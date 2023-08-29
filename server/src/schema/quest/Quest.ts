import { BattleRoom, BossRoom, MarketRoom } from "./QuestRoom";

export class Quest {
    private configuration;

    name;
    battleRoom: () => BattleRoom;
    marketRoom: () => MarketRoom;
    bossRoom: () => BossRoom;

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
        room.generate();

        return room;
    };
}
