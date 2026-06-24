"use client";

import { useEffect, useState } from "react";
import { InfoHint } from "@/components/ui/InfoHint";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toaster";
import { postJson } from "@/lib/api-client";
import { toastMessages } from "@/lib/toasts";

// Module-level cache: avoids re-calling Claude when navigating back to a vehicle.
const cache = new Map<string, string>();

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-3 dark:border-primary-900/50 dark:bg-primary-900/20">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span aria-hidden className="text-primary-600 dark:text-primary-300">
          ✨
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
          AI Summary
        </span>
        <InfoHint
          label="AI-generated from the inspection data; it can make mistakes. Verify against the report below."
          className="ml-auto"
        />
      </div>
      {children}
    </div>
  );
}

export function ConditionSummary({ id }: { id: string }) {
  const [summary, setSummary] = useState<string | null>(() => cache.get(id) ?? null);
  const [loading, setLoading] = useState(() => !cache.has(id));
  const { toast } = useToast();

  useEffect(() => {
    if (cache.has(id)) return;
    let cancelled = false;
    (async () => {
      try {
        const { summary } = await postJson<{ summary: string }>(
          "/api/condition-summary",
          { id },
        );
        if (cancelled) return;
        cache.set(id, summary);
        setSummary(summary);
      } catch {
        if (cancelled) return;
        toast(toastMessages.aiSummaryUnavailable, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, toast]);

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      </Shell>
    );
  }

  // Failed (or empty) — render nothing; the raw condition details still show.
  if (!summary) return null;

  return (
    <Shell>
      <p className="text-sm leading-6 text-ink">{summary}</p>
    </Shell>
  );
}
