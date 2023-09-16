import { Schema, ArraySchema, type } from "@colyseus/schema";
import { Ability, AoeDamageAbility, DamageAbility } from "./Ability";

export type EquipmentType = "weapon" | "ring";

export abstract class Item extends Schema {
    @type("string")
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }
}

export class StackableItem extends Item {
    @type("uint16")
    quantity: number;

    constructor(name: string, quantity: number = 1) {
        super(name);
        this.quantity = quantity;
    }
}

export class Equipment extends Item {
    @type("string")
    type: EquipmentType;

    @type([Ability])
    abilities: ArraySchema<Ability>;

    @type("number")
    healthModifier: number;

    @type("number")
    damageModifier: number;

    constructor(name: string, type: EquipmentType, abilities: Ability[], healthMultiplier: number, damageMultiplier: number) {
        super(name);
        this.type = type;
        this.abilities = new ArraySchema<Ability>(...abilities);
        this.healthModifier = healthMultiplier;
        this.damageModifier = damageMultiplier;
    }
}

export const itemRefs = {
    coin: (quantity: number = 1) => new StackableItem("Coin", quantity),
} satisfies { [key: string]: (quantity: number) => StackableItem };

export const equipmentRefs = {
    training_sword: () => new Equipment("Training Sword", "weapon", [new DamageAbility("Sword Thrust", 8)], 0, 0),
    steel_sword: () => new Equipment("Steel Sword", "weapon", [new DamageAbility("Valiant Strike", 15), new AoeDamageAbility("Rapid Sweep", 8, 5)], 0, 0),
} satisfies { [key: string]: () => Equipment };
