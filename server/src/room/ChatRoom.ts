import { Client, Room } from "@colyseus/core";
import { MainState } from "../schema/MainState";
import { CommandReceiver } from "../classes/CommandReceiver";
import { ClientData } from "../schema/ClientData";

const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";

export class ChatRoom extends Room<MainState> {
    private CHAT_CHANNEL = "chat:rooms";

    private commandReceiver: CommandReceiver = new CommandReceiver(this);

    private generateRoomIdSingle(): string {
        let result = "";
        for (let i = 0; i < 4; i++) {
            result += CONSONANTS.charAt(Math.floor(Math.random() * CONSONANTS.length));
        }
        return result;
    }

    private async generateRoomId(): Promise<string> {
        const currentIds = await this.presence.smembers(this.CHAT_CHANNEL);
        let id;
        do {
            id = this.generateRoomIdSingle();
        } while (currentIds.includes(id));

        await this.presence.sadd(this.CHAT_CHANNEL, id);
        return id;
    }

    override async onCreate(options: any) {
        const { maxClients }: { maxClients: number } = options;

        this.setState(new MainState(Date.now()));
        this.commandReceiver.register();
        this.roomId = await this.generateRoomId();
        this.maxClients = [2, 4, 8, 16].includes(maxClients) ? maxClients : 4;
    }

    override onJoin(client: Client, options: any) {
        let { clientId }: { clientId: string } = options;

        clientId = clientId && clientId !== "" ? clientId : "User";

        if (this.state.clientData.some((client) => client.clientId === clientId)) {
            console.log(`clientId '${clientId}' is taken.`);
            client.leave(4101, `clientId '${clientId}' is taken`);
        } else {
            console.log(`${clientId} (${client.sessionId}) joined!`);
            client.userData = { clientId };

            const clientData = new ClientData(client.id, clientId);
            this.state.clientData.push(clientData);
            if (!this.state.leader) {
                this.state.leader = clientId;
            }
        }
    }

    override onLeave(client: Client) {
        console.log(client.sessionId, "left!");
        const replaceLeader = this.commandReceiver.isLeader(client); // Replace leader if the leader is leaving

        const idx = this.state.clientData.findIndex((c) => c.sessionId === client.sessionId);
        if (idx !== -1) {
            this.state.clientData.deleteAt(idx);
        } else {
            console.error(`Client '${client.id}' could not be removed.`);
        }

        // Choose the earliest joined client to be the next leader
        if (replaceLeader) {
            if (this.clients.length > 0) {
                this.state.leader = this.clients[0].userData.clientId;
            }
        }
    }

    override onDispose() {
        console.log("room", this.roomId, "disposing...");
        this.presence.srem(this.CHAT_CHANNEL, this.roomId);
        this.commandReceiver = null;
    }
}
