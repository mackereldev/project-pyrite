import { ChatMessageType } from "$lib/enums";
import ChatMessage from "./ChatMessage";
import { CmdError, InpsectCmd, HelpCmd, PingCmd } from "./Command";

export default class CommandHandler {
    public static executeCommand = async (commandName: string, ...args: string[]): Promise<ChatMessage | undefined> => {
        const msg = (message: string | ChatMessage | undefined) => {
            if (message !== undefined) {
                if (message instanceof ChatMessage) {
                    return message;
                } else {
                    return new ChatMessage(undefined, ChatMessageType.System, message, false);
                }
            }
        }
        
        const err = (message: string) => {
            return new ChatMessage(undefined, ChatMessageType.System, message, true);
        }
        
        try {
            switch (commandName) {
                case "inspect":
                    return msg(await new InpsectCmd(args[0]).execute());
                case "help":
                    return msg(await new HelpCmd().execute());
                case "ping":
                    return msg(await new PingCmd(args[0]).execute());
                default:
                    return err(`Command '${commandName}' could not be found.`);
            }
        } catch (error) {
            if (error instanceof CmdError) {
                return err(error.message);
            } else if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error(error);
            }
            
            return err("An unknown error occurred.");
        }
    }
}
