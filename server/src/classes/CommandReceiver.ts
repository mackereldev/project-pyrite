import { Game } from "../room/Game";
import { ServerChat } from "./ServerChat";
import * as MathMore from "../../../src/lib/classes/MathMore";
import { Client } from "colyseus";
import { QuestInactive, OnlyLeader } from "./MessageTemplate";
import { BattleRoom } from "../schema/quest/QuestRoom";
import { Equipment, EquipmentType } from "../schema/quest/Item";
import { EquipmentSlot } from "../schema/quest/EquipmentSlot";

export class CommandReceiver {
    private game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    register() {
        /* TODO
        Most of the validation here should be done on the client side (bar requisite checking).
        Remove ServerChat all together, since only cheaters will be receiving those messages.
        Move MessageTemplate to the client side or use inheritance.
        Wrap everything in try and catch
        */

        this.game.onMessage("player-chat", (client, message) => {
            const { msg }: { msg: string } = message;
            this.game.broadcast("player-chat", { msg, author: { sessionId: client.id, clientId: client.userData.clientId } });
        });

        this.game.onMessage("cmd-ping", (client, message) => {
            let { delay }: { delay: number } = message;

            delay = MathMore.clamp(delay, 0, 10000);

            if (Number.isFinite(delay)) {
                delay = MathMore.clamp(delay, 0, 10000);
            }

            this.game.clock.setTimeout(() => {
                this.game.broadcast("cmd-ping", { sender: { sessionId: client.id, clientId: client.userData.clientId } });
            }, delay);
        });

        this.game.onMessage("cmd-quest", (client, message) => {
            const { action }: { action: "start" | "stop" } = message;

            if (!this.isLeader(client)) {
                client.send("server-chat", new ServerChat("system", OnlyLeader("quest"), true).serialize());
                return;
            }

            if (action === "start") {
                if (!this.game.state.questState.active) {
                    this.game.questHandler.start();
                } else {
                    client.send("server-chat", new ServerChat("system", "Quest has already started.", true).serialize());
                }
            } else if (action === "stop") {
                if (this.game.state.questState.active) {
                    this.game.questHandler.stop();
                } else {
                    client.send("server-chat", new ServerChat("system", QuestInactive(), true).serialize());
                }
            } else {
                client.send("server-chat", new ServerChat("system", `(cmd-quest) Unknown action '${action}'.`, true).serialize());
            }
        });

        this.game.onMessage("cmd-advance", (client) => {
            if (!this.isLeader(client)) {
                client.send("server-chat", new ServerChat("system", OnlyLeader("advance"), true).serialize());
                return;
            } else if (!this.game.state.questState.active) {
                client.send("server-chat", new ServerChat("system", QuestInactive(), true).serialize());
                return;
            } else if (this.game.state.questState.room.type === "battle" && (this.game.state.questState.room as BattleRoom).enemies.length > 0) {
                client.send("server-chat", new ServerChat("system", "All enemies must first be defeated before advancing.", true).serialize());
                return;
            }

            this.game.questHandler.nextRoom();
            this.game.broadcast("quest-advance", undefined, { afterNextPatch: true });
        });

        this.game.onMessage("cmd-attack", (client, message) => {
            const { targetEnemy, targetAbility }: { targetEnemy: number, targetAbility: number } = message;

            try {
                const player = this.game.state.questState.players.find((p) => p.clientId === client.userData.clientId);

                if (this.game.state.questState.currentTurn !== player) {
                    console.error(`${player.clientId} tried to attack but it's not their turn.`);
                    return;
                }

                const ability = player.abilities[targetAbility - 1];
                const battleRoom = this.game.state.questState.room as BattleRoom;
                const enemy = battleRoom.enemies[targetEnemy - 1];

                const enemyString = `'${enemy.name}' (Enemy ${targetEnemy})`;
                const totalDamage = ability.damage * player.evaluateEquipmentModifier("DMG");
                const messages = [
                    `'${player.clientId}' uses '${ability.name}' on ${enemyString}, dealing ${totalDamage} damage.`,
                ];

                if (enemy.dealDamage(totalDamage)) {
                    battleRoom.enemies.deleteAt(targetEnemy - 1);
                    messages.push(`${enemyString} dies.`);
                } else {
                    messages.push(`${enemyString} is now on ${enemy.health}/${enemy.maxHealth} HP`);
                }

                this.game.questHandler.nextTurn();

                this.game.broadcast("server-chat", messages.map((text) => new ServerChat("game", text).serialize()));
            } catch (error) {
                console.trace(error);
            }
        });

        this.game.onMessage("cmd-equip", (client, message) => {
            const { targetEquipment, preferredSlot }: { targetEquipment: number; preferredSlot: number | undefined } = message;

            try {
                const player = this.game.state.questState.players.find((p) => p.clientId === client.userData.clientId);
                const equipment = player.inventory[targetEquipment - 1] as Equipment;

                let replaced: Equipment;
                if (preferredSlot) {
                    replaced = player.replaceEquipment(equipment, player.equipmentSlots.filter((s) => s.typeRestriction === equipment.type)[preferredSlot - 1]);
                } else {
                    replaced = player.addEquipment(equipment, true);
                }

                if (replaced) {
                    player.addItem(replaced);
                }

                player.removeItem(equipment);
            } catch (error) {
                console.trace(error);
            }
        });

        this.game.onMessage("cmd-unequip", (client, message) => {
            const { equipmentType, targetSlot }: { equipmentType: EquipmentType, targetSlot: number } = message;

            try {
                const player = this.game.state.questState.players.find((p) => p.clientId === client.userData.clientId);
                const slot: EquipmentSlot = player.equipmentSlots.filter((s) => s.typeRestriction === equipmentType)[targetSlot - 1];

                const removedEquipment = player.removeEquipment(slot);
                if (removedEquipment) {
                    player.addItem(removedEquipment);
                }
            } catch (error) {
                console.trace(error);
            }
        });
    }

    isLeader(client: Client): boolean {
        return this.game.state.leader === client.userData.clientId;
    }
}
