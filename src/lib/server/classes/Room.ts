import Client from "./Client";
import type { Realtime, Types } from "ably/promises";
import { getChannelNamespace } from "$lib/server/environment-handler";

export default class Room {
    private realtime: Realtime;
    private channel: Types.RealtimeChannelPromise;

    private _code;
    get code() {
        return this._code;
    }

    private clients: Client[] = [];
    private leader?: Client;

    private _serverStartTime = Date.now();
    get serverStartTime() {
        return this._serverStartTime;
    }

    private onCloseRoom;

    get serverConnectionId() {
        return this.realtime.connection.id!;
    }

    constructor(realtimeInstance: Realtime, code: string, onCloseRoomCallback: (room: Room) => void) {
        this.realtime = realtimeInstance;
        this._code = code;
        this.onCloseRoom = onCloseRoomCallback;
        this.channel = this.realtime.channels.get(`${getChannelNamespace()}:${this.code}`);
    }

    private async joinClient(client: Client) {
        if (this.clients.every((c) => !client.similar(c))) {
            if (!this.leader) {
                this.leader = client;
            }

            await this.channel.presence.enterClient(client.clientId);
            this.clients.push(client);
            return true;
        } else {
            return false;
        }
    }

    private async leaveClient(clientId: string) {
        const client = this.getClient(clientId);

        try {
            const replaceLeader = this.leader == client;

            this.clients = this.clients.filter((c) => c != client);
            await this.channel.presence.leaveClient(clientId);

            if (this.clients.length == 0) {
                this.closeRoom();
                return true;
            } else {
                if (replaceLeader) {
                    this.leader = this.clients[0];
                }
            }
        } catch (error) {
            console.error(error);
        }

        return false;
    }

    private closeRoom() {
        this.channel.detach();

        this.onCloseRoom(this);
    }

    getClient(clientId: string) {
        return this.clients.find((c) => c.clientId == clientId);
    }

    async initialise() {
        await this.channel.subscribe("server/join", async (msg) => {
            console.log(`received request from client (${msg.clientId}) to join server ${this.code}`);
            
            if (msg.connectionId && (await this.joinClient(new Client(msg.clientId, msg.connectionId)))) {
                console.log(`request from (${msg.clientId}) to join was successful`);
                await this.channel.publish("client/join", { success: true });
                console.log(`msg published...`);
            } else {
                console.log(`request from (${msg.clientId}) to join was unsuccessful`);
                await this.channel.publish("client/join", { success: false, errorReason: "invalid_request" });
                console.log(`msg published...`);
            }
        });
        
        await this.channel.subscribe("server/leave", async (msg) => {
            console.log(`received request from client (${msg.clientId}) to leave server ${this.code}`);
            const success = await this.leaveClient(msg.clientId);

            if (success) {
                console.log(`request from (${msg.clientId}) to leave was successful`);
            } else {
                console.log(`request from (${msg.clientId}) to leave was unsuccessful`);
            }
        });

        return await this.channel.whenState("attached");
    }
}
