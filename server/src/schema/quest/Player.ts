import { ArraySchema, type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { Item, StackableItem, equipmentRefs, itemRefs } from "./Item";

export class Player extends Entity {
    @type("string")
    clientId: string;

    @type([Item])
    inventory: ArraySchema<Item> = new ArraySchema<Item>();

    constructor(clientId: string, isDead: boolean) {
        super("~PLAYER", 50, undefined, ["weapon", "weapon", "ring", "ring"]);
        this.addEquipment(equipmentRefs.training_sword(), false, true);
        this.addItem(equipmentRefs.steel_sword(), itemRefs.coin(20));
        this.clientId = clientId;
        this.isDead = isDead;
    }

    addItem = (...items: Item[]) => {
        items.forEach((item) => {
            if (item instanceof StackableItem) {
                const match = this.inventory.find((i) => i instanceof StackableItem && i.name === item.name) as StackableItem;
                if (match) {
                    match.quantity += item.quantity;
                    return;
                }
            }

            this.inventory.push(item);
        });
    };

    removeItem = (...items: Item[]) => {
        items.forEach((item) => {
            if (item instanceof StackableItem) {
                const matchIdx = this.inventory.findIndex((i) => i instanceof StackableItem && i.name === item.name);
                const match = this.inventory[matchIdx] as StackableItem;
                if (match) {
                    match.quantity -= item.quantity;
                    if (match.quantity <= 0) {
                        this.inventory.deleteAt(matchIdx);
                    }
                }
            } else {
                this.inventory.deleteAt(this.inventory.findIndex((i) => i.name === item.name));
            }
        });
    };
}
