import { writable } from "svelte/store";
import type { Types } from "ably";
import type ChatChannel from "./ChatChannel";

export const channelStore = writable<Types.RealtimeChannelPromise>();
export const gameChatStore = writable<ChatChannel>();
