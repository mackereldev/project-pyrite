import { Enemy } from "./Enemy";
import { Player } from "./Player";

export type PlayerChanges = { player: Player; changes: { health: number } }[];
export type EnemyChanges = { enemy: Enemy; changes: { health: number } }[];

export class AbilityExecutionResult {
    playerChanges: PlayerChanges;
    enemyChanges: EnemyChanges;
    message: string;

    static get default() : AbilityExecutionResult {
        return new AbilityExecutionResult([], [], "");
    }
    

    constructor(playerChanges: PlayerChanges = [], enemyChanges: EnemyChanges = [], message: string) {
        this.playerChanges = playerChanges;
        this.enemyChanges = enemyChanges;
        this.message = message;
    }
}
