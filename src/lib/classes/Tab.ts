import type { IconSource } from "@steeze-ui/heroicons";
import { writable } from "svelte/store";

export abstract class Tab {
    name = writable<string>();
    heroIcon?: IconSource;

    constructor(name?: string, heroIcon?: IconSource) {
        this.name.set(name || "NULL");
        this.heroIcon = heroIcon;
    }

    dispose = async () => { };
}
