<script lang="ts">
    export let stroke = "currentColor";
    export let strokeWidth = 1.5;
</script>

<svg xmlns="http://www.w3.org/2000/svg" fill="none" {stroke} stroke-width={strokeWidth} class="{$$props.class || ''}" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
</svg>
