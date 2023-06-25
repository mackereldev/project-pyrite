import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const prerender = false;

export const load = (async ({ fetch, params }) => {
    let openRooms: string[] = ["123456", "185274", "938588"];

    if (openRooms.includes(params.code)) {
        const username = await (await fetch("/api/username")).text();

        return {
            code: params.code,
            clientId: username,
        };
    }
    throw error(404);
}) satisfies PageLoad;
