import { ServerChat } from "../../classes/ServerChat";
import { Game } from "../../room/Game";
import { Ability, DamageAbility } from "./Ability";
import { AbilityExecutionContext } from "./AbilityExecutionContext";
import { EnemyPrefab } from "./EnemyPrefab";
import { Entity } from "./Entity";
import { Equipment } from "./Item";
import { Player } from "./Player";
import { BattleRoom } from "./QuestRoom";

export class Enemy extends Entity {
    room: BattleRoom;

    constructor(room: BattleRoom, name: string, health: number, abilities: Ability[], equipment: Equipment[]) {
        super(name, health, abilities, equipment.map((eq) => eq.type));
        this.room = room;
        equipment.forEach(eq => {
            this.addEquipment(eq);
        });
    }

    takeTurn = (game: Game, players: Player[]): void => {
        const abilities = Array.from(this.abilities);

        for (let i = 0; i < abilities.length; i++) {
            const ability = abilities[Math.floor(Math.random() * abilities.length)];

            let target: Entity;
            if (ability.nature === "friendly") {
                if (this.room.enemies.length > 0) {
                    target = this.room.enemies[Math.floor(Math.random() * this.room.enemies.length)];
                } else {
                    abilities.splice(abilities.indexOf(ability), 1);
                    continue;
                }
            } else if (ability.nature === "hostile") {
                if (players.length > 0) {
                    target = players[Math.floor(Math.random() * players.length)];
                } else {
                    abilities.splice(abilities.indexOf(ability), 1);
                    continue;
                }
            }
            const abilityExecutionResult = ability.execute(new AbilityExecutionContext(this, target, this.room.enemies.toArray(), players));
            ability.evaluate(game, abilityExecutionResult);
            return;
        }

        game.broadcast("server-chat", new ServerChat("game", `${this.name} skips their turn.`).serialize());
    };

    override die = () => {
        this.room.enemies.deleteAt(this.room.enemies.findIndex((enemy) => enemy === this));
    };
}

export const enemyRefs = {
    skeleton: new EnemyPrefab(2, (room: BattleRoom) => new Enemy(room, "Skeleton", 14,
        [],
        [
            new Equipment("Bone Cutlass", "weapon", [
                new DamageAbility("Sword Slash", 5),
            ], 0, 0),
        ]
    )),
    bat: new EnemyPrefab(1, (room: BattleRoom) => new Enemy(room, "Bat", 8,
        [
            new DamageAbility("Swoop", 3),
        ],
        []
    )),
} satisfies { [key: string]: EnemyPrefab };
