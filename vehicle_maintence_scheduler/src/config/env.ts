import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(__dirname, "..", "..", ".env");
dotenv.config({ path: envPath });

/**
 * Access token from environment (.env key ACCESS_TOKEN).
 */
export function getAccessToken(): string | undefined {
  const raw = process.env.ACCESS_TOKEN;
  if (raw === undefined || raw === null) {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
