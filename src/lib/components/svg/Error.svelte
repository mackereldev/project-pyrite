<script lang="ts">
    export let stroke = "currentColor";
    export let strokeWidth = 1.5;
</script>

<svg xmlns="http://www.w3.org/2000/svg" fill="none" {stroke} stroke-width={strokeWidth} class="{$$props.class || ''}" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
</svg>
