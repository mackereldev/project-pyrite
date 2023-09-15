import { Schema, ArraySchema, type } from "@colyseus/schema";
import { QuestRoom } from "./quest/QuestRoom";
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
    turnCycle: ArraySchema<Entity> = new ArraySchema<Entity>();

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
