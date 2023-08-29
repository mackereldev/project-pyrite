import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import { Ability } from "./Ability";
import { Equipment, EquipmentType } from "./Item";
import { EquipmentSlot } from "./EquipmentSlot";

export abstract class Entity extends Schema {
    @type("string")
    public name: string;

    @type("number")
    public baseHealth: number;

    @type("number")
    public maxHealth: number;

    @type("number")
    public health: number;

    @type("boolean")
    public isDead: boolean = false;

    /**
     * @remarks This should not be modified directly. Use `replaceEquipment()` and `removeEquipment()` instead.
     */
    @type([EquipmentSlot])
    public readonly equipmentSlots = new ArraySchema<EquipmentSlot>(
        new EquipmentSlot("weapon"),
        new EquipmentSlot("ring"),
    );

    @type([Ability])
    public abilities: ArraySchema<Ability>;

    constructor(name: string, health: number, abilities: Ability[] = [], equipmentSlots: EquipmentType[] = []) {
        super();
        this.name = name;
        this.baseHealth = health;
        this.maxHealth = health;
        this.health = health;
        this.abilities = new ArraySchema<Ability>(...abilities);
        this.equipmentSlots = new ArraySchema<EquipmentSlot>(...equipmentSlots.map((slot) => new EquipmentSlot(slot)));
    }

    /**
     * Deals damage to the entity.
     * @returns Whether the entity died as a result of the damage dealt or was already dead (Entity.isDead).
     */
    public dealDamage = (damage: number): boolean => {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
        }
        return this.isDead;
    };

    /**
     * Adds equipment and its respective abilities and stat boosts (if any) to the entity.
     * @param equipment The equipment to add in place of the equipment occupying `slotIndex`.
     * @param slotIndex The index of the slot to be replaced within the equipment type's respective section.
     * @returns The equipment being replaced.
     */
    public replaceEquipment = (equipment: Equipment, slot: EquipmentSlot, refillHealth: boolean = false): Equipment => {
        let replaced: Equipment;

        if (slot.typeRestriction === equipment.type) {
            if (slot.equipment) {
                replaced = slot.equipment;
                this.removeEquipment(slot);
            }

            slot.equipment = equipment;
            this.abilities.push(...equipment.abilities);
            this.updateHealth(refillHealth);
    
            return replaced;
        } else {
            console.error(`Equipment of type '${equipment.type}' cannot be assigned to slot of type '${slot.typeRestriction}'`)
            return;
        }
    };

    /**
     * A helper function that adds equipment to any available slot (refer to `replaceEquipment`).
     * @param equipment The equipment to add.
     * @param forceEquip Whether the equipment should replace another already equiped item when necessary.
     * @returns The equipment being replaced (only exists if `forceEquip` is true).
     */
    public addEquipment = (equipment: Equipment, forceEquip: boolean = false, refillHealth: boolean = false): Equipment => {
        // All equipment slots with a matching equipment type
        const slots: EquipmentSlot[] = this.equipmentSlots.filter((s) => s.typeRestriction === equipment.type);
        
        if (slots.length > 0) {
            // All equipment slots with a matching equipment type that are empty
            const emptySlots = slots.filter((s) => !s.equipment);

            if (emptySlots.length > 0) {
                return this.replaceEquipment(equipment, emptySlots[0], refillHealth);
            } else if (forceEquip) {
                return this.replaceEquipment(equipment, slots[0], refillHealth);
            } else {
                // No empty slots were found
                return;
            }
        } else {
            console.error(`No slots available for equipment of type '${equipment.type}'`);
            return;
        }
    }

    /**
     * Removes equipment and its associated abilities and stat boosts from the entity.
     * @returns The equipment being removed.
     */
    public removeEquipment = (slot: EquipmentSlot, refillHealth: boolean = false): Equipment => {
        if (this.equipmentSlots.includes(slot)) {
            this.abilities = this.abilities.filter((ability) => !slot.equipment.abilities.includes(ability));
            this.updateHealth(refillHealth);

            const removedEquipment = slot.equipment;
            slot.equipment = undefined;

            return removedEquipment;
        }

        return;
    };

    /**
     * @returns The aggregate multiplier for the specified stat summed from each equipment on the entity.
     */
    public evaluateEquipmentModifier = (stat: "HP" | "DMG"): number => {
        switch (stat) {
            case "HP":
                return Math.max(0.1, (this.equipmentSlots.filter((slot) => slot.equipment) as EquipmentSlot[]).reduce((total, slot) => total + slot.equipment!.healthModifier, 1));
            case "DMG":
                return Math.max(0.1, (this.equipmentSlots.filter((slot) => slot.equipment) as EquipmentSlot[]).reduce((total, slot) => total + slot.equipment!.damageModifier, 1));
            default:
                return 1;
        }
    }

    public updateHealth = (refillHealth: boolean = false) => {
        const multiplier = this.evaluateEquipmentModifier("HP");
        this.maxHealth = this.baseHealth * multiplier;
        if (this.health > this.maxHealth || refillHealth) {
            this.health = this.maxHealth;
        }
    }
}
