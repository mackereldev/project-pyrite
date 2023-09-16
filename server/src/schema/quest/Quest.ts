import { BattleRoom, BossRoom, MarketRoom, QuestRoom } from "./QuestRoom";

export class Quest {
    private readonly configuration: (() => QuestRoom)[];

    readonly name;
    readonly battleRoom: () => BattleRoom;
    readonly marketRoom: () => MarketRoom;
    readonly bossRoom: () => BossRoom;

    constructor(name: string, battleRoom: () => BattleRoom, marketRoom: () => MarketRoom, bossRoom: () => BossRoom) {
        this.name = name;
        this.battleRoom = battleRoom;
        this.marketRoom = marketRoom;
        this.bossRoom = bossRoom;

        this.configuration = [
            battleRoom,
            battleRoom,
            marketRoom,
            battleRoom,
            battleRoom,
            marketRoom,
            battleRoom,
            battleRoom,
            marketRoom,
            bossRoom,
        ];
    }

    generateRoomByIndex = (idx: number) => {
        const roomType = this.configuration[Math.floor(idx)];
        const callback = [this.battleRoom, this.marketRoom, this.bossRoom].find((t) => t === roomType);

        const room = callback();
        const difficulty = Math.floor(idx / 3) * 1.25 + 2;
        room.generate(difficulty);

        return room;
    };
}
