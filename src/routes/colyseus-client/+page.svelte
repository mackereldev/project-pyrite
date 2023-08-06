<script lang="ts">
    import * as Colyseus from "colyseus.js";
    import type { GameState } from "../../../server/src/rooms/schema/GameState";
    import Input from "$lib/components/Input.svelte";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import ToastData from "$lib/classes/ToastData";

    const client = new Colyseus.Client("ws://localhost:2567");
    let room: Colyseus.Room<GameState>;

    let usernameValue: string;
    let roomIdValue: string;
    let messageValue: string;

    let messages: { author: string; msg: string }[] = [];

    $: connected = !!room && room.connection.isOpen;

    let toastContainer: ToastContainer;

    onMount(() => {
        page.subscribe((value) => {
            changeRoom(value.url.hash.slice(1));
        });
    });

    const createRoom = async () => {
        try {
            room = await client.create<GameState>("game", { clientId: usernameValue, maxClients: 8 });

            setURLHashSilently(room.id, true);
            registerMessages();
        } catch (error) {
            throw error;
        }
    };

    const joinRoom = async (roomId: string) => {
        const pageData = get(page);
        console.debug(`attempting to join room '${roomId}'`);

        client
            .joinById<GameState>(roomId, { clientId: usernameValue })
            .then((r) => {
                room = r;
                registerMessages();
                pageData.url.hash = roomId;
                history.replaceState(window.history.state, "", pageData.url);
            })
            .catch((err) => {
                if (err.code === 4001) {
                    toastContainer.addToasts(new ToastData("error", "Unable to Join", "Username was taken"));
                } else if (err.code === 4212) {
                    toastContainer.addToasts(new ToastData("error", "Unable to Join", "Room not found"));
                }
                pageData.url.hash = "";
                history.replaceState(window.history.state, "", pageData.url);
            });
    };

    const registerMessages = () => {
        room.onLeave(() => {
            leaveRoom(false);
        })

        if (process.env.NODE_ENV === "development") {
            room.onMessage("__playground_message_types", (message) => {
                console.debug("Playground message types", message);
            });
        }

        room.onMessage("chat", (message) => {
            const { author, msg }: { msg: string; author: { sessionId: string; clientId: string } } = message;
            console.debug(message);
            messages = messages.concat({ author: author.clientId, msg });
        });
    };

    const sendMessage = () => {
        const msg = messageValue.replace(/[^ -~]+/g, "").trim();
        if (msg.length > 0) {
            room.send("chat", { msg: messageValue });
        }
        messageValue = "";
    };

    const changeRoom = async (roomId: string) => {
        if (roomId.length === 4 && roomId.match(/^[A-Z]+$/)) {
            joinRoom(roomId);
        } else {
            leaveRoom(true);
        }
    };
    
    const leaveRoom = async (consented: boolean) => {
        if (room) {
            room.removeAllListeners();
            if (room.connection.isOpen) {
                await room.leave(consented);
            }
        }

        connected = room != null && room.connection.isOpen;
        setURLHashSilently("", true);
    }

    const setURLHashSilently = (hash: string, replace: boolean) => {
        const pageData = get(page);
        pageData.url.hash = hash;

        if (replace) {
            history.replaceState(window.history.state, "", pageData.url);
        } else {
            history.pushState(window.history.state, "", pageData.url);
        }
    };

    const submitRoomId = () => {
        if (roomIdValue.length !== 4) {
            toastContainer.addToasts(new ToastData("warning", "Invalid Input", "Room ID must be 4 characters long"));
            return;
        }

        joinRoom(roomIdValue);
    };
</script>

<svelte:window on:hashchange={() => changeRoom(window.location.hash.slice(1))} />

<ToastContainer bind:this={toastContainer} />

<div class="flex h-full w-full items-center justify-center flex-col gap-12">
    {#if room && connected}
        <span class="text-3xl">Room: {room.id}</span>
        <div>
            <form on:submit|preventDefault={sendMessage} class="flex flex-col">
                <label for="message-input" class="text-lg">Send Message</label>
                <Input bind:value={messageValue} type="text" id="message-input" />
            </form>
        </div>
        <div class="flex flex-col ring-2 ring-zinc-300 w-96 h-64 overflow-y-scroll px-4 py-2">
            {#each messages as message}
                <div class="flex gap-2">
                    <span class="text-violet-500 font-bold">{message.author}</span>
                    <div class="break-all">{message.msg}</div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="flex flex-col gap-16 items-center">
            <Input bind:value={usernameValue} placeholder="Username" />
            <div class="flex gap-8">
                <form on:submit|preventDefault={submitRoomId} class="flex flex-col gap-4">
                    <div class="flex flex-col">
                        <label for="room-id-input" class="text-lg">Room ID</label>
                        <!-- prettier-ignore -->
                        <Input bind:value={roomIdValue} placeholder="Enter Code" id="room-id-input" on:input={() => {roomIdValue = roomIdValue.replaceAll(/[^A-Za-z]+/g, '').toUpperCase()}} maxlength={4} />
                    </div>
                    <button type="submit" class="btn btn-highlight">Join Room</button>
                </form>
                <form on:submit|preventDefault={createRoom} class="flex flex-col">
                    <button type="submit" class="btn btn-highlight">Create Room</button>
                </form>
            </div>
        </div>
    {/if}
</div>
