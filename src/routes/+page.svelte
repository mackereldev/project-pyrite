<script lang="ts">
	import Input from "../lib/components/Input.svelte";

	let joinCode: string = "";

	const validateJoinCodeNumerical = () => {
        joinCode = joinCode.replace(/\D/g, "");
    };
    
    const joinRoom = () => {
        // Validation
        validateJoinCodeNumerical(); // Numeric

        console.log(`Joining room: ${joinCode}.`);
    }

	const createRoom = () => {
		console.log("Creating room.");
	};
</script>

<div class="flex flex-col gap-8">
	<form on:submit|preventDefault={joinRoom} class="flex flex-row w-64 h-10 overflow-clip rounded-md outline outline-1 outline-offset-0 outline-sky-600 transition-all duration-75 focus-within:outline-sky-500 focus-within:outline-2">
		<Input maxlength={6} min=0 bind:value={joinCode} on:input={validateJoinCodeNumerical} placeholder="Enter Code" omitBorderStyle class="flex-grow w-full"></Input>
		<button type="submit" class="group flex box-content items-center w-10 px-1.5 bg-sky-500 transition-colors duration-200 hover:bg-sky-400">
			<svg viewBox="0 0 24 24" class="fill-sky-100 transition-colors duration-200 group-hover:fill-stone-100">
				<path d="M12.1714 10.9998L7.51451 6.34292L8.92872 4.92871L15.9998 11.9998L8.92872 19.0708L7.51451 17.6566L12.1713 12.9998L2.99953 12.9999L2.99951 10.9999L12.1714 10.9998ZM17.9996 18.9997L17.9996 4.99972H19.9996L19.9996 18.9997H17.9996Z"/>
			</svg>
		</button>
	</form>
	<span class="text-center font-bold text-2xl text-stone-300">OR</span>
	<button id="create-room" on:click={createRoom} class="w-64 h-10 px-3 text-xl text-sky-100 font-medium text-center bg-sky-500 rounded-md transition-all duration-200 hover:text-stone-50 hover:bg-sky-400">
		Create Room
	</button>
</div>
