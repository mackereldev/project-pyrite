import { HelpCommand, PingCommand } from "./Command";
import type CommandContext from "./CommandContext";

export default class Game {
    private static commands = {
        help: new HelpCommand(),
        ping: new PingCommand(),
    };

    public runCommand = (commandName: string, ctx: CommandContext, ...args: string[]) => {
        if (Object.hasOwn(Game.commands, commandName)) {
            const name = commandName as keyof typeof Game.commands;
            const command = Game.commands[name];

            if (command.execute(ctx, ...args)) {
                return true;
            }
        }

        return false;
    };
}
