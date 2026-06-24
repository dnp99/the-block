"use client";

import { cn } from "@/lib/cn";
export function InfoHint({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        className="grid h-5 w-5 cursor-help place-items-center rounded-full text-ink-subtle transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-30 mt-1.5 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-elevated px-2.5 py-1.5 text-xs leading-snug text-ink-muted opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
