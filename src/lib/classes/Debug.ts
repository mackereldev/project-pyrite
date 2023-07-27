export default class Debug {
    static enabled = false;
    static #initialised = false;

    static get allowed() {
        if (!Debug.#initialised) {
            Debug.enabled = localStorage.getItem("debug_mode") == "true";
        }

        return Debug.enabled;
    }

    static log(message?: any, ...optionalParams: any[]) {
        if (!Debug.allowed) return;

        console.log(message, ...optionalParams);
    }
}
