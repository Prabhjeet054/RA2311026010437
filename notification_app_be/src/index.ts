import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { Log } from "../../dist/logging_middleware";
import { getAccessToken, getPort } from "./config/env";
import notificationRoutes from "./routes/notification.routes";

async function bootstrap(): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    await Log(
      "backend",
      "fatal",
      "config",
      "ACCESS_TOKEN is missing or empty in environment",
      ""
    );
    console.error("FATAL: Set ACCESS_TOKEN in notification_app_be/.env");
    process.exit(1);
  }

  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/v1/notifications", notificationRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(
    (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  );

  const port = getPort();
  const server = app.listen(port, () => {
    void Log(
      "backend",
      "info",
      "route",
      `HTTP server listening on port ${port}`,
      token
    );
    console.log(`Notification API listening on http://localhost:${port}`);
  });

  const shutdown = (signal: string) => {
    void Log(
      "backend",
      "info",
      "route",
      `Received ${signal}, closing HTTP server`,
      token
    );
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
