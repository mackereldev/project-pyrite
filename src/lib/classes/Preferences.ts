import { browser } from "$app/environment";

export default class Preferences {
    characterName: string = "";
    private _darkMode: boolean = false;

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

                prefs.characterName = obj.characterName;
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
