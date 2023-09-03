import type { PageLoad } from "./$types";
import { preferencesStore } from "$lib/classes/Stores";
import { get } from "svelte/store";

export const load = (({ params }) => {
    const { roomId } = params;
    const clientId = get(preferencesStore)?.characterName || "Player";

    return {
        roomId,
        clientId
    };
}) satisfies PageLoad;
