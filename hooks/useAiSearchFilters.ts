"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/shared/Toaster";
import { postJson } from "@/lib/api-client";
import { parseSearchFilters, type SearchFilters } from "@/lib/contracts/search";
import { useToastMessages } from "@/hooks/useToastMessages";

interface AiResult {
  query: string;
  filters: SearchFilters;
}
export function useAiSearchFilters(query: string) {
  const aiCache = useRef(new Map<string, SearchFilters>());
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const { toast } = useToast();
  const aiSearchUnavailable = useToastMessages().aiSearchUnavailable;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    let cancelled = false;
    const cached = aiCache.current.get(q);
    const handle = window.setTimeout(async () => {
      try {
        const filters =
          cached ??
          parseSearchFilters(
            (await postJson<{ filters: unknown }>("/api/search", { query: q })).filters,
          );
        if (cancelled) return;
        aiCache.current.set(q, filters);
        setAiResult({ query: q, filters });
      } catch {
        if (cancelled) return;
        setAiResult({ query: q, filters: { keywords: q.split(/\s+/) } });
        toast(aiSearchUnavailable, "error");
      }
    }, cached ? 0 : 600);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query, toast, aiSearchUnavailable]);

  const trimmedQuery = query.trim();
  const aiLoading = trimmedQuery.length >= 3 && aiResult?.query !== trimmedQuery;

  const aiFilters = useMemo<SearchFilters>(() => {
    
    if (aiResult?.query === trimmedQuery) return aiResult.filters;
    return {};
  }, [aiResult, trimmedQuery]);

  const restoreAi = useCallback((result: AiResult) => {
    aiCache.current.set(result.query, result.filters);
    setAiResult(result);
  }, []);

  function removeAiFilter(key: keyof SearchFilters) {
    setAiResult((prev) => {
      if (!prev) return prev;
      const filters = { ...prev.filters };
      delete filters[key];
      return { query: prev.query, filters };
    });
  }

  const resetAi = useCallback(() => {
    setAiResult(null);
  }, []);

  return { aiFilters, aiLoading, removeAiFilter, resetAi, restoreAi };
}
