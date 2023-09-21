<script lang="ts">
    import { ChatTab } from "$lib/classes/ChatTab";
    import { preferencesStore, toastContainerStore } from "$lib/classes/Stores";
    import { addTab } from "$lib/classes/TabHandler";
    import ToastData from "$lib/classes/ToastData";
    import Input from "./Input.svelte";

    let roomIdValue: string;

    const createRoom = () => {
        addTab(new ChatTab());
    };

    const joinRoom = () => {
        if (roomIdValue.length !== 4) {
            $toastContainerStore.addToasts(new ToastData("warning", "Invalid Input", "Room ID must be 4 characters long"));
            return;
        }

        addTab(new ChatTab(roomIdValue));
    };
</script>

<div class="relative flex h-full flex-col items-center justify-center gap-20">
    {#if $preferencesStore}
        <div class="absolute right-4 top-4 flex flex-col">
            <span>Username</span>
            <Input bind:value={$preferencesStore.username} placeholder="User" />
        </div>
    {/if}
    <div class="flex flex-col items-center">
        <h1 class="text-3xl">Welcome to <span class="text-amber-500">Pyrite</span></h1>
        <p>A messaging app</p>
    </div>
    <div class="flex w-48 flex-col items-center gap-6">
        <button on:click={createRoom} class="btn w-full">Create a room</button>
        <p class="text-lg">OR</p>
        <div class="flex flex-col items-center">
            <p class="mb-2">Join an existing one</p>
            <div class="flex flex-col gap-2">
                <form on:submit|preventDefault={joinRoom} class="ring-input flex h-fit flex-row overflow-clip">
                    <!-- prettier-ignore -->
                    <Input bind:value={roomIdValue} placeholder="Enter Code" id="room-id-input" on:input={() => {roomIdValue = roomIdValue.replaceAll(/[^A-Za-z]+/g, '').toUpperCase()}} maxlength={4} omitRingStyle class="h-9 w-full flex-grow text-center" />
                    <button type="submit" class="group box-content flex w-8 items-center bg-zinc-100 px-0.5 transition-colors hover:bg-violet-500">
                        <svg viewBox="0 0 24 24" class="fill-zinc-400 transition-colors group-hover:fill-zinc-100">
                            <path d="M12.1714 10.9998L7.51451 6.34292L8.92872 4.92871L15.9998 11.9998L8.92872 19.0708L7.51451 17.6566L12.1713 12.9998L2.99953 12.9999L2.99951 10.9999L12.1714 10.9998ZM17.9996 18.9997L17.9996 4.99972H19.9996L19.9996 18.9997H17.9996Z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
