<script lang="ts">
    import type { PageData } from "./$types";
    import { afterUpdate, onMount } from "svelte";
    import { beforeNavigate } from "$app/navigation";
    import type { Types } from "ably/promises";
    import type Client from "$lib/server/classes/Client";
    import { Realtime } from "ably";

    export let data: PageData;
    let { code, clientId, channelNamespace, serverConnectionId } = data ?? {};

    let realtime: Types.RealtimePromise;
    let channel: Types.RealtimeChannelPromise;

    $: connected = !!channel;
    $: console.log(`STATUS: ${connected ? "Connected to Ably" : "Offline"}`);

    let players: string[] = [];

    beforeNavigate(async () => {
        if (channel.state == "attaching" || channel.state == "attached") {
            channel.publish("server/leave", { clientId });
        }
        await channel.detach();
        channel.presence.unsubscribe();
    });

    onMount(async () => {
        realtime = new Realtime.Promise({
            authUrl: "/.netlify/functions/ably-token-request",
            clientId,
        });

        channel = realtime.channels.get(`${channelNamespace}:${code}`);

        channel.subscribe("client/join", (msg) => {
            if (isValidServerMessage(msg)) {
                if (msg.data.success) {
                    console.log("The server successfully connected the client to the room.");
                } else {
                    console.log("The server was unable to connect the client to the room.");
                }
            } else {
                console.log("The server was unable to connect the client to the room.");
            }
        });

        channel.subscribe("peer/chat", (msg) => {
            console.log(`${msg.clientId} says '${msg.data.message}'`);
        });

        channel.presence.subscribe((ctx) => {
            if (ctx.action == "present") {
                players = [...players, ctx.clientId];
            } else if (ctx.action == "enter") {
                players = [...players, ctx.clientId];
            } else if (ctx.action == "leave") {
                players.splice(players.indexOf(ctx.clientId), 1);
                players = [...players];
            }
        });

        await channel.whenState("attached");
        channel.publish("server/join", { clientId });
    });

    const messagePeers = async () => {
        if (connected) {
            channel.publish("peer/chat", { message: "hello, world!!!" });
        }
    };

    const isValidServerMessage = (msg: Types.Message) => {
        return msg.connectionId == serverConnectionId;
    };
</script>

<div class="flex flex-col items-center gap-4">
    {#each players as player}
        <div class="flex w-64 rounded bg-zinc-300 p-4">
            <span class="flex-grow font-bold">{player}</span>
            {#if player == clientId}
                <span class="font-bold text-violet-500">(You)</span>
            {/if}
        </div>
    {/each}
    <button on:click={messagePeers} class="btn mt-8">Message All Players</button>
</div>
