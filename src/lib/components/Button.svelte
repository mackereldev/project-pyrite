<script lang="ts">
    export let highlight = false;

    const defaultStyle = "text-zinc-500 ring-1 ring-zinc-400 hover:text-violet-600 hover:ring-violet-500 hover:ring-[1.5px]";
    const highlightStyle = "font-medium text-zinc-100 bg-violet-500 hover:text-zinc-50 hover:bg-violet-400";
</script>

<button id="create-room" on:click class="{$$props.class || ''} px-4 py-1 text-lg {highlight ? highlightStyle : defaultStyle} rounded-lg text-center transition-all">
    <slot />
</button>
