import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { disconnectPrisma } from "./db/prisma";

export async function startServer() {
  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    await disconnectPrisma();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
