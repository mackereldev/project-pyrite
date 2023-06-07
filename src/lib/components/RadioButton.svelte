<script lang="ts">
    export let name: string;
    export let value: string | number;
    export let label: string;
    export let group = -1;
</script>

<div class="relative flex-grow h-full">
    <input type="radio" {name} {value} bind:group={group} class="peer appearance-none w-full h-full bg-zinc-100 transition-colors hover:bg-zinc-200 checked:bg-violet-500 hover:checked:bg-violet-600">
    <div class="group absolute flex top-0 left-0 w-full h-full items-center pointer-events-none">
        <div class="transition-colors peer-checked:group-[]:text-zinc-100 flex-grow text-center text-sm">
            {label}
        </div>
    </div>
</div>
