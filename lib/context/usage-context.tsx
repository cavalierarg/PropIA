"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface UsageState {
  count: number;
  remaining: number;
  limit: number;
  isPro: boolean;
}

interface UsageContextValue extends UsageState {
  setUsage: (u: Partial<Pick<UsageState, "count" | "remaining">>) => void;
}

const UsageContext = createContext<UsageContextValue>({
  count: 0,
  remaining: 5,
  limit: 5,
  isPro: false,
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

  const setUsage = (u: Partial<Pick<UsageState, "count" | "remaining">>) => {
    setUsageState((prev) => ({ ...prev, ...u }));
  };

  return (
    <UsageContext.Provider value={{ ...usage, setUsage }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  return useContext(UsageContext);
}
