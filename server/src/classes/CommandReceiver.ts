import { ChatRoom } from "../room/ChatRoom";
import * as MathUtil from "./MathUtil";
import { Client } from "colyseus";
import { ServerChat } from "./ServerChat";

export class CommandReceiver {
    private chatRoom: ChatRoom;

    constructor(chatRoom: ChatRoom) {
        this.chatRoom = chatRoom;
    }

    register() {
        /* TODO
        Most of the validation here should be done on the client side (bar requisite checking).
        Remove ServerChat all together, since only cheaters will be receiving those messages.
        Move MessageTemplate to the client side or use inheritance.
        Wrap everything in try and catch
        */

        this.chatRoom.onMessage("client-chat", (client, message) => {
            const { msg }: { msg: string } = message;
            this.chatRoom.broadcast("client-chat", { msg, author: { sessionId: client.id, clientId: client.userData.clientId } });
        });

        this.chatRoom.onMessage("cmd-ping", (client, message) => {
            let { delay }: { delay: number } = message;

            delay = MathUtil.clamp(delay, 0, 10000);

            if (Number.isFinite(delay)) {
                delay = MathUtil.clamp(delay, 0, 10000);
            }

            this.chatRoom.clock.setTimeout(() => {
                this.chatRoom.broadcast("server-chat", new ServerChat(`Client ${client.userData.clientId} pinged all clients.`).serialize());
            }, delay);
        });
    }

    isLeader(client: Client): boolean {
        return this.chatRoom.state.leader === client.userData.clientId;
    }
}
