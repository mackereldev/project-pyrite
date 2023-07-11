export default class DevHelper {
    static devMode = false;
    static #initialised = false;

    static get allowed() {
        if (!DevHelper.#initialised) {
            DevHelper.devMode = localStorage.getItem("isDev") == "true";;
        }

        return DevHelper.devMode;
    }

    static log (message?: any, ...optionalParams: any[]) {
        if (!DevHelper.allowed) return;

        console.log(message, ...optionalParams);
    }
}
