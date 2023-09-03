import { Schema, ArraySchema, type } from "@colyseus/schema";
import { Enemy, enemyRefs } from "../quest/Enemy";
import { Boss, bossRefs } from "../quest/Boss";

export abstract class QuestRoom extends Schema {
    @type("string")
    type: "battle" | "market" | "boss";

    abstract generate(): void;

    constructor(type: "battle" | "market" | "boss") {
        super();
        this.type = type;
    }
}

export class BattleRoom extends QuestRoom {
    enemyPrefabs: (() => Enemy)[];

    @type([Enemy])
    enemies: ArraySchema<Enemy> = new ArraySchema<Enemy>();

    constructor(...enemyPrefabs: (keyof typeof enemyRefs)[]) {
        super("battle");
        this.enemyPrefabs = enemyPrefabs.map((e) => enemyRefs[e]);
    }

    generate(): void {
        const generatedEnemies = [];

        for (let i = 0; i < 3; i++) {
            const random = Math.random() * this.enemyPrefabs.length;
            const enemy = this.enemyPrefabs[Math.floor(random)];

            generatedEnemies.push(enemy());
        }

        this.enemies.push(...generatedEnemies);
    }
}

export class MarketRoom extends QuestRoom {
    test: number;

    constructor(test: number) {
        super("market");
        this.test = test;
    }

    generate(): void {
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

    generate(): void {
        throw new Error("Method not implemented.");
    }
}
