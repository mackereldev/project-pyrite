import { Schema, type } from "@colyseus/schema";

export class ClientData extends Schema {
    @type("string")
    sessionId: string;

    @type("string")
    clientId: string;

    constructor(sessionId: string, clientId: string) {
        super();
        this.sessionId = sessionId;
        this.clientId = clientId;
    }
}
