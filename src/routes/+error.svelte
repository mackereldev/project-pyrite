<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let statusDesc: string;
    switch ($page.status) {
        case 404:
            statusDesc = "Page not found";
            break;
        default:
            statusDesc = "Unknown error";
            break;
    }
</script>

<div class="flex flex-col items-center justify-center gap-12">
    <div class="flex flex-row items-center justify-center gap-4">
        <h1 class="text-5xl font-light">{$page.status}</h1>
        <div class="block w-px h-12 flex-grow bg-zinc-300" />
        <span class="text-lg">{statusDesc}</span>
    </div>
    <Button on:click={() => goto("/")} class="absolute top-[60%]">Return Home</Button>
</div>
