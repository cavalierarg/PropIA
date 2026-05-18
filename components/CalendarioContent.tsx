"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { generarCalendario, CalendarDay } from "@/lib/actions/calendario.actions";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckIcon,
  CopyIcon,
  LoaderIcon,
  LockIcon,
  SparklesIcon,
  CalendarIcon,
} from "lucide-react";

const NICHOS = [
  "Casas",
  "Departamentos",
  "PH y dúplex",
  "Terrenos y lotes",
  "Locales comerciales",
  "Oficinas",
];

const COLORES_RED: Record<string, string> = {
  Instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  Facebook: "bg-blue-600 text-white",
  LinkedIn: "bg-sky-700 text-white",
};

const FREE_DAYS = 3;
const TOTAL_DAYS = 30;

export default function CalendarioContent() {
  const { user } = useUser();
  const [nicho, setNicho] = useState("");
  const [zona, setZona] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dias, setDias] = useState<CalendarDay[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [planChecked, setPlanChecked] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  useEffect(() => {
    getUserPlan().then((plan) => {
      setIsPro(plan === "pro");
      setPlanChecked(true);
    });
  }, []);

  const handleGenerar = async () => {
    if (!nicho || !zona) return;
    setError("");
    setDias([]);
    setLoading(true);

    try {
      const result = await generarCalendario({ nicho, zona });
      setDias(result.dias);
      setIsPro(result.isPro);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        setError("Necesitás iniciar sesión para usar esta feature.");
      } else {
        setError("Ocurrió un error al generar el calendario. Intentá de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Plan badge */}
      {planChecked && (
        <div className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-semibold border ${
          isPro
            ? "bg-[#00d4d4]/10 text-[#0f3460] border-[#00d4d4]/30"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          {isPro ? (
            <><SparklesIcon className="w-3.5 h-3.5" /> Plan PRO — calendario completo de {TOTAL_DAYS} días</>
          ) : (
            <><CalendarIcon className="w-3.5 h-3.5" /> Plan Free — preview de {FREE_DAYS} días</>
          )}
        </div>
      )}

      {/* Formulario */}
      <div className="border border-[#0f3460]/10 rounded-xl p-5 sm:p-6 bg-card flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Tu nicho *</Label>
            <select
              value={nicho}
              onChange={(e) => setNicho(e.target.value)}
              className="w-full border border-input bg-background rounded-md px-3 h-12 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="">Seleccioná tu nicho</option>
              {NICHOS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Zona donde trabajás *</Label>
            <Input
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              placeholder="Ej: Palermo, Buenos Aires"
              className="h-12 text-base"
            />
          </div>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          onClick={handleGenerar}
          disabled={loading || !nicho || !zona}
          className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm bg-[#0f3460] hover:bg-[#0f3460]/90 text-white"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoaderIcon className="w-4 h-4 animate-spin" />
              {isPro ? "Generando 30 días de contenido..." : "Generando preview de 3 días..."}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Generar calendario
            </span>
          )}
        </Button>
      </div>

      {/* Resultados */}
      {dias.length > 0 && (
        <div className="flex flex-col gap-5 sm:gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
              Tu plan de contenido
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPro
                ? `${TOTAL_DAYS} días de contenido para ${nicho} en ${zona}`
                : `Preview de ${FREE_DAYS} días · Actualizá a PRO para los ${TOTAL_DAYS} días completos`}
            </p>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>

          {/* Días disponibles */}
          <div className="flex flex-col gap-4">
            {dias.map((dia, index) => (
              <DayCard
                key={dia.dia}
                dia={dia}
                index={index}
                copiedIndex={copiedIndex}
                onCopy={handleCopy}
              />
            ))}
          </div>

          {/* Gate PRO para usuarios free */}
          {!isPro && (
            <div className="flex flex-col gap-4">
              {/* Tarjetas bloqueadas de preview */}
              {[4, 5, 6].map((day) => (
                <LockedDayCard key={day} day={day} />
              ))}

              {/* CTA de upgrade */}
              <div className="border-2 border-dashed border-[#00d4d4]/50 rounded-xl p-6 sm:p-8 flex flex-col items-center gap-5 text-center bg-[#00d4d4]/5">
                <div className="w-14 h-14 rounded-2xl bg-[#00d4d4]/15 flex items-center justify-center">
                  <SparklesIcon className="w-7 h-7 text-[#00d4d4]" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-[#0f3460] text-lg sm:text-xl">
                    Desbloqueá los {TOTAL_DAYS - FREE_DAYS} días restantes
                  </p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Con el Plan PRO generás el calendario completo de {TOTAL_DAYS} días con copies
                    listos para Instagram, Facebook y LinkedIn.
                  </p>
                  <ul className="text-sm text-left mt-1 flex flex-col gap-1.5 mx-auto max-w-xs">
                    {[
                      `${TOTAL_DAYS} días de contenido de una sola vez`,
                      "Posts para Instagram, Facebook y LinkedIn",
                      "Copies 100% listos para publicar",
                      "Generaciones ilimitadas de calendarios",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[#0f3460]">
                        <CheckIcon className="w-4 h-4 text-[#00d4d4] shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  asChild
                  className="h-12 px-8 text-base bg-[#0f3460] hover:bg-[#0f3460]/90 text-white font-semibold"
                >
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Upgrade a PRO — Ver los {TOTAL_DAYS} días
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de día disponible ───────────────────────────────────── */
function DayCard({
  dia,
  index,
  copiedIndex,
  onCopy,
}: {
  dia: CalendarDay;
  index: number;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}) {
  return (
    <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center gap-3">
        <span className="text-2xl font-bold text-[#0f3460] tabular-nums leading-none w-9 shrink-0">
          {String(dia.dia).padStart(2, "0")}
        </span>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="text-sm font-semibold text-[#0f3460] leading-tight">{dia.fecha}</span>
          <span className="text-xs text-muted-foreground truncate">{dia.tipo_contenido}</span>
        </div>
        <span
          className={`text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 ${
            COLORES_RED[dia.red] ?? "bg-gray-100 text-gray-800"
          }`}
        >
          {dia.red}
        </span>
      </div>

      {/* Copy */}
      <div className="p-4 flex flex-col gap-4 bg-card">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground break-words">
          {dia.copy}
        </p>
        <Button
          type="button"
          variant="outline"
          className="self-end h-11 px-5 text-sm"
          onClick={() => onCopy(dia.copy, index)}
        >
          {copiedIndex === index ? (
            <span className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-600" />
              Copiado
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CopyIcon className="w-4 h-4" />
              Copiar
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ── Tarjeta de día bloqueado ────────────────────────────────────── */
function LockedDayCard({ day }: { day: number }) {
  return (
    <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm relative">
      {/* Contenido borroso de fondo */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        <div className="px-4 py-3 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center gap-3">
          <span className="text-2xl font-bold text-[#0f3460] w-9">{String(day).padStart(2, "0")}</span>
          <div className="flex flex-col gap-1 flex-1">
            <div className="h-3.5 w-36 bg-[#0f3460]/15 rounded-full" />
            <div className="h-3 w-24 bg-[#0f3460]/10 rounded-full" />
          </div>
          <div className="h-6 w-20 bg-purple-400/30 rounded-full" />
        </div>
        <div className="p-4 flex flex-col gap-2.5 bg-card">
          {[100, 85, 95, 70, 90, 60, 80].map((w, i) => (
            <div key={i} className="h-3 bg-muted rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      {/* Overlay de bloqueo */}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[1px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center">
            <LockIcon className="w-4.5 h-4.5 text-[#0f3460]/70" />
          </div>
          <span className="text-[10px] font-bold tracking-wider text-[#0f3460] bg-[#00d4d4]/20 border border-[#00d4d4]/30 rounded-full px-2.5 py-0.5 uppercase">
            PRO
          </span>
        </div>
      </div>
    </div>
  );
}
