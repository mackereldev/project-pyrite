import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import config from "@colyseus/tools";

import { ChatRoom } from "./room/ChatRoom";

export default config({
    initializeGameServer: (gameServer) => {
        gameServer.define("chat-room", ChatRoom);
    },

    initializeExpress: (app) => {
        if (process.env.NODE_ENV !== "production") {
            app.use("/", playground);
        }

        app.use("/colyseus", monitor());
    },
});
