import type { RequestHandler } from '@sveltejs/kit';
// import { type RequestHandler, json } from '@sveltejs/kit';

export const GET = (({ cookies }) => {
    return new Response(cookies.get("clientId"));
}) satisfies RequestHandler;

export const POST = (async ({ request, cookies }) => {
    const username = await request.json();
    
    cookies.set("clientId", username, {
        path: "/",
        sameSite: "strict",
        httpOnly: true
    });

    return new Response(username);
}) satisfies RequestHandler;
