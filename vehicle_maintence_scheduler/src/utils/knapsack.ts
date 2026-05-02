/**
 * 0/1 knapsack via bottom-up dynamic programming (no greedy, no external libs).
 * weight = duration, value = impact. Uses a flat Uint32Array table for cache-friendly access.
 */

export interface KnapsackItem {
  taskId: string;
  weight: number;
  value: number;
}

export interface KnapsackResult {
  selectedTaskIds: string[];
  totalDuration: number;
  totalImpact: number;
}

function index(i: number, w: number, stride: number): number {
  return i * stride + w;
}

/**
 * Solves 0/1 knapsack with nonnegative integer weights and capacity.
 */
export function solveZeroOneKnapsack(
  items: KnapsackItem[],
  capacity: number
): KnapsackResult {
  const n = items.length;
  if (n === 0 || capacity <= 0) {
    return { selectedTaskIds: [], totalDuration: 0, totalImpact: 0 };
  }

  const weights = items.map((it) => Math.max(0, Math.floor(it.weight)));
  const values = items.map((it) => Math.max(0, Math.floor(it.value)));
  const W = Math.floor(capacity);
  const stride = W + 1;
  const tableSize = (n + 1) * stride;

  // dp[i][w] = max impact using first i items with capacity w
  const dp = new Uint32Array(tableSize);

  for (let i = 1; i <= n; i++) {
    const wi = weights[i - 1]!;
    const vi = values[i - 1]!;
    const prev = i - 1;
    for (let w = 0; w <= W; w++) {
      const base = dp[index(prev, w, stride)]!;
      let best = base;
      if (wi <= w) {
        const cand = dp[index(prev, w - wi, stride)]! + vi;
        if (cand > best) {
          best = cand;
        }
      }
      dp[index(i, w, stride)] = best;
    }
  }

  // Reconstruct chosen items
  const selectedTaskIds: string[] = [];
  let w = W;
  let totalDuration = 0;
  for (let i = n; i >= 1; i--) {
    if (dp[index(i, w, stride)] !== dp[index(i - 1, w, stride)]) {
      const item = items[i - 1]!;
      const wi = weights[i - 1]!;
      selectedTaskIds.push(item.taskId);
      totalDuration += wi;
      w -= wi;
    }
  }

  selectedTaskIds.reverse();

  return {
    selectedTaskIds,
    totalDuration,
    totalImpact: dp[index(n, W, stride)]!,
  };
}
