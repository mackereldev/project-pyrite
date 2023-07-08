import type { ChatMessageType } from "$lib/enums";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

export default class ChatMessage {
    time;
    author;
    text;
    type;

    get empty() {
        return this.text == null || this.text.length == 0;
    }

    get formattedTime() {
        return dayjs.utc(this.time).format("HH:mm:ss");
    }

    constructor(time: number, author: string, type: ChatMessageType, text: string) {
        this.time = time;
        this.author = author;
        this.text = text;
        this.type = type;

        dayjs.extend(utc);
    }
}
