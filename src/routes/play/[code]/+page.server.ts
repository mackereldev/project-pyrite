import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { CONTEXT } from "$env/static/private";

export const prerender = false;

export const load = (async ({ fetch, params }) => {
    let openRooms: string[] = ["123456", "185274", "938588"];

    if (openRooms.includes(params.code)) {
        const username = (await (await fetch("/api/username")).text()) || "Player";
        const publicNamespace = CONTEXT == "production" || CONTEXT == "deploy-preview";

        return {
            code: params.code,
            clientId: username,
            publicNamespace,
        };
    }
    throw error(404);
}) satisfies PageServerLoad;
