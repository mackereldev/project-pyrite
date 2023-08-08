import { ChatMessageType } from "$lib/enums";
import { get } from "svelte/store";
import ChatMessage from "./ChatMessage";
import * as MathMore from "./MathMore";
import { room } from "./Stores";
import { isNumber } from "./Utility";

export abstract class Cmd {
    protected validate(): boolean {
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                if (this[key] === undefined) {
                    throw new CmdError(`Argument '${key}' was not defined.`);
                }
            }
        }
        return true;
    }
    abstract execute(): Promise<string | ChatMessage | undefined>;
}

export class CmdError implements Error {
    name: string = "CmdError";
    message: string;
    stack?: string | undefined;
    cause?: unknown;

    constructor(message: string) {
        this.message = message;
    }
}

export class InpsectCmd extends Cmd {
    target: string;

    constructor(target: string) {
        super();

        this.target = target;

        this.validate();
    }

    async execute(): Promise<string | ChatMessage | undefined> {
        return new ChatMessage(undefined, ChatMessageType.Game, `You inspect '${this.target}'.`);
    }
}

export class HelpCmd extends Cmd {
    async execute(): Promise<string | ChatMessage | undefined> {
        return "<Insert help here...>";
    }
}

export class PingCmd extends Cmd {
    delay: number = 0;

    constructor(delay: string) {
        super();

        if (delay) {
            // Detect this automatically in parent
            if (isNumber(delay)) {
                this.delay = MathMore.clamp(parseInt(delay), 0, 10000);
            } else {
                throw new CmdError("Argument 'delay' must be a numeric value.");
            }
        }
    }

    async execute(): Promise<string | ChatMessage | undefined> {
        const r = get(room);

        if (r) {
            r.send("ping", { delay: this.delay });
        }

        return;
    }
}
