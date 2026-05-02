import { Log } from "../../../dist/logging_middleware";
import { fetchDepots, fetchVehicles } from "../repository/apiClient";
import { solveZeroOneKnapsack, type KnapsackItem } from "../utils/knapsack";

export interface DepotScheduleResult {
  depotId: number;
  selectedTaskIds: string[];
  totalDuration: number;
  totalImpact: number;
}

export async function runScheduler(
  token: string
): Promise<DepotScheduleResult[]> {
  await Log(
    "backend",
    "info",
    "service",
    "Vehicle maintenance scheduler started",
    token
  );

  let depots;
  let vehicles;
  try {
    depots = await fetchDepots(token);
    vehicles = await fetchVehicles(token);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Unknown error fetching API data";
    await Log("backend", "error", "service", `API call failed: ${msg}`, token);
    throw err;
  }

  const items: KnapsackItem[] = vehicles.map((v) => ({
    taskId: v.TaskID,
    weight: v.Duration,
    value: v.Impact,
  }));

  const results: DepotScheduleResult[] = [];

  for (const depot of depots) {
    const capacity = depot.MechanicHours;
    const kn = solveZeroOneKnapsack(items, capacity);

    await Log(
      "backend",
      "info",
      "service",
      `Knapsack completed for depot ${depot.ID}: impact=${kn.totalImpact}, duration=${kn.totalDuration}, tasks=${kn.selectedTaskIds.length}`,
      token
    );

    results.push({
      depotId: depot.ID,
      selectedTaskIds: kn.selectedTaskIds,
      totalDuration: kn.totalDuration,
      totalImpact: kn.totalImpact,
    });
  }

  return results;
}
