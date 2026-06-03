"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getUsage } from "@/lib/actions/usage.actions";

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

  useEffect(() => {
    let cancelled = false;
    getUsage()
      .then((data) => {
        if (!cancelled) {
          setUsageState(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsageState(initial);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
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
