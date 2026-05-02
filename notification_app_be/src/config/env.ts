import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

export function getAccessToken(): string | undefined {
  const raw = process.env.ACCESS_TOKEN;
  if (raw === undefined || raw === null) {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getPort(): number {
  const p = process.env.PORT;
  if (p === undefined || p === "") {
    return 3000;
  }
  const n = Number.parseInt(p, 10);
  return Number.isFinite(n) && n > 0 ? n : 3000;
}
