<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { tweened } from "svelte/motion";
    import { linear, quintOut, circOut } from "svelte/easing";
    import { onMount, createEventDispatcher } from "svelte";
    import type ToastData from "$lib/classes/ToastData";
    import { Icon, type IconSource } from "@steeze-ui/svelte-icon";
    import { QuestionMarkCircle, CheckCircle, InformationCircle, ExclamationCircle, XCircle, XMark } from "@steeze-ui/heroicons";

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

    let colour: string = "bg-faint";
    let icon: IconSource = QuestionMarkCircle;
    if (toast.severity === "success") {
        colour = "bg-emerald-200";
        icon = CheckCircle;
    } else if (toast.severity === "info") {
        colour = "bg-sky-200";
        icon = InformationCircle;
    } else if (toast.severity === "warning") {
        colour = "bg-yellow-200";
        icon = ExclamationCircle;
    } else if (toast.severity === "error") {
        colour = "bg-red-200";
        icon = XCircle;
    }

    const dispatch = createEventDispatcher();
</script>

<div in:fly={{ x: 100, duration: 500, opacity: 1, easing: quintOut }} out:fade={{ duration: 200, easing: circOut }} class="flex h-20 w-96">
    <button on:click={remove} class="relative flex flex-grow items-center gap-3 truncate rounded-lg px-4 {colour}">
        <Icon src={icon} class="h-8 w-8 stroke-zinc-600" />
        <div class="flex flex-grow flex-col items-start text-zinc-600">
            <div class="text-lg font-medium">{toast.message}</div>
            <div class="text-sm">{toast.detail}</div>
        </div>
        <Icon src={XMark} class="h-7 w-7 stroke-neutral-800/20 stroke-2 transition-colors hover:stroke-neutral-600/50" />
        {#if toast.expires}
            <div bind:this={progressBar} class="absolute bottom-0 left-0 h-1 bg-neutral-800/20" />
        {/if}
    </button>
</div>
