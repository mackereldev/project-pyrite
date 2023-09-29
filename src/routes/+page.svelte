<script lang="ts">
    import { beforeNavigate } from "$app/navigation";
    import { ChatTab } from "$lib/classes/ChatTab";
    import { HomeTab } from "$lib/classes/HomeTab";
    import ChatTabContent from "$lib/components/ChatTabContent.svelte";
    import TabButton from "$lib/components/TabButton.svelte";
    import PreferencesModal from "$lib/components/Modal/PreferencesModal.svelte";
    import HomeTabContent from "$lib/components/HomeTabContent.svelte";
    import { tabsStore, currentTabIdx, changeTab, closeAllTabs } from "$lib/classes/TabHandler";
    import { preferencesModalStore } from "$lib/classes/Stores";

    $: currentTab = $tabsStore[$currentTabIdx];

    beforeNavigate(async () => {
        closeAllTabs();
    });
</script>

<PreferencesModal bind:this={$preferencesModalStore} />

<div class="flex h-full w-full gap-4 p-6">
    <div class="flex flex-1 basis-[36rem] flex-col overflow-hidden rounded ring-2 ring-border">
        <div class="flex h-7 border-b-2 border-border">
            {#each $tabsStore as tab, index}
                <TabButton on:click={() => changeTab(index)} {tab} isCurrentTab={currentTab === tab} />
            {/each}
        </div>
        {#if currentTab instanceof HomeTab}
            <HomeTabContent />
        {:else if currentTab instanceof ChatTab}
            {#key currentTab}
                <ChatTabContent chatTab={currentTab} />
            {/key}
        {/if}
    </div>
</div>
