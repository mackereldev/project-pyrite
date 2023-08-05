import ToastData from "$lib/classes/ToastData";
import { PageLoad } from "./$types";

export const load = (async ({ data, url }) => {
    const joinRejectionReason = url.searchParams.get("join_rejection_reason");

    let toasts: ToastData[] = [];

    switch (joinRejectionReason) {
        case "duplicate_client_id":
            toasts.push(new ToastData("error", "Unable To Join", "Duplicate name."));
            break;
        case "room_not_found":
            toasts.push(new ToastData("error", "Unable To Join", "Room could not be found."));
            break;
        case "invalid_request":
            toasts.push(new ToastData("error", "Invalid Request", "The server rejected your request."));
            break;
        default:
            break;
    }

    return {
        ...data,
        toasts,
    };
}) satisfies PageLoad;
