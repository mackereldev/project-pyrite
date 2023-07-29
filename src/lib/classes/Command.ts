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
        if (ctx.channel) {
            let delay = 0;
            if (args[0]) {
                delay = parseFloat(args[0]);
                if (Number.isFinite(delay)) {
                    delay = MathMore.clamp(delay, 0, 10000);
                }
            }

            ctx.channel.publish("server/ping", { delay });
            return true;
        }

        return false;
    }
}
