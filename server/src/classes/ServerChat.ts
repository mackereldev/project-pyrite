export type ServerChatType = "game" | "system";

export class ServerChat {
    public type: ServerChatType;
    public text;
    public isError;

    constructor(type: ServerChatType, text: string, isError: boolean = false) {
        this.type = type;
        this.text = text;
        this.isError = isError;
    }

    public serialize(channel: "game" | "social" = "game"): object {
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
