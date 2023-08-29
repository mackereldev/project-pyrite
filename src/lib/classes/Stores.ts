import * as Colyseus from "colyseus.js";
import { writable } from "svelte/store";
import type { GameState } from "../../../server/src/schema/GameState";
import type ChatChannel from "./ChatChannel";
import Preferences from "./Preferences";
import { subscribeStoreDefer } from "./Utility";

export const gameChat = writable<ChatChannel>();
export const clientStore = writable<Colyseus.Client>(new Colyseus.Client("ws://localhost:2567"));
export const roomStore = writable<Colyseus.Room<GameState>>();
export const preferencesStore = writable<Preferences>(Preferences.loadPrefs());

subscribeStoreDefer(preferencesStore, (prefs) => {
    Preferences.savePrefs(prefs);
});
