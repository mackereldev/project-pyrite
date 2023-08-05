import { getUsername, setUsername } from "$lib/server/user-handler";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET = (({ cookies }) => {
    return json({ username: getUsername(cookies) });
}) satisfies RequestHandler;

export const PUT = (async ({ request, cookies }) => {
    const username = await request.json();

    setUsername(cookies, username);

    return json({ username });
}) satisfies RequestHandler;
