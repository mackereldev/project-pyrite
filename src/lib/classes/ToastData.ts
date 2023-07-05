export default class ToastData {
    static readonly DEFAULT_DURATIONS = {
        success: 5000,
        info: 5000,
        warning: 5000,
        error: 5000,
    };

    severity;
    message: string;
    detail: string;
    #duration;
    get duration() {
        return this.#duration == "disabled" ? -1 : this.#duration == "auto" ? this.#evaluateAutoDuration() : this.#duration;
    }
    get expires() {
        // Checkes against getter in case this.#evaluateAutoDuration evaluates to non-positive number
        return this.duration >= 0;
    }

    constructor(severity: "success" | "info" | "warning" | "error" = "info", message: string = "Message", detail: string = "Detail", duration: "disabled" | "auto" | number = "auto") {
        this.severity = severity;
        this.message = message;
        this.detail = detail;
        this.#duration = duration;
    }

    #evaluateAutoDuration() {
        return ToastData.DEFAULT_DURATIONS[this.severity];
    }

    clone() {
        return new ToastData(this.severity, this.message, this.detail, this.#duration);
    }
}
