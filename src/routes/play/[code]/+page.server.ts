import { getChannelNamespace } from "$lib/server/environment-handler";
import { getRoomData } from "$lib/server/room-handler";
import { getUsername } from "$lib/server/user-handler";
import { redirect } from "@sveltejs/kit";
import { PageServerLoad } from "./$types";

export const load = (async ({ cookies, params }) => {
    const username = getUsername(cookies) || "Player";
    const namespace = getChannelNamespace();
    const code = params.code;

    const response = await getRoomData(code, username);
    if (response.canJoin) {
        return {
            clientId: username,
            channelNamespace: namespace,
            code,
            serverStartTime: response.data?.serverStartTime!,
            serverConnectionId: response.data?.serverConnectionId!,
        };
    } else {
        throw redirect(307, `/?join_rejection_reason=${response.errorReason}`);
    }
}) satisfies PageServerLoad;
