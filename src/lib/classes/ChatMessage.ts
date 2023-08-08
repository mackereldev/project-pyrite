import type { ChatMessageType } from "$lib/enums";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

export default class ChatMessage {
    public author;
    public type;
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
}
