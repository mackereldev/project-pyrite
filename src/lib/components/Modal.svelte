<script lang="ts">
    let dialog: HTMLDialogElement;

    const onClick = (e: MouseEvent) => {
        if (e.target === dialog) {
            dialog.close();
        }
    };

    export const open = () => {
        if (!dialog.open) {
            dialog.showModal();
        }
    };

    export const close = () => {
        if (dialog.open) {
            dialog.close();
        }
    };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:click={onClick} class="p-0">
    <div class="p-4">
        <slot />
    </div>
</dialog>
