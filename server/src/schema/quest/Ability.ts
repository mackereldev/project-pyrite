import { Schema, type } from "@colyseus/schema";
import { AbilityExecutionResult, EnemyChanges } from "./AbilityExecutionResult";
import { AbilityExecutionContext } from "./AbilityExecutionContext";
import type { Enemy } from "./Enemy";

export abstract class Ability extends Schema {
    @type("string")
    name: string;

    @type("string")
    nature: "friendly" | "hostile";

    constructor(name: string, nature: "friendly" | "hostile") {
        super();
        this.name = name;
        this.nature = nature;
    }

    execute(context: AbilityExecutionContext): AbilityExecutionResult {
        context.validate(this.nature);
        return AbilityExecutionResult.default;
    }
}

export class DamageAbility extends Ability {
    @type("number")
    damage: number;

    constructor(name: string, damage: number) {
        super(name, "hostile");
        this.damage = damage;
    }

    override execute(context: AbilityExecutionContext): AbilityExecutionResult {
        super.execute(context);

        if (context.enemies.includes(context.target)) {
            const enemy: Enemy = context.target as Enemy;
            const totalBaseDamage = this.damage * context.executor.evaluateEquipmentModifier("DMG");

            return new AbilityExecutionResult([], [{ enemy, changes: { health: -totalBaseDamage } }]);
        }
    }
}

export class AoeDamageAbility extends DamageAbility {
    @type("number")
    adjacencyDamage: number;

    constructor(name: string, damage: number, adjacencyDamage: number) {
        super(name, damage);
        this.adjacencyDamage = adjacencyDamage;
    }

    override execute(context: AbilityExecutionContext): AbilityExecutionResult {
        super.execute(context);

        if (context.enemies.includes(context.target)) {
            const targetEnemy: Enemy = context.target as Enemy;
            const enemyChanges: EnemyChanges = [];
            const executorDamageMultiplier = context.executor.evaluateEquipmentModifier("DMG");

            const totalBaseDamage = this.damage * executorDamageMultiplier;
            const totalAdjacentDamage = this.adjacencyDamage * executorDamageMultiplier;

            const adjacentEnemies = context.enemies.filter((enemy) => enemy !== targetEnemy);
            enemyChanges.push({ enemy: targetEnemy, changes: { health: -totalBaseDamage * executorDamageMultiplier } });
            adjacentEnemies.forEach((enemy) => enemyChanges.push({ enemy, changes: { health: -totalAdjacentDamage } }));

            return new AbilityExecutionResult([], enemyChanges);
        }
    }
}
