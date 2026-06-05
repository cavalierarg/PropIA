"use client";

import type { VarianteEspanol } from "@/lib/agent-context";

const VARIANTES: { value: VarianteEspanol; flag: string; label: string }[] = [
  { value: "ar", flag: "🇦🇷", label: "Argentina" },
  { value: "es", flag: "🇪🇸", label: "España" },
  { value: "mx", flag: "🇲🇽", label: "México" },
  { value: "neutro", flag: "🌎", label: "Neutro" },
];

interface Props {
  value: VarianteEspanol;
  onChange: (v: VarianteEspanol) => void;
  disabled?: boolean;
}

export default function VarianteEspanolSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Variante de español
      </span>
      <div className="flex gap-2 flex-wrap">
        {VARIANTES.map((v) => (
          <button
            key={v.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(v.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              value === v.value
                ? "border-[#0f3460] bg-[#0f3460] text-white"
                : "border-border bg-card text-muted-foreground hover:border-[#0f3460]/50 hover:text-foreground"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <span>{v.flag}</span>
            <span>{v.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
