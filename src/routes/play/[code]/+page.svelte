<script lang="ts">
    import type { PageData } from "./$types";
    import { onMount } from "svelte";
    import { Realtime, Types } from "ably/promises";
    
    export let data: PageData;
    let { code, clientId } = data ?? {};
    
    let channel: Types.RealtimeChannelPromise;
    $: serviceStatus = channel ? "Connected to Ably" : "Offline";
    $: console.log(`STATUS: ${serviceStatus}`);
    
    let players: string[] = [];
    $: players;
    
    onMount(async () => {
        const realtime = new Realtime.Promise({
            authUrl: "/.netlify/functions/ably-token-request",
            clientId,
        });
    
        channel = realtime.channels.get(code);
    
        channel.presence.subscribe("present", (ctx) => {
            console.log(`${ctx.clientId} is already here.`);
            players = [...players, ctx.clientId];
        });
        
        channel.presence.subscribe("enter", (ctx) => {
            console.log(`${ctx.clientId} joined the room.`);
            players = [...players, ctx.clientId];
        });
        
        channel.presence.subscribe("leave", (ctx) => {
            console.log(`${ctx.clientId} left the room.`);
            players.splice(players.indexOf(ctx.clientId), 1);
            players = [...players];
        });
        
        channel.presence.enter();
    })
</script>

<div class="flex flex-col items-center gap-4">
    {#each players as player}
        <div class="bg-zinc-300 p-4 w-64 rounded">
            <span class="font-bold">{player}</span>
        </div>
    {/each}
</div>
