import { Log } from "../../../dist/logging_middleware";
import type { Notification, NotificationType } from "../domain/notification.types";
import type { NotificationInboxRecord } from "../utils/priority_inbox";
import { getTopNNotifications } from "../utils/priority_inbox";
import { fetchNotifications } from "../repository/notification.repository";

export async function getAllNotifications(
  accessToken: string
): Promise<Notification[]> {
  await Log(
    "backend",
    "info",
    "service",
    "Enter: get all notifications",
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
      `getAllNotifications failed: ${msg}`,
      accessToken
    );
    throw err;
  }
}

export interface TopNotificationRow extends Notification {
  priorityScore: number;
}

export async function getTopPriorityNotifications(
  accessToken: string,
  n: number
): Promise<TopNotificationRow[]> {
  await Log(
    "backend",
    "info",
    "service",
    "Enter: get top priority notifications",
    accessToken
  );

  try {
    const all = await fetchNotifications(accessToken);
    const inbox = all as NotificationInboxRecord[];
    const scored = await getTopNNotifications(inbox, n);
    return scored.map((s) => ({
      ...s.notification,
      priorityScore: s.score,
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await Log(
      "backend",
      "error",
      "service",
      `getTopPriorityNotifications failed: ${msg}`,
      accessToken
    );
    throw err;
  }
}

export async function getNotificationsByType(
  accessToken: string,
  type: NotificationType
): Promise<Notification[]> {
  await Log(
    "backend",
    "info",
    "service",
    "Enter: get notifications filtered by type",
    accessToken
  );

  try {
    const all = await fetchNotifications(accessToken);
    return all.filter((x) => x.Type === type);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await Log(
      "backend",
      "error",
      "service",
      `getNotificationsByType failed: ${msg}`,
      accessToken
    );
    throw err;
  }
}
