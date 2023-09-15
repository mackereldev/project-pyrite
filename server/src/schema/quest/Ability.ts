import { Schema, type } from "@colyseus/schema";
import { AbilityExecutionResult, EntityChanges } from "./AbilityExecutionResult";
import { AbilityExecutionContext } from "./AbilityExecutionContext";
import type { Enemy } from "./Enemy";
import { Entity } from "./Entity";
import { Game } from "../../room/Game";
import { ServerChat } from "../../classes/ServerChat";

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

    evaluate(game: Game, result: AbilityExecutionResult): void {
        const messages = [];
        messages.push(`'${result.context.executor.name}' uses '${this.name}' on '${result.context.target.name}'`);

        const entityDeathQueue: Entity[] = [];

        const executorDamageMultiplier = result.context.executor.evaluateEquipmentModifier("DMG");
        result.entityChanges.forEach(entityChange => {
            const healthChange = entityChange.changes.health * executorDamageMultiplier;
            if (entityChange.entity.changeHealth(healthChange)) {
                messages.push(`${entityChange.entity.name} took ${-healthChange} damage and died.`);
                entityDeathQueue.push(entityChange.entity);
            } else {
                if (healthChange > 0) {
                    messages.push(`${entityChange.entity.name} healed for ${healthChange} health (${entityChange.entity.health}/${entityChange.entity.maxHealth} HP)`);
                } else {
                    messages.push(`${entityChange.entity.name} took ${-healthChange} damage (${entityChange.entity.health}/${entityChange.entity.maxHealth} HP)`);
                }
            }
        });

        game.broadcast("server-chat", messages.map((text) => new ServerChat("game", text).serialize()));
        entityDeathQueue.forEach(entity => entity.die());
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

        if (context.hostiles.includes(context.target)) {
            const totalBaseDamage = this.damage * context.executor.evaluateEquipmentModifier("DMG");

            return new AbilityExecutionResult(context, [{ entity: context.target, changes: { health: -totalBaseDamage } }]);
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

        if (context.hostiles.includes(context.target as Enemy)) {
            const targetEnemy: Enemy = context.target as Enemy;
            const entityChanges: EntityChanges = [];
            const executorDamageMultiplier = context.executor.evaluateEquipmentModifier("DMG");

            const totalBaseDamage = this.damage * executorDamageMultiplier;
            const totalAdjacentDamage = this.adjacencyDamage * executorDamageMultiplier;

            const adjacentEnemies = context.hostiles.filter((entity) => entity !== targetEnemy);
            entityChanges.push({ entity: targetEnemy, changes: { health: -totalBaseDamage * executorDamageMultiplier } });
            adjacentEnemies.forEach((entity) => entityChanges.push({ entity, changes: { health: -totalAdjacentDamage } }));

            return new AbilityExecutionResult(context, entityChanges);
        }
    }
}
