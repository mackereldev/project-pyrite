import { Schema, type } from "@colyseus/schema";

export class Ability extends Schema {
    @type("string")
    name: string;

    @type("number")
    damage: number;

    constructor(name: string, damage: number) {
        super();
        this.name = name;
        this.damage = damage;
    }
}
