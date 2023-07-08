import Client from "./Client";
import type { Realtime, Types } from "ably/promises";
import { getChannelNamespace } from "$lib/server/environment-handler";

export default class Room {
    private realtime: Realtime;
    code: string;
    private channel: Types.RealtimeChannelPromise;

    private clients: Client[] = [];
    private leader?: Client;

    private _serverStartTime = Date.now();
    get serverStartTime() {
        return this._serverStartTime;
    }

    private subscriptions: Promise<Types.ChannelStateChange | null>[] = [];
    private onCloseRoom;

    get serverConnectionId() {
        return this.realtime.connection.id!;
    }

    constructor(realtimeInstance: Realtime, code: string, onCloseRoomCallback: (room: Room) => void) {
        this.realtime = realtimeInstance;
        this.code = code;
        this.onCloseRoom = onCloseRoomCallback;
        this.channel = this.realtime.channels.get(`${getChannelNamespace()}:${this.code}`);

        this.subscriptions.push(this.channel.subscribe("server/join", async (msg) => {
            if (msg.connectionId && await this.joinClient(new Client(msg.clientId, msg.connectionId))) {
                this.channel.publish("client/join", { success: true });
            } else {
                this.channel.publish("client/join", { success: false, errorReason: "invalid_request" });
            }
        }));

        this.subscriptions.push(this.channel.subscribe("server/leave", (msg) => {
            if (msg.data.clientId == msg.clientId && msg.connectionId) {
                this.leaveClient(msg.clientId);
            }
        }));
    }

    private async joinClient(client: Client) {
        if (this.clients.every((c) => c.clientId != client.clientId && c.connectionId != client.connectionId)) {
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
                return; // Prevents more code from running after the room is closed
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

    async whenConnected() {
        this.subscriptions.forEach(async subscription => {
            await subscription;
        });
        return await this.channel.whenState("attached");
    }
}
