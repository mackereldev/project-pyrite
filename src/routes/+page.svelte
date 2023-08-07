<script lang="ts">
    import type { GameState } from "../../server/src/rooms/schema/GameState";
    import Input from "$lib/components/Input.svelte";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import ToastData from "$lib/classes/ToastData";
    import { client, room, preferencesStore } from "$lib/classes/Stores";
    import { goto } from "$app/navigation";
    import type { PageData } from "./$types";
    import PreferencesModal from "$lib/components/Modal/PreferencesModal.svelte";
    import RadioButtonGroup from "$lib/components/RadioButtonGroup.svelte";
    import RadioButton from "$lib/components/RadioButton.svelte";

    export let data: PageData;
    $: ({ errorReason } = data ?? {});

    let toastContainer: ToastContainer;
    let preferencesModal: PreferencesModal;

    let characterNameValue: string;
    let roomIdValue: string;
    let maxClientsValue: number = 4;

    onMount(() => {
        characterNameValue = $preferencesStore.characterName;

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
            $room = await $client.create<GameState>("game", { clientId: characterNameValue, maxClients: maxClientsValue });

            goto(`/play/${$room.id}`);
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
                goto(`/play/${roomId}`);
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
<PreferencesModal bind:this={preferencesModal} />

<div class="flex flex-col gap-12">
    <div class="flex flex-col items-center rounded-lg p-6 ring-2 ring-zinc-300">
        <h2 class="mb-4 text-center text-2xl font-bold">Preferences</h2>
        <div class="flex flex-col">
            <span class="text-lg font-light">Character Name</span>
            <!-- prettier-ignore -->
            <Input bind:value={characterNameValue} on:input={() => {$preferencesStore.characterName = characterNameValue;}} placeholder="Player" class="text-center" />
        </div>
    </div>
    <div class="flex flex-row gap-8">
        <div class="flex flex-col justify-center gap-2">
            <h2 class="mb-4 text-center text-2xl font-bold">Join</h2>
            <form on:submit|preventDefault={submitRoomId} class="ring-input flex h-fit w-48 flex-row overflow-clip">
                <!-- prettier-ignore -->
                <Input bind:value={roomIdValue} placeholder="Enter Code" id="room-id-input" on:input={() => {roomIdValue = roomIdValue.replaceAll(/[^A-Za-z]+/g, '').toUpperCase()}} maxlength={4} omitRingStyle class="h-9 w-full flex-grow text-center" />
                <button type="submit" class="group box-content flex w-8 items-center bg-zinc-100 px-0.5 transition-colors hover:bg-violet-500">
                    <svg viewBox="0 0 24 24" class="fill-zinc-400 transition-colors group-hover:fill-zinc-100">
                        <path d="M12.1714 10.9998L7.51451 6.34292L8.92872 4.92871L15.9998 11.9998L8.92872 19.0708L7.51451 17.6566L12.1713 12.9998L2.99953 12.9999L2.99951 10.9999L12.1714 10.9998ZM17.9996 18.9997L17.9996 4.99972H19.9996L19.9996 18.9997H17.9996Z" />
                    </svg>
                </button>
            </form>
        </div>
        <div class="w-0.5 flex-grow bg-zinc-200" />
        <div class="flex w-64 flex-col gap-2">
            <h2 class="mb-4 text-center text-2xl font-bold">Host</h2>
            <form on:submit|preventDefault={createRoom} class="flex flex-col gap-2">
                <div class="flex flex-col">
                    <fieldset>
                        <legend class="text-lg font-light">Maximum Clients</legend>
                        <RadioButtonGroup>
                            <RadioButton name="max-clients" bind:group={maxClientsValue} label="2" value={2} />
                            <RadioButton name="max-clients" bind:group={maxClientsValue} label="4" value={4} />
                            <RadioButton name="max-clients" bind:group={maxClientsValue} label="8" value={8} />
                            <RadioButton name="max-clients" bind:group={maxClientsValue} label="16" value={16} />
                        </RadioButtonGroup>
                    </fieldset>
                </div>
                <button type="submit" class="btn btn-highlight mt-6 self-end">Create Room</button>
            </form>
        </div>
    </div>
</div>
