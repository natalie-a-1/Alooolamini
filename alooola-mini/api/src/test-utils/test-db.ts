import { execSync } from "node:child_process";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";

/**
 * Singleton reference to the started PostgreSQL test container.
 */
let container: StartedPostgreSqlContainer | null = null;

/**
 * Starts a new PostgreSQL Docker container for use in integration tests.
 * If a container is already started, returns the existing instance.
 *
 * @returns {Promise<StartedPostgreSqlContainer>} The started test container.
 */
export async function startTestDb(): Promise<StartedPostgreSqlContainer> {
  if (container) return container;
  container = await new PostgreSqlContainer("postgres:16-alpine").start();
  return container;
}

/**
 * Generates a PostgreSQL connection URI for the given test container.
 *
 * @param {StartedPostgreSqlContainer} testContainer - The running test container.
 * @returns {string} The connection URI.
 */
export function getTestDatabaseUrl(testContainer: StartedPostgreSqlContainer): string {
  return testContainer.getConnectionUri();
}

/**
 * Applies the Prisma database schema to the specified database using `prisma db push`.
 * Forces a full reset and accepts potential data loss.
 *
 * @param {string} databaseUrl - The database URL to apply the schema to.
 */
export function applySchema(databaseUrl: string): void {
  execSync(`npx prisma db push --force-reset --accept-data-loss --url="${databaseUrl}"`, {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}

/**
 * Stops the running PostgreSQL test container (if active) and cleans up resources.
 *
 * @returns {Promise<void>}
 */
export async function stopTestDb(): Promise<void> {
  if (!container) return;
  await container.stop();
  container = null;
}
