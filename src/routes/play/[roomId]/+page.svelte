<script lang="ts">
    import { client, gameChat, preferencesStore, room } from "$lib/classes/Stores";
    import { afterUpdate, onMount } from "svelte";
    import type { PageData } from "./$types";
    import { beforeNavigate, goto } from "$app/navigation";
    import type { GameState } from "../../../../server/src/rooms/schema/GameState";
    import { AutoScrollBehaviour, ChatMessageType } from "$lib/enums";
    import ChatChannel from "$lib/classes/ChatChannel";
    import ChatMessage from "$lib/classes/ChatMessage";
    import ChatItem from "$lib/components/ChatItem.svelte";
    import CommandHandler from "$lib/classes/CommandHandler";

    export let data: PageData;
    $: ({ roomId } = data ?? {});

    let messageValue: string;
    let messageHistory: HTMLDivElement;

    let players: string[] = [];
    const chatChannels = {
        game: new ChatChannel("Game", (chatChannel: ChatChannel, message: ChatMessage) => onChatMessage(chatChannel, message)),
        social: new ChatChannel("Social", (chatChannel: ChatChannel, message: ChatMessage) => onChatMessage(chatChannel, message)),
    };
    let currentChatChannel = chatChannels.game;
    $gameChat = chatChannels.game;

    let autoScrollBehaviour = AutoScrollBehaviour.Always;
    let queueAutoScroll = false;

    let showShadow: boolean;

    $: connected = !!$room && $room.connection.isOpen;

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
            $client
                .joinById<GameState>(roomId, { clientId: $preferencesStore.characterName })
                .then((r) => {
                    $room = r;
                    registerMessages();
                })
                .catch((err) => {
                    goto(`/?error=${err.code}`);
                });
        } else {
            registerMessages();
        }
    });

    const registerMessages = () => {
        $room.onLeave((code) => {
            connected = false;
            goto(`/?error=${code}`);
        });

        if (process.env.NODE_ENV === "development") {
            $room.onMessage("__playground_message_types", (message) => {
                console.debug("Playground message types", message);
            });
        }

        $room.onMessage("chat", (message) => {
            const { msg, author }: { msg: string; author: { sessionId: string; clientId: string } } = message;
            console.debug("MESSAGE:", message);
            chatChannels.social.addMessage(new ChatMessage(author.clientId, ChatMessageType.Player, msg));
        });

        $room.onMessage("ping", (message) => {
            const { sender }: { sender: { sessionId: string; clientId: string } } = message;

            chatChannels.game.addMessage(new ChatMessage(undefined, ChatMessageType.System, `Client '${sender.clientId}' pinged all clients.`));
        });
    };

    const leaveRoom = async (consented: boolean) => {
        if ($room) {
            $room.removeAllListeners();
            if ($room.connection.isOpen) {
                await $room.leave(consented);
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
                $room.send("chat", { msg: messageValue });
            }
        }
    };

    const sendCommand = async () => {
        const command = messageValue.replace(/ +(?= )/g, "").split(" ");
        const commandName = command[0];
        const args = command.slice(1);

        console.debug("COMMAND:", commandName);
        const response = await CommandHandler.executeCommand(commandName, ...args);
        if (response) {
            chatChannels.game.addMessage(response);
        }
    };

    const onChatMessage = (chatChannel: ChatChannel, message: ChatMessage) => {
        currentChatChannel = currentChatChannel; // Force redraw

        // Auto scroll
        if (messageHistory && autoScrollBehaviour == AutoScrollBehaviour.Always) {
            queueAutoScroll = true;
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
</script>

<svelte:window on:resize={updateShowShadow} />

<div class="flex h-full w-full gap-4 p-6">
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
                <ChatItem {message} relativeStartTime={$room.state.serverStartTime} />
            {/each}
        </div>
        <form on:submit|preventDefault={submitMessage} class={`p-4 transition-shadow duration-150 ${showShadow && "chat-entry-shadow"}`}>
            <input type="text" bind:value={messageValue} class="h-8 w-full rounded px-2 text-sm ring-2 ring-zinc-300" />
        </form>
    </div>
    <div class="flex flex-shrink basis-96 flex-col gap-4">
        <div class="flex flex-1 flex-col overflow-scroll rounded p-4 ring-2 ring-zinc-300">
            <span class="border-b-2 border-zinc-300 pb-2 text-3xl">Players</span>
            {#each players as player}
                <div class="flex border-b border-zinc-300 p-4 last:border-0">
                    <span class="flex-grow font-bold">{player}</span>
                    {#if player == $preferencesStore.characterName}
                        <span class="font-bold text-violet-500">(You)</span>
                    {/if}
                </div>
            {/each}
        </div>
        <div class="flex-1 rounded ring-2 ring-zinc-300" />
    </div>
</div>
