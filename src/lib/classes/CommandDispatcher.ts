import { ChatMessage } from "./ChatMessage";
import { Cmd, CmdError, PingCmd } from "./Command";

export default class CommandDispatcher {
    static executeCommand = (commandName: string, ...args: string[]): ChatMessage | undefined => {
        const err = (message: string) => {
            return new ChatMessage(undefined, "system", message, true);
        };

        try {
            if (Object.keys(commandRefs).includes(commandName)) {
                return commandRefs[commandName as keyof typeof commandRefs](args[0]).execute();
            } else {
                return err(`Command '${commandName}' could not be found.`);
            }
        } catch (error) {
            if (error instanceof CmdError) {
                return err(error.message);
            } else if (error instanceof Error) {
                console.trace(error);
            } else {
                console.trace(error);
            }

            return err("An unknown error occurred.");
        }
    };
}

export const commandRefs = {
    ping: (...args: string[]) => new PingCmd(args[0]),
} satisfies { [key: string]: (...args: string[]) => Cmd };
