import { Log } from "../../../dist/logging_middleware";
import type { Notification } from "../domain/notification.types";

const UPSTREAM_BASE = "http://20.207.122.201/evaluation-service";

interface NotificationsResponse {
  notifications?: unknown[];
}

function isNotificationType(x: string): x is Notification["Type"] {
  return x === "Placement" || x === "Result" || x === "Event";
}

function mapToNotification(raw: unknown): Notification | null {
  if (raw === null || typeof raw !== "object") {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = o.ID ?? o.id;
  const type = o.Type ?? o.type;
  const message = o.Message ?? o.message;
  const ts = o.Timestamp ?? o.timestamp;
  if (
    typeof id !== "string" ||
    typeof type !== "string" ||
    !isNotificationType(type) ||
    typeof message !== "string" ||
    typeof ts !== "string"
  ) {
    return null;
  }
  return {
    ID: id,
    Type: type,
    Message: message,
    Timestamp: ts,
  };
}

export async function fetchNotifications(token: string): Promise<Notification[]> {
  await Log(
    "backend",
    "debug",
    "repository",
    "GET /evaluation-service/notifications",
    token
  );

  const res = await fetch(`${UPSTREAM_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upstream notifications failed: HTTP ${res.status} ${body}`);
  }

  const data = (await res.json()) as NotificationsResponse;
  const list = data.notifications ?? [];
  const out: Notification[] = [];
  for (const item of list) {
    const n = mapToNotification(item);
    if (n !== null) {
      out.push(n);
    }
  }
  return out;
}
