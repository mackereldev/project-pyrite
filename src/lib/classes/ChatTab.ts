import { get, writable } from "svelte/store";
import { ChatMessage } from "./ChatMessage";
import { Tab } from "./Tab";
import { clientStore, toastContainerStore } from "./Stores";
import type * as Colyseus from "colyseus.js";
import type { MainState } from "../../../server/src/schema/MainState";
import { CommandDispatcher } from "./CommandDispatcher";
import { changeTab, closeTab } from "./TabHandler";
import ToastData from "./ToastData";
import { tabsStore, currentTabIdx } from "./TabHandler";
import type { ClientData } from "../../../server/src/schema/ClientData";
import { preferences } from "./Preferences";

export class ChatTab extends Tab {
    roomStore = writable<Colyseus.Room<MainState>>();
    commandDispatcher = new CommandDispatcher(this);

    messages = writable<ChatMessage[]>([]);
    clients = writable<{ clientId: string; sessionId: string, isLeader: boolean }[]>([]);

    lastReadMessage: ChatMessage | undefined;
    isUnread = writable<boolean>(false);

    effectiveUsername = writable<string>("");

    private acceptingJoinMessages: boolean = false;

    constructor(code?: string) {
        super();

        if (code) {
            this.join(code);
        } else {
            this.create();
        }
    }

    addMessage = (message: ChatMessage) => {
        // Add message to the message list (use concat() to reassign the variable, triggering a reactive update)
        this.messages.update((current: ChatMessage[]) => current.concat(message));

        // Mark as unread
        if (get(tabsStore)[get(currentTabIdx)] !== this) {
            this.isUnread.set(true);
        }
    };

    private create = () => {
        get(clientStore).create<MainState>("chat-room", { clientId: get(preferences.username) })
            .then((room) => this.initialiseRoom(room))
            .catch((err) => this.handleError(err));
    };

    private join = (code: string) => {
        get(clientStore).joinById<MainState>(code, { clientId: get(preferences.username) })
            .then((room) => this.initialiseRoom(room))
            .catch((err) => this.handleError(err));
    };

    private initialiseRoom = (room: Colyseus.Room<MainState>) => {
        this.roomStore.set(room);
        this.name.set(room.roomId);

        room.onLeave(() => {
            this.dispose();
        });

        if (process.env.NODE_ENV === "development") {
            room.onMessage("__playground_message_types", (message) => {
                console.debug("Playground message types", message);
            });
        }

        room.state.clientData.onAdd((client: ClientData) => {
            this.clients.update((clients) => clients.concat({ clientId: client.clientId, sessionId: client.sessionId, isLeader: get(this.roomStore).state.leader === client.clientId }));

            if (client.sessionId === get(this.roomStore).sessionId) {
                // Only show join messages once all 'present' clients have been processed
                this.acceptingJoinMessages = true;
                // The clientId may be altered by the server after joining (anonymous mode), and is instead found by matching the concrete sessionId
                this.effectiveUsername.set(client.clientId);
            }

            // Only added if the user specified the joinLeaveMessages preference option
            if (this.acceptingJoinMessages && get(preferences.joinLeaveMessages)) {
                this.addMessage(new ChatMessage(undefined, "system", `${client.clientId} joined the room.`));
            }
        });

        room.state.clientData.onRemove((client: ClientData) => {
            this.clients.update((clients) => clients.filter((value) => client.sessionId !== value.sessionId));
            if (get(preferences.joinLeaveMessages)) {
                this.addMessage(new ChatMessage(undefined, "system", `${client.clientId} left the room.`));
            }
        });

        // The server's means of communicating to a client or all clients
        room.onMessage("server-chat", (message) => {
            const chat = (msg: { serializedMessage: { text: string; isError: boolean } }) => {
                const chatMessage = new ChatMessage(undefined, "system", msg.serializedMessage.text, msg.serializedMessage.isError);
                this.addMessage(chatMessage);
            };

            // message can be either a single 'serializedMessage' or an array of them (avoids excessive calls since RCP messages are sent instantly)
            if (Array.isArray(message)) {
                message.forEach((subMessage) => chat(subMessage));
            } else {
                chat(message);
            }
        });

        // A client's means of communicating with other clients (chat messages)
        room.onMessage("client-chat", (message) => {
            const { msg, author }: { msg: string; author: { sessionId: string; clientId: string } } = message;

            console.debug("MESSAGE:", message);
            this.addMessage(new ChatMessage(author.clientId, "user", msg));
        });
    };

    private handleError = (err: any) => {
        const toastContainer = get(toastContainerStore);
        // Codes are defined in the server and are used to clarify otherwise generic error messages
        if (err.code === 4101) {
            toastContainer.addToasts(new ToastData("error", "Unable to Join", "Username was taken"));
        } else if (err.code === 4121) {
            toastContainer.addToasts(new ToastData("error", "Unable to Join", "Username is too long"));
        } else if (err.code === 4122) {
            toastContainer.addToasts(new ToastData("error", "Unable to Join", "Username contains illegal characters"));
        } else if (err.code === 4212) {
            toastContainer.addToasts(new ToastData("error", "Unable to Join", "Room does not exist or is full"));
        }
        // Server errors are treated as fatal, closing the tab and redirecting to the home tab
        console.error(`Colyseus error (${err.code}): ${err.message}`);
        closeTab(this);
        changeTab(0);
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
