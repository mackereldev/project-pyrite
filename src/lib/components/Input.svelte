<script lang="ts">
    export let maxlength: number = 524288;
    export let min: string = "";
    export let max: string = "";
    export let placeholder: string = "";
    export let omitBorderStyle: boolean = false;
    export let value: any = "";
</script>

<input {maxlength} {min} {max} {placeholder} bind:value={value} on:input class="{$$props.class || ''} w-64 h-10 px-3 placeholder:text-stone-500 text-2xl font-medium text-center bg-zinc-700 outline-0 {omitBorderStyle || "rounded-md ring-1 ring-sky-600 transition-all duration-75 focus:ring-sky-500 focus:ring-2"}"/>
