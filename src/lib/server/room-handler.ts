import Room from "./classes/Room";
import { Rest, Realtime } from "ably/promises";
import { ABLY_API_KEY_SERVER } from "$env/static/private";
import { getChannelNamespace } from "./environment-handler";

const rest = new Rest(ABLY_API_KEY_SERVER);
const realtime = new Realtime(ABLY_API_KEY_SERVER);

export let activeRooms: Room[] = [];

export const createRoom = async () => {
    const code = getUniqueCode();
    const room = new Room(realtime, getChannelNamespace(), code, onCloseRoom);
    await room.initialise();
    activeRooms.push(room);

    return code;
};

export const getRoomData = async (code: string, clientId: string) => {
    await realtime.connection.whenState("connected");

    const room = getRoom(code);

    if (room) {
        if (room.getClient(clientId)) {
            return { canJoin: false, errorReason: "duplicate_client_id" };
        } else if (realtime.connection.id) {
            return { canJoin: true, data: { serverStartTime: room.serverStartTime, serverConnectionId: room.serverConnectionId } };
        }
    } else {
        return { canJoin: false, errorReason: "room_not_found" };
    }

    return { canJoin: false, errorReason: "unknown_error" };
};

const getUniqueCode = () => {
    let code: string;

    do {
        code = Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, "0");
    } while (activeRooms.some((r) => r.code == code));

    return code;
};

const getRoom = (code: string) => {
    return activeRooms.find((r) => r.code == code);
};

const onCloseRoom = (room: Room) => {
    activeRooms = activeRooms.filter((r) => r != room);
};
