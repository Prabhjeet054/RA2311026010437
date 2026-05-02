import { Log } from "../../../dist/logging_middleware";
import type { Notification, NotificationType } from "../domain/notification.types";
import { getAccessToken } from "../config/env";

const UPSTREAM = "http://20.207.122.201/evaluation-service/notifications";

/** Optional read flags from upstream (camelCase or PascalCase). */
export interface NotificationInboxRecord extends Notification {
  IsRead?: boolean;
  isRead?: boolean;
}

const TYPE_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export interface ScoredNotification {
  notification: NotificationInboxRecord;
  score: number;
}

function isUnread(n: NotificationInboxRecord): boolean {
  const r = n.IsRead ?? n.isRead;
  if (r === undefined) {
    return true;
  }
  return !r;
}

/**
 * Combined score: type dominates; recency (seconds since epoch) is tiebreaker.
 * score = typeWeight * 1000 + floor(unixMs / 1000)
 */
export function computePriorityScore(n: NotificationInboxRecord): number {
  const w = TYPE_WEIGHT[n.Type] ?? 0;
  const ms = Date.parse(n.Timestamp);
  const sec = Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
  return w * 1000 + sec;
}

/**
 * Min-heap of at most `maxSize` items by `score` (lower score = root).
 * After inserting all candidates, the heap holds the `maxSize` largest scores;
 * the root is the minimum among them (k-th largest overall).
 */
export class MinHeap {
  private readonly heap: ScoredNotification[] = [];

  constructor(private readonly maxSize: number) {
    if (maxSize < 1) {
      throw new Error("MinHeap maxSize must be at least 1");
    }
  }

  insert(notification: NotificationInboxRecord, score: number): void {
    this.heap.push({ notification, score });
    this.siftUp(this.heap.length - 1);
    if (this.heap.length > this.maxSize) {
      this.extractMin();
    }
  }

  extractMin(): ScoredNotification | undefined {
    if (this.heap.length === 0) {
      return undefined;
    }
    const root = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.siftDown(0);
    }
    return root;
  }

  get size(): number {
    return this.heap.length;
  }

  /** Drain heap: smallest score first (ascending). */
  drainAscending(): ScoredNotification[] {
    const out: ScoredNotification[] = [];
    while (this.heap.length > 0) {
      out.push(this.extractMin()!);
    }
    return out;
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private left(i: number): number {
    return i * 2 + 1;
  }

  private right(i: number): number {
    return i * 2 + 2;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const p = this.parent(i);
      if (this.heap[i]!.score >= this.heap[p]!.score) {
        break;
      }
      this.swap(i, p);
      i = p;
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length;
    for (;;) {
      const l = this.left(i);
      const r = this.right(i);
      let smallest = i;
      if (l < n && this.heap[l]!.score < this.heap[smallest]!.score) {
        smallest = l;
      }
      if (r < n && this.heap[r]!.score < this.heap[smallest]!.score) {
        smallest = r;
      }
      if (smallest === i) {
        break;
      }
      this.swap(i, smallest);
      i = smallest;
    }
  }

  private swap(a: number, b: number): void {
    const t = this.heap[a]!;
    this.heap[a] = this.heap[b]!;
    this.heap[b] = t;
  }
}

export async function getTopNNotifications(
  notifications: NotificationInboxRecord[],
  n = 10
): Promise<ScoredNotification[]> {
  const token = getAccessToken() ?? "";
  const unread = notifications.filter(isUnread);
  const heap = new MinHeap(n);

  for (const notification of unread) {
    const score = computePriorityScore(notification);
    await Log(
      "backend",
      "debug",
      "utils",
      `priority score=${score} type=${notification.Type} id=${notification.ID}`,
      token
    );
    heap.insert(notification, score);
  }

  const ascending = heap.drainAscending();
  ascending.reverse();
  return ascending;
}

interface NotificationsResponse {
  notifications?: NotificationInboxRecord[];
}

export async function fetchNotificationsUpstream(
  token: string
): Promise<NotificationInboxRecord[]> {
  await Log(
    "frontend",
    "info",
    "api",
    "GET /evaluation-service/notifications",
    token
  );

  const res = await fetch(UPSTREAM, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    await Log(
      "frontend",
      "error",
      "api",
      `fetch notifications failed: HTTP ${res.status} ${body}`,
      token
    );
    throw new Error(`notifications HTTP ${res.status}: ${body}`);
  }

  const data = (await res.json()) as NotificationsResponse;
  return data.notifications ?? [];
}

function printResults(scored: ScoredNotification[]): void {
  console.log("\n========== Priority Inbox (top unread) ==========\n");
  if (scored.length === 0) {
    console.log("(no unread notifications)\n");
    return;
  }
  scored.forEach((row, i) => {
    const n = row.notification;
    console.log(`#${i + 1}`);
    console.log(`  Type:      ${n.Type}`);
    console.log(`  Message:   ${n.Message}`);
    console.log(`  Timestamp: ${n.Timestamp}`);
    console.log(`  Score:     ${row.score}`);
    console.log("-".repeat(48));
  });
  console.log("");
}

async function main(): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    console.error("Set ACCESS_TOKEN in notification_app_be/.env");
    process.exit(1);
  }

  let list: NotificationInboxRecord[];
  try {
    list = await fetchNotificationsUpstream(token);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  const top = await getTopNNotifications(list, 10);
  printResults(top);
}

if (require.main === module) {
  void main();
}
