export type Stack = "backend" | "frontend";

export type Level = "debug" | "info" | "warn" | "error" | "fatal";

type BackendPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "handler"
  | "repository"
  | "route"
  | "service";

type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";

type SharedPackage = "auth" | "config" | "middleware" | "utils";

/** Union of every valid package name for any stack. */
export type Package =
  | BackendPackage
  | FrontendPackage
  | SharedPackage;

type BackendOrShared = BackendPackage | SharedPackage;
type FrontendOrShared = FrontendPackage | SharedPackage;

const LOG_URL = "http://20.207.122.201/evaluation-service/logs";

interface LogSuccessBody {
  logID?: string;
  logId?: string;
}

export async function Log(
  stack: "backend",
  level: Level,
  pkg: BackendOrShared,
  message: string,
  token: string
): Promise<void>;
export async function Log(
  stack: "frontend",
  level: Level,
  pkg: FrontendOrShared,
  message: string,
  token: string
): Promise<void>;
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string,
  token: string
): Promise<void> {
  try {
    const res = await fetch(LOG_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });

    if (!res.ok) {
      return;
    }

    const text = await res.text();
    if (!text) {
      return;
    }

    let data: LogSuccessBody;
    try {
      data = JSON.parse(text) as LogSuccessBody;
    } catch {
      return;
    }

    const logID = data.logID ?? data.logId;
    if (logID !== undefined && logID !== null && logID !== "") {
      console.log(logID);
    }
  } catch {
    // Silent: no app-level logging on failure
  }
}
