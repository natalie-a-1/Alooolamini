"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const requestId_1 = require("./middleware/requestId");
const routes_1 = require("./routes");
const errors_1 = require("./lib/errors");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use((0, morgan_1.default)("dev"));
    app.use(requestId_1.requestId);
    app.get("/", (_req, res) => {
        res.json({ data: { status: "ok", service: "alooola-api" } });
    });
    app.use("/api/v1", routes_1.apiRouter);
    app.use((req, res) => {
        res.status(404).json({
            error: {
                code: "NOT_FOUND",
                message: "Route not found",
                details: { path: req.path },
            },
        });
    });
    app.use((err, _req, res, _next) => {
        if (err instanceof errors_1.ApiError) {
            return res.status(err.status).json({
                error: {
                    code: err.code,
                    message: err.message,
                    details: err.details,
                },
            });
        }
        return res.status(500).json({
            error: {
                code: "INTERNAL_ERROR",
                message: "Internal Server Error",
            },
        });
    });
    return app;
}
