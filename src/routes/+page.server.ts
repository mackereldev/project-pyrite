import { getUsername } from "$lib/server/user-handler";
import type { PageServerLoad } from "./$types";

export const load = (async ({ cookies }) => {
    const username = getUsername(cookies) || "";

    return {
        username,
    };
}) satisfies PageServerLoad;
