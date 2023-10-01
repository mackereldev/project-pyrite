export class ServerChat {
    text;
    isError;

    constructor(text: string, isError: boolean = false) {
        this.text = text;
        this.isError = isError;
    }

    // Only serialized messages can be sent to the client since they're plain text
    serialize(): object {
        return {
            serializedMessage: {
                text: this.text,
                isError: this.isError,
            },
        };
    }
}
