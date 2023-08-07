import { browser } from "$app/environment"

export default class Preferences {
    public characterName: string = "";
    private _darkMode: boolean = false;

    public get darkMode() {
        return this._darkMode;
    }

    public set darkMode(value: boolean) {
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

    public static loadPrefs = () => {
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
    }
    
    public static savePrefs = (prefs: Preferences) => {
        if (browser) {
            localStorage.setItem("preferences", JSON.stringify(prefs));
        }
    }
}
