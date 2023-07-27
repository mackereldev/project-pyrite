import { NODE_ENV } from "$env/static/private";

export const getChannelNamespace = () => {
    return NODE_ENV == "production" ? "public" : NODE_ENV == "development" ? "dev" : "invalid";
};
