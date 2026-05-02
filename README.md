# RA2311026010437

Node.js 18+ TypeScript project. Build tooling and dependencies live at the **repository root**; application code is organized in folders such as `logging_middleware/`.

## Setup

```bash
npm install
npm run build
```

Compiled output is written to `dist/` (for example `dist/logging_middleware/`).

## Logging middleware

Source: `logging_middleware/index.ts` — exports `Log`, `Stack`, `Level`, and `Package`.

```typescript
import { Log } from "./logging_middleware";

await Log("backend", "info", "service", "User signed in", token);
await Log("frontend", "error", "component", "Render failed", token);
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| `stack` | `"backend"` or `"frontend"` |
| `level` | `"debug"`, `"info"`, `"warn"`, `"error"`, or `"fatal"` |
| `pkg` | Package name for that stack (see below) |
| `message` | Log message |
| `token` | Bearer token for `Authorization` |

**Backend** packages: `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`, plus shared.

**Frontend** packages: `api`, `component`, `hook`, `page`, `state`, `style`, plus shared.

**Shared** (either stack): `auth`, `config`, `middleware`, `utils`.

### Behavior

- `POST` to `http://20.207.122.201/evaluation-service/logs` with body `{ stack, level, package, message }` and `Authorization: Bearer <token>`.
- On success, prints `logID` / `logId` from the JSON response with `console.log` when present.
- Failures are handled silently (no console output for errors).
