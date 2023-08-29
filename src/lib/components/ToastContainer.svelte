<script lang="ts">
    import type ToastData from "$lib/classes/ToastData";
    import ToastElement from "./ToastElement.svelte";

    export let toasts: ToastData[] = [];

    export const addToasts = (...toastData: ToastData[]) => {
        toasts = toasts.concat(toastData);
    };

    const remove = (event: CustomEvent) => {
        toasts = toasts.filter((t) => t !== event.detail.toast);
    };
</script>

<div class="fixed bottom-0 right-0 flex flex-col-reverse gap-2 p-2 z-10">
    {#each toasts as toast (toast)}
        <ToastElement {toast} on:remove={remove} />
    {/each}
</div>
