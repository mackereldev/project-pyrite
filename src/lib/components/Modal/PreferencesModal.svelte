<script lang="ts">
    import Modal from "../Modal.svelte";
    import { preferencesStore } from "$lib/classes/Stores";
    import { get } from "svelte/store";
    import { onMount } from "svelte";
    
    let modal: Modal;
    let mounted = false;

    let darkModeInput: boolean;

    onMount(() => {
        mounted = true;
        darkModeInput = get(preferencesStore).darkMode;
    })

    const savePrefs = () => {
        if (mounted) {
            $preferencesStore.darkMode = darkModeInput;
        }
    }

    export const open = () => modal.open();
    export const close = () => modal.close();
</script>

<Modal bind:this={modal}>
    <form on:submit|preventDefault={savePrefs} on:change={savePrefs}>
        <label for="pref-dark-mode">Dark Mode</label>
        <input bind:checked={darkModeInput} type="checkbox" id="pref-dark-mode" value="Dark Mode">
    </form>
</Modal>
