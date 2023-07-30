import type { PageServerLoad } from "./$types";
import { getUsername } from "$lib/server/user-handler";

export const load = (async ({ cookies }) => {
    const username = getUsername(cookies) || "";

    return {
        username,
    };
}) satisfies PageServerLoad;
