import type { Readable } from "svelte/store";

// Subscribers are not immediately invoked when the store is set up
// https://stackoverflow.com/a/66819321/14270868
export const subscribeStoreDefer = <T>(store: Readable<T>, fn: (state: T) => void) => {
    let firedFirst = false;
    return store.subscribe((state: T) => {
        if (!firedFirst) {
            firedFirst = true;
        } else {
            fn(state);
        }
    });
};

// Is a positive whole number
export const isNatural = (number: string): boolean => {
    if (number) {
        return !!number.match(/^\d+$/);
    }

    return false;
};

// Is a whole number
export const isInteger = (number: string): boolean => {
    if (number) {
        return !!number.match(/^-?\d+$/);
    }

    return false;
};
