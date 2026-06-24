"use client";

import { useEffect, useState } from "react";

// The auction "now" comes from the viewer's clock, not a server timestamp that a CDN/SSR cache can
// staledate. `anchorMs` (the schedule anchor) and `nowMs` (the ticking judge-time) both seed from the
// server value for SSR, then jump to the real client clock on mount — anchorMs frozen so countdowns
// tick via nowMs. This keeps the (45-min) live window aligned with real time regardless of caching.
export function useAuctionClock(serverNowMs: number) {
  const [anchorMs, setAnchorMs] = useState(serverNowMs);
  const [nowMs, setNowMs] = useState(serverNowMs);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setAnchorMs(Date.now());
    setNowMs(Date.now());
    /* eslint-enable react-hooks/set-state-in-effect */
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return { anchorMs, nowMs };
}
