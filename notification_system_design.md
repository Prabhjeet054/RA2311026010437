# Stage 1

## Overview

This document describes the REST API and real-time layer for a **Campus Notification Platform** where students receive updates for **Placements**, **Events**, and **Results**. All student-scoped resources assume the caller is authenticated (e.g. session or JWT); the examples use `Authorization: Bearer <token>`.

---

## Core actions

| # | Action | Purpose |
|---|--------|---------|
| 1 | Get all notifications for a student | List every notification for the authenticated student (paginated). |
| 2 | Get unread notifications | Return only notifications where `isRead` is `false`. |
| 3 | Mark a notification as read | Set `isRead` to `true` for one notification (idempotent). |
| 4 | Mark all notifications as read | Set `isRead` to `true` for all of the student’s notifications. |
| 5 | Get notifications filtered by type | Return notifications whose `type` is `Placement`, `Result`, or `Event`. |

---

## Notification JSON schema (shared)

All notification objects returned by the API share this shape:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "studentId": "stu_01HZX8K9M2N4P6Q8R0S2T4V6W8",
  "type": "Placement",
  "message": "Amazon SDE intern shortlist published.",
  "isRead": false,
  "createdAt": "2026-05-02T14:30:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique notification identifier. |
| `studentId` | string | Owning student identifier. |
| `type` | string | One of `"Placement"`, `"Result"`, `"Event"`. |
| `message` | string | Human-readable body. |
| `isRead` | boolean | Read state. |
| `createdAt` | string | ISO 8601 timestamp (UTC recommended). |

---

## Endpoints

### 1. Get all notifications for a student

| Item | Specification |
|------|----------------|
| **Method + URL** | `GET /api/v1/notifications` |
| **Request headers** | `Authorization: Bearer <access_token>` (required)<br>`Accept: application/json` (recommended) |
| **Query parameters** | `page` (optional, integer ≥ 1, default `1`)<br>`limit` (optional, integer 1–100, default `20`) |
| **Request body** | None |

**Response JSON schema (200 OK)**

