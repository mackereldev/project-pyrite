import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (({ params }) => {
    let openRooms: string[] = ["123456", "185274", "938588"];

    if (openRooms.includes(params.code)) {
        return {
            code: params.code,
        };
    }
    throw error(404);
}) satisfies PageLoad;
