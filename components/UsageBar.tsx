"use client";

import { useUsage } from "@/lib/context/usage-context";
import { Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/meta-pixel";

interface UsageBarProps {
  checkoutUrl?: string;
  renewalDate?: string;
  className?: string;
}

function UsageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="h-3 w-48 bg-slate-100 rounded-full animate-pulse" />
        <div className="h-3 w-8 bg-slate-100 rounded-full animate-pulse" />
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className="h-1.5 w-1/4 rounded-full bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

export default function UsageBar({ checkoutUrl, renewalDate, className = "" }: UsageBarProps) {
  const { count, remaining, limit, isPro, loading } = useUsage();

  if (loading) {
    return <UsageSkeleton className={className} />;
  }

  if (isPro) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-medium text-[#00c9c9] ${className}`}>
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        Generaciones ilimitadas ✓
      </div>
    );
  }

  const isLimitReached = remaining === 0;
  const isWarning = remaining > 0 && remaining <= 2;
  const progressPercent = limit > 0 ? Math.min(100, Math.round((count / limit) * 100)) : 0;

  const textColor = isLimitReached
    ? "text-red-600"
    : isWarning
    ? "text-amber-600"
    : "text-slate-500";

  const barColor = isLimitReached
    ? "#ef4444"
    : isWarning
    ? "#f59e0b"
    : undefined;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-xs font-medium ${textColor}`}>
          {count} generacion{count !== 1 ? "es" : ""} usada{count !== 1 ? "s" : ""} · te quedan {remaining} este mes
        </p>
        <span className="text-xs font-bold text-[#0f3460] tabular-nums shrink-0">
          {count}/{limit}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            background: barColor ?? "linear-gradient(90deg, #0f3460, #00c9c9)",
          }}
        />
      </div>
      {renewalDate && (
        <p className="text-[11px] text-slate-300">Se renuevan el {renewalDate}</p>
      )}
      {isLimitReached && checkoutUrl && (
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("InitiateCheckout")}
          className="mt-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#00c9c9] hover:bg-[#00b3b3] py-2 rounded-lg transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          Upgrade a PRO para continuar
        </a>
      )}
    </div>
  );
}
