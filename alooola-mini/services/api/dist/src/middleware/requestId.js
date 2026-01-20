/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = requestId;
const node_crypto_1 = require("node:crypto");
function requestId(req, res, next) {
    const headerId = req.header("X-Request-Id");
    const id = headerId && headerId.length > 0 ? headerId : (0, node_crypto_1.randomUUID)();
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
}
