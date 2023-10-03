import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

export type ChatMessageType = "user" | "system";

export class ChatMessage {
    author: string | undefined;
    type: ChatMessageType;
    text;
    isError;
    time;

    constructor(author: string | undefined, type: ChatMessageType, text: string, isError: boolean = false) {
        this.author = author;
        this.type = type;
        this.text = text;
        this.isError = isError;
        this.time = Date.now();

        dayjs.extend(utc);
    }

    // This the time since the server was started (easier to read, especially given the short-form nature of the app)
    getRelativeTime = (relativeStartTime: number) => {
        return dayjs.utc(this.time - relativeStartTime).format("HH:mm:ss");
    };

    // Only serialized messages can be sent to the server since they're plain text
    serialize(): string {
        return ChatMessage.serialize(this);
    }

    static serialize(chatMessage: ChatMessage): string {
        return JSON.stringify(chatMessage);
    }
}
