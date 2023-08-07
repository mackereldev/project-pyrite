<script lang="ts">
    import { client, preferencesStore, room } from "$lib/classes/Stores";
    import { onMount } from "svelte";
    import type { PageData } from "./$types";
    import { beforeNavigate, goto } from "$app/navigation";
    import Input from "$lib/components/Input.svelte";
    import type { GameState } from "../../../../../server/src/rooms/schema/GameState";
    import type { BeforeNavigate } from "@sveltejs/kit";

    export let data: PageData;
    $: ({ roomId } = data ?? {});

    let messageValue: string;

    let messages: { author: string; msg: string }[] = [];

    $: connected = !!$room && $room.connection.isOpen;
    $: console.log(connected);

    beforeNavigate(async (navigation: BeforeNavigate) => {
        await leaveRoom(true);
    })

    onMount(() => {
        if (!connected) {
            $client
            .joinById<GameState>(roomId, { clientId: $preferencesStore.nickname })
                .then((r) => {
                    $room = r;
                    registerMessages();
                })
                .catch((err) => {
                    goto(`/colyseus-client?error=${err.code}`);
                });
        } else {
            registerMessages();
        }
    });

    const registerMessages = () => {
        $room.onLeave((code) => {
            connected = false;
            goto(`/colyseus-client?error=${code}`);
        });

        if (process.env.NODE_ENV === "development") {
            $room.onMessage("__playground_message_types", (message) => {
                console.debug("Playground message types", message);
            });
        }

        $room.onMessage("chat", (message) => {
            const { author, msg }: { msg: string; author: { sessionId: string; clientId: string } } = message;
            console.debug(message);
            messages = messages.concat({ author: author.clientId, msg });
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

    const sendMessage = () => {
        if (connected) {
            const msg = messageValue.replace(/[^ -~]+/g, "").trim();
            if (msg.length > 0) {
                $room.send("chat", { msg: messageValue });
            }
            messageValue = "";
        }
    };
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-12">
    <span class="text-3xl">Room: {connected ? $room.id : "Offline"}</span>
    <div>
        <form on:submit|preventDefault={sendMessage} class="flex flex-col">
            <label for="message-input" class="text-lg">Send Message</label>
            <Input bind:value={messageValue} type="text" id="message-input" />
        </form>
    </div>
    <div class="flex h-64 w-96 flex-col overflow-y-scroll px-4 py-2 ring-2 ring-zinc-300">
        {#each messages as message}
            <div class="flex gap-2">
                <span class="font-bold text-violet-500">{message.author}</span>
                <div class="break-all">{message.msg}</div>
            </div>
        {/each}
    </div>
</div>

