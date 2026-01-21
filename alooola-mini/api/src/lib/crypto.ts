/**
 * Project source file.
 */
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

/** Helper for hash token. */
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Helper for generate token. */
export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

/** Helper for hash password. */
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/** Helper for verify password. */
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
