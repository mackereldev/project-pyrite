import type { RequestHandler } from "@sveltejs/kit";
import { getUsername, setUsername } from "$lib/server/user-handler";

export const GET = (({ cookies }) => {
    return new Response(getUsername(cookies));
}) satisfies RequestHandler;

export const POST = (async ({ request, cookies }) => {
    const username = await request.json();
    
    setUsername(cookies, username);

    return new Response(username);
}) satisfies RequestHandler;
