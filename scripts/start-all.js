"use strict";

/**
 * Single entrypoint for Railway (and local): one process runs the notification API;
 * the vehicle maintenance scheduler runs once in a child process (non-blocking).
 *
 * Env (Railway Variables):
 *   ACCESS_TOKEN — required for both apps
 *   RUN_VEHICLE_SCHEDULER=false — skip the scheduler child (API only)
 */

const { spawn } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const vehicleEntry = path.join(root, "vehicle_maintence_scheduler", "dist", "index.js");
const apiEntry = path.join(root, "notification_app_be", "dist", "index.js");

if (process.env.RUN_VEHICLE_SCHEDULER !== "false") {
  const child = spawn(process.execPath, [vehicleEntry], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      console.error(`[vehicle_maintence_scheduler] killed (${signal})`);
    } else {
      console.log(`[vehicle_maintence_scheduler] finished (exit ${code ?? 0})`);
    }
  });
  child.on("error", (err) => {
    console.error("[vehicle_maintence_scheduler] spawn error:", err);
  });
} else {
  console.log("[start-all] RUN_VEHICLE_SCHEDULER=false — skipping vehicle scheduler");
}

require(apiEntry);
