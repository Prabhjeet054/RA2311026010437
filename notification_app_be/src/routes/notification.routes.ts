import { Router, type RequestHandler } from "express";
import {
  getAllNotificationsHttp,
  getNotificationsByTypeHttp,
  getTopPriorityNotificationsHttp,
} from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { Log } from "../../../dist/logging_middleware";
import { getAccessToken } from "../config/env";
import { parseTopNParam } from "../utils/parseTopN";

const router = Router();

function asyncHandler(
  fn: (
    req: Parameters<RequestHandler>[0],
    res: Parameters<RequestHandler>[1],
    next: Parameters<RequestHandler>[2]
  ) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Route-layer log (info/route) before controller. */
function logRouteFetchingAll(): RequestHandler {
  return async (_req, _res, next) => {
    const token = getAccessToken() ?? "";
    await Log(
      "backend",
      "info",
      "route",
      "Fetching all notifications",
      token
    );
    next();
  };
}

function logRouteFetchingTop(): RequestHandler {
  return async (req, _res, next) => {
    const token = getAccessToken() ?? "";
    const parsed = parseTopNParam(req.query.n);
    const msg = parsed.ok
      ? `Fetching top ${parsed.n} priority notifications`
      : "Fetching top priority notifications (invalid n query)";
    await Log("backend", "info", "route", msg, token);
    next();
  };
}

router.get(
  "/",
  authMiddleware,
  logRouteFetchingAll(),
  asyncHandler(getAllNotificationsHttp)
);

router.get(
  "/top",
  authMiddleware,
  logRouteFetchingTop(),
  asyncHandler(getTopPriorityNotificationsHttp)
);

router.get(
  "/type/:type",
  authMiddleware,
  asyncHandler(getNotificationsByTypeHttp)
);

export default router;
