<script lang="ts">
    export let maxlength: number = 524288;
    export let min: string = "";
    export let max: string = "";
    export let placeholder: string = "";
    export let omitBorderStyle: boolean = false;
    export let value: any = "";
</script>

<input {maxlength} {min} {max} {placeholder} bind:value={value} on:input class="{$$props.class || ''} w-64 h-10 px-3 placeholder:text-stone-500 text-2xl font-medium text-center bg-zinc-700 {omitBorderStyle ? "outline-none" : "rounded-md outline outline-1 outline-offset-0 outline-sky-600 transition-all duration-75 focus:outline-sky-500 focus:outline-2"}"/>
