import { Log } from "../../../dist/logging_middleware";
import type { Notification } from "../domain/notification.types";
import { fetchNotifications } from "../repository/notification.repository";

export async function listNotifications(accessToken: string): Promise<Notification[]> {
  await Log(
    "backend",
    "info",
    "service",
    "Fetching notifications from evaluation-service",
    accessToken
  );

  try {
    return await fetchNotifications(accessToken);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await Log(
      "backend",
      "error",
      "service",
      `Failed to fetch notifications: ${msg}`,
      accessToken
    );
    throw err;
  }
}
