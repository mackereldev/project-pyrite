import { Schema, ArraySchema, type } from "@colyseus/schema";
import { QuestState } from "./QuestState";
import { ClientData } from "./ClientData";

export class GameState extends Schema {
    @type("number")
    serverStartTime: number = 0;

    @type(QuestState)
    questState: QuestState = new QuestState();

    @type([ClientData])
    clientData: ArraySchema<ClientData> = new ArraySchema<ClientData>();

    @type("string")
    leader: string;

    constructor(serverStartTime: number) {
        super();
        this.serverStartTime = serverStartTime;
    }
}
