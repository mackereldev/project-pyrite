import type { Types } from "ably";
import { writable } from "svelte/store";
import type ChatChannel from "./ChatChannel";
import * as Colyseus from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import Preferences from "./Preferences";
import { subscribeStoreDefer } from "./Utility";

export const channelStore = writable<Types.RealtimeChannelPromise>();
export const gameChatStore = writable<ChatChannel>();
export const client = writable<Colyseus.Client>(new Colyseus.Client("ws://localhost:2567"));
export const room = writable<Colyseus.Room<GameState>>();
export const preferencesStore = writable<Preferences>(Preferences.loadPrefs());

subscribeStoreDefer(preferencesStore, (prefs) => {
    Preferences.savePrefs(prefs);
});
