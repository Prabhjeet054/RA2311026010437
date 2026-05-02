import type { NextFunction, Request, Response } from "express";

/**
 * No end-user authentication: clients are pre-authorised.
 * Placeholder for future request-scoped checks (e.g. API keys) if required.
 */
export function authMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  next();
}
