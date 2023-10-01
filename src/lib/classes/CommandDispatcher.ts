import { get, type Writable } from "svelte/store";
import type { MainState } from "../../../server/src/schema/MainState";
import { ChatMessage } from "./ChatMessage";
import { Cmd, CmdContext, CmdError, LeaveCmd, PingCmd } from "./Command";
import type * as Colyseus from "colyseus.js";
import type { ChatTab } from "./ChatTab";

export class CommandDispatcher {
    chatTab: ChatTab;
    roomStore: Writable<Colyseus.Room<MainState>>;

    constructor(chatTab: ChatTab) {
        this.chatTab = chatTab;
        this.roomStore = chatTab.roomStore;
    }

    executeCommand = async (commandName: string, ...args: string[]): Promise<ChatMessage | undefined> => {
        const err = (message: string) => {
            return new ChatMessage(undefined, "system", message, true);
        };

        try {
            if (Object.keys(commandRefs).includes(commandName)) {
                const context = new CmdContext(get(this.roomStore), this.chatTab);
                return await commandRefs[commandName as keyof typeof commandRefs](context, ...args).execute();
            } else {
                return err(`Command '${commandName}' could not be found.`);
            }
        } catch (error) {
            if (error instanceof CmdError) {
                return err(error.message);
            } else if (error instanceof Error) {
                console.error(error);
            } else {
                console.error(error);
            }

            return err("An unknown error occurred.");
        }
    };
}

// Command keys exist so that the user can specify which command they want to execute
export const commandRefs = {
    ping: (context: CmdContext, ...args: string[]) => new PingCmd(context, args[0]),
    leave: (context: CmdContext) => new LeaveCmd(context),
} satisfies { [key: string]: (context: CmdContext, ...args: string[]) => Cmd };
