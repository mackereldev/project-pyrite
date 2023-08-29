import { Schema, ArraySchema, type } from "@colyseus/schema";
import { QuestRoom } from "./quest/QuestRoom";
import { Player } from "./quest/Player";
import { Entity } from "./quest/Entity";

export class QuestState extends Schema {
    @type("string")
    public name: string;

    @type("boolean")
    public active: boolean = false;

    @type(Entity)
    public currentTurn: Entity;

    @type([Entity])
    public turnCycle: Entity[] = [];

    @type("number")
    public roomIndex: number = -1;

    @type(QuestRoom)
    public room: QuestRoom;

    @type([Player])
    public players: ArraySchema<Player> = new ArraySchema<Player>();
}
