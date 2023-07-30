import { HelpCommand, PingCommand } from "./Command";

export default class CommandHandler {
    private static commands = {
        help: new HelpCommand(),
        ping: new PingCommand(),
    };

    public runCommand = (commandName: string, ...args: string[]) => {
        if (Object.hasOwn(CommandHandler.commands, commandName)) {
            const name = commandName as keyof typeof CommandHandler.commands;
            const command = CommandHandler.commands[name];

            if (command.execute(...args)) {
                return true;
            }
        }

        return false;
    };
}
