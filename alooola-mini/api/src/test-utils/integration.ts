import type { Express } from "express";
import type { PrismaClient } from "@prisma/client";
import { applySchema, getTestDatabaseUrl, startTestDb, stopTestDb } from "./test-db";

/**
 * Represents the context for integration tests, including the Express app,
 * Prisma client, and the test database URL.
 */
export type IntegrationTestContext = {
  app: Express;
  prisma: PrismaClient;
  databaseUrl: string;
};

/**
 * Holds the Prisma disconnect function to be called during teardown.
 * Initialized when the integration test context is created.
 */
let disconnectPrisma: (() => Promise<void>) | null = null;

/**
 * Sets up the integration test context:
 *  - Starts a test database container.
 *  - Sets the DATABASE_URL environment variable to point to the test DB.
 *  - Applies the database schema.
 *  - Creates and returns an Express app and Prisma client.
 *
 * @returns {Promise<IntegrationTestContext>} The integration test context with app, prisma, and database URL.
 */
export async function setupIntegrationTestContext(): Promise<IntegrationTestContext> {
  const container = await startTestDb();
  const databaseUrl = getTestDatabaseUrl(container);

  process.env.DATABASE_URL = databaseUrl;

  applySchema(databaseUrl);

  // Dynamically import app and Prisma modules.
  const { createApp } = await import("../app");
  const prismaModule = await import("../db/prisma");
  disconnectPrisma = prismaModule.disconnectPrisma;

  const app = createApp();

  return { app, prisma: prismaModule.prisma, databaseUrl };
}

/**
 * Tears down the integration test context:
 *  - Disconnects the Prisma client if it was set.
 *  - Stops the test database container.
 *
 * @returns {Promise<void>}
 */
export async function teardownIntegrationTestContext() {
  if (disconnectPrisma) {
    await disconnectPrisma();
  }
  await stopTestDb();
}
