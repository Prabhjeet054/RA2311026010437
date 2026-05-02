import { Log } from "../../../dist/logging_middleware";

const BASE = "http://20.207.122.201/evaluation-service";

export interface DepotDto {
  ID: number;
  MechanicHours: number;
}

export interface VehicleDto {
  TaskID: string;
  Duration: number;
  Impact: number;
}

export async function fetchDepots(token: string): Promise<DepotDto[]> {
  await Log(
    "backend",
    "debug",
    "repository",
    "GET /evaluation-service/depots",
    token
  );

  const res = await fetch(`${BASE}/depots`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`depots HTTP ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { depots?: DepotDto[] };
  return data.depots ?? [];
}

export async function fetchVehicles(token: string): Promise<VehicleDto[]> {
  await Log(
    "backend",
    "debug",
    "repository",
    "GET /evaluation-service/vehicles",
    token
  );

  const res = await fetch(`${BASE}/vehicles`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`vehicles HTTP ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { vehicles?: VehicleDto[] };
  return data.vehicles ?? [];
}
