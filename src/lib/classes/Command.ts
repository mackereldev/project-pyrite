import { get } from "svelte/store";
import { ChatMessage } from "./ChatMessage";
import { roomStore } from "./Stores";
import { isInteger, isNatural } from "./Utility";
import type { BattleRoom } from "../../../server/src/schema/quest/QuestRoom";
import type { Entity } from "../../../server/src/schema/quest/Entity";
import type { Equipment, StackableItem } from "../../../server/src/schema/quest/Item";
import type { Player } from "../../../server/src/schema/quest/Player";
import type { EquipmentSlot } from "../../../server/src/schema/quest/EquipmentSlot";
import type { GameState } from "../../../server/src/schema/GameState";
import type { Room } from "colyseus.js";
import type { DamageAbility } from "../../../server/src/schema/quest/Ability";
import { constructSection, type Section } from "./RecursiveSection";

// https://stackoverflow.com/a/60807986/14270868
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;
type SingleKey<T> = IsUnion<keyof T> extends true ? never : object extends T ? never : T;

export abstract class Cmd {
    args: { [key: string]: string | number; } = {};
    protected room: Room<GameState>;
    protected player: Player;

    constructor(requisite: CmdRequisite = "None") {
        this.room = get(roomStore);
        const clientData = this.room.state.clientData.find((c) => c.sessionId === this.room.sessionId)!;
        this.player = this.room.state.questState.players.find((p) => p.clientId === clientData.clientId)!;

        if ((requisite === "QuestActive" || requisite === "CurrentTurn") && !this.room.state.questState.active) {
            throw new CmdError("The quest must be active.");
        }

        if (requisite === "CurrentTurn" && this.room.state.questState.currentTurn !== this.player) {
            throw new CmdError("It's not your turn.");
        }
    }

    abstract execute(): ChatMessage | undefined;

    static help(): string | undefined { return }

    protected static asGame(text: string, isError: boolean = false) {
        return new ChatMessage(undefined, "game", text, isError);
    }

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

export type CmdRequisite = "None" | "QuestActive" | "CurrentTurn";

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

export class QuestCmd extends Cmd {
    override args;

    constructor(action: string, quest?: string) {
        super();
        this.args = {
            action: Cmd.toEnum({ action }, ["start", "stop", "list"]),
            quest: quest ? Cmd.toInt({ quest }) : -1,
        };
    }

    override execute(): ChatMessage | undefined {
        this.room.send("cmd-quest", { action: this.args.action, quest: this.args.quest });
        return;
    }
}

export class AdvanceCmd extends Cmd {
    override execute(): ChatMessage | undefined {
        this.room.send("cmd-advance");
        return;
    }
}

export class InspectCmd extends Cmd {
    override args;

    constructor(type: string, target: string = "") {
        super("QuestActive");

        this.args = {
            type: Cmd.toEnum({ type }, ["self", "room", "player", "enemy"]),
            target,
        };
    }

