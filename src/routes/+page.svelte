<script lang="ts">
    import Input from "../lib/components/Input.svelte";
    import RadioButtonGroup from "../lib/components/RadioButtonGroup.svelte";
    import RadioButton from "../lib/components/RadioButton.svelte";

    let joinCode: string = "";
    let maxLatency = 500;
    let maxClients = 4;

    const validateJoinCodeNumerical = () => {
        joinCode = joinCode.replace(/\D/g, "");
    };

    const joinRoom = () => {
        // Validation
        validateJoinCodeNumerical(); // Numeric

        console.log(`Joining room: ${joinCode}.`);
    };

    const createRoom = () => {
        console.log("Creating room.");
    };
</script>

<div class="flex flex-row gap-8">
    <div class="flex flex-col gap-2 justify-center">
        <h1 class="text-center font-bold text-2xl mb-4">Join</h1>
        <form on:submit|preventDefault={joinRoom} class="flex flex-row w-48 h-fit overflow-clip rounded-lg outline outline-1 outline-offset-0 outline-zinc-400 transition-all focus-within:outline-violet-500 focus-within:outline-2">
            <Input maxlength={6} min="0" bind:value={joinCode} on:input={validateJoinCodeNumerical} placeholder="Enter Code" omitBorderStyle class="flex-grow w-full h-9" />
            <button type="submit" class="group flex box-content items-center w-8 px-0.5 bg-zinc-100 transition-colors hover:bg-violet-500">
                <svg viewBox="0 0 24 24" class="fill-zinc-400 transition-colors group-hover:fill-stone-100">
                    <path d="M12.1714 10.9998L7.51451 6.34292L8.92872 4.92871L15.9998 11.9998L8.92872 19.0708L7.51451 17.6566L12.1713 12.9998L2.99953 12.9999L2.99951 10.9999L12.1714 10.9998ZM17.9996 18.9997L17.9996 4.99972H19.9996L19.9996 18.9997H17.9996Z" />
                </svg>
            </button>
        </form>
    </div>
    <div class="block w-px flex-grow bg-stone-300" />
    <div class="flex flex-col gap-2 w-64">
        <h1 class="text-center font-bold text-2xl mb-4">Host</h1>
        <div class="flex flex-col">
            <fieldset>
                <legend class="text-lg font-bold">Maximum Latency</legend>
                <RadioButtonGroup>
                    <RadioButton name="max-latency" bind:group={maxLatency} label="100" value={100} />
                    <RadioButton name="max-latency" bind:group={maxLatency} label="250" value={250} />
                    <RadioButton name="max-latency" bind:group={maxLatency} label="500" value={500} />
                    <RadioButton name="max-latency" bind:group={maxLatency} label="2000" value={2000} />
                    <RadioButton name="max-latency" bind:group={maxLatency} label="∞" value={Infinity} />
                </RadioButtonGroup>
            </fieldset>
        </div>
        <div class="flex flex-col">
            <fieldset>
                <legend class="text-lg font-bold">Maximum Clients</legend>
                <RadioButtonGroup>
                    <RadioButton name="max-clients" bind:group={maxClients} label="2" value={2} />
                    <RadioButton name="max-clients" bind:group={maxClients} label="4" value={4} />
                    <RadioButton name="max-clients" bind:group={maxClients} label="8" value={8} />
                    <RadioButton name="max-clients" bind:group={maxClients} label="16" value={16} />
                </RadioButtonGroup>
            </fieldset>
        </div>
        <button id="create-room" on:click={createRoom} class="self-end w-fit h-fit px-4 py-1 mt-6 text-lg text-violet-100 font-medium text-center bg-violet-500 rounded-lg transition-all hover:text-violet-50 hover:bg-violet-400"> Create Room </button>
    </div>
</div>
