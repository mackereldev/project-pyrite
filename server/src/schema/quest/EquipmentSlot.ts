import { Schema, type } from "@colyseus/schema";
import { Equipment, type EquipmentType } from "./Item";

export class EquipmentSlot extends Schema {
    @type("string")
    readonly typeRestriction: EquipmentType;

    /**
     * @remarks Do not modify this directly.
     */
    @type(Equipment)
    equipment: Equipment | undefined;

    constructor(typeRestriction: EquipmentType) {
        super();
        this.typeRestriction = typeRestriction;
    }
}
