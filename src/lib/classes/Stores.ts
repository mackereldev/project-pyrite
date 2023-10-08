import * as Colyseus from "colyseus.js";
import { writable } from "svelte/store";
import type ToastContainer from "$lib/components/ToastContainer.svelte";
import type PreferencesModal from "$lib/components/Modal/PreferencesModal.svelte";
import type ExportModal from "$lib/components/Modal/ExportModal.svelte";
import { PUBLIC_NODE_ENV } from "$env/static/public";

const devMode = PUBLIC_NODE_ENV && PUBLIC_NODE_ENV === "development";
const serverEndpoint = devMode ? "ws://localhost:2567" : "https://pyrite-backend.mackerel.dev";

export const clientStore = writable<Colyseus.Client>(new Colyseus.Client(serverEndpoint));
export const toastContainerStore = writable<ToastContainer>();
export const preferencesModalStore = writable<PreferencesModal>();
export const exportModalStore = writable<ExportModal>();
