import { get, writable } from "svelte/store";
import { ChatMessage } from "./ChatMessage";
import { Tab } from "./Tab";
import { clientStore, preferencesStore, toastContainerStore } from "./Stores";
import type * as Colyseus from "colyseus.js";
import type { MainState } from "../../../server/src/schema/MainState";
import { CommandDispatcher } from "./CommandDispatcher";
import { closeTab } from "./TabHandler";
import ToastData from "./ToastData";
import { tabsStore, currentTabIdx } from "./TabHandler";
import type { ClientData } from "../../../server/src/schema/ClientData";

export class ChatTab extends Tab {
    roomStore = writable<Colyseus.Room<MainState>>();
    commandDispatcher = new CommandDispatcher(this);

    messages = writable<ChatMessage[]>([]);
    clients = writable<{ clientId: string; isLeader: boolean }[]>([]);

    lastReadMessage: ChatMessage | undefined;
    isUnread = writable<boolean>(false);

    effectiveUsername = writable<string>("");

    constructor(code?: string) {
        super();

        if (code) {
            this.join(code);
        } else {
            this.create();
        }

        this.effectiveUsername.set(get(preferencesStore).username || "User");
    }

    addMessage = (message: ChatMessage) => {
        this.messages.update((current: ChatMessage[]) => current.concat(message));

        // Mark as unread
        if (get(tabsStore)[get(currentTabIdx)] !== this) {
            this.isUnread.set(true);
        }
    };

    private create = () => {
        get(clientStore).create<MainState>("chat-room", { clientId: get(preferencesStore).username })
            .then((room) => this.initialiseRoom(room))
            .catch((err) => this.handleError(err));
    };

    private join = (code: string) => {
        get(clientStore).joinById<MainState>(code, { clientId: get(preferencesStore).username })
            .then((room) => this.initialiseRoom(room))
            .catch((err) => this.handleError(err));
    };

    private initialiseRoom = (room: Colyseus.Room<MainState>) => {
        this.roomStore.set(room);
        this.name.set(room.roomId);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        room.onLeave((code) => {
            this.dispose();
        });

        if (process.env.NODE_ENV === "development") {
            room.onMessage("__playground_message_types", (message) => {
                console.debug("Playground message types", message);
            });
        }

        room.state.clientData.onAdd((client: ClientData) => {
            this.clients.update((clients) => clients.concat({ clientId: client.clientId, isLeader: get(this.roomStore).state.leader === client.clientId }));
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        room.state.clientData.onRemove((client: ClientData, key: number) => {
            this.clients.update((clients) => clients.filter((value, idx) => idx !== key));
        });

        room.onMessage("server-chat", (message) => {
            const chat = (msg: { serializedMessage: { text: string; isError: boolean } }) => {
                const chatMessage = new ChatMessage(undefined, "system", msg.serializedMessage.text, msg.serializedMessage.isError);
                this.addMessage(chatMessage);
            };

            if (Array.isArray(message)) {
                message.forEach((subMessage) => chat(subMessage));
            } else {
                chat(message);
            }
        });

        room.onMessage("client-chat", (message) => {
            const { msg, author }: { msg: string; author: { sessionId: string; clientId: string } } = message;

            console.debug("MESSAGE:", message);
            this.addMessage(new ChatMessage(author.clientId, "user", msg));
        });

        room.onMessage("cmd-ping", (message) => {
            const { sender }: { sender: { sessionId: string; clientId: string } } = message;

            this.addMessage(new ChatMessage(undefined, "system", `Client ${sender.clientId} pinged all clients.`));
        });
    };

    private handleError = (err: any) => {
        const toastContainer = get(toastContainerStore);
        if (err.code === 4101) {
            toastContainer.addToasts(new ToastData("error", "Unable to Join", "Username was taken"));
        } else if (err.code === 4212) {
            toastContainer.addToasts(new ToastData("error", "Unable to Join", "Room not found"));
        }
        console.error(`Colyseus error (${err.code}): ${err.message}`);
        closeTab(this);
    };

    override dispose = async () => {
        const room = get(this.roomStore);
        if (room) {
            room.removeAllListeners();
            if (room.connection.isOpen) {
                await room.leave(true);
            }
        }
    };
}
