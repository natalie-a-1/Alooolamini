import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { requestId } from "./middleware/requestId";
import { apiRouter } from "./routes";
import { ApiError } from "./lib/errors";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(requestId);

  app.get("/", (_req, res) => {
    res.json({ data: { status: "ok", service: "alooola-api" } });
  });

  app.use("/api/v1", apiRouter);

  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        details: { path: req.path },
      },
    });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ApiError) {
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
