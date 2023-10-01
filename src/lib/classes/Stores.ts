import * as Colyseus from "colyseus.js";
import { writable } from "svelte/store";
import type ToastContainer from "$lib/components/ToastContainer.svelte";
import type PreferencesModal from "$lib/components/Modal/PreferencesModal.svelte";
import type ExportModal from "$lib/components/Modal/ExportModal.svelte";

export const clientStore = writable<Colyseus.Client>(new Colyseus.Client("https://pyrite-backend.mackerel.dev"));
export const toastContainerStore = writable<ToastContainer>();
export const preferencesModalStore = writable<PreferencesModal>();
export const exportModalStore = writable<ExportModal>();
