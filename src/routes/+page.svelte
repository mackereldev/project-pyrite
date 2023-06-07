<script lang="ts">
    import { page } from "$app/stores";
    import Input from "../lib/components/Input.svelte";

    let landingPage: HTMLDivElement;
    let roomCreationPage: HTMLDivElement;

    let joinCode: string = "";

    const validateJoinCodeNumerical = () => {
        joinCode = joinCode.replace(/\D/g, "");
    };

    const joinRoom = () => {
        // Validation
        validateJoinCodeNumerical(); // Numeric

        console.log(`Joining room: ${joinCode}.`);
    };

    const createRoom = () => {
        console.log(landingPage);
        console.log("Creating room.");
    };
</script>

<div class="group/screen absolute top-0 left-0 w-screen h-screen">
    <div bind:this={landingPage} class="absolute flex items-center justify-center w-screen h-screen transition-all duration-500 group-hover/screen:opacity-0 group-hover/screen:-translate-x-48">
        <div class="flex flex-col items-center justify-center gap-8">
            <form on:submit|preventDefault={joinRoom} class="flex flex-row w-64 h-10 overflow-clip rounded-md ring-1 ring-sky-600 transition-all duration-75 focus-within:ring-sky-500 focus-within:ring-2">
                <Input maxlength={6} min="0" bind:value={joinCode} on:input={validateJoinCodeNumerical} placeholder="Enter Code" omitBorderStyle class="flex-grow w-full" />
                <button type="submit" class="group flex box-content items-center w-10 px-1.5 bg-sky-500 transition-colors duration-200 hover:bg-sky-400">
                    <svg viewBox="0 0 24 24" class="fill-sky-100 transition-colors duration-200 group-hover:fill-stone-100">
                        <path d="M12.1714 10.9998L7.51451 6.34292L8.92872 4.92871L15.9998 11.9998L8.92872 19.0708L7.51451 17.6566L12.1713 12.9998L2.99953 12.9999L2.99951 10.9999L12.1714 10.9998ZM17.9996 18.9997L17.9996 4.99972H19.9996L19.9996 18.9997H17.9996Z" />
                    </svg>
                </button>
            </form>
            <span class="text-center font-bold text-2xl text-stone-300">OR</span>
            <button id="create-room" on:click={createRoom} class="w-64 h-10 px-3 text-xl text-sky-100 font-medium text-center bg-sky-500 rounded-md transition-all duration-200 hover:text-stone-50 hover:bg-sky-400">Create Room</button>
        </div>
    </div>
    <div bind:this={roomCreationPage} class="absolute flex items-center justify-center w-screen h-screen opacity-0 translate-x-48 transition-all duration-500 group-hover/screen:opacity-100 group-hover/screen:translate-x-0">
        <div class="flex flex-col gap-2 items-center justify-center">
            <h1 class="text-center font-bold text-2xl text-stone-200 mb-4">Room Creation</h1>
            <div class="flex flex-col">
                <span class="text-lg font-bold">Maximum Latency</span>
                <Input placeholder="Maximum Latency" />
            </div>
            <div class="flex flex-col">
                <span class="text-lg font-bold">Maximum Clients</span>
                <Input placeholder="Maximum Clients" />
            </div>
            <div class="flex flex-row gap-2 w-64">
                <button id="create-room" on:click={createRoom} class="basis-1/3 h-fit px-4 py-1 mt-6 text-lg text-sky-500 font-medium text-center bg-transparent ring-1 ring-inset ring-sky-500 rounded-lg transition-all hover:text-sky-400 hover:ring-sky-400 hover:ring-2">Back</button>
                <button id="create-room" on:click={createRoom} class="basis-2/3 h-fit px-4 py-1 mt-6 text-lg text-sky-100 font-medium text-center bg-sky-500 rounded-lg transition-all hover:text-sky-50 hover:bg-sky-400">Create</button>
            </div>
        </div>
    </div>
</div>
