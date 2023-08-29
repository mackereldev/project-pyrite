import { Ability } from "./Ability";
import { Enemy } from "./Enemy";

export class Boss extends Enemy {}

export const bossRefs = {
    skeletonKing: () => new Boss("Skeleton King", 200, [
        new Ability("Slam", 40),
    ]),
};
