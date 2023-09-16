import { AoeDamageAbility } from "./Ability";
import { Enemy } from "./Enemy";
import { BattleRoom } from "./QuestRoom";

export class Boss extends Enemy { }

export const bossRefs = {
    giantSkeleton: (room: BattleRoom) => new Boss(room, "Giant Skeleton", 200, [
        new AoeDamageAbility("Slam", 14, 10),
    ], []),
} satisfies { [key: string]: (room: BattleRoom) => Boss };
