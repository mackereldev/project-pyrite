import { AoeDamageAbility } from "./Ability";
import { Enemy } from "./Enemy";

export class Boss extends Enemy { }

export const bossRefs = {
    giantSkeleton: () => new Boss("Giant Skeleton", 200, [
        new AoeDamageAbility("Slam", 14, 10),
    ]),
};
