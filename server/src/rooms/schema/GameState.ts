import { Schema, type } from "@colyseus/schema";

export class GameState extends Schema {
    @type("boolean")
    isQuesting: boolean = false;

    @type("number")
    serverStartTime: number = 0;

    constructor(serverStartTime: number, ...args: any[]) {
        super(...args);
        this.serverStartTime = serverStartTime;
    }
}
