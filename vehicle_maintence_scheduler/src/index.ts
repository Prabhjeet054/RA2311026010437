import { Log } from "../../dist/logging_middleware";
import { getAccessToken } from "./config/env";
import { runScheduler } from "./service/scheduler";

async function main(): Promise<void> {
  const token = getAccessToken();

  if (!token) {
    await Log(
      "backend",
      "fatal",
      "db",
      "ACCESS_TOKEN is missing or empty in environment",
      ""
    );
    console.error("FATAL: Set ACCESS_TOKEN in vehicle_maintence_scheduler/.env");
    process.exit(1);
  }

  const results = await runScheduler(token);

  console.log("\n========== Vehicle Maintenance Schedule ==========\n");
  for (const r of results) {
    console.log(`Depot ID:        ${r.depotId}`);
    console.log(`Selected tasks:  ${r.selectedTaskIds.length ? r.selectedTaskIds.join(", ") : "(none)"}`);
    console.log(`Total duration:  ${r.totalDuration} hours`);
    console.log(`Total impact:    ${r.totalImpact}`);
    console.log("-".repeat(50));
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
