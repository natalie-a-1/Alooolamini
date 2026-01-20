/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCursor = encodeCursor;
exports.decodeCursor = decodeCursor;
exports.buildCursorResponse = buildCursorResponse;
const node_buffer_1 = require("node:buffer");
function encodeCursor(parts) {
    const raw = parts
        .map((part) => (part instanceof Date ? part.toISOString() : String(part)))
        .join("|");
    return node_buffer_1.Buffer.from(raw, "utf8").toString("base64");
}
function decodeCursor(cursor) {
    const decoded = node_buffer_1.Buffer.from(cursor, "base64").toString("utf8");
    return decoded.split("|");
}
function buildCursorResponse(items, limit, cursorFn) {
    if (items.length <= limit) {
        return { items, nextCursor: null, hasMore: false };
    }
    const sliced = items.slice(0, limit);
    const nextCursor = cursorFn(sliced[sliced.length - 1]);
    return { items: sliced, nextCursor, hasMore: true };
}
