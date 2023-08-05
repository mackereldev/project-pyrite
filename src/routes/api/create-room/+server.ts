import { createRoom } from "$lib/server/room-handler";
import { json, type RequestHandler } from "@sveltejs/kit";

export const PATCH = (async () => {
    const code = await createRoom();

    return json({ code });
}) satisfies RequestHandler;
