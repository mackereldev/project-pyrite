import { ChatMessageType } from "$lib/enums";
import { get } from "svelte/store";
import ChatMessage from "./ChatMessage";
import * as MathMore from "./MathMore";
import { gameChat, room } from "./Stores";

export abstract class Command {
    public abstract execute: (...args: string[]) => boolean;
}

export class HelpCommand extends Command {
    public execute = (...args: string[]): boolean => {
        const gc = get(gameChat);

        gc.addMessage(new ChatMessage(undefined, ChatMessageType.System, "<Insert help here...>"));
        return true;
    };
}

export class PingCommand extends Command {
    public execute = (...args: string[]): boolean => {
        const r = get(room);
        const [delay] = args;

        if (r) {
            let ms = 0;
            if (delay) {
                ms = parseFloat(delay);
                if (Number.isFinite(ms)) {
                    ms = MathMore.clamp(ms, 0, 10000);
                }
            }

            r.send("ping", { delay: ms });
            return true;
        }

        return false;
    };
}
