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
                return;
            } else {
                if (replaceLeader) {
                    this.leader = this.clients[0];
                }
            }
        } catch (error) {
            console.error(error);
        }
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
            if (msg.connectionId && (await this.joinClient(new Client(msg.clientId, msg.connectionId)))) {
                this.channel.publish("client/join", { success: true });
            } else {
                this.channel.publish("client/join", { success: false, errorReason: "invalid_request" });
            }
        });

        await this.channel.subscribe("server/leave", async (msg) => {
            await this.leaveClient(msg.clientId);
        });

        return await this.channel.whenState("attached");
    }
}
