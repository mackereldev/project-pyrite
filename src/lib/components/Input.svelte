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

<input {minlength} {maxlength} {min} {max} {placeholder} {required} bind:this={element} bind:value={value} on:input class="{$$props.class || ''} w-64 h-8 px-3 placeholder:text-zinc-300 text-lg font-medium text-center bg-zinc-100 transition-all {!omitRingStyle && "ring-input"}"/>
