<script lang="ts">
    import "../app.css";
    import { toastContainerStore } from "$lib/classes/Stores";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
</script>

<svelte:head>
    <title>Chat App</title>
</svelte:head>

<ToastContainer bind:this={$toastContainerStore} />

<slot />
