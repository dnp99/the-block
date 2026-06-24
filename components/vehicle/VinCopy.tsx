"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/*
  Click-to-copy VIN. Used inside row/card links, so it stops propagation and
  prevents default — clicking the VIN copies it without triggering navigation.
  Sits above the stretched-link overlay via z-index from the caller.
*/
export function VinCopy({ vin, className }: { vin: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(vin);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context) — no-op.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied" : "Copy VIN"}
      className={cn(
        "relative z-[2] inline-flex items-center gap-1 rounded font-mono tracking-tight text-ink-muted transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        className,
      )}
    >
      <span>{vin}</span>
      {copied ? (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 text-success"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
      <span className="sr-only">{copied ? "VIN copied" : "Copy VIN"}</span>
    </button>
  );
}
