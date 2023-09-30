<script lang="ts">
    export let name: string;
    export let value: string | number;
    export let label: string;
    export let group = -1;
</script>

<div class="relative h-full flex-grow">
    <input type="radio" {name} {value} bind:group class="peer h-full w-full appearance-none bg-theme-100 transition-colors checked:bg-violet-500 hover:bg-theme-200 hover:checked:bg-violet-600" />
    <div class="group pointer-events-none absolute left-0 top-0 flex h-full w-full items-center">
        <div class="flex-grow text-center text-sm transition-colors peer-checked:group-[]:text-theme-100">
            {label}
        </div>
    </div>
</div>
