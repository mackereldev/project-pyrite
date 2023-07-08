import { CONTEXT } from "$env/static/private";

export const getChannelNamespace = () => {
    return CONTEXT == "production" || CONTEXT == "deploy-preview" ? "public" : "dev";
};
