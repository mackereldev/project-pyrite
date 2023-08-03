import { writable } from "svelte/store";
import type { Types } from "ably";
import type ChatChannel from "./ChatChannel";
import Preferences from "./Preferences";
import { subscribeStoreDefer } from "./Utility";

export const channelStore = writable<Types.RealtimeChannelPromise>();
export const gameChatStore = writable<ChatChannel>();
export const preferencesStore = writable<Preferences>(Preferences.loadPrefs());

subscribeStoreDefer(preferencesStore, (prefs) => {
    Preferences.savePrefs(prefs);
});
