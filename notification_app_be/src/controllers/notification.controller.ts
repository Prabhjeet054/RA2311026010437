import type { Request, Response } from "express";
import { Log } from "../../../dist/logging_middleware";
import { getAccessToken } from "../config/env";
import { listNotifications } from "../services/notification.service";

export async function getNotifications(
  _req: Request,
  res: Response
): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    await Log(
      "backend",
      "error",
      "service",
      "ACCESS_TOKEN missing; cannot call upstream",
      ""
    );
    res.status(503).json({
      error: "Service misconfiguration",
      message: "Server access token is not configured",
    });
    return;
  }

  await Log(
    "backend",
    "info",
    "controller",
    "GET /api/notifications",
    token
  );

  try {
    const notifications = await listNotifications(token);
    res.status(200).json({ notifications });
  } catch {
    res.status(502).json({
      error: "Bad gateway",
      message: "Failed to retrieve notifications from upstream",
    });
  }
}
