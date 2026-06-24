import { describe, expect, it } from "vitest";
import {
  auctionState,
  auctionCountdownLabel,
  LIVE_DURATION_MS,
  type AuctionPhase,
} from "@/lib/auction";

const ANCHOR = 1_700_000_000_000;

describe("auctionState", () => {
  it("is deterministic for the same id + anchor + now", () => {
    const a = auctionState("abc", ANCHOR, ANCHOR);
    const b = auctionState("abc", ANCHOR, ANCHOR);
    expect(a).toEqual(b);
  });

  it("produces a realistic mix of phases at the anchor moment", () => {
    const counts: Record<AuctionPhase, number> = { upcoming: 0, live: 0, ended: 0 };
    for (let i = 0; i < 200; i++) {
      counts[auctionState(`vehicle-${i}`, ANCHOR, ANCHOR).phase]++;
    }

    expect(counts.live).toBeGreaterThan(0);
    expect(counts.upcoming).toBeGreaterThan(0);
    expect(counts.ended).toBeGreaterThan(0);
    expect(counts.live + counts.upcoming + counts.ended).toBe(200);
  });

  it("transitions live → ended as time passes the end", () => {
    let liveId = "";
    for (let i = 0; i < 200 && !liveId; i++) {
      const id = `v${i}`;
      if (auctionState(id, ANCHOR, ANCHOR).phase === "live") liveId = id;
    }
    expect(liveId).not.toBe("");
    const s = auctionState(liveId, ANCHOR, ANCHOR);
    expect(auctionState(liveId, ANCHOR, s.endMs + 1).phase).toBe("ended");
  });

  it("upcoming auctions start in the future relative to now", () => {
    let upId = "";
    for (let i = 0; i < 200 && !upId; i++) {
      const id = `u${i}`;
      if (auctionState(id, ANCHOR, ANCHOR).phase === "upcoming") upId = id;
    }
    const s = auctionState(upId, ANCHOR, ANCHOR);
    expect(s.startMs).toBeGreaterThan(ANCHOR);
    expect(s.endMs - s.startMs).toBe(LIVE_DURATION_MS);
  });

  it("spreads upcoming/ended across roughly a 10-day window", () => {
    const DAY = 24 * 60 * 60_000;
    let maxUpcoming = 0;
    let maxEndedAgo = 0;
    for (let i = 0; i < 400; i++) {
      const s = auctionState(`spread-${i}`, ANCHOR, ANCHOR);
      if (s.phase === "upcoming") maxUpcoming = Math.max(maxUpcoming, s.startMs - ANCHOR);
      if (s.phase === "ended") maxEndedAgo = Math.max(maxEndedAgo, ANCHOR - s.endMs);
    }
    // ~5 days each side (beyond the old 3-day upcoming / 2-day ended bounds).
    expect(maxUpcoming).toBeGreaterThan(3 * DAY);
    expect(maxUpcoming).toBeLessThanOrEqual(5 * DAY);
    expect(maxEndedAgo).toBeGreaterThan(2 * DAY);
    expect(maxEndedAgo).toBeLessThanOrEqual(5 * DAY);
  });
});

describe("auctionCountdownLabel", () => {
  it("labels each phase sensibly", () => {
    const live = { phase: "live" as const, startMs: ANCHOR - 60_000, endMs: ANCHOR + 120_000 };
    expect(auctionCountdownLabel(live, ANCHOR)).toBe("Ends in 2m 0s");

    const upcoming = { phase: "upcoming" as const, startMs: ANCHOR + 3_600_000, endMs: ANCHOR + 6_300_000 };
    expect(auctionCountdownLabel(upcoming, ANCHOR)).toBe("Starts in 1h 0m");

    const ended = { phase: "ended" as const, startMs: ANCHOR - 10_000_000, endMs: ANCHOR - 1_000_000 };
    expect(auctionCountdownLabel(ended, ANCHOR)).toBe("Auction ended");
  });
});
