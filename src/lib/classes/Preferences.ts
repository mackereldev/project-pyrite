import { browser } from "$app/environment";
import { AutoScrollBehaviour } from "$lib/enums";

export class Preferences {
    username: string = "";
    private _darkMode: boolean = false;
    autoScrollBehaviour: AutoScrollBehaviour = AutoScrollBehaviour.Always;

    get darkMode() {
        return this._darkMode;
    }

    set darkMode(value: boolean) {
        this._darkMode = value;
        if (value) {
            if (!document.documentElement.classList.contains("dark")) {
                document.documentElement.classList.add("dark");
            }
        } else {
            if (document.documentElement.classList.contains("dark")) {
                document.documentElement.classList.remove("dark");
            }
        }
    }

    static loadPrefs = () => {
        if (browser) {
            const prefs = new Preferences();
            const storage = localStorage.getItem("preferences");
            if (storage) {
                const obj = JSON.parse(storage);

                prefs.username = obj.username;
                prefs.darkMode = obj._darkMode;
            }
            return prefs;
        }
    };

    static savePrefs = (prefs: Preferences) => {
        if (browser) {
            localStorage.setItem("preferences", JSON.stringify(prefs));
        }
    };
}
