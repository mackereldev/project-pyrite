<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    $: message = statusMessages[$page.status as keyof typeof statusMessages];

    const statusMessages = {
        404: "Page not found",
        401: "Unauthorized",
        500: "Internal error",
        502: "Bad gateway",
    };
</script>

<div class="flex flex-col items-center justify-center gap-12">
    <div class="flex flex-row items-center justify-center gap-4">
        <h1 class="text-5xl font-light">{$page.status}</h1>
        <div class="h-12 w-0.5 flex-grow bg-theme-200" />
        <span class="text-lg">{message}</span>
    </div>
    <button on:click={() => goto("/")} class="btn absolute top-[60%]">Return Home</button>
</div>
