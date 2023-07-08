<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { tweened } from "svelte/motion";
    import { linear, quintOut, circOut } from "svelte/easing";
    import { onMount, createEventDispatcher } from "svelte";
    import Success from "$lib/components/svg/Success.svelte";
    import Info from "$lib/components/svg/Info.svelte";
    import Warning from "$lib/components/svg/Warning.svelte";
    import Error from "$lib/components/svg/Error.svelte";
    import type ToastData from "$lib/classes/ToastData";

    export let toast: ToastData;

    let progressBar: HTMLDivElement;
    const progress = tweened(1, {
        duration: toast.duration,
        easing: linear,
    });

    const remove = () => {
        dispatch("remove", { toast });
    };

    onMount(() => {
        if (toast.expires) {
            progress.subscribe((value) => {
                progressBar && (progressBar.style.width = `${value * 100}%`);

                if (value <= 0) {
                    remove();
                }
            });

            progress.set(0);
        }
    });

    let colour = "bg-zinc-200";
    if (toast.severity == "success") {
        colour = "bg-emerald-200";
    } else if (toast.severity == "info") {
        colour = "bg-sky-200";
    } else if (toast.severity == "warning") {
        colour = "bg-yellow-200";
    } else if (toast.severity == "error") {
        colour = "bg-red-200";
    }

    const dispatch = createEventDispatcher();
</script>

<div in:fly={{ x: 100, duration: 500, opacity: 1, easing: quintOut }} out:fade={{ duration: 200, easing: circOut }} class="flex h-20 w-96">
    <button on:click={remove} class="relative flex flex-grow items-center gap-3 truncate rounded-lg px-4 {colour}">
        {#if toast.severity == "success"}
            <Success class="h-8 w-8" />
        {:else if toast.severity == "info"}
            <Info class="h-8 w-8" />
        {:else if toast.severity == "warning"}
            <Warning class="h-8 w-8" />
        {:else if toast.severity == "error"}
            <Error class="h-8 w-8" />
        {/if}
        <div class="flex flex-grow flex-col items-start">
            <div class="text-lg font-medium">{toast.message}</div>
            <div class="text-sm">{toast.detail}</div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 460.775 460.775" class="fill-neutral-800/20 transition-colors hover:fill-neutral-600/50">
            <path d="M285.08 230.397 456.218 59.27c6.076-6.077 6.076-15.911 0-21.986L423.511 4.565a15.55 15.55 0 0 0-21.985 0l-171.138 171.14L59.25 4.565a15.551 15.551 0 0 0-21.985 0L4.558 37.284c-6.077 6.075-6.077 15.909 0 21.986l171.138 171.128L4.575 401.505c-6.074 6.077-6.074 15.911 0 21.986l32.709 32.719a15.555 15.555 0 0 0 21.986 0l171.117-171.12 171.118 171.12a15.551 15.551 0 0 0 21.985 0l32.709-32.719c6.074-6.075 6.074-15.909 0-21.986L285.08 230.397z" />
        </svg>
        {#if toast.expires}
            <div bind:this={progressBar} class="absolute bottom-0 left-0 h-1 bg-neutral-800/20" />
        {/if}
    </button>
</div>
