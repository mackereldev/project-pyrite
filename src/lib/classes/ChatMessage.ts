import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

export type ChatMessageType = "player" | "game" | "system";

export class ChatMessage {
    public author: string | undefined;
    public type: ChatMessageType;
    public text;
    public isError;
    private time;

    constructor(author: string | undefined, type: ChatMessageType, text: string, isError: boolean = false) {
        this.author = author;
        this.type = type;
        this.text = text;
        this.isError = isError;
        this.time = Date.now();

        dayjs.extend(utc);
    }

    public getRelativeTime = (relativeStartTime: number) => {
        return dayjs.utc(this.time - relativeStartTime).format("HH:mm:ss");
    };

    public serialize(): string {
        return ChatMessage.serialize(this);
    }

    public static serialize(chatMessage: ChatMessage): string {
        return JSON.stringify(chatMessage);
    }

    public static deserialize(serializedMessage: string): void {
        const obj = JSON.parse(serializedMessage);
    }
}
