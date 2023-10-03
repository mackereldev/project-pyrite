<script lang="ts">
    import "../app.css";
    import { toastContainerStore } from "$lib/classes/Stores";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import { tabsStore, currentTabIdx } from "$lib/classes/TabHandler";
    import type { Unsubscriber } from "svelte/store";

    let context = "Home";
    let tabNameUnsubscriber: Unsubscriber | undefined;
    currentTabIdx.subscribe((tabIndex) => {
        // Remove existing subscription
        if (tabNameUnsubscriber) {
            tabNameUnsubscriber();
            tabNameUnsubscriber = undefined;
        }

        if (tabIndex > 0) {
            tabNameUnsubscriber = $tabsStore[tabIndex].name.subscribe((value) => (context = value));
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
