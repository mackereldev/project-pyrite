import * as dotenv from "dotenv";
import * as Ably from "ably/promises";
import { HandlerEvent, HandlerContext } from "@netlify/functions";

dotenv.config();

export async function handler(event: HandlerEvent, context: HandlerContext) {
    if (!process.env.ABLY_API_KEY_CLIENT) {
        return {
            statusCode: 500,
            headers: { "content-type": "application/json" },
            body: JSON.stringify("Missing ABLY_API_KEY_CLIENT environment variable."),
        };
    }

    const clientId = event.queryStringParameters!["clientId"] || process.env.DEFAULT_CLIENT_ID || "NO_CLIENT_ID";
    const client = new Ably.Rest(process.env.ABLY_API_KEY_CLIENT);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: clientId });
    return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(tokenRequestData),
    };
}
