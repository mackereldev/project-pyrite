import { Game } from "../room/Game";
import { Quest } from "../schema/quest/Quest";
import { BattleRoom, BossRoom, MarketRoom, QuestRoom } from "../schema/quest/QuestRoom";
import { ServerChat } from "./ServerChat";
import { Player } from "../schema/quest/Player";
import { ClientData } from "../schema/ClientData";
import { Entity } from "../schema/quest/Entity";
import { ArraySchema } from "@colyseus/schema";

export class QuestHandler {
    private game: Game;

    private get questState() {
        return this.game.state.questState;
    }

    static quests: Quest[] = [
        new Quest(
            "Catacombs",
            () => new BattleRoom("skeleton", "bat"),
            () => new MarketRoom(0),
            () => new BossRoom("giantSkeleton")
        ),
        // new Quest("Dark Forest", ...),
    ];

    private currentQuest: Quest = null;
    private currentRoom: QuestRoom = null;

    constructor(game: Game) {
        this.game = game;
    }

    start = (questIndex: number) => {
        try {
            this.questState.active = true;
            this.currentQuest = QuestHandler.quests[questIndex];
            this.questState.roomIndex = -1;
            this.questState.name = this.currentQuest.name;
            this.nextRoom();

            // Join every currently connected player to the quest
            this.game.state.clientData.forEach((client) => this.joinPlayer(client));
            this.questState.currentTurn = this.questState.players[0];

            this.game.broadcast("quest-start", undefined, { afterNextPatch: true });
        } catch (error) {
            console.error("Quest could not be started.");
        }
    };

    nextRoom = () => {
        this.questState.roomIndex++;
        this.currentRoom = this.currentQuest.generateRoomByIndex(this.questState.roomIndex);
        this.questState.room = this.currentRoom;
    };

    joinPlayer = (client: ClientData, asDead: boolean = false) => {
        this.questState.players.push(new Player(client.clientId, asDead));
    };

    leavePlayer = (clientId: string) => {
        const idx = this.questState.players.findIndex((p) => p.clientId === clientId);
        if (idx !== -1) {
            if (this.questState.currentTurn === this.questState.players[idx]) {
                this.nextTurn();
            }
            this.questState.players.deleteAt(idx);
        }
    };

    nextTurn = () => {
        if (!["battle"].includes(this.questState.room?.type)) {
            console.error("Must be in a battle room. (WIP)");
            return;
        }

        const turnIndex = this.questState.turnCycle.indexOf(this.questState.currentTurn);
        this.questState.currentTurn = this.questState.turnCycle[(turnIndex + 1) % this.questState.turnCycle.length];
    };

    updateTurnCycle = () => {
        this.questState.turnCycle = new ArraySchema<Entity>(...(this.questState.players.toArray() as Entity[]).concat((this.questState.room as BattleRoom).enemies.toArray() as Entity[]).filter((entity) => !entity.isDead));
    };

    stop = () => {
        this.questState.active = false;
        this.currentQuest = null;
        this.questState.roomIndex = -1;
        this.questState.name = "";
        this.questState.currentTurn = null;
        this.currentRoom = null;

        this.game.broadcast("server-chat", new ServerChat("game", `Your party abandons the quest.`).serialize());
        this.questState.players.clear();
    };

    dispose = () => { };
}
