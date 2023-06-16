<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    $: message = statusMessages[$page.status as keyof typeof statusMessages];

    const statusMessages = {
        404: "Page not found",
        401: "Unauthorized",
        500: "Internal error",
        502: "Bad gateway"
    };
</script>

<div class="flex flex-col items-center justify-center gap-12">
    <div class="flex flex-row items-center justify-center gap-4">
        <h1 class="text-5xl font-light">{$page.status}</h1>
        <div class="w-px h-12 flex-grow bg-zinc-300" />
        <span class="text-lg">{message}</span>
    </div>
    <Button on:click={() => goto("/")} class="absolute top-[60%]">Return Home</Button>
</div>
