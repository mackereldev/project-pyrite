import { Schema, ArraySchema, type } from "@colyseus/schema";
import { BattleRoom, QuestRoom } from "./quest/QuestRoom";
import { Player } from "./quest/Player";
import { Entity } from "./quest/Entity";

export class QuestState extends Schema {
    @type("string")
    name: string;

    @type("boolean")
    active: boolean = false;

    @type(Entity)
    currentTurn: Entity;

    @type([Entity])
    clientTurnCycle: ArraySchema<Entity> = new ArraySchema<Entity>();

    get turnCycle(): Entity[] {
        if (this.room.type === "battle") {
            return (this.players.toArray() as Entity[]).concat((this.room as BattleRoom).enemies.toArray() as Entity[]).filter((entity) => !entity.isDead);
        } else {
            return [];
        }
    }

    @type("number")
    roomIndex: number = -1;

    @type(QuestRoom)
    room: QuestRoom;

    @type([Player])
    players: ArraySchema<Player> = new ArraySchema<Player>();

    get alivePlayers(): Player[] {
        return this.players.filter((player) => !player.isDead);
    }
}
