<script lang="ts">
    import type { GameState } from "../../../server/src/rooms/schema/GameState";
    import Input from "$lib/components/Input.svelte";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import ToastData from "$lib/classes/ToastData";
    import { client, room, preferencesStore } from "$lib/classes/Stores";
    import { goto } from "$app/navigation";
    import type { PageData } from "./$types";

    export let data: PageData;
    $: ({ errorReason } = data ?? {});

    let characterNameValue: string;
    let roomIdValue: string;

    let toastContainer: ToastContainer;

    onMount(() => {
        characterNameValue = $preferencesStore.nickname;

        if ($page.url.searchParams.has("error")) {
            $page.url.searchParams.delete("error");
            window.history.replaceState(window.history.state, "", $page.url);
        }
        if (errorReason != -1) {
            handleError(errorReason);
        }
    });

    const createRoom = async () => {
        try {
            $room = await $client.create<GameState>("game", { clientId: characterNameValue, maxClients: 8 });

            goto(`/colyseus-client/play/${$room.id}`);
        } catch (error) {
            throw error;
        }
    };

    const joinRoom = async (roomId: string) => {
        console.debug(`attempting to join room '${roomId}'`);

        $client
            .joinById<GameState>(roomId, { clientId: characterNameValue })
            .then((r) => {
                $room = r;
                goto(`/colyseus-client/play/${roomId}`);
            })
            .catch((err) => {
                handleError(err.code);
            });
    };

    const handleError = (code: number) => {
        if (code === 4101) {
            toastContainer.addToasts(new ToastData("error", "Unable to Join", "Character name was taken"));
        } else if (code === 4212) {
            toastContainer.addToasts(new ToastData("error", "Unable to Join", "Room not found"));
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

<ToastContainer bind:this={toastContainer} />

<div class="flex h-full w-full flex-col items-center justify-center gap-12">
    <div class="flex flex-col items-center gap-16">
        <!-- prettier-ignore -->
        <Input bind:value={characterNameValue} on:input={() => {$preferencesStore.nickname = characterNameValue}} placeholder="Character Name" />
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
</div>

