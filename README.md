# RA2311026010437

Node.js 18+ TypeScript monorepo: shared logging middleware, a vehicle maintenance scheduler CLI, and a notification REST API.

## 1. Repository structure

| Path | Description |
|------|-------------|
| `logging_middleware/` | Shared `Log()` helper for posting structured logs to the evaluation logging endpoint. |
| `vehicle_maintence_scheduler/` | Standalone service that loads depots/vehicles from the evaluation API and runs a 0/1 knapsack scheduler. |
| `notification_app_be/` | Express + TypeScript API that proxies and processes notifications (including priority inbox). |
| `notification_system_design.md` | Written design for the notification platform (API, database, caching, queues). |
| Root `package.json` / `tsconfig.json` | Builds `logging_middleware` into `dist/` for imports from subprojects. |

## 2. Installing dependencies

Install **each** place that has its own `package.json`:

```bash
# Repository root (logging middleware)
npm install

# Vehicle maintenance scheduler
cd vehicle_maintence_scheduler && npm install && cd ..

# Notification backend
cd notification_app_be && npm install && cd ..
```

## 3. Build and run `vehicle_maintence_scheduler`

From the repository root:

```bash
cd vehicle_maintence_scheduler
npm run build
npm start
```

`npm run build` compiles the parent project first (`prebuild`), then this package, so `dist/logging_middleware` exists for imports.

Create `vehicle_maintence_scheduler/.env` (see [Environment variables](#5-environment-variables)) before running.

## 4. Build and run `notification_app_be`

```bash
cd notification_app_be
npm run build
npm start
```

The HTTP server listens on the configured port (default **3000**). Example: `GET http://localhost:3000/health`, `GET http://localhost:3000/api/v1/notifications`.

Optional CLI for the priority inbox utility (after build):

```bash
npm run priority-inbox
```

## 5. Environment variables

Use `.env` files **next to** each app’s `package.json` (they are gitignored). Format is `KEY=value` per line.

### `vehicle_maintence_scheduler/.env`

```env
ACCESS_TOKEN=<bearer token for evaluation-service APIs>
```

### `notification_app_be/.env`

```env
ACCESS_TOKEN=<bearer token for evaluation-service APIs>
PORT=3000
```

`PORT` is optional; it defaults to **3000** if omitted.