    override execute(): ChatMessage | undefined {
        const inspectSelf = () => {
            const self = this.room.state.questState.players.find((p) => p.clientId === this.player.clientId)!;
            if (self.isDead) {
                return Cmd.asGame(`You cannot inspect yourself because you are dead.`);
            } else {
                const evaluation = this.evaluateEntity(self, true);
                if (evaluation) {
                    return Cmd.asGame(`You inspect yourself:${evaluation}`);
                } else {
                    return Cmd.asGame("You're empty :(");
                }
            }
        };

        const player = this.room.state.questState.players.find((p) => p.clientId === this.args.target);

        switch (this.args.type) {
            case "self":
                return inspectSelf();
            case "room":
                // TODO: support boss rooms
                if (["battle"].includes(this.room.state.questState.room?.type)) {
                    const rootSection: Section = {
                        "Enemies": { prependIndices: true, items: (this.room.state.questState.room as BattleRoom).enemies.map((enemy) => `${enemy.name}: ${enemy.health}/${enemy.maxHealth} HP`) }
                    };
                    return Cmd.asGame(`You inspect the room:${constructSection(rootSection, true)}`);
                }
                return;
            case "player":
                if (player) {
                    if (player.clientId === this.player.clientId) {
                        return inspectSelf();
                    }

                    if (player.isDead) {
                        return Cmd.asGame(`Player '${player.clientId}' cannot be inspected because they are dead.`);
                    } else {
                        return Cmd.asGame(`You inspect player '${player.clientId}':${this.evaluateEntity(player, false)}`);
                    }
                } else {
                    throw new CmdError(`Argument 'target' must be a valid player.`);
                }
            case "enemy":
                if (this.room.state.questState.room?.type === "battle" && (this.room.state.questState.room as BattleRoom).enemies.length > 0) {
                    if (this.args.target && isNatural(this.args.target)) {
                        const targetNum = parseInt(this.args.target);
                        if (targetNum > 0 && targetNum <= (this.room.state.questState?.room as BattleRoom)?.enemies?.length) {
                            const enemy = (this.room.state.questState.room as BattleRoom).enemies[parseInt(this.args.target) - 1];
                            const evaluation = this.evaluateEntity(enemy, false);
                            if (evaluation) {
                                return Cmd.asGame(`You inspect enemy ${this.args.target} (${enemy.name}):${evaluation}`);
                            } else {
                                return Cmd.asGame(`The enemy: ${this.args.target} (${enemy.name}) is empty :(.`);
                            }
                        } else {
                            throw new CmdError("Argument 'target' must point to a valid enemy.");
                        }
                    } else {
                        throw new CmdError("Argument 'target' must be a numeric value.");
                    }
                } else {
                    throw new CmdError("There are no enemies in this room.");
                }
            default:
                return Cmd.asGame(`Unhandled argument '${this.args.type}'.`, true);
        }
    }

    /**
     * @returns A string of inspection details, or null if entity is empty.
     */
    private evaluateEntity = (entity: Entity, showIndices: boolean): string => {
        const getMultiplierString = (equipment: Equipment): string => {
            const multipliers: { [key: string]: number } = {
                HP: equipment.healthModifier,
                DMG: equipment.damageModifier,
            };

            const validMultipliers = Object.entries(multipliers).filter((mult) => mult[1] !== 0);
            if (validMultipliers.length > 0) {
                return ": " + validMultipliers.map((mult) => `${mult[1] < 0 ? "" : "+"}${mult[1] * 100}% ${mult[0]}`).join(", ");
            } else {
                return "";
            }
        };

        const dmgMult = this.evaluateEquipmentModifier(entity, "DMG");

        const rootSection: Section = {
            "Attributes": { prependIndices: false, items: [`Health: ${entity.health}/${entity.maxHealth} HP`] },
            "Equipment": {
                "Weapons": { prependIndices: true, items: entity.equipmentSlots.filter((slot) => slot.typeRestriction === "weapon").map((slot: EquipmentSlot) => slot.equipment ? `${slot.equipment.name}${getMultiplierString(slot.equipment)}` : "EMPTY") },
                "Rings": { prependIndices: true, items: entity.equipmentSlots.filter((slot) => slot.typeRestriction === "ring").map((slot: EquipmentSlot) => slot.equipment ? `${slot.equipment.name}${getMultiplierString(slot.equipment)}` : "EMPTY") },
            },
            // Improve '(ability as DamageAbility)'; add AoeAbility
            "Abilities": { prependIndices: true, items: entity.abilities.map((ability) => `${ability.name}: ${(ability as DamageAbility).damage * dmgMult} DMG${dmgMult !== 1 ? ` (${(ability as DamageAbility).damage} DMG)` : ""}`) },
            "Inventory": (entity as Player).inventory && { prependIndices: true, items: (entity as Player).inventory.map((item) => `${item.name}${(item as StackableItem).quantity > 1 ? ` (${(item as StackableItem).quantity})` : ""}`) },
        };

        return constructSection(rootSection, showIndices);
    };

    /**
     * @returns The aggregate multiplier for the specified stat summed from each equipment on the entity.
     * @remarks Replicated from server-side method of same name.
     */
    private evaluateEquipmentModifier = (entity: Entity, stat: "HP" | "DMG"): number => {
        switch (stat) {
            case "HP":
                return Math.max(0.1, (entity.equipmentSlots.filter((slot) => slot.equipment) as EquipmentSlot[]).reduce((total, slot) => total + slot.equipment!.healthModifier, 1));
            case "DMG":
                return Math.max(0.1, (entity.equipmentSlots.filter((slot) => slot.equipment) as EquipmentSlot[]).reduce((total, slot) => total + slot.equipment!.damageModifier, 1));
            default:
                return 1;
        }
    };
}

export class AttackCmd extends Cmd {
    override args;

