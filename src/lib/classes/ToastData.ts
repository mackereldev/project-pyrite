export default class ToastData {
    static readonly DEFAULT_DURATIONS = {
        success: 5000,
        info: 5000,
        warning: 8000,
        error: 12000,
    };

    severity: "success" | "info" | "warning" | "error";
    message: string;
    detail: string;

    private _duration: "disabled" | "auto" | number;
    get duration() {
        return this._duration === "disabled" ? -1 : this._duration === "auto" ? this.evaluateAutoDuration() : this._duration;
    }

    get expires() {
        // Checkes against getter in case this.#evaluateAutoDuration evaluates to non-positive number
        return this.duration >= 0;
    }

    constructor(severity: "success" | "info" | "warning" | "error" = "info", message: string = "Message", detail: string = "Detail", duration: "disabled" | "auto" | number = "auto") {
        this.severity = severity;
        this.message = message;
        this.detail = detail;
        this._duration = duration;
    }

    private evaluateAutoDuration = () => {
        return ToastData.DEFAULT_DURATIONS[this.severity];
    };
}
