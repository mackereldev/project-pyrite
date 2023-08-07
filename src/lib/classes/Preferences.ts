import { browser } from "$app/environment"

export default class Preferences {
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

    constructor(darkMode: boolean) {
        this.darkMode = darkMode;
    }

    public static loadPrefs = () => {
        if (browser) {
            const storage = localStorage.getItem("preferences");
            if (storage) {
                const obj = JSON.parse(storage);
                const prefs = new Preferences(obj._darkMode);
                return prefs;
            }
        }
    }
    
    public static savePrefs = (prefs: Preferences) => {
        if (browser) {
            localStorage.setItem("preferences", JSON.stringify(prefs));
        }
    }
}
