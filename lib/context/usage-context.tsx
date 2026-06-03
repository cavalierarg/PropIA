"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface UsageState {
  count: number;
  remaining: number;
  limit: number;
  isPro: boolean;
}

interface UsageContextValue extends UsageState {
  loading: boolean;
  setUsage: (u: Partial<Pick<UsageState, "count" | "remaining">>) => void;
}

const UsageContext = createContext<UsageContextValue>({
  count: 0,
  remaining: 5,
  limit: 5,
  isPro: false,
  loading: true,
  setUsage: () => {},
});

export function UsageProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial: UsageState;
}) {
  const [usage, setUsageState] = useState<UsageState>(initial);
  const [loading, setLoading] = useState(true);

  // Fetch real usage from DB on mount — the layout's initial prop may be stale
  // on client-side navigation since the layout Server Component doesn't re-run.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data: UsageState) => {
        if (!cancelled) {
          setUsageState(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback to initial data from layout if fetch fails
          setUsageState(initial);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setUsage = (u: Partial<Pick<UsageState, "count" | "remaining">>) => {
    setUsageState((prev) => ({ ...prev, ...u }));
  };

  return (
    <UsageContext.Provider value={{ ...usage, loading, setUsage }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  return useContext(UsageContext);
}
