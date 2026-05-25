"use client";

import { useState } from "react";
import { Zap, ArrowDown, X } from "lucide-react";

export default function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#0f3460] to-[#1a5276] rounded-2xl p-4 sm:p-5 mb-4 flex items-center gap-4 shadow-md">
      <div className="w-10 h-10 rounded-xl bg-[#00c9c9]/20 flex items-center justify-center shrink-0">
        <Zap className="w-5 h-5 text-[#00c9c9]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm sm:text-base leading-snug">
          Generá tu primer post ahora — solo toma 60 segundos
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <ArrowDown className="w-3.5 h-3.5 text-[#00c9c9] animate-bounce" />
          <span className="text-xs text-white/70">
            Completá el formulario de abajo para empezar
          </span>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="text-white/40 hover:text-white/80 transition-colors shrink-0 p-1"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
