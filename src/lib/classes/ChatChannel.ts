import type { ChatMessage } from "./ChatMessage";

export default class ChatChannel {
    name: string;
    private messages: ChatMessage[] = [];
    private onMessageCallback;

    constructor(name: string, onMessageCallback: (chatChannel: ChatChannel, message: ChatMessage) => void) {
        this.name = name;
        this.onMessageCallback = onMessageCallback;
    }

    addMessage = (message: ChatMessage) => {
        this.messages = this.messages.concat(message);
        this.onMessageCallback(this, message);
    };

    getMessages = () => {
        return [...this.messages];
    };
}
