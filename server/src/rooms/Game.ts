import { Client, Room } from "@colyseus/core";
import { GameState } from "./schema/GameState";

const LETTERS = "BCDFGHJKLMNPQRSTVWXYZ";

export class Game extends Room<GameState> {
    GAME_CHANNEL = "game:rooms";

    generateRoomIdSingle(): string {
        let result = "";
        for (let i = 0; i < 4; i++) {
            result += LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
        }
        return result;
    }

    async generateRoomId(): Promise<string> {
        const currentIds = await this.presence.smembers(this.GAME_CHANNEL);
        let id;
        do {
            id = this.generateRoomIdSingle();
        } while (currentIds.includes(id));

        await this.presence.sadd(this.GAME_CHANNEL, id);
        return id;
    }

    claimClientId(client: Client, clientId: string): boolean {
        if (this.clients.find((c) => c !== client && c.userData && c.userData.clientId === clientId)) {
            console.log(`clientId '${clientId}' is taken`);
            client.leave(4001, `clientId '${clientId}' is taken`);
            return false;
        } else {
            console.log(client.sessionId, "joined!");
            client.userData.clientId = clientId;
            return true;
        }
    }

    async onCreate(options: any) {
        const { maxClients }: { maxClients: number } = options;

        this.setState(new GameState());
        this.roomId = await this.generateRoomId();

        if ([2, 4, 8, 16].includes(maxClients)) {
            this.maxClients = maxClients;
        } else {
            this.maxClients = 4;
        }

        this.onMessage("chat", (client, message) => {
            const { msg }: { msg: string } = message;
            this.broadcast("chat", { msg, author: { sessionId: client.id, clientId: client.userData.clientId } });
        });
    }

    onJoin(client: Client, options: any) {
        const { clientId }: { clientId: string } = options;

        client.userData = {};
        this.claimClientId(client, clientId && clientId != "" ? clientId : "Player");
    }

    onLeave(client: Client, consented: boolean) {
        console.log(client.sessionId, "left!");
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
        this.presence.srem(this.GAME_CHANNEL, this.roomId);
    }
}
