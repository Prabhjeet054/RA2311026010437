# logging-middleware

Small TypeScript helper that posts structured log events to the evaluation-service logging endpoint.

## Install

```bash
npm install
npm run build
```

Requires **Node.js 18+** (uses the built-in `fetch` API).

## Usage

```typescript
import { Log } from "logging-middleware";

await Log("backend", "info", "service", "User signed in", process.env.LOG_TOKEN!);
await Log("frontend", "error", "component", "Render failed", token);
```

### Parameters

| Parameter | Description |
|-----------|-------------|
| `stack` | `"backend"` or `"frontend"` |
| `level` | `"debug"`, `"info"`, `"warn"`, `"error"`, or `"fatal"` |
| `pkg` | Package name; must match the stack (see below) |
| `message` | Log message string |
| `token` | Bearer token for `Authorization` |

**Backend** packages: `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`, plus shared.

**Frontend** packages: `api`, `component`, `hook`, `page`, `state`, `style`, plus shared.

**Shared** (valid for either stack): `auth`, `config`, `middleware`, `utils`.

### Behavior

- Sends `POST` to `http://20.207.122.201/evaluation-service/logs` with JSON body  
  `{ stack, level, package, message }` and headers `Content-Type: application/json`, `Authorization: Bearer <token>`.
- On success, if the response JSON includes `logID` or `logId`, that value is printed with `console.log`.
- On network or HTTP errors, failures are handled silently (no `console` output).

### Types

`Stack`, `Level`, and `Package` are exported for use in your application.
