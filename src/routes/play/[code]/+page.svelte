<script lang="ts">
    import type { PageData } from "./$types";
    import { beforeNavigate, goto } from "$app/navigation";
    import type { Types } from "ably/promises";
    import { Realtime } from "ably";
    import ChatMessage from "$lib/classes/ChatMessage";
    import ChatItem from "$lib/components/ChatItem.svelte";
    import { AutoScrollBehaviour, ChatMessageType } from "$lib/enums";
    import { afterUpdate, onMount } from "svelte";

    export let data: PageData;
    let { code, clientId, channelNamespace, serverStartTime, serverConnectionId } = data ?? {};

    let realtime: Types.RealtimePromise;
    let channel: Types.RealtimeChannelPromise;

    $: connected = !!channel;
    $: console.log(`STATUS: ${connected ? "Connected to Ably" : "Offline"}`);

    let players: string[] = [];

    let messages: ChatMessage[] = [];

    let autoScrollBehaviour = AutoScrollBehaviour.Always;
    let queueAutoScroll = false;

    let messageHistory: HTMLDivElement;
    $: messages, updateScroll();
    let messageBox: HTMLInputElement;

    let showShadow: boolean;

    beforeNavigate(async () => {
        if (channel.state == "attaching" || channel.state == "attached") {
            channel.publish("server/leave", {});
        }

        channel.presence.unsubscribe();
        await channel.detach();
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

        realtime = new Realtime.Promise({
            authUrl: "/.netlify/functions/ably-token-request",
            clientId,
        });
        await realtime.connection.whenState("connected");

        channel = realtime.channels.get(`${channelNamespace}:${code}`);
        await channel.whenState("attached");

        await channel.subscribe("client/join", (msg) => {
            if (isValidServerMessage(msg)) {
                if (!msg.data.success) {
                    goto(`/?join_rejection_reason=${msg.data.errorReason}`);
                }
            }
        });

        await channel.subscribe("peer/chat", (msg) => {
            messages = messages.concat(new ChatMessage(msg.timestamp - serverStartTime, msg.clientId, ChatMessageType.Player, msg.data.message));
        });

        await channel.presence.subscribe((ctx) => {
            if (ctx.action == "present") {
                players = players.concat(ctx.clientId);
            } else if (ctx.action == "enter") {
                players = players.concat(ctx.clientId);
            } else if (ctx.action == "leave") {
                players.splice(players.indexOf(ctx.clientId), 1);
                players = [...players];
            }
        });

        channel.publish("server/join", {});
    });

    const isValidServerMessage = (msg: Types.Message) => {
        return msg.connectionId == serverConnectionId;
    };

    const updateScroll = () => {
        if (messageHistory && autoScrollBehaviour == AutoScrollBehaviour.Always) {
            queueAutoScroll = true;
        }
    };

    const sendMessage = () => {
        const message = messageBox.value.replace(/[^ -~]+/g, "").trim();
        if (message.length > 0) {
            if (connected) {
                channel.publish("peer/chat", { message });
                messageBox.value = "";
            }
        }
    };

    const updateShowShadow = () => {
        showShadow = messageHistory.scrollHeight - messageHistory.scrollTop > messageHistory.clientHeight;
    };
</script>

<svelte:window on:resize={updateShowShadow} />

<div class="flex h-full w-full gap-4 p-6">
    <div class="flex flex-1 basis-[36rem] flex-col rounded ring-2 ring-zinc-300">
        <div bind:this={messageHistory} on:scroll={updateShowShadow} class="flex flex-grow flex-col overflow-y-scroll break-all px-3 pt-3 transition-all">
            {#each messages as message}
                <ChatItem {message} />
            {/each}
        </div>
        <form on:submit|preventDefault={sendMessage} class={`p-4 transition-shadow duration-150 ${showShadow && "chat-entry-shadow"}`}>
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
