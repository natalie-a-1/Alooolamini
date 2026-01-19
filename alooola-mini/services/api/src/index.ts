import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "alooola-api" });
});

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "healthy" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
