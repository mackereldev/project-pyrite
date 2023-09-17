<script lang="ts">
    import { clientStore, roomStore } from "$lib/classes/Stores";
    import { afterUpdate, onMount } from "svelte";
    import type { PageData } from "./$types";
    import { beforeNavigate, goto } from "$app/navigation";
    import type { MainState } from "../../../../server/src/schema/MainState";
    import { AutoScrollBehaviour } from "$lib/enums";
    import ChatChannel from "$lib/classes/ChatChannel";
    import { ChatMessage } from "$lib/classes/ChatMessage";
    import ChatItem from "$lib/components/ChatItem.svelte";
    import CommandDispatcher from "$lib/classes/CommandDispatcher";

    export let data: PageData;
    $: ({ roomId, clientId } = data ?? {});

    let messageElement: HTMLInputElement;
    let messageValue: string;
    let messageHistory: HTMLDivElement;

    let clients: { clientId: string; isLeader: boolean }[] = [];

    // TODO: These should be dynamic (room code)
    let chatChannels: { [key: string]: ChatChannel } = {};
    let currentChatChannel: ChatChannel;

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
        chatChannels = {
            mainRoom: new ChatChannel(roomId, (chatChannel, message) => onChatMessage(chatChannel, message)),
        };
        currentChatChannel = chatChannels.mainRoom;

        if (!connected) {
            console.debug("Join and register");
            $clientStore
                .joinById<MainState>(roomId, { clientId })
                .then((r) => {
                    $roomStore = r;
                    registerClientSubscriptions();
                    updateClientList();
                })
                .catch((err) => {
                    goto(`/?error=${err.code}`);
                });
        } else {
            console.debug("Register");
            registerClientSubscriptions();
            updateClientList();
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

        $roomStore.state.clientData.onChange(() => {
            updateClientList();
        });

        $roomStore.onMessage("server-chat", (message) => {
            function chat(msg: { serializedMessage: { text: string; isError: boolean } }) {
                const chatMessage = new ChatMessage(undefined, "system", msg.serializedMessage.text, msg.serializedMessage.isError);
                chatChannels.mainRoom.addMessage(chatMessage);
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
            chatChannels.mainRoom.addMessage(new ChatMessage(author.clientId, "player", msg));
        });

        $roomStore.onMessage("cmd-ping", (message) => {
            const { sender }: { sender: { sessionId: string; clientId: string } } = message;

            chatChannels.mainRoom.addMessage(new ChatMessage(undefined, "system", `Client '${sender.clientId}' pinged all clients.`));
        });
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
        currentChatChannel.lastReadMessage = currentChatChannel.getMessages().at(-1);

        currentChatChannel = channel;
        messageElement.focus();
        channel.isUnread = false;
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
        const response = CommandDispatcher.executeCommand(commandName, ...args);
        if (response) {
            chatChannels.mainRoom.addMessage(response);
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
        } else {
            chatChannel.isUnread = true;
            chatChannels = chatChannels; // Force redraw
        }
    };

    const submitMessage = async () => {
        // TODO: Support sending commands
        sendChatMessage();

        // Automtically mark as read
        currentChatChannel.lastReadMessage = undefined;

        messageValue = "";
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            // Manually mark as read
            currentChatChannel.lastReadMessage = undefined;
        }
    };

    const updateShowShadow = () => {
        showShadow = messageHistory.scrollHeight - messageHistory.scrollTop > messageHistory.clientHeight;
    };

    const updateClientList = () => {
        const clientData = $roomStore.state.clientData.toArray();
        clients = clientData.map((client) => {
            return { clientId: client.clientId, isLeader: $roomStore.state.leader === client.clientId };
        });
    };
</script>

<svelte:window on:resize={updateShowShadow} on:keydown={onKeyDown} />

<div class="flex h-full w-full gap-4 p-6">
    <div class="flex flex-1 basis-[36rem] flex-col overflow-hidden rounded ring-2 ring-zinc-300">
        <div class="flex border-b-2 border-zinc-300">
            {#each Object.values(chatChannels) as chatChannel}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div on:click={() => changeChatChannel(chatChannel)} class="group relative cursor-pointer border-x first:border-l-0 first:border-l-transparent last:border-r-2">
                    <div class="px-4 py-1 text-sm font-semibold shadow-[0_2px] transition-all group-hover:bg-zinc-200 {currentChatChannel === chatChannel ? 'text-violet-500 shadow-violet-500' : 'text-zinc-400 shadow-transparent group-hover:text-zinc-500'}">{chatChannel.name}</div>
                    {#if chatChannel.isUnread}
                        <div class="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-violet-400"></div>
                    {/if}
                </div>
            {/each}
        </div>
        <div bind:this={messageHistory} on:scroll={updateShowShadow} class="flex flex-grow flex-col overflow-y-scroll break-words px-3 pt-3 transition-all">
            {#if currentChatChannel}
                {#each currentChatChannel.getMessages() as message, i (message)}
                    <ChatItem {message} unreadIndicator={i !== currentChatChannel.messageCount - 1 && currentChatChannel.lastReadMessage === message} relativeStartTime={$roomStore.state.serverStartTime} />
                {/each}
            {/if}
        </div>
        <form on:submit|preventDefault={submitMessage} class={`p-4 transition-shadow duration-150 ${showShadow && "chat-entry-shadow"}`}>
            <!-- svelte-ignore a11y-autofocus -->
            <input type="text" autofocus bind:this={messageElement} bind:value={messageValue} class="h-8 w-full rounded px-2 text-sm ring-2 ring-zinc-300" />
        </form>
    </div>
    <div class="flex flex-shrink basis-96 flex-col gap-4">
        <div class="flex flex-1 flex-col overflow-clip rounded p-5 ring-2 ring-zinc-300">
            <span class="border-b-2 border-zinc-300 pb-2 text-2xl">Players</span>
            <div class="flex flex-col overflow-y-scroll">
                {#each clients as peer}
                    <div class="flex p-4">
                        {#if peer.isLeader}
                            <span class="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-amber-400 stroke-amber-400 stroke-2">
                                    <path d="M4 19H20M11.2929 5.70711L8.70711 8.2929C8.31658 8.68342 7.68342 8.68342 7.29289 8.2929L5.70711 6.70711C5.07714 6.07714 4 6.52331 4 7.41422V15C4 15.5523 4.44772 16 5 16H19C19.5523 16 20 15.5523 20 15V7.41421C20 6.52331 18.9229 6.07714 18.2929 6.70711L16.7071 8.2929C16.3166 8.68342 15.6834 8.68342 15.2929 8.2929L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711Z" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                        {:else}
                            <span class="mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 fill-none stroke-neutral-400 stroke-2">
                                    <path d="M17.5 21.0001H6.5C5.11929 21.0001 4 19.8808 4 18.5001C4 14.4194 10 14.5001 12 14.5001C14 14.5001 20 14.4194 20 18.5001C20 19.8808 18.8807 21.0001 17.5 21.0001Z" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
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
            <div class="flex h-full w-full items-center justify-center">
                <span class="text-lg">Command list</span>
            </div>
        </div>
    </div>
</div>
