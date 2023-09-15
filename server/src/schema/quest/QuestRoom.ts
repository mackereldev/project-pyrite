import { Schema, ArraySchema, type } from "@colyseus/schema";
import { Enemy, enemyRefs } from "../quest/Enemy";
import { Boss, bossRefs } from "../quest/Boss";
import { EnemyPrefab } from "./EnemyPrefab";

export abstract class QuestRoom extends Schema {
    @type("string")
    type: "battle" | "market" | "boss";

    abstract generate(difficulty: number): void;

    constructor(type: "battle" | "market" | "boss") {
        super();
        this.type = type;
    }
}

export class BattleRoom extends QuestRoom {
    static enemyLimit: number = 4;

    enemyPrefabs: EnemyPrefab[];

    @type([Enemy])
    enemies: ArraySchema<Enemy> = new ArraySchema<Enemy>();

    constructor(...enemyPrefabs: (keyof typeof enemyRefs)[]) {
        super("battle");
        this.enemyPrefabs = enemyPrefabs.map((e) => enemyRefs[e]);
    }

    override generate(difficulty: number): void {
        const generatedEnemies = [];

        /*
        The float is a random number magnified by the deviance, centred around 1.
        A deviance of 0.5 will give a float between 0.75 and 1.25.
        The maxWeight takes into account the float and the difficulty of the current room.
        Enemies have different weights depending on their relative difficulty.
        The maxWeight determines the maximum allowed sum of enemy weights for the given room.
        maxWeight always be equal to or greater than 1.
        */
        const deviance = 0.4;
        const float = ((Math.random() - 0.5) * deviance + 1);
        const maxWeight = Math.max(difficulty * float, 1);
        let currentWeight = 0;

        /*
        BattleRoom.enemyLimit determines the maximum allowed number of enemies that can be generated.
        If the loop has generated a number of enemies equal to BattleRoom.enemyLimit, then the room finishes generating.
        validPrefabs is a filtered list of the room's enemyPrefabs, where each prefab's weight will not exceed the maxWeight.
        If validPrefabs is empty, then the room finishes generating.
        */
        for (let i = 0; i < BattleRoom.enemyLimit; i++) {
            const validPrefabs: EnemyPrefab[] = this.enemyPrefabs.filter((prefab) => prefab.weight + currentWeight <= maxWeight);
            if (validPrefabs.length <= 0) break;

            const prefab = validPrefabs[Math.floor(Math.random() * validPrefabs.length)];
            currentWeight += prefab.weight;
            generatedEnemies.push(prefab.initialiser(this));
        }

        this.enemies = new ArraySchema(...generatedEnemies);
    }
}

export class MarketRoom extends QuestRoom {
    test: number;

    constructor(test: number) {
        super("market");
        this.test = test;
    }

    override generate(): void {
        throw new Error("Method not implemented.");
    }
}

export class BossRoom extends QuestRoom {
    private bossPrefab: (() => Boss);

    @type(Boss)
    boss: Boss;

    constructor(bossPrefab: keyof typeof bossRefs) {
        super("boss");
        this.bossPrefab = bossRefs[bossPrefab];
    }

    override generate(): void {
        throw new Error("Method not implemented.");
    }
}
