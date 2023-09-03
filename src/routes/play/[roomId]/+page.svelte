<script lang="ts">
    import { clientStore, gameChat, roomStore } from "$lib/classes/Stores";
    import { afterUpdate, onMount } from "svelte";
    import type { PageData } from "./$types";
    import { beforeNavigate, goto } from "$app/navigation";
    import type { GameState } from "../../../../server/src/schema/GameState";
    import { AutoScrollBehaviour } from "$lib/enums";
    import ChatChannel from "$lib/classes/ChatChannel";
    import { ChatMessage, type ChatMessageType } from "$lib/classes/ChatMessage";
    import ChatItem from "$lib/components/ChatItem.svelte";
    import CommandDispatcher from "$lib/classes/CommandDispatcher";
    import { generateUpcomingTurns } from "$lib/classes/GameClient";
    import type { Player } from "../../../../server/src/schema/quest/Player";

    export let data: PageData;
    $: ({ roomId, clientId } = data ?? {});

    let messageValue: string;
    let messageHistory: HTMLDivElement;

    let peers: { clientId: string; isLeader: boolean }[] = [];
    const chatChannels = {
        game: new ChatChannel("Game", (chatChannel, message) => onChatMessage(chatChannel, message)),
        social: new ChatChannel("Social", (chatChannel, message) => onChatMessage(chatChannel, message)),
    };
    let currentChatChannel = chatChannels.game;
    $gameChat = chatChannels.game;

    let turns: { type: "player" | "enemy"; name: string }[] = [];

    let autoScrollBehaviour = AutoScrollBehaviour.Always;
    let queueAutoScroll = false;

    let showShadow: boolean;

    $: connected = !!$roomStore && $roomStore.connection.isOpen;

    if (import.meta.hot) {
        import.meta.hot.on("vite:ws:disconnect", async () => {
            await leaveRoom(false);
        });
        import.meta.hot.accept(async () => {
            await leaveRoom(false);
            if (connected) {
                import.meta.hot?.invalidate();
            }
        });
    }

    beforeNavigate(async () => {
        await leaveRoom(true);
    });

    afterUpdate(() => {
        if (queueAutoScroll) {
            queueAutoScroll = false;
            messageHistory.scrollTo(0, messageHistory.scrollHeight);
        }
    });

    onMount(() => {
        updateShowShadow();

        if (!connected) {
            console.debug("Join and register");
            $clientStore
                .joinById<GameState>(roomId, { clientId })
                .then((r) => {
                    $roomStore = r;
                    registerClientSubscriptions();
                })
                .catch((err) => {
                    goto(`/?error=${err.code}`);
                });
        } else {
            console.debug("Register");
            registerClientSubscriptions();
            updatePlayerList();
        }
    });

    const registerClientSubscriptions = () => {
        $roomStore.onLeave((code) => {
            connected = false;
            goto(`/?error=${code}`);
        });

        if (process.env.NODE_ENV === "development") {
            $roomStore.onMessage("__playground_message_types", (message) => {
                console.debug("Playground message types", message);
            });
        }

        $roomStore.onMessage("server-chat", (message) => {
            function chat(msg: { channel: "game" | "social"; serializedMessage: { type: "game" | "system"; text: string; isError: boolean } }) {
                const chatMessage = new ChatMessage(undefined, msg.serializedMessage.type as ChatMessageType, msg.serializedMessage.text, msg.serializedMessage.isError);
                if (msg.channel === "game") {
                    chatChannels.game.addMessage(chatMessage);
                } else if (msg.channel === "social") {
                    chatChannels.social.addMessage(chatMessage);
                }
            }

            if (Array.isArray(message)) {
                message.forEach((subMessage) => chat(subMessage));
            } else {
                chat(message);
            }
        });

        $roomStore.onMessage("player-chat", (message) => {
            const { msg, author }: { msg: string; author: { sessionId: string; clientId: string } } = message;
            console.debug("MESSAGE:", message);
            chatChannels.social.addMessage(new ChatMessage(author.clientId, "player", msg));
        });

        $roomStore.onMessage("cmd-ping", (message) => {
            const { sender }: { sender: { sessionId: string; clientId: string } } = message;

            chatChannels.game.addMessage(new ChatMessage(undefined, "system", `Client '${sender.clientId}' pinged all clients.`));
        });

        $roomStore.onMessage("quest-start", () => {
            chatChannels.game.addMessage(new ChatMessage(undefined, "game", `Your party embarks into the '${$roomStore.state.questState.name}'.`));
            enterQuestRoom();
        });

        $roomStore.onMessage("quest-advance", () => {
            chatChannels.game.addMessage(new ChatMessage(undefined, "game", "Your party advances."));
            enterQuestRoom();
        });

        $roomStore.state.questState.listen("active", (value) => {
            if (!value) {
                turns = [];
            }
        });

        $roomStore.state.questState.listen("currentTurn", updateTurnsList, false);
        $roomStore.state.questState.listen("turnCycle", updateTurnsList, false);
    };

    const leaveRoom = async (consented: boolean) => {
        if ($roomStore) {
            $roomStore.removeAllListeners();
            if ($roomStore.connection.isOpen) {
                await $roomStore.leave(consented);
            }
        }
    };

    const changeChatChannel = (channel: ChatChannel) => {
        currentChatChannel = channel;
        currentChatChannel = currentChatChannel; // Force redraw
    };

    const sendChatMessage = () => {
        if (connected) {
            const msg = messageValue.replace(/[^ -~]+/g, "").trim();
            if (msg.length > 0) {
                $roomStore.send("player-chat", { msg: messageValue });
            }
        }
    };

    const sendCommand = async () => {
        const command = messageValue.replace(/ +(?= )/g, "").split(" ");
        const commandName = command[0];
        const args = command.slice(1);

        console.debug("COMMAND:", commandName);
        const response = await CommandDispatcher.executeCommand(commandName, ...args);
        if (response) {
            chatChannels.game.addMessage(response);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const onChatMessage = (chatChannel: ChatChannel, message: ChatMessage) => {
        if (chatChannel === currentChatChannel) {
            currentChatChannel = currentChatChannel; // Force redraw

            // Auto scroll
            if (messageHistory && autoScrollBehaviour === AutoScrollBehaviour.Always) {
                queueAutoScroll = true;
            }
        }
    };

    const submitMessage = async () => {
        if (currentChatChannel === chatChannels.game) {
            sendCommand();
        } else if (currentChatChannel === chatChannels.social) {
            sendChatMessage();
        }

        messageValue = "";
    };

    const updateShowShadow = () => {
        showShadow = messageHistory.scrollHeight - messageHistory.scrollTop > messageHistory.clientHeight;
    };

    const updatePlayerList = () => {
        const clientData = $roomStore.state.clientData.toArray();
        peers = clientData.map((client) => {
            return { clientId: client.clientId, isLeader: $roomStore.state.leader === client.clientId };
        });
    };

    const enterQuestRoom = async () => {
        const response = await CommandDispatcher.executeCommand("inspect", "room");
        if (response) {
            chatChannels.game.addMessage(response);
        }
    };

    const updateTurnsList = () => {
        try {
            if ($roomStore.state.questState.currentTurn) {
                turns = generateUpcomingTurns(6).map((entity) => {
                    return { type: (entity as Player)?.clientId ? "player" : "enemy", name: (entity as Player)?.clientId || entity?.name || "INVALID_ENTITY" };
                });
            }
        } catch (error) {
            console.trace(error);
        }
    };

    const logState = () => {
        console.log($roomStore.state.questState.room.type);
    };
</script>

<svelte:window on:resize={updateShowShadow} />

<div class="flex h-full w-full gap-4 p-6">
    <button on:click={logState} class="btn text-sm">Log State</button>
    <div class="flex flex-1 basis-[36rem] flex-col overflow-hidden rounded ring-2 ring-zinc-300">
        <div class="flex border-b-2 border-zinc-300">
            {#each Object.values(chatChannels) as chatChannel}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div on:click={() => changeChatChannel(chatChannel)} class="group cursor-pointer border-x first:border-l-0 first:border-l-transparent last:border-r-2">
                    <div class="px-4 py-1 text-sm font-semibold shadow-[0_2px] transition-all group-hover:bg-zinc-200 {currentChatChannel === chatChannel ? 'text-violet-500 shadow-violet-500' : 'text-zinc-400 shadow-transparent group-hover:text-zinc-500'}">{chatChannel.name}</div>
                </div>
            {/each}
        </div>
        <div bind:this={messageHistory} on:scroll={updateShowShadow} class="flex flex-grow flex-col overflow-y-scroll break-words px-3 pt-3 transition-all">
            {#each currentChatChannel.getMessages() as message (message)}
                <ChatItem {message} relativeStartTime={$roomStore.state.serverStartTime} />
            {/each}
        </div>
        <form on:submit|preventDefault={submitMessage} class={`p-4 transition-shadow duration-150 ${showShadow && "chat-entry-shadow"}`}>
            <input type="text" bind:value={messageValue} class="h-8 w-full rounded px-2 text-sm ring-2 ring-zinc-300" />
        </form>
    </div>
    <div class="flex flex-shrink basis-96 flex-col gap-4">
        <div class="flex flex-1 flex-col overflow-clip rounded p-5 ring-2 ring-zinc-300">
            <span class="border-b-2 border-zinc-300 pb-2 text-2xl">Players</span>
            <div class="flex flex-col overflow-y-scroll">
                {#each peers as peer}
                    <div class="flex p-4">
                        {#if peer.isLeader}
                            <span class="mr-2">👑</span>
                        {/if}
                        <span class="font-bold">{peer.clientId}</span>
                        {#if peer.clientId === clientId}
                            <span class="sup font-bold text-violet-500">(You)</span>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
        <div class="flex flex-1 flex-col gap-2 overflow-clip rounded p-5 ring-2 ring-zinc-300">
            {#if $roomStore?.state.questState?.active}
                {#if $roomStore.state.questState.room.type === "battle"}
                    <span class="border-b-2 border-zinc-300 pb-2 text-2xl">Turns</span>
                    <div class="flex flex-col overflow-y-scroll">
                        {#each turns as turn, index}
                            <div class="flex items-center p-2 {index === 0 && 'ring-2'} rounded-md ring-inset ring-zinc-300">
                                <div class={`mr-2 ${index === 0 ? "h-3 w-3" : "h-2 w-2"} rounded-full ${turn.type === "player" ? "bg-emerald-400" : "bg-red-400"}`} />
                                <span class={`${index === 0 ? "font-bold" : ""}`}>{turn.name}</span>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="flex h-full w-full items-center justify-center">
                        <span class="text-lg">Not currently in a battle room</span>
                    </div>
                {/if}
            {:else}
                <div class="flex h-full w-full items-center justify-center">
                    <span class="text-lg">Quest not active</span>
                </div>
            {/if}
        </div>
    </div>
</div>
