import { Schema, type } from "@colyseus/schema";

export class GameState extends Schema {
    @type("boolean")
    isQuesting: boolean = false;
}