```json
{
  "data": [
    {
      "id": "uuid",
      "studentId": "string",
      "type": "Placement | Result | Event",
      "message": "string",
      "isRead": true,
      "createdAt": "2026-05-02T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

| HTTP status | Meaning |
|-------------|---------|
| `200` | Success; body includes `data` and `meta`. |
| `401` | Missing or invalid authentication. |
| `403` | Authenticated but not allowed to access this student’s notifications. |
| `429` | Rate limited. |

---

### 2. Get unread notifications

| Item | Specification |
|------|----------------|
| **Method + URL** | `GET /api/v1/notifications/unread` |
| **Request headers** | `Authorization: Bearer <access_token>` (required)<br>`Accept: application/json` (recommended) |
| **Query parameters** | Same pagination as above: `page`, `limit` (optional) |
| **Request body** | None |

**Response JSON schema (200 OK)**

```json
{
  "data": [
    {
      "id": "uuid",
      "studentId": "string",
      "type": "Placement | Result | Event",
      "message": "string",
      "isRead": false,
      "createdAt": "2026-05-02T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

| HTTP status | Meaning |
|-------------|---------|
| `200` | Success; every item has `isRead: false`. |
| `401` | Unauthenticated. |
| `403` | Forbidden. |
| `429` | Rate limited. |

---

### 3. Mark a notification as read

| Item | Specification |
|------|----------------|
| **Method + URL** | `PATCH /api/v1/notifications/{notificationId}/read` |
| **Request headers** | `Authorization: Bearer <access_token>` (required)<br>`Content-Type: application/json` (optional; body may be empty) |
| **Path parameters** | `notificationId` — UUID of the notification |
| **Request body** | Empty object `{}` or omitted (no required fields). |

**Response JSON schema (200 OK)**

```json
{
  "data": {
    "id": "uuid",
    "studentId": "string",
    "type": "Placement | Result | Event",
    "message": "string",
    "isRead": true,
    "createdAt": "2026-05-02T14:30:00.000Z"
  }
}
```

| HTTP status | Meaning |
|-------------|---------|
| `200` | Notification updated; `isRead` is `true` (idempotent if already read). |
| `401` | Unauthenticated. |
| `403` | Notification belongs to another student. |
| `404` | Notification not found. |
| `409` | Optional: conflict if resource state prevents update (rare). |

---

### 4. Mark all notifications as read

| Item | Specification |
|------|----------------|
| **Method + URL** | `POST /api/v1/notifications/read-all` |
| **Request headers** | `Authorization: Bearer <access_token>` (required)<br>`Content-Type: application/json` |
| **Request body** | Empty object `{}` or `{ "scope": "all" }` (extensible). |

**Response JSON schema (200 OK)**

```json
{
  "data": {
    "updatedCount": 12
  }
}
```

| HTTP status | Meaning |
|-------------|---------|
| `200` | All matching notifications marked read; `updatedCount` is the number of rows changed (may be `0`). |
| `401` | Unauthenticated. |
| `403` | Forbidden. |
| `429` | Rate limited. |

---

### 5. Get notifications filtered by type

| Item | Specification |
|------|----------------|
| **Method + URL** | `GET /api/v1/notifications` |
| **Request headers** | `Authorization: Bearer <access_token>` (required)<br>`Accept: application/json` |
| **Query parameters** | `type` (required for this use case): `Placement` \| `Result` \| `Event`<br>Plus optional `page`, `limit` |
| **Request body** | None |

**Example:** `GET /api/v1/notifications?type=Event&page=1&limit=20`

**Response JSON schema (200 OK)** — same envelope as “Get all notifications”:

```json
{
  "data": [
    {
      "id": "uuid",
      "studentId": "string",
      "type": "Event",
      "message": "string",
      "isRead": true,
      "createdAt": "2026-05-02T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 7,
    "totalPages": 1
  }
}
```

| HTTP status | Meaning |
|-------------|---------|
| `200` | Success; `data` only includes notifications matching `type`. |
| `400` | Invalid or missing `type` query value. |
| `401` | Unauthenticated. |
| `403` | Forbidden. |
| `429` | Rate limited. |

---

## Real-time mechanism (WebSockets / Socket.IO)

### Recommendation

Use **WebSockets** with **Socket.IO** (or a compatible stack) so the server can **push** new notifications to connected clients without polling. Socket.IO adds namespaces, rooms, automatic reconnection, and fallback transports, which fits campus clients on mixed networks.

### Connection flow

| Step | Actor | Action |
|------|--------|--------|
| 1 | Client | Student opens the app; client obtains `access_token` (same as REST). |
| 2 | Client | Opens Socket.IO connection to `wss://api.campus.example/socket.io/`, sending auth (e.g. `auth: { token: "<access_token>" }` in the handshake). |
| 3 | Server | Validates token, resolves `studentId`, joins the socket to a **room** e.g. `student:{studentId}`. |
| 4 | Server | When a new notification is created for that student, server **emits** to that room only. |
| 5 | Client | Listens for the event, merges the payload into local state (or invalidates cache), updates UI (badge, list). |
| 6 | Client | On disconnect, Socket.IO reconnects; server re-authenticates and re-joins the room. |

**Sequence (conceptual):** **Student connects → server authenticates and subscribes the socket → new notification is persisted → server pushes event → client updates UI.**

### Socket event names and payloads

| Event name | Direction | When | Payload JSON schema |
|------------|-----------|------|----------------------|
| `notification:new` | Server → Client | A new notification is created for this student | See below |
| `notification:read` | Server → Client | Optional: another device marked a notification read (sync) | See below |
| `connect` | Built-in | Connection established | (Socket.IO) |
| `disconnect` | Built-in | Connection lost | (Socket.IO) |

**`notification:new` payload**

```json
{
  "notification": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "studentId": "stu_01HZX8K9M2N4P6Q8R0S2T4V6W8",
    "type": "Placement",
    "message": "New company visit scheduled tomorrow.",
    "isRead": false,
    "createdAt": "2026-05-02T15:00:00.000Z"
  }
}
```

**`notification:read` payload (optional sync event)**

```json
{
  "notificationId": "550e8400-e29b-41d4-a716-446655440000",
  "readAt": "2026-05-02T15:05:00.000Z"
}
```

Clients should treat `notification:new` as the primary real-time signal to refresh unread counts and prepend to the notification list; REST endpoints remain the source of truth for full history and pagination.

---

# Stage 2

## 1. Database choice: PostgreSQL

| Criterion | Why PostgreSQL fits |
|-----------|---------------------|
| **ACID compliance** | Notifications and read-state updates must not be lost or partially applied; PostgreSQL provides durable, atomic transactions for inserts, updates, and bulk “mark all read” operations. |
| **Relational integrity** | A **foreign key** from `notifications.student_id` to `students.id` prevents orphan rows and keeps the data model aligned with Stage 1’s `studentId` on each notification. |
| **Indexing** | B-tree, partial, and composite indexes (including on expressions) support fast filters by student, unread state, type, and recency—matching the Stage 1 list and filter endpoints. |
| **Ecosystem** | Mature tooling for **partitioning**, **logical replication** (read replicas), and **VACUUM** helps manage growth and read scaling. |

---

## 2. DB schema (SQL)

```sql
-- Enum aligned with API notification types
CREATE TYPE notification_type AS ENUM ('Placement', 'Result', 'Event');

CREATE TABLE students (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes requested for common filters and sorting
CREATE INDEX idx_notifications_student_id ON notifications (student_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX idx_notifications_type ON notifications (type);
```

> **Note:** For production at scale, the base table may be replaced by a **partitioned** parent (see Stage 2 §4); the same columns and indexes apply per partition or as composite strategies below.

---

## 3. Problems at scale (when data grows large)

| Problem | Description |
|---------|-------------|
| **Table bloat** | Millions of notification rows increase heap size, index size, and **VACUUM** / autovacuum cost; old rows remain hot in backups and maintenance windows grow. |
| **Slow queries without proper indexes** | Listing by student, filtering unread, or sorting by `created_at` degrades to sequential scans; `COUNT(*)` for unread becomes expensive without suitable indexes. |
| **High read load from polling** | If many students poll the REST API on a short interval, **SELECT** traffic spikes, stressing the primary and cache layers; this is mitigated by push (Stage 1) plus replicas and caching. |

---

## 4. Solutions

| Strategy | Purpose |
|----------|---------|
| **Composite index `(student_id, is_read, created_at DESC)`** | Optimizes “all for student”, “unread for student ordered by newest”, and unread counts scoped to one student—reducing random I/O for the hottest queries. |
| **Partition `notifications` by `created_at` (e.g. monthly)** | Prunes old partitions, keeps working set smaller, and can speed time-range queries and archival jobs. |
| **Read replicas** | Offload **SELECT** (lists, counts) from the primary; writes stay on primary or via routing rules. |
| **Archive notifications older than 6 months** | Move cold rows to cheaper storage (e.g. S3 + Parquet, or an `notifications_archive` table) and drop or detach old partitions to control bloat and backup size. |

**Example: composite index**

```sql
CREATE INDEX idx_notifications_student_unread_created
  ON notifications (student_id, is_read, created_at DESC);
```

**Example: monthly range partitioning (illustrative)**

```sql
-- Parent (partitioned); child tables hold one month each
CREATE TABLE notifications (
  id          UUID NOT NULL DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES students (id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Example partitions (create ahead with a job or pg_partman)
CREATE TABLE notifications_2026_05 PARTITION OF notifications
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
```

---

## 5. SQL queries (aligned with Stage 1 API)

Placeholders: `$1` = student UUID, `$2` = notification UUID where applicable. Add `LIMIT` / `OFFSET` (or keyset pagination) for list endpoints as in Stage 1.

### Fetch all notifications for a student (paginated)

```sql
SELECT
  id,
  student_id,
  type::text AS type,
  message,
  is_read,
  created_at
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### Fetch unread notifications for a student (`created_at` DESC)

```sql
SELECT
  id,
  student_id,
  type::text AS type,
  message,
  is_read,
  created_at
FROM notifications
WHERE student_id = $1
  AND is_read = false
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### Mark a single notification as read

```sql
UPDATE notifications
SET is_read = true
WHERE id = $1
  AND student_id = $2
RETURNING id, student_id, type::text AS type, message, is_read, created_at;
```

### Mark all notifications for a student as read

```sql
UPDATE notifications
SET is_read = true
WHERE student_id = $1
  AND is_read = false;

-- Optional: return count in application using GET DIAGNOSTICS or a CTE:
-- WITH u AS (
--   UPDATE notifications SET is_read = true
--   WHERE student_id = $1 AND is_read = false
--   RETURNING 1
-- )
-- SELECT COUNT(*)::int AS updated_count FROM u;
```

**Returning `updatedCount` in one round trip (PostgreSQL):**

```sql
WITH updated AS (
  UPDATE notifications
  SET is_read = true
  WHERE student_id = $1
    AND is_read = false
  RETURNING 1
)
SELECT COUNT(*)::int AS updated_count FROM updated;
```

### Count unread notifications for a student

```sql
SELECT COUNT(*)::bigint AS unread_count
FROM notifications
WHERE student_id = $1
  AND is_read = false;
```

### Filter by type (Stage 1: `GET ...?type=...`)

```sql
SELECT
  id,
  student_id,
  type::text AS type,
  message,
  is_read,
  created_at
FROM notifications
WHERE student_id = $1
  AND type = $2::notification_type
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;
```

---

# Stage 3

## Slow query under review

The following uses **camelCase** column names as in some ORM schemas; Stage 2 uses **snake_case** (`student_id`, `is_read`, `created_at`). The analysis below applies to both naming styles.

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

---

## 1. Is the query accurate?

| Verdict | Explanation |
|---------|-------------|
| **Logic** | **Yes** — filtering one student’s unread rows and sorting by newest first matches the intended behavior. |
| **Practicality** | **`SELECT *` is wasteful** — it pulls every column (e.g. long `message` bodies, internal flags) when the client may only need `id`, `message`, `type`, `created_at`, etc. Prefer an explicit column list. |

**Improved shape (snake_case, PostgreSQL):**

```sql
SELECT id, message, type, created_at
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY created_at DESC;
```

---

## 2. Why is it slow?

| Cause | Effect |
|-------|--------|
| **No supporting index** on `(student_id, is_read, created_at)` | The planner may **sequentially scan** the whole table to find matching rows, then sort. |
| **Large table** (e.g. **5,000,000** rows) | A full scan touches millions of heap pages—high I/O and latency. |
| **`SELECT *`** | Reads **all columns** for every candidate row, increasing heap fetches and network payload even after filters. |

---

## 3. What would you change? Computational cost?

| Change | Rationale |
|--------|-----------|
| **Composite index** | Matches filter + sort: same student, unread only, newest first. |
| **Narrow `SELECT`** | Less heap I/O and smaller responses. |

```sql
CREATE INDEX idx_notifications_student_unread
  ON notifications (student_id, is_read, created_at DESC);
```

```sql
SELECT id, message, type, created_at
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY created_at DESC;
```

| Aspect | Before (typical worst case) | After (index-friendly plan) |
|--------|-----------------------------|-------------------------------|
| **Cost model** | **O(n)** table scan over **n** rows, plus sort if needed | **O(log n)** index probes to locate the range, plus **O(k)** for **k** matching rows (often small) |
| **Note** | Constants and constants matter; `k ≪ n` for one student’s unread list. | Inserts/updates pay a small extra cost to maintain the new index. |

---

## 4. Should we add indexes on every column?

| Answer | Reason |
|--------|--------|
| **No** | **Writes** (`INSERT`, `UPDATE`, `DELETE`) must update **every** index on the table—more indexes → more work per write and more **WAL** / lock contention risk. |
| | Each index uses **extra disk space** and **memory** for caching. |
| | Index only columns that appear in **`WHERE`**, **`ORDER BY`**, **`JOIN`**, or selective **`GROUP BY`** patterns you actually run (and consider **partial** indexes for skewed filters). |

---

## 5. Students with a Placement notification in the last 7 days

Stage 2 stores the category in the **`type`** column as PostgreSQL enum **`notification_type`** with values **`'Event'`**, **`'Result'`**, **`'Placement'`** (not a separate `notificationType` column).

**Query:**

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days';
```

**Index recommendation**

A **partial** index keeps the structure small when Placement rows are a fraction of all notifications; it supports the time filter and `student_id` lookups for deduplication:

```sql
CREATE INDEX idx_notifications_placement_created_at
  ON notifications (created_at DESC, student_id)
  WHERE type = 'Placement';
```

Alternatively, if many queries filter by **`type`** and **`created_at`** across all types, a **composite** index can serve broader workloads:

```sql
CREATE INDEX idx_notifications_type_created_at
  ON notifications (type, created_at DESC);
```

Choose based on whether Placement-only analytics dominate (favor **partial**) or mixed-type time-range queries are common (favor **composite**).

---

# Stage 4

## Problem

Notifications are loaded on **every page load** for **every** student. Naïve **`GET /notifications`** on each navigation creates a **thundering herd** of identical database reads and can overwhelm the DB.

Below are complementary strategies to cut read load, with tradeoffs on **consistency**, **performance**, and **complexity**.

---

## Strategy 1 — Redis cache (recommended)

| Aspect | Detail |
|--------|--------|
| **Cache key** | `notifications:{studentId}` (or versioned: `notifications:v1:{studentId}`) |
| **TTL** | **30–60 seconds** (tune per freshness requirements) |
| **Read path** | On **`GET /notifications`**: **GET** Redis → on **miss**, query PostgreSQL → **SET** key with TTL → return payload |
| **Write path** | On **mark-as-read** (single or bulk): **DELETE** (or **invalidate**) `notifications:{studentId}` so the next read repopulates from DB |

**Tradeoffs**

| Dimension | Effect |
|-----------|--------|
| **Consistency** | **Eventual** — clients may see data up to **TTL** seconds old unless invalidated on writes you control. |
| **Performance** | **Large win** — hot keys served from memory; DB QPS drops sharply for repeat page loads. |
| **Complexity** | **Medium** — Redis cluster, eviction policy, serialization format (JSON), and **invalidation discipline** on every mutation path. |

---

## Strategy 2 — HTTP response caching (`Cache-Control`)

| Aspect | Detail |
|--------|--------|
| **Header** | e.g. **`Cache-Control: private, max-age=30`** — **private** so user-specific lists are not stored on shared CDN caches inappropriately. |
| **Where it helps** | Browser (and optionally **private** CDN behaviors) reuse the last response without calling the origin for **max-age** seconds. |

**Tradeoffs**

| Dimension | Effect |
|-----------|--------|
| **Consistency** | **Weak for reads** — after **mark-as-read**, the browser may still show a cached list until **max-age** expires; **no server-side invalidation** of browser cache. |
| **Performance** | **Good** for repeat navigations **within one device/session**; does not reduce load from **different clients** or **first** request per interval. |
| **Complexity** | **Low** — set headers in the API gateway or app; must align with auth and **Vary** if responses differ by cookie/header. |

---

## Strategy 3 — Pagination (cursor-based)

| Aspect | Detail |
|--------|--------|
| **Goal** | Do **not** return the full history on every load. |
| **Mechanism** | **Cursor-based** pagination using **`created_at`** (and **`id`** as tiebreaker): e.g. `?limit=20&cursor=<opaque>` where cursor encodes last seen `(created_at, id)`. |

**Tradeoffs**

| Dimension | Effect |
|-----------|--------|
| **Consistency** | **Stable pages** if cursors are opaque and ordered; new inserts can **shift** what “next page” means—document whether duplicates/skips are acceptable. |
| **Performance** | **Strong** — smaller rows per request, less JSON, shorter DB queries with **`LIMIT`**. |
| **Complexity** | **Medium** — cursor encoding, edge cases (clock skew, deletes), and UX for “infinite scroll”. |

---

## Strategy 4 — WebSocket push instead of polling

| Aspect | Detail |
|--------|--------|
| **Idea** | Students **do not poll** on an interval; the server **pushes** new notifications (Stage 1: e.g. **`notification:new`**) when they are created. |
| **Effect** | Removes **repeated** **`GET /notifications`** used only to “check for updates”; initial load may still hit the API once, then deltas via socket. |

**Tradeoffs**

| Dimension | Effect |
|-----------|--------|
| **Consistency** | **High** for **new** items — delivery is near real-time; still need reconciliation (reconnect, missed events) via a **sync** endpoint or idempotent event IDs. |
| **Performance** | **Excellent** for reducing **read amplification**; shifts cost to **connection fan-out**, **presence**, and **horizontal scaling** of the socket tier. |
| **Complexity** | **Higher** — sticky sessions or Redis pub/sub, auth on handshake, backoff, mobile background limits. |

---

## Summary: consistency vs performance vs complexity

| Strategy | Consistency | Performance | Complexity |
|----------|-------------|-------------|------------|
| **Redis** | Slight staleness (TTL); better if invalidated on write | Very high for repeated reads | Medium |
| **HTTP cache** | Can be stale until `max-age`; hard to invalidate on read | Good for same client repeats | Low |
| **Pagination** | Depends on cursor design | High (smaller payloads/queries) | Medium |
| **WebSockets** | Strong for new events; needs sync story | Eliminates polling churn | Higher |

---

## Recommended combination: Redis + WebSockets

| Layer | Role |
|-------|------|
| **WebSockets** | **Primary** mechanism for **new** notifications — avoids polling loops that hammer **`GET /notifications`**. |
| **Redis** | **Caches** the **initial / paginated** list after navigation or cache miss — absorbs bursty traffic and repeated full-page loads. |

Together: **push** minimizes **unnecessary** list fetches; **Redis** makes the **remaining** reads cheap and predictable. Add **cursor pagination** for large histories, and use **`Cache-Control: private, short max-age`** only as a **supplement** if you accept client-side staleness—**do not** rely on it alone for correctness after **mark-as-read**; prefer **Redis invalidation** and/or **socket** events to refresh UI state.
