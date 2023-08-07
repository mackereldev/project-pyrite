import type { PageLoad } from "./$types";

export const load = (({ url }) => {
    const errorParam = url.searchParams.get("error");

    let errorReason = errorParam && parseInt(errorParam) || -1;

    return {
        errorReason,
    }
}) satisfies PageLoad;
