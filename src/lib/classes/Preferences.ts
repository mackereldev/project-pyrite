import { browser } from "$app/environment";
import { AutoScrollBehaviour, ChatStyle } from "$lib/enums";
import { writable, type Writable } from "svelte/store";
import { subscribeStoreDefer } from "./Utility";

export class Preferences {
    username = writable<string>("");
    chatStyle = writable<ChatStyle>(ChatStyle.Cozy);
    autoScrollBehaviour = writable<AutoScrollBehaviour>(AutoScrollBehaviour.OnlySelf);
    darkMode = writable<boolean>(false);
    joinLeaveMessages = writable<boolean>(true);

    constructor() {
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                const prop = this[key] as any;
                if (prop.subscribe) {
                    const store = prop as Writable<never>;
                    // Each store of the Preferences class is saved independently upon its value being changed
                    subscribeStoreDefer(store, (value) => {
                        const oldStorage = JSON.parse(localStorage.getItem("preferences") || "{}");
                        oldStorage[key] = value;
                        localStorage.setItem("preferences", JSON.stringify(oldStorage));
                    });
                }
            }
        }

        subscribeStoreDefer(this.darkMode, (value) => {
            if (value) {
                if (!document.documentElement.classList.contains("dark")) {
                    document.documentElement.classList.add("dark");
                }
            } else {
                if (document.documentElement.classList.contains("dark")) {
                    document.documentElement.classList.remove("dark");
                }
            }
        });
    }

    /*
    Preferences are loaded from local storage only if they exist. Each value is
    tested against the properties of the Preferences class, that is if a store
    of the same name exists. Otherwise, unknown preferences are ignored.
    */
    static loadPrefs = () => {
        const prefs = new Preferences();

        if (browser) {
            const storageRaw = localStorage.getItem("preferences");
            if (storageRaw) {
                const storage = JSON.parse(storageRaw);

                for (const key in storage) {
                    if (Object.prototype.hasOwnProperty.call(storage, key)) {
                        const storageProp = storage[key] as any;
                        if (Object.prototype.hasOwnProperty.call(prefs, key)) {
                            const prop = prefs[key as never] as any;
                            if (prop.subscribe) {
                                const store = prop as Writable<never>;
                                store.set(storageProp as never);
                            }
                        }
                    }
                }
            }
        }

        return prefs;
    };
}

// TODO: Use a static class instead since only one instance of Prefrences should exist
export const preferences: Preferences = Preferences.loadPrefs();
