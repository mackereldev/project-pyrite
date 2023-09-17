import { Schema, ArraySchema, type } from "@colyseus/schema";
import { ClientData } from "./ClientData";

export class MainState extends Schema {
    @type("number")
    serverStartTime: number = 0;

    @type([ClientData])
    clientData: ArraySchema<ClientData> = new ArraySchema<ClientData>();

    @type("string")
    leader: string;

    constructor(serverStartTime: number) {
        super();
        this.serverStartTime = serverStartTime;
    }
}
