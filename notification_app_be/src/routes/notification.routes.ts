import { Router, type RequestHandler } from "express";
import { getNotifications } from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

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

router.get("/", authMiddleware, asyncHandler(getNotifications));

export default router;
