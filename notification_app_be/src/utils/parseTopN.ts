export type ParseTopNResult =
  | { ok: true; n: number }
  | { ok: false };

/** Default 10; valid range 1–100 inclusive. */
export function parseTopNParam(raw: unknown): ParseTopNResult {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, n: 10 };
  }
  const n = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(n) || n < 1 || n > 100) {
    return { ok: false };
  }
  return { ok: true, n };
}
