<script lang="ts">
    import { ChatTab } from "$lib/classes/ChatTab";
    import { toastContainerStore } from "$lib/classes/Stores";
    import { addTab } from "$lib/classes/TabHandler";
    import { preferences } from "$lib/classes/Preferences";
    import ToastData from "$lib/classes/ToastData";
    import Input from "./Input.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { Cog6Tooth } from "@steeze-ui/heroicons";
    import { preferencesModalStore } from "$lib/classes/Stores";

    let roomIdValue: string;

    const username = preferences.username;
    // Simple username sanitisation (done server-side too, also see https://www.ascii-code.com)
    username.subscribe((value) => {
        $username = value.replace(/[^\x20-\x7F]/g, "");
    });

    const createRoom = () => {
        // A ChatTab constructed without any arguments defaults to creating a new room, then joining
        addTab(new ChatTab());
    };

    const joinRoom = () => {
        // Using client-side validation and toasts provides instant feedback whereas relying on server-side validation may take more time
        if (roomIdValue.length !== 4) {
            $toastContainerStore.addToasts(new ToastData("warning", "Invalid Input", "Room ID must be 4 characters long"));
            return;
        }

        addTab(new ChatTab(roomIdValue));
    };
</script>

<div class="relative flex flex-grow flex-col items-center justify-center gap-20">
    <button on:click={$preferencesModalStore.open} class="group absolute left-4 top-4 h-9 w-9 rounded-lg bg-theme-100 p-1.5 ring-2 ring-inset ring-theme-200 transition-all hover:bg-theme-200 hover:ring-violet-500">
        <Icon src={Cog6Tooth} class="stroke-theme-300 stroke-2 transition-colors group-hover:stroke-violet-500" />
    </button>
    <div class="absolute right-4 top-4 flex flex-col">
        <span>Username</span>
        <Input bind:value={$username} placeholder="Anonymous" maxlength={24} />
    </div>
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
                    <button type="submit" class="group box-content flex w-8 items-center bg-theme-100 px-0.5 transition-colors hover:bg-violet-500">
                        <svg viewBox="0 0 24 24" class="fill-theme-400 transition-colors group-hover:fill-theme-100">
                            <path d="M12.1714 10.9998L7.51451 6.34292L8.92872 4.92871L15.9998 11.9998L8.92872 19.0708L7.51451 17.6566L12.1713 12.9998L2.99953 12.9999L2.99951 10.9999L12.1714 10.9998ZM17.9996 18.9997L17.9996 4.99972H19.9996L19.9996 18.9997H17.9996Z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
