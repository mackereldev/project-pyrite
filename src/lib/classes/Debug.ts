export default class Debug {
    private static initialised = false;
    private static _isLogging = false;
    private static _isDummy = false;

    private static initialise() {
        Debug._isLogging = localStorage.getItem("debug_mode") == "true";
        Debug._isDummy = localStorage.getItem("dummy_mode") == "true";
        this.initialised = true;
    }
    
    public static get isLogging() {
        if (!Debug.initialised) {
            Debug.initialise();
        }
        
        return Debug._isLogging;
    }
    
    public static get isDummy() {
        if (!Debug.initialised) {
            Debug.initialise();
        }

        return Debug._isDummy;
    }

    public static log(message?: any, ...optionalParams: any[]) {
        if (!Debug.isLogging) return;

        console.log(message, ...optionalParams);
    }
}
