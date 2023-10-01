import { ChatRoom } from "../room/ChatRoom";
import { ServerChat } from "./ServerChat";

/** Receives and interprets commands and their arguments, and handles the responses. */
export class CommandReceiver {
    private chatRoom: ChatRoom;

    constructor(chatRoom: ChatRoom) {
        this.chatRoom = chatRoom;
    }

    register() {
        // Chat message queued for broadcasting. Profanity filters and other validation would go here.
        this.chatRoom.onMessage("client-chat", (client, message) => {
            const { msg }: { msg: string } = message;
            this.chatRoom.broadcast("client-chat", { msg, author: { sessionId: client.id, clientId: client.userData.clientId } });
        });

        // Specialised ping command
        this.chatRoom.onMessage("cmd-ping", (client, message) => {
            let { delay }: { delay: number } = message;

            if (Number.isFinite(delay)) {
                delay = Math.max(Math.min(delay, 10000), 0); // Clamp delay between 0 and 10 seconds

                this.chatRoom.clock.setTimeout(() => {
                    this.chatRoom.broadcast("server-chat", new ServerChat(`Client ${client.userData.clientId} pinged all clients.`).serialize());
                }, delay);
            }
        });
    }
}
