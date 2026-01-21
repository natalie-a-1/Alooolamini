/**
 * Project source file.
 */
import { Buffer } from "node:buffer";

/** Encode cursor. */
export function encodeCursor(parts: Array<string | number | Date>) {
  const raw = parts
    .map((part) => (part instanceof Date ? part.toISOString() : String(part)))
    .join("|");
  return Buffer.from(raw, "utf8").toString("base64");
}

/** Decode cursor. */
export function decodeCursor(cursor: string) {
  const decoded = Buffer.from(cursor, "base64").toString("utf8");
  return decoded.split("|");
}

/** Build cursor response. */
export function buildCursorResponse<T>(items: T[], limit: number, cursorFn: (item: T) => string) {
  if (items.length <= limit) {
    return { items, nextCursor: null, hasMore: false };
  }

  const sliced = items.slice(0, limit);
  const nextCursor = cursorFn(sliced[sliced.length - 1]);

  return { items: sliced, nextCursor, hasMore: true };
}
