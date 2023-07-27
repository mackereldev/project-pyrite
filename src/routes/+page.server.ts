import type { PageServerLoad } from "./$types";
import { getUsername } from "$lib/server/user-handler";
import { ABLY_API_KEY_CLIENT } from "$env/static/private";

export const load = (async ({ cookies }) => {
    const username = getUsername(cookies) || "";

    console.log(ABLY_API_KEY_CLIENT);

    return {
        username,
    };
}) satisfies PageServerLoad;
