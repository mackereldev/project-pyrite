<script lang="ts">
    export let minlength: number = -524288;
    export let maxlength: number = 524288;
    export let min: string = "";
    export let max: string = "";
    export let placeholder: string = "";
    export let required: boolean = false;
    export let omitRingStyle: boolean = false;
    export let value: any = "";
    export let element: HTMLInputElement | null = null;
</script>

<input {minlength} {maxlength} {min} {max} {placeholder} {required} bind:this={element} bind:value on:input class="{$$props.class || ''} h-8 w-64 bg-zinc-100 px-3 text-center text-lg font-medium transition-all placeholder:text-zinc-300 {!omitRingStyle && 'ring-input'}" />
