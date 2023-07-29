import type ChatMessage from "./ChatMessage";

export default class ChatChannel {
    name: string;
    messages: ChatMessage[] = [];

    constructor(name: string) {
        this.name = name;
    }
}
