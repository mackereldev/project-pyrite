import { get } from "svelte/store";
import { ChatMessage } from "./ChatMessage";
import { roomStore } from "./Stores";
import { isInteger, isNatural } from "./Utility";
import type { MainState } from "../../../server/src/schema/MainState";
import type { Room } from "colyseus.js";
import type { ClientData } from "../../../server/src/schema/ClientData";

// https://stackoverflow.com/a/60807986/14270868
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
type SingleKey<T> = IsUnion<keyof T> extends true ? never : object extends T ? never : T;

export abstract class Cmd {
    args: { [key: string]: string | number; } = {};
    protected room: Room<MainState>;
    protected clientData: ClientData;

    constructor() {
        this.room = get(roomStore);
        this.clientData = this.room.state.clientData.find((c) => c.sessionId === this.room.sessionId)!;
    }

    abstract execute(): ChatMessage | undefined;

    static help(): string | undefined { return }

    protected static asSystem(text: string, isError: boolean = false) {
        return new ChatMessage(undefined, "system", text, isError);
    }

    protected static toInt<T extends Record<string, string>>(number: SingleKey<T>, allowNegative: boolean = false): number {
        const [name, value] = Object.entries(number)[0];

        if (isNatural(value) || allowNegative && isInteger(value)) {
            return parseInt(value);
        } else {
            throw new CmdError(`Argument '${name}' must be a positive whole number.`);
        }
    }

    protected static toEnum<T extends Record<string, string>, K extends string>(string: SingleKey<T>, options: readonly K[]): K {
        const [name, value] = Object.entries(string)[0];

        if (options.includes(value as K)) {
            return value as K;
        } else {
            throw new CmdError(`Argument '${name}' must be one of: ${options.map((opt) => `'${opt}'`).join(", ")}.`);
        }
    }
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

export class PingCmd extends Cmd {
    override args;

    constructor(delay: string) {
        super();
        this.args = {
            delay: Cmd.toInt({ delay }),
        };
    }

    override execute(): ChatMessage | undefined {
        this.room.send("cmd-ping", { delay: this.args.delay });
        return;
    }
}
