/**
 * @file pagination.ts
 * @description Cursor-based pagination helpers for encoding, decoding, and building paginated API responses.
 */

import { Buffer } from "node:buffer";

/**
 * Encodes the parts of a cursor into a base64 string for transmission in API responses.
 *
 * @param {Array<string | number | Date>} parts - List of values that uniquely identify the page position.
 *   Numbers and strings are stringified; Dates are converted to ISO8601 strings.
 * @returns {string} Base64-encoded cursor value.
 *
 * @example
 * const cursor = encodeCursor([123, "abc", new Date()]);
 * // => "MTIz... (base64 string)"
 */
export function encodeCursor(parts: Array<string | number | Date>): string {
  const raw = parts
    .map((part) => (part instanceof Date ? part.toISOString() : String(part)))
    .join("|");
  return Buffer.from(raw, "utf8").toString("base64");
}

/**
 * Decodes a base64-encoded cursor string into its original string array representation.
 *
 * @param {string} cursor - The base64-encoded cursor string.
 * @returns {string[]} Array of string values (dates remain as ISO strings).
 *
 * @example
 * const [id, label, date] = decodeCursor(cursor);
 */
export function decodeCursor(cursor: string): string[] {
  const decoded = Buffer.from(cursor, "base64").toString("utf8");
  return decoded.split("|");
}

/**
 * Builds a cursor-based paginated response for an API endpoint.
 *
 * @template T
 * @param {T[]} items - The list of items fetched (should be limit + 1 in length for "hasMore" checks).
 * @param {number} limit - The maximum number of items per page.
 * @param {(item: T) => string} cursorFn - Function to get the encoded cursor from an item.
 * @returns {{
 *   items: T[],
 *   nextCursor: string | null,
 *   hasMore: boolean
 * }}
 *
 * @example
 * const response = buildCursorResponse(results, 20, item => encodeCursor([item.id]));
 * // response: { items, nextCursor, hasMore }
 */
export function buildCursorResponse<T>(
  items: T[],
  limit: number,
  cursorFn: (item: T) => string
): { items: T[]; nextCursor: string | null; hasMore: boolean } {
  // If the fetched items <= limit, there is no next page.
  if (items.length <= limit) {
    return {
      items,
      nextCursor: null,
      hasMore: false,
    };
  }

  // Items has one extra for pagination check; trim result to limit.
  const sliced = items.slice(0, limit);
  const nextCursor = cursorFn(sliced[sliced.length - 1]);

  return {
    items: sliced,
    nextCursor,
    hasMore: true,
  };
}
