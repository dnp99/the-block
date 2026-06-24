export interface BidOverride {
  amount: number;
  count: number;
  at: number;
}

export type BidStore = Record<string, BidOverride>;

function isBidOverride(x: unknown): x is BidOverride {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.amount === "number" &&
    Number.isFinite(o.amount) &&
    typeof o.count === "number" &&
    typeof o.at === "number"
  );
}
export function parseBidStore(raw: string): BidStore {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof data !== "object" || data === null) return {};
  const out: BidStore = {};
  for (const [id, value] of Object.entries(data)) {
    if (typeof id === "string" && isBidOverride(value)) out[id] = value;
  }
  return out;
}
