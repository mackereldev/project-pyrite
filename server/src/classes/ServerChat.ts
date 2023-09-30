export class ServerChat {
    text;
    isError;

    constructor(text: string, isError: boolean = false) {
        this.text = text;
        this.isError = isError;
    }

    serialize(): object {
        return {
            serializedMessage: {
                text: this.text,
                isError: this.isError,
            },
        };
    }
}
