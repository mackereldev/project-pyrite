import Room from "./classes/Room";
import { ABLY_API_KEY_SERVER } from "$env/static/private";
import { Rest, Realtime } from "ably/promises";

const rest = new Rest(ABLY_API_KEY_SERVER);
const realtime = new Realtime(ABLY_API_KEY_SERVER);

export let activeRooms: Room[] = [];

export const createRoom = () => {
    const code = getUniqueCode();
    const room = new Room(realtime, code, onCloseRoom);
    activeRooms.push(room);

    return code;
};

export const getRoomData = async (code: string, clientId: string) => {
    await realtime.connection.whenState("connected");

    const room = activeRooms.find((r) => r.code == code);

    if (room) {
        if (getRoom(code)?.getClient(clientId)) {
            return { canJoin: false, errorReason: "duplicate_client_id", serverConnectionId: realtime.connection.id };
        }

        return { canJoin: true, errorReason: "", serverConnectionId: realtime.connection.id };
    } else {
        return { canJoin: false, errorReason: "room_not_found", serverConnectionId: realtime.connection.id };
    }
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
