<script lang="ts">
    import "../app.css";
    import { toastContainerStore } from "$lib/classes/Stores";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import { tabsStore, currentTabIdx } from "$lib/classes/TabHandler";
    import { get } from "svelte/store";

    let context = "Home";
    currentTabIdx.subscribe((tabIndex) => {
        if (tabIndex > 0) {
            context = get($tabsStore[tabIndex].name);
        } else {
            context = "Home";
        }
    });
</script>

<svelte:head>
    <title>Pyrite | {context}</title>
</svelte:head>

<ToastContainer bind:this={$toastContainerStore} />

<slot />
