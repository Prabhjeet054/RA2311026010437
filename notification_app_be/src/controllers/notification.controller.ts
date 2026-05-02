import type { Request, Response } from "express";
import { Log } from "../../../dist/logging_middleware";
import type { NotificationType } from "../domain/notification.types";
import { getAccessToken } from "../config/env";
import {
  getAllNotifications,
  getNotificationsByType,
  getTopPriorityNotifications,
} from "../services/notification.service";
import { parseTopNParam } from "../utils/parseTopN";

const VALID_TYPES: NotificationType[] = ["Placement", "Result", "Event"];

function isNotificationTypeParam(s: string): s is NotificationType {
  return (VALID_TYPES as string[]).includes(s);
}

export async function getAllNotificationsHttp(
  _req: Request,
  res: Response
): Promise<void> {
  const token = getAccessToken();
  if (!token) {
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
    "Enter: GET /api/v1/notifications",
    token
  );

  try {
    const notifications = await getAllNotifications(token);
    res.status(200).json({ notifications });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await Log(
      "backend",
      "error",
      "controller",
      `getAllNotificationsHttp: ${msg}`,
      token
    );
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve notifications",
    });
  }
}

export async function getTopPriorityNotificationsHttp(
  req: Request,
  res: Response
): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    res.status(503).json({
      error: "Service misconfiguration",
      message: "Server access token is not configured",
    });
    return;
  }

  const parsed = parseTopNParam(req.query.n);
  if (!parsed.ok) {
    await Log(
      "backend",
      "error",
      "controller",
      "Invalid query param n (use 1–100)",
      token
    );
    res.status(400).json({
      error: "Bad request",
      message: "Query param n must be an integer between 1 and 100",
    });
    return;
  }

  await Log(
    "backend",
    "info",
    "controller",
    "Enter: GET /api/v1/notifications/top",
    token
  );

  try {
    const notifications = await getTopPriorityNotifications(token, parsed.n);
    res.status(200).json({ notifications, meta: { n: parsed.n } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await Log(
      "backend",
      "error",
      "controller",
      `getTopPriorityNotificationsHttp: ${msg}`,
      token
    );
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve top priority notifications",
    });
  }
}

export async function getNotificationsByTypeHttp(
  req: Request,
  res: Response
): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    res.status(503).json({
      error: "Service misconfiguration",
      message: "Server access token is not configured",
    });
    return;
  }

  const typeParam = req.params.type ?? "";

  if (!isNotificationTypeParam(typeParam)) {
    await Log(
      "backend",
      "error",
      "controller",
      `Invalid notification type: ${typeParam}`,
      token
    );
    res.status(400).json({
      error: "Bad request",
      message: "type must be one of: Placement, Result, Event",
    });
    return;
  }

  await Log(
    "backend",
    "debug",
    "controller",
    "Filtering by type",
    token
  );

  await Log(
    "backend",
    "info",
    "controller",
    `Enter: GET /api/v1/notifications/type/${typeParam}`,
    token
  );

  try {
    const notifications = await getNotificationsByType(token, typeParam);
    res.status(200).json({ notifications, meta: { type: typeParam } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await Log(
      "backend",
      "error",
      "controller",
      `getNotificationsByTypeHttp: ${msg}`,
      token
    );
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to retrieve notifications by type",
    });
  }
}
