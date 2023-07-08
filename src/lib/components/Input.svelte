<script lang="ts">
    export let minlength: number = -524288;
    export let maxlength: number = 524288;
    export let min: string = "";
    export let max: string = "";
    export let placeholder: string = "";
    export let required: boolean = false;
    export let omitRingStyle: boolean = false;
    export let disable1Password: boolean = true;
    export let value: string = "";
    export let element: HTMLInputElement | null = null;
</script>

<input {minlength} {maxlength} {min} {max} {placeholder} {required} data-1p-ignore={disable1Password} bind:this={element} bind:value on:input class="{$$props.class || ''} h-8 w-64 bg-zinc-100 px-3 text-lg font-medium placeholder:text-zinc-300 {omitRingStyle ? 'transition-all duration-75' : 'ring-input'}" />
