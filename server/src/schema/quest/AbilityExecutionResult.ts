import { AbilityExecutionContext } from "./AbilityExecutionContext";
import { Entity } from "./Entity";

export type EntityChanges = { entity: Entity; changes: { health: number } }[];

export class AbilityExecutionResult {
    context: AbilityExecutionContext;
    entityChanges: EntityChanges;

    static get default(): AbilityExecutionResult {
        return new AbilityExecutionResult(undefined, []);
    }

    constructor(context: AbilityExecutionContext, entityChanges: EntityChanges = []) {
        this.context = context;
        this.entityChanges = entityChanges;
    }
}