    constructor(targetEnemy: string, targetAbility: string) {
        super("CurrentTurn");
        this.args = {
            targetEnemy: Cmd.toInt({ targetEnemy }),
            targetAbility: Cmd.toInt({ targetAbility }),
        };
    }

    override execute(): ChatMessage | undefined {
        const questRoom = this.room.state.questState.room;

        if (questRoom.type === "battle" && (questRoom as BattleRoom).enemies.length > 0) {
            if (this.args.targetEnemy <= 0 || this.args.targetEnemy > (questRoom as BattleRoom).enemies.length) {
                throw new CmdError("Argument 'targetEnemy' must point to a valid enemy.");
            }
        } else {
            throw new CmdError("There are no enemies in this room.");
        }

        if (this.args.targetAbility <= 0 || this.args.targetAbility > this.player.abilities.length) {
            throw new CmdError("Argument 'targetAbility' must point to one of your abilities.");
        }

        this.room.send("cmd-attack", { targetEnemy: this.args.targetEnemy, targetAbility: this.args.targetAbility });
        return;
    }
}

export class EquipCmd extends Cmd {
    specifiedPreferredSlot: boolean;
    override args;

    constructor(targetItem: string, preferredSlot?: string) {
        super("CurrentTurn");
        this.specifiedPreferredSlot = !!preferredSlot;
        this.args = {
            targetItem: Cmd.toInt({ targetItem }),
            preferredSlot: preferredSlot ? Cmd.toInt({ preferredSlot }) : -1,
        };
    }

    override execute(): ChatMessage | undefined {
        if (this.args.targetItem > 0 && this.args.targetItem <= this.player.inventory.length) {
            const item = this.player.inventory[this.args.targetItem - 1];
            if ("type" in item) {
                const equipment = item as Equipment;
                const type = equipment.type;

                if (this.specifiedPreferredSlot && this.args.preferredSlot <= 0 || this.args.preferredSlot > this.player.equipmentSlots.filter((slot) => slot.typeRestriction === type).length) {
                    const titleCase = type.charAt(0).toUpperCase() + type.slice(1);
                    if (this.args.preferredSlot === 1) {
                        throw new CmdError("No available slots to equip to.");
                    } else {
                        throw new CmdError(`Argument 'preferredSlot' must point to one of your '${titleCase}' slots when equipping a ${type}.`);
                    }
                }

                this.room.send("cmd-equip", { targetEquipment: this.args.targetItem, preferredSlot: this.specifiedPreferredSlot ? this.args.preferredSlot : undefined });
                return Cmd.asGame(`Equiping ${equipment.name}.`);
            } else {
                throw new CmdError("You cannot equip a non-equipment item.");
            }
        } else {
            throw new CmdError("Argument 'targetItem' must point to one of your inventory items.");
        }
    }
}

export class UnequipCmd extends Cmd {
    override args;

    constructor(equipmentType: string, targetEquipment: string) {
        super("QuestActive");
        this.args = {
            equipmentType: Cmd.toEnum({ equipmentType }, ["weapon", "ring"]),
            targetEquipment: Cmd.toInt({ targetEquipment }),
        };
    }

    override execute(): ChatMessage | undefined {
        const validSlots: EquipmentSlot[] = this.player.equipmentSlots.filter((slot) => slot.typeRestriction === this.args.equipmentType);
        const titleCase = this.args.equipmentType.charAt(0).toUpperCase() + this.args.equipmentType.slice(1);
        if (this.args.targetEquipment > 0 && this.args.targetEquipment <= validSlots.length) {
            const slot = validSlots[this.args.targetEquipment - 1];

            if (slot.equipment) {
                this.room.send("cmd-unequip", { equipmentType: this.args.equipmentType, targetSlot: this.args.targetEquipment });
                return Cmd.asGame(`Unequiping ${slot.equipment?.name}.`);
            } else {
                throw new CmdError(`Slot ${this.args.targetEquipment} of '${titleCase}' does not contain equipment.`);
            }
        } else {
            throw new CmdError(`Argument 'targetEquipment' must point to one of your '${titleCase}' slots when equipping a ${this.args.equipmentType}.`);
        }
    }
}
