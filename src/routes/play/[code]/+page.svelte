<script lang="ts">
    import type { PageData } from "./$types";
    import { beforeNavigate, goto } from "$app/navigation";
    import { Realtime, type Types } from "ably/promises";
    import ChatMessage from "$lib/classes/ChatMessage";
    import ChatItem from "$lib/components/ChatItem.svelte";
    import { AutoScrollBehaviour, ChatMessageType } from "$lib/enums";
    import { afterUpdate, onMount } from "svelte";
    import Debug from "$lib/classes/Debug";
    import ChatChannel from "$lib/classes/ChatChannel";
    import Game from "$lib/classes/Game";
    import CommandContext from "$lib/classes/CommandContext";

    export let data: PageData;
    let { code, clientId, channelNamespace, serverStartTime, serverConnectionId } = data ?? {};

    let game = new Game();

    let realtime: Types.RealtimePromise;
    let channel: Types.RealtimeChannelPromise;

    $: connected = !!channel;
    $: console.log(`STATUS: ${connected ? "Connected to Ably" : "Offline"}`);

    let players: string[] = [];
    const chatChannels = {
        game: new ChatChannel("Game", (chatChannel: ChatChannel, message: ChatMessage) => onMessage(chatChannel, message)),
        social: new ChatChannel("Social", (chatChannel: ChatChannel, message: ChatMessage) => onMessage(chatChannel, message)),
    };

    let autoScrollBehaviour = AutoScrollBehaviour.Always;
    let queueAutoScroll = false;

    let messageHistory: HTMLDivElement;
    let messageBox: HTMLInputElement;

    let showShadow: boolean;

    let currentChatChannel = chatChannels.game;

    if (import.meta.hot) {
        import.meta.hot.on("vite:ws:disconnect", async () => {
            await shutDown();
        });
        import.meta.hot.accept(async () => {
            await shutDown();
            if (channel) {
                import.meta.hot?.invalidate();
            }
        });
    }

    beforeNavigate(async () => {
        if (channel) {
            if (channel.state == "attaching" || channel.state == "attached") {
                Debug.log("[PUBLISH] server/leave");
                await channel.publish("server/leave", {});
            } else {
                Debug.log("Skipping server/leave publish: channel state is not attached.");
            }

            channel.presence.unsubscribe();
            await channel.detach();
        }

        realtime.close();
    });

    afterUpdate(() => {
        if (queueAutoScroll) {
            queueAutoScroll = false;
            messageHistory.scrollTo(0, messageHistory.scrollHeight);
        }
    });

    onMount(async () => {
        updateShowShadow();

        if (!Debug.isDummy) {
            realtime = new Realtime.Promise({
                async authCallback(data, callback) {
                    const tokenRequest = await fetch(`/api/ably-token-request?clientId=${data.clientId}`);
                    callback(null, JSON.parse((await tokenRequest.json()).body));
                },
                clientId,
            });
            await realtime.connection.whenState("connected");

            channel = realtime.channels.get(`${channelNamespace}:${code}`);
            Debug.log(`[GET] Attempting to connect to channel ${channelNamespace}:${code}.`);

            Debug.log("[SUBSCRIBE] client/join");
            await channel.subscribe("client/join", (msg) => {
                const { success, errorReason } = msg.data;

                if (isValidServerMessage(msg)) {
                    if (!success) {
                        Debug.log(`client/join: joining was unsuccessful (${errorReason}).`);
                        goto(`/?join_rejection_reason=${errorReason}`);
                        return;
                    }

                    Debug.log("[RECEIVE] client/join: joining was successfully validated by the server.");
                } else {
                    Debug.log("[RECEIVE] client/join: joining was unsuccessful (server message failed to validate). Printing msg...");
                    Debug.log(msg);
                }
            });

            Debug.log("[SUBSCRIBE] client/ping");
            await channel.subscribe("client/ping", (msg) => {
                if (isValidServerMessage(msg)) {
                    const sender = msg.data.sender;

                    Debug.log(`[RECEIVE] client/ping: client '${sender}' pinged all clients.`);
                    chatChannels.game.addMessage(new ChatMessage(undefined, ChatMessageType.System, `Client '${sender}' pinged all clients.`));
                }
            });

            Debug.log("[SUBSCRIBE] peer/chat");
            await channel.subscribe("peer/chat", (msg) => {
                const { message } = msg.data;

                Debug.log(`[RECEIVE] peer/chat: chat message received by client: '${msg.clientId}' says '${message}'.`);
                chatChannels.social.addMessage(new ChatMessage(msg.clientId, ChatMessageType.Player, message));
            });

            Debug.log("[PRESENCE_SUBSCRIBE] all");
            await channel.presence.subscribe((ctx) => {
                Debug.log(`[PRESENCE_RECEIVE] Presence event receive (action: ${ctx.action}, clientId: ${ctx.clientId}).`);

                if (ctx.action == "present") {
                    players = players.concat(ctx.clientId);
                } else if (ctx.action == "enter") {
                    players = players.concat(ctx.clientId);
                } else if (ctx.action == "leave") {
                    players.splice(players.indexOf(ctx.clientId), 1);
                    players = players; // Force redraw
                }
            });

            Debug.log("[PUBLISH] server/join");
            await channel.publish("server/join", {});
        }
    });

    const shutDown = async () => {
        if (channel) {
            if (channel.state == "attaching" || channel.state == "attached") {
                Debug.log("[PUBLISH] server/leave");
                await channel.publish("server/leave", {});
            } else {
                Debug.log("Skipping server/leave publish: channel state is not attached.");
            }

            channel.presence.unsubscribe();
            await channel.detach();
        }

        if (realtime) {
            realtime.close();
        }
    };

    const isValidServerMessage = (msg: Types.Message) => {
        return msg.connectionId == serverConnectionId;
    };

    const changeChatChannel = (channel: ChatChannel) => {
        currentChatChannel = channel;
        currentChatChannel = currentChatChannel; // Force redraw
    };

    const sendCommand = () => {
        const command = messageBox.value.replace(/ +(?= )/g, "").split(" ");
        const commandName = command[0];
        const args = command.slice(1);
        game.runCommand(commandName, getCommandContext(), ...args);
    };

    const onMessage = (chatChannel: ChatChannel, message: ChatMessage) => {
        currentChatChannel = currentChatChannel; // Force redraw

        // Auto scroll
        if (messageHistory && autoScrollBehaviour == AutoScrollBehaviour.Always) {
            queueAutoScroll = true;
        }
    };

    const sendSocialMessage = () => {
        const message = messageBox.value.replace(/[^ -~]+/g, "").trim();
        if (message.length > 0) {
            if (connected) {
                Debug.log(`[PUBLISH] peer/chat: sending message as ${clientId} ('${message}')`);
                channel.publish("peer/chat", { message });
                return true;
            }
        }

        return false;
    };

    const submitMessage = async () => {
        let clearInput = true;

        if (currentChatChannel === chatChannels.game) {
            sendCommand();
        } else if (currentChatChannel === chatChannels.social) {
            clearInput = sendSocialMessage();
        }

        if (clearInput) {
            messageBox.value = "";
        }
    };

    const updateShowShadow = () => {
        showShadow = messageHistory.scrollHeight - messageHistory.scrollTop > messageHistory.clientHeight;
    };

    const getCommandContext = () => {
        return new CommandContext(channel, chatChannels.game);
    };
