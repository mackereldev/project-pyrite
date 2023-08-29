import { Schema, type } from "@colyseus/schema";
import { Equipment, EquipmentType } from "./Item";

export class EquipmentSlot extends Schema {
    @type("string")
    public readonly typeRestriction: EquipmentType;

    /**
     * @remarks Do not modify this directly.
     */
    @type(Equipment)
    public equipment: Equipment | undefined;

    constructor(typeRestriction: EquipmentType) {
        super();
        this.typeRestriction = typeRestriction;
    }
}
