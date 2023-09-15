import { Enemy } from "./Enemy";
import { BattleRoom } from "./QuestRoom";

export class EnemyPrefab {
    weight: number;
    initialiser: (room: BattleRoom) => Enemy;

    constructor(weight: number, initialiser: (room: BattleRoom) => Enemy) {
        this.weight = weight;
        this.initialiser = initialiser;
    }
}
