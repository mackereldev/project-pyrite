import { ABLY_API_KEY_CLIENT } from "$env/static/private";
import { json, type RequestHandler } from "@sveltejs/kit";
import { Rest } from "ably/promises";

export const GET = (async ({ url }) => {
    if (!ABLY_API_KEY_CLIENT) {
        return json({
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify("Missing ABLY_API_KEY_CLIENT environment variable."),
        });
    }

    const clientId = url.searchParams.get("clientId") || undefined;
    const client = new Rest(ABLY_API_KEY_CLIENT);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: clientId });

    return json({
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(tokenRequestData),
    });
}) satisfies RequestHandler;
