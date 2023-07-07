import { json, type RequestHandler } from "@sveltejs/kit";
import { createRoom } from "$lib/server/room-handler";

export const PATCH = (async () => {
    const code = createRoom();

    return json({ code });
}) satisfies RequestHandler;
