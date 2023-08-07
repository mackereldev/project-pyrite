import type { Readable } from "svelte/store";

// https://stackoverflow.com/a/66819321/14270868
export const subscribeStoreDefer = <T>(store: Readable<T>, fn: (state: T) => void) => {
    let firedFirst = false;
    return store.subscribe((state: T) => {
        if (!firedFirst) {
            firedFirst = true;
        } else {
            fn(state);
        }
    })
}
