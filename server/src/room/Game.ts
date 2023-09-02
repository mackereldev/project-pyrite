import { Client, Room } from "@colyseus/core";
import { GameState } from "../schema/GameState";
import { CommandReceiver } from "../classes/CommandReceiver";
import { QuestHandler } from "../classes/QuestHandler";
import { ClientData } from "../schema/ClientData";
import { ChangeTree } from "@colyseus/schema/lib/changes/ChangeTree";
import { BattleRoom } from "../schema/quest/QuestRoom";

const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";

export class Game extends Room<GameState> {
    private GAME_CHANNEL = "game:rooms";

    private commandHandler: CommandReceiver = new CommandReceiver(this);
    questHandler: QuestHandler = new QuestHandler(this);

    private generateRoomIdSingle(): string {
        let result = "";
        for (let i = 0; i < 4; i++) {
            result += CONSONANTS.charAt(Math.floor(Math.random() * CONSONANTS.length));
        }
        return result;
    }

    override onBeforePatch(state: GameState): void | Promise<any> {
        // Checks if the player or enemy state has changed this patch, and updates the turn cycle
        const playerChangeTree = (state.questState.players as any)?.$changes as ChangeTree;
        const enemiesChangeTree = ((state.questState.room as BattleRoom)?.enemies as any)?.$changes as ChangeTree;

        if (playerChangeTree?.changed || enemiesChangeTree?.changed) {
            this.questHandler.updateTurnCycle();
        }

        return;
    }

    private async generateRoomId(): Promise<string> {
        const currentIds = await this.presence.smembers(this.GAME_CHANNEL);
        let id;
        do {
            id = this.generateRoomIdSingle();
        } while (currentIds.includes(id));

        await this.presence.sadd(this.GAME_CHANNEL, id);
        return id;
    }

    override async onCreate(options: any) {
        const { maxClients }: { maxClients: number } = options;

        this.setState(new GameState(Date.now()));
        this.commandHandler.register();
        this.roomId = await this.generateRoomId();
        this.maxClients = [2, 4, 8, 16].includes(maxClients) ? maxClients : 4;
    }

    override onJoin(client: Client, options: any) {
        let { clientId }: { clientId: string } = options;

        clientId = clientId && clientId !== "" ? clientId : "Player";

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

            // Newly joining players will join the quest as dead
            if (this.state.questState.active) {
                this.questHandler.joinPlayer(clientData, true); // <-- 'asDead' is true
            }
        }
    }

    override onLeave(client: Client) {
        console.log(client.sessionId, "left!");
        const replaceLeader = this.commandHandler.isLeader(client); // Replace leader if the leader is leaving

        const idx = this.state.clientData.findIndex((c) => c.sessionId === client.sessionId);
        if (idx !== -1) {
            // Leave player from the quest
            if (this.state.questState.active) {
                this.questHandler.leavePlayer(this.state.clientData[idx].clientId);
            }

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
        this.presence.srem(this.GAME_CHANNEL, this.roomId);
        this.commandHandler = null;
        this.questHandler = null;
    }
}
