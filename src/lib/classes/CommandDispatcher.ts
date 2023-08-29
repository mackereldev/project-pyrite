import { ChatMessage } from "./ChatMessage";
import { CmdError, PingCmd, QuestCmd, AdvanceCmd, InspectCmd, AttackCmd, EquipCmd, UnequipCmd } from "./Command";

export default class CommandDispatcher {
    public static executeCommand = async (commandName: string, ...args: string[]): Promise<ChatMessage | undefined> => {
        const err = (message: string) => {
            return new ChatMessage(undefined, "system", message, true);
        };

        try {
            if (commandName === "help") {
                const helpTarget = args[0];
                const cmd = commandRefs[helpTarget as keyof typeof commandRefs];

                if (helpTarget) {
                    if (cmd) {
                        const help = cmd.help();
                        if (help) {
                            return new ChatMessage(undefined, "system", help);
                        } else {
                            return new ChatMessage(undefined, "system", "Not yet implemented.");
                        }
                    } else {
                        return err(`Command '${helpTarget}' does not have a valid help implementation.`);
                    }
                } else {
                    const helpStrings: string[] = [];
                    Object.entries(commandRefs).forEach((entry) => {
                        const name = entry[0];
                        const cmd = entry[1];
                        const help = cmd.help();
                        if (help) {
                            helpStrings.push(help);
                        }
                    });
                    return new ChatMessage(undefined, "system", helpStrings.join("\n"));
                }
            } else {
                switch (commandRefs[commandName as keyof typeof commandRefs]) {
                    case PingCmd:
                        return new PingCmd(args[0]).execute();
                    case QuestCmd:
                        return new QuestCmd(args[0]).execute();
                    case AdvanceCmd:
                        return new AdvanceCmd().execute();
                    case InspectCmd:
                        return new InspectCmd(args[0], args[1]).execute();
                    case AttackCmd:
                        return new AttackCmd(args[0], args[1]).execute();
                    case EquipCmd:
                        return new EquipCmd(args[0], args[1]).execute();
                    case UnequipCmd:
                        return new UnequipCmd(args[0], args[1]).execute();
                    default:
                        return err(`Command '${commandName}' could not be found.`);
                }
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
    ping: PingCmd,
    quest: QuestCmd,
    advance: AdvanceCmd,
    inspect: InspectCmd,
    attack: AttackCmd,
    equip: EquipCmd,
    unequip: UnequipCmd,
};
