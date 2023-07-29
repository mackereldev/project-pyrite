import type { Types } from "ably/promises";
import type ChatChannel from "./ChatChannel";

export default class CommandContext {
    channel;
    gameChat;

    constructor(channel: Types.RealtimeChannelPromise, gameChat: ChatChannel) {
        this.channel = channel;
        this.gameChat = gameChat;
    }
}
