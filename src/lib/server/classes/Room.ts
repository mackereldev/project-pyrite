import Client from "./Client";
import type { Realtime, Types } from "ably/promises";
import * as MathMore from "$lib/classes/MathMore";

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

    constructor(realtimeInstance: Realtime, namespace: string, code: string, onCloseRoomCallback: (room: Room) => void) {
        this.realtime = realtimeInstance;
        this._code = code;
        this.onCloseRoom = onCloseRoomCallback;
        this.channel = this.realtime.channels.get(`${namespace}:${this.code}`);
    }

    private joinClient(client: Client) {
        if (!this.leader) {
            this.leader = client;
        }

        this.channel.presence.enterClient(client.clientId);
        this.clients.push(client);
    }

    private leaveClient(clientId: string) {
        const client = this.getClient(clientId);

        try {
            const replaceLeader = this.leader == client;

            this.clients = this.clients.filter((c) => c != client);
            this.channel.presence.leaveClient(clientId);

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
        await this.channel.subscribe("server/join", (msg) => {
            console.log(`received request from client (${msg.clientId}) to join server ${this.code}`);
            this.joinClient(new Client(msg.clientId, msg.connectionId!));
        });

        await this.channel.subscribe("server/leave", (msg) => {
            console.log(`received request from client (${msg.clientId}) to leave server ${this.code}`);
            const success = this.leaveClient(msg.clientId);

            if (success) {
                console.log(`request from (${msg.clientId}) to leave was successful`);
            } else {
                console.log(`request from (${msg.clientId}) to leave was unsuccessful`);
            }
        });

        await this.channel.subscribe("server/ping", (msg) => {
            let delay = msg.data.delay;
            if (Number.isFinite(delay)) {
                delay = MathMore.clamp(delay, 0, 10000);
            }

            setTimeout(() => {
                this.channel.publish("client/ping", { sender: msg.clientId });
            }, delay);
        });

        return await this.channel.whenState("attached");
    }
}
