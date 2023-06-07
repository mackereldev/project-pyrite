<script lang="ts">
    export let maxlength: number = 524288;
    export let min: string = "";
    export let max: string = "";
    export let placeholder: string = "";
    export let omitBorderStyle: boolean = false;
    export let value: any = "";
</script>

<input {maxlength} {min} {max} {placeholder} bind:value={value} on:input class="{$$props.class || ''} w-64 h-8 px-3 placeholder:text-zinc-300 text-lg font-medium text-center bg-zinc-100 transition-all {omitBorderStyle ? "outline-none" : "rounded-lg outline outline-1 outline-offset-0 outline-zinc-400 focus:outline-violet-500 focus:outline-2"}"/>
