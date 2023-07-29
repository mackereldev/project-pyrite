<script lang="ts">
    import type { PageData } from "./$types";
    import { beforeNavigate, goto } from "$app/navigation";
    import type { Types } from "ably/promises";
    import { Realtime } from "ably";
    import ChatMessage from "$lib/classes/ChatMessage";
    import ChatItem from "$lib/components/ChatItem.svelte";
    import { AutoScrollBehaviour, ChatMessageType } from "$lib/enums";
    import { afterUpdate, onMount } from "svelte";
    import Debug from "$lib/classes/Debug";
    import ChatChannel from "$lib/classes/ChatChannel";

    export let data: PageData;
    let { code, clientId, channelNamespace, serverStartTime, serverConnectionId } = data ?? {};

    let realtime: Types.RealtimePromise;
    let channel: Types.RealtimeChannelPromise;

    $: connected = !!channel;
    $: console.log(`STATUS: ${connected ? "Connected to Ably" : "Offline"}`);

    let players: string[] = [];
    const chatChannels = {
        game: new ChatChannel("Game"),
        social: new ChatChannel("Social"),
    };

    let autoScrollBehaviour = AutoScrollBehaviour.Always;
    let queueAutoScroll = false;

    let messageHistory: HTMLDivElement;
    $: currentChatChannel.messages, updateScroll();
    let messageBox: HTMLInputElement;

    let showShadow: boolean;

    let currentChatChannel = chatChannels.social;

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
                if (isValidServerMessage(msg)) {
                    if (!msg.data.success) {
                        Debug.log(`client/join: joining was unsuccessful (${msg.data.errorReason}).`);
                        goto(`/?join_rejection_reason=${msg.data.errorReason}`);
                        return;
                    }

                    Debug.log("[RECEIVE] client/join: joining was successfully validated by the server.");
                } else {
                    Debug.log("[RECEIVE] client/join: joining was unsuccessful (server message failed to validate). Printing msg...");
                    Debug.log(msg);
                }
            });

            Debug.log("[SUBSCRIBE] peer/chat");
            await channel.subscribe("peer/chat", (msg) => {
                Debug.log(`[RECEIVE] peer/chat: chat message received by client: '${msg.clientId}' says '${msg.data.message}'.`);
                chatChannels.social.messages.push(new ChatMessage(msg.timestamp - serverStartTime, msg.clientId, ChatMessageType.Player, msg.data.message));
                redrawChatChannel(chatChannels.social);
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
                    players = [...players];
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
        redrawChatChannel(channel);
    };

    const redrawChatChannel = (channel?: ChatChannel) => {
        if (channel) {
            if (currentChatChannel === channel) {
                currentChatChannel = currentChatChannel;
            }
        } else {
            currentChatChannel = currentChatChannel;
        }
    };

    const updateScroll = () => {
        if (messageHistory && autoScrollBehaviour == AutoScrollBehaviour.Always) {
            queueAutoScroll = true;
        }
    };

    const sendCommand = () => {
        const command = messageBox.value;
        console.log(command);
        return true;
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
        let success;

        if (currentChatChannel === chatChannels.game) {
            success = sendCommand();
        } else if (currentChatChannel === chatChannels.social) {
            success = sendSocialMessage();
        }

        if (success) {
            messageBox.value = "";
        }
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
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div on:click={() => changeChatChannel(chatChannel)} class="group cursor-pointer border-x first:border-l-0 first:border-l-transparent last:border-r-2">
                    <div class="px-4 py-1 text-sm font-semibold shadow-[0_2px] transition-all group-hover:bg-zinc-200 {currentChatChannel === chatChannel ? 'text-violet-500 shadow-violet-500' : 'text-zinc-400 shadow-transparent group-hover:text-zinc-500'}">{chatChannel.name}</div>
                </div>
            {/each}
        </div>
        <div bind:this={messageHistory} on:scroll={updateShowShadow} class="flex flex-grow flex-col overflow-y-scroll break-all px-3 pt-3 transition-all">
            {#each currentChatChannel.messages as message}
                <ChatItem {message} />
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
