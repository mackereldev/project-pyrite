import { Types } from "ably";
import { writable } from "svelte/store";
import ChatChannel from "./ChatChannel";

export const channelStore = writable<Types.RealtimeChannelPromise>();
export const gameChatStore = writable<ChatChannel>();
