import type CommandContext from "./CommandContext";
import * as MathMore from "./MathMore";
import ChatMessage from "./ChatMessage";
import { ChatMessageType } from "$lib/enums";

abstract class Command {
    public abstract execute(ctx: CommandContext, ...args: string[]): boolean;
}

export class HelpCommand extends Command {
    public execute(ctx: CommandContext, ...args: string[]): boolean {
        ctx.gameChat.addMessage(new ChatMessage(undefined, ChatMessageType.System, "<Insert help here...>"));
        return true;
    }
}

export class PingCommand extends Command {
    public execute(ctx: CommandContext, ...args: string[]): boolean {
        const [delay] = args;

        if (ctx.channel) {
            let ms = 0;
            if (delay) {
                ms = parseFloat(delay);
                if (Number.isFinite(ms)) {
                    ms = MathMore.clamp(ms, 0, 10000);
                }
            }

            ctx.channel.publish("server/ping", { delay: ms });
            return true;
        }

        return false;
    }
}
