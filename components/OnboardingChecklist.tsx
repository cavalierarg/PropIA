"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, PartyPopper, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateOnboardingStep } from "@/lib/actions/onboarding.actions";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
  stepKey?: string;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
}

export default function OnboardingChecklist({ items }: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const router = useRouter();
  const doneCount = items.filter((i) => i.done).length;
  const allDone = doneCount === items.length;

  if (allDone) {
    return (
      <div className="bg-gradient-to-r from-[#0f3460] to-[#1a5276] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <PartyPopper className="w-5 h-5 text-[#00c9c9]" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">
            ¡Completaste todos los primeros pasos!
          </p>
          <p className="text-xs text-white/70 mt-0.5">
            Ya dominás PropIA. Seguí generando contenido de calidad.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#0f3460]">Primeros pasos</span>
          <span className="text-xs bg-[#00c9c9]/10 text-[#00c9c9] font-semibold px-2 py-0.5 rounded-full">
            {doneCount}/{items.length}
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((doneCount / items.length) * 100)}%`,
                background: "linear-gradient(90deg, #0f3460, #00c9c9)",
              }}
            />
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const isToggling = toggling === item.id;

              const handleManualToggle = async () => {
                if (item.done || !item.stepKey || isToggling) return;
                setToggling(item.id);
                await updateOnboardingStep(item.stepKey);
                router.refresh();
                setToggling(null);
              };

              const icon = item.done ? (
                <CheckCircle2 className="w-4 h-4 text-[#00c9c9] shrink-0" />
              ) : isToggling ? (
                <Loader2 className="w-4 h-4 text-slate-300 shrink-0 animate-spin" />
              ) : (
                <Circle
                  className={`w-4 h-4 shrink-0 ${item.stepKey ? "text-slate-300 cursor-pointer hover:text-[#00c9c9] transition-colors" : "text-slate-300"}`}
                  onClick={item.stepKey ? handleManualToggle : undefined}
                />
              );

              const content = (
                <div
                  className={`flex items-center gap-3 py-0.5 ${
                    !item.done && item.href ? "cursor-pointer" : ""
                  }`}
                >
                  {icon}
                  <span
                    className={`text-sm ${
                      item.done
                        ? "line-through text-slate-400"
                        : "text-slate-700 hover:text-[#0f3460]"
                    }`}
                  >
                    {item.label}
                  </span>
                  {!item.done && item.stepKey && (
                    <span className="text-xs text-slate-400 ml-auto">(tildá cuando lo hagas)</span>
                  )}
                </div>
              );

              return !item.done && item.href ? (
                <Link key={item.id} href={item.href}>
                  {content}
                </Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
