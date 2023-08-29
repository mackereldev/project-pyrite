export type ServerChatType = "game" | "system";

export class ServerChat {
    type: ServerChatType;
    text;
    isError;

    constructor(type: ServerChatType, text: string, isError: boolean = false) {
        this.type = type;
        this.text = text;
        this.isError = isError;
    }

    serialize(channel: "game" | "social" = "game"): object {
        return {
            channel,
            serializedMessage: {
                type: this.type,
                text: this.text,
                isError: this.isError,
            },
        };
    }
}
