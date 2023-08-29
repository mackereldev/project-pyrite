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
    turnCycle: Entity[] = [];

    @type("number")
    roomIndex: number = -1;

    @type(QuestRoom)
    room: QuestRoom;

    @type([Player])
    players: ArraySchema<Player> = new ArraySchema<Player>();
}
