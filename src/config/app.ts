import * as express from "express";
import * as listEndpoints from "express-list-endpoints";
import { IncomingMessage, Server, ServerResponse } from "http";
import * as morgan from "morgan";

type Listen = Server<typeof IncomingMessage, typeof ServerResponse>;

const startServer: (router: express.Router, callback?: () => void) => { app: express.Application; server: Listen } = (
    router,
    callback
) => {
    const app = express();
    const port = process.env.PORT || 3000;
    const version = process.env.VERSION || "v1";

    app.use(express.json());
    app.use(morgan("dev"));

    app.use(`/api/${version}`, router);

    const server: Listen = app.listen(port, () => {
        if (process.env.NODE_ENV !== "test") {
            console.log(`Server listening on port ${port}`);

            let endpoints = listEndpoints(app);
            console.table(endpoints);
        }

        if (callback) {
            callback();
        }
    }).on("error", (error: Error) => {
        if (error.message.includes("EADDRINUSE")) {
            if (process.env.NODE_ENV !== "test") {
                console.error(`Server failed: ${error.message}`);
                process.exit(1);
            }
        }
    });

    return { app, server };
}

export { startServer };
