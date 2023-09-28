import * as Colyseus from "colyseus.js";
import { writable } from "svelte/store";
import type ToastContainer from "$lib/components/ToastContainer.svelte";
import type PreferencesModal from "$lib/components/Modal/PreferencesModal.svelte";

export const clientStore = writable<Colyseus.Client>(new Colyseus.Client("ws://localhost:2567"));
export const toastContainerStore = writable<ToastContainer>();
export const preferencesModalStore = writable<PreferencesModal>();
