/**
 * @file crypto.ts
 * @description Cryptography helpers for hashing, password operations, and secure token generation.
 */

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

/**
 * Hashes a token using SHA-256 and returns a hex-encoded hash.
 *
 * @param {string} token - The token to hash.
 * @returns {string} The SHA-256 hash in hex format.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a cryptographically secure random token string.
 *
 * @param {number} [bytes=32] - Number of random bytes to generate.
 * @returns {string} Hex-encoded token string.
 */
export function generateToken(bytes: number = 32): string {
  return randomBytes(bytes).toString("hex");
}

/**
 * Hashes a password using bcrypt.
 *
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} The hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain text password with a hash to verify identity.
 *
 * @param {string} password - The plain text password.
 * @param {string} hash - The hashed password to compare with.
 * @returns {Promise<boolean>} True if the password matches the hash, else false.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
