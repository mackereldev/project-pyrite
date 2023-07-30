import { HelpCommand, PingCommand } from "./Command";

export default class Game {
    private static commands = {
        help: new HelpCommand(),
        ping: new PingCommand(),
    };

    public runCommand = (commandName: string, ...args: string[]) => {
        if (Object.hasOwn(Game.commands, commandName)) {
            const name = commandName as keyof typeof Game.commands;
            const command = Game.commands[name];

            if (command.execute(...args)) {
                return true;
            }
        }

        return false;
    };
}
