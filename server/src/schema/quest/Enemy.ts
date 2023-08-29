import { Ability } from "./Ability";
import { Entity } from "./Entity";
import { Equipment } from "./Item";

export class Enemy extends Entity {
    constructor(name: string, health: number, abilities: Ability[], equipment: Equipment[] = []) {
        super(name, health, abilities, equipment.map((eq) => eq.type));
        equipment.forEach(eq => {
            this.addEquipment(eq);
        });
    }
}

export const enemyRefs = {
    skeleton: () => new Enemy("Skeleton", 50, [], [
        new Equipment("Bone Cutlass", "weapon", [
            new Ability("Sword Slash", 15),
        ], 0, 0),
    ]),
    bat: () => new Enemy("Bat", 20, [
        new Ability("Swoop", 15),
    ]),
};
