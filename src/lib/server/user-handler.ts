import type { Cookies } from "@sveltejs/kit";

const COOKIE_NAMES = {
    USERNAME: "username",
};

export const getUsername = (cookies: Cookies) => {
    return cookies.get(COOKIE_NAMES.USERNAME);
};

export const setUsername = (cookies: Cookies, username: string) => {
    cookies.set(COOKIE_NAMES.USERNAME, username, {
        path: "/",
        sameSite: "strict",
        secure: false,
    });
};
