import { Client, Room } from "@colyseus/core";
import { MainState } from "../schema/MainState";
import { CommandReceiver } from "../classes/CommandReceiver";
import { ClientData } from "../schema/ClientData";

export class ChatRoom extends Room<MainState> {
    private CHAT_CHANNEL = "chat:rooms";

    private commandReceiver: CommandReceiver = new CommandReceiver(this);

    private async generateRoomId(): Promise<string> {
        const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";
        const generateRoomIdSingle = (): string => {
            let result = "";
            for (let i = 0; i < 4; i++) {
                result += CONSONANTS.charAt(Math.floor(Math.random() * CONSONANTS.length));
            }
            return result;
        };

        const currentIds = await this.presence.smembers(this.CHAT_CHANNEL);
        let id;
        do {
            id = generateRoomIdSingle();
        } while (currentIds.includes(id));

        await this.presence.sadd(this.CHAT_CHANNEL, id);
        return id;
    }

    override async onCreate() {
        this.setState(new MainState(Date.now()));
        this.commandReceiver.register();
        this.roomId = await this.generateRoomId();
    }

    override onJoin(client: Client, options: any) {
        let { clientId }: { clientId: string } = options;

        if (clientId && clientId !== "") {
            // Checks if clientId is too long
            if (clientId.length > 24) {
                client.leave(4121, `clientId '${clientId}' is longer than 24 characters`);
                return;
            }

            // Checks for illegal characters
            if (new RegExp(/[^\x20-\x7F]/g).test(clientId)) {
                client.leave(4122, `clientId '${clientId}' contains illegal characters`);
                return;
            }
        } else {
            clientId = `Anonymous (${client.sessionId})`;
        }

        if (this.state.clientData.some((client) => client.clientId === clientId)) {
            client.leave(4101, `clientId '${clientId}' is taken`);
        } else {
            if (this.state.clientData.length === 0) {
                console.debug(`Room '${this.roomId}' was created by '${clientId}' (${client.sessionId})`);
            }
            client.userData = { clientId };

            const clientData = new ClientData(client.id, clientId);
            this.state.clientData.push(clientData);
            if (!this.state.leader) {
                this.state.leader = clientId;
            }
        }
    }

    override onLeave(client: Client) {
        const replaceLeader = this.state.isLeader(client); // Replace leader if the leader is leaving

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
        console.debug(`Room '${this.roomId}' was disposed.`);
        this.presence.srem(this.CHAT_CHANNEL, this.roomId);
        this.commandReceiver = null;
    }
}
