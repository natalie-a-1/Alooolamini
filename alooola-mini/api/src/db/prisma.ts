/**
 * Prisma client setup and database connection.
 */
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

/** Helper for prisma. */
export const prisma = new PrismaClient({ adapter });

/** Helper for disconnect prisma. */
export async function disconnectPrisma() {
  await prisma.$disconnect();
  await pool.end();
}
