import { get, writable } from "svelte/store";
import type { Tab } from "./Tab";
import { HomeTab } from "./HomeTab";
import { ChatTab } from "./ChatTab";

export const tabsStore = writable<Tab[]>([new HomeTab()]);
export const currentTabIdx = writable<number>(0);

export const addTab = (tab: Tab) => {
    tabsStore.update((value) => value.concat(tab));
    changeTab(get(tabsStore).length - 1);
};

export const closeTab = async (tab: Tab) => {
    await tab.dispose();
    const currentIdx = get(currentTabIdx);
    // If the current tab was closed, then change the tab to the one before it
    if (tab === get(tabsStore)[currentIdx]) {
        changeTab(Math.max(0, currentIdx - 1));
    }
    tabsStore.update((value) => value.filter((t) => t !== tab));
};

export const closeAllTabs = async () => {
    for (const tab of get(tabsStore)) {
        await closeTab(tab);
    }
};

export const changeTab = (index: number) => {
    if (index >= 0 && index < get(tabsStore).length) {
        const tabs = get(tabsStore);
        const previousTab = tabs[get(currentTabIdx)];
        const currentTab = tabs[index];
        currentTabIdx.set(index);

        // Indicate that the latest message of the previous ChatTab was the last one read by the user
        if (previousTab instanceof ChatTab) {
            previousTab.lastReadMessage = get(previousTab.messages).at(-1);
        }

        // Mark the selected ChatTab as read by the user
        if (currentTab instanceof ChatTab) {
            currentTab.isUnread.set(false);
        }
    }
};
