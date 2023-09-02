import { Ability, DamageAbility } from "./Ability";
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
            new DamageAbility("Sword Slash", 15),
        ], 0, 0),
    ]),
    bat: () => new Enemy("Bat", 20, [
        new DamageAbility("Swoop", 15),
    ]),
};
