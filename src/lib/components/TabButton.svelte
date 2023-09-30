<script lang="ts">
    import { ChatTab } from "$lib/classes/ChatTab";
    import type { Tab } from "$lib/classes/Tab";
    import { Home } from "@steeze-ui/heroicons";
    import { Icon } from "@steeze-ui/svelte-icon";

    export let tab: Tab;
    export let isCurrentTab: boolean;

    const tabName = tab.name;
    const isUnread = (tab as ChatTab)?.isUnread;
</script>

<button on:click class="group relative flex cursor-pointer border-x border-faint first:border-l-0 first:border-l-transparent last:border-r-2">
    <div class="flex h-full flex-grow items-center {tab.heroIcon === undefined ? 'px-4' : 'px-1'} text-sm font-semibold shadow-[0_2px] transition-all group-hover:bg-faint {isCurrentTab ? 'stroke-violet-500 text-violet-500 shadow-violet-500' : 'stroke-faded text-faded shadow-transparent group-hover:stroke-accent group-hover:text-accent'}">
        {#if tab.heroIcon !== undefined}
            <Icon src={Home} class="h-5 w-5 cursor-pointer fill-none" />
        {:else}
            {$tabName}
        {/if}
    </div>
    {#if tab instanceof ChatTab}
        {#if $isUnread}
            <div class="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-violet-400"></div>
        {/if}
    {/if}
</button>