</script>

<svelte:window on:resize={updateShowShadow} />

<div class="flex h-full w-full gap-4 p-6">
    <div class="flex flex-1 basis-[36rem] flex-col overflow-hidden rounded ring-2 ring-zinc-300">
        <div class="flex border-b-2 border-zinc-300">
            {#each Object.values(chatChannels) as chatChannel}
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={() => changeChatChannel(chatChannel)} class="group cursor-pointer border-x first:border-l-0 first:border-l-transparent last:border-r-2">
                    <div class="px-4 py-1 text-sm font-semibold shadow-[0_2px] transition-all group-hover:bg-zinc-200 {currentChatChannel === chatChannel ? 'text-violet-500 shadow-violet-500' : 'text-zinc-400 shadow-transparent group-hover:text-zinc-500'}">{chatChannel.name}</div>
                </div>
            {/each}
        </div>
        <div bind:this={messageHistory} on:scroll={updateShowShadow} class="flex flex-grow flex-col overflow-y-scroll break-all px-3 pt-3 transition-all">
            {#each currentChatChannel.getMessages() as message (message)}
                <ChatItem {message} relativeStartTime={serverStartTime} />
            {/each}
        </div>
        <form on:submit|preventDefault={submitMessage} class={`p-4 transition-shadow duration-150 ${showShadow && "chat-entry-shadow"}`}>
            <input type="text" bind:this={messageBox} class="h-8 w-full rounded px-2 text-sm ring-2 ring-zinc-300" />
        </form>
    </div>
    <div class="flex flex-shrink basis-96 flex-col gap-4">
        <div class="flex flex-1 flex-col overflow-scroll rounded p-4 ring-2 ring-zinc-300">
            <span class="border-b-2 border-zinc-300 pb-2 text-3xl">Players</span>
            {#each players as player}
                <div class="flex border-b border-zinc-300 p-4 last:border-0">
                    <span class="flex-grow font-bold">{player}</span>
                    {#if player == clientId}
                        <span class="font-bold text-violet-500">(You)</span>
                    {/if}
                </div>
            {/each}
        </div>
        <div class="flex-1 rounded ring-2 ring-zinc-300" />
    </div>
</div>
