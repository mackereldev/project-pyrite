import * as Colyseus from "colyseus.js";
import { writable } from "svelte/store";
import { Preferences } from "./Preferences";
import { subscribeStoreDefer } from "./Utility";
import type ToastContainer from "$lib/components/ToastContainer.svelte";

export const clientStore = writable<Colyseus.Client>(new Colyseus.Client("ws://localhost:2567"));
export const preferencesStore = writable<Preferences>(Preferences.loadPrefs());
export const toastContainerStore = writable<ToastContainer>();

subscribeStoreDefer(preferencesStore, (prefs) => {
    Preferences.savePrefs(prefs);
});
