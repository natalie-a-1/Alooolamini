/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const http_1 = require("http");
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./db/prisma");
async function startServer() {
    const app = (0, app_1.createApp)();
    const server = (0, http_1.createServer)(app);
    server.listen(env_1.env.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`API listening on http://localhost:${env_1.env.PORT}`);
    });
    const shutdown = async () => {
        await (0, prisma_1.disconnectPrisma)();
        server.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
