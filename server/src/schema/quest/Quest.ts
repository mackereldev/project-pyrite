import { BattleRoom, BossRoom, MarketRoom, QuestRoom } from "./QuestRoom";

export class Quest {
    private configuration;

    public name;
    public battleRoom: () => BattleRoom
    public marketRoom: () => MarketRoom;
    public bossRoom: () => BossRoom;

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
        ]
    }

    public generateRoomByIndex = (idx: number) => {
        const roomType = this.configuration[Math.floor(idx)];
        const callback = [this.battleRoom, this.marketRoom, this.bossRoom].find((t) => t === roomType);

        let room = callback();
        room.generate();

        return room;
    };
}
