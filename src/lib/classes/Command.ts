import * as MathMore from "./MathMore";
import ChatMessage from "./ChatMessage";
import { ChatMessageType } from "$lib/enums";
import { get } from "svelte/store";
import { channelStore, gameChatStore } from "./Stores";

export abstract class Command {
    public abstract execute(...args: string[]): boolean;
}

export class HelpCommand extends Command {
    public execute(...args: string[]): boolean {
        const gameChat = get(gameChatStore);

        gameChat.addMessage(new ChatMessage(undefined, ChatMessageType.System, "<Insert help here...>"));
        return true;
    }
}

export class PingCommand extends Command {
    public execute(...args: string[]): boolean {
        const channel = get(channelStore);
        const [delay] = args;

        if (channel) {
            let ms = 0;
            if (delay) {
                ms = parseFloat(delay);
                if (Number.isFinite(ms)) {
                    ms = MathMore.clamp(ms, 0, 10000);
                }
            }

            channel.publish("server/ping", { delay: ms });
            return true;
        }

        return false;
    }
}
