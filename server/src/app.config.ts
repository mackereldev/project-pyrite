import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import config from "@colyseus/tools";

import { Game } from "./rooms/Game";

export default config({
    initializeGameServer: (gameServer) => {
        gameServer.define("game", Game);
    },

    initializeExpress: (app) => {
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground);
        }

        app.use("/colyseus", monitor());
    },
});
