"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function optionalAuth(req, _res, next) {
    const header = req.header("Authorization");
    if (!header || !header.startsWith("Bearer ")) {
        return next();
    }
    const token = header.replace("Bearer ", "").trim();
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        req.user = { id: payload.sub, email: payload.email };
    }
    catch {
        // ignore invalid token
    }
    return next();
}
