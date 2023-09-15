import { Enemy } from "./Enemy";
import { Entity } from "./Entity";
import { Player } from "./Player";

export class AbilityExecutionContext {
    executor: Entity;
    target: Entity;
    allies: Entity[];
    hostiles: Entity[];

    constructor(executor: Entity, target: Entity, allies: Entity[], hostiles: Entity[]) {
        this.executor = executor;
        this.target = target;
        this.allies = allies;
        this.hostiles = hostiles;
    }

    validate(nature: "friendly" | "hostile") {
        const executorType = this.executor instanceof Player ? "player" : this.executor instanceof Enemy ? "enemy" : "invalid";
        const targetType = this.target instanceof Player ? "player" : this.target instanceof Enemy ? "enemy" : "invalid";

        if (executorType === "invalid") throw new Error("'executor' is an invalid entity.");
        if (targetType === "invalid") throw new Error("'target' is an invalid entity.");

        if (nature === "friendly" && executorType !== targetType) throw new Error("'target' must be an ally.");
        if (nature === "hostile" && executorType === targetType) throw new Error("'target' must be an enemy.");
    }
}
