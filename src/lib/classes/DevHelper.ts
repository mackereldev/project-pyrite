export default class DevHelper {
    static debugMode = false;
    static #initialised = false;

    static get allowed() {
        if (!DevHelper.#initialised) {
            DevHelper.debugMode = localStorage.getItem("debug_mode") == "true";
        }

        return DevHelper.debugMode;
    }

    static log(message?: any, ...optionalParams: any[]) {
        if (!DevHelper.allowed) return;

        console.log(message, ...optionalParams);
    }
}
