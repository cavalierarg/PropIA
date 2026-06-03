"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { generarCalendario, CalendarDay } from "@/lib/actions/calendario.actions";
import { useUsage } from "@/lib/context/usage-context";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  LockIcon,
  SparklesIcon,
  CalendarIcon,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import PropertyLoadedCard from "@/components/PropertyLoadedCard";

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
  const router = useRouter();
  const { limit, setUsage } = useUsage();
  const [nicho, setNicho] = useState("");
  const [zona, setZona] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryDisabled, setRetryDisabled] = useState(false);
  const [error, setError] = useState("");
  const [loadedProperty, setLoadedProperty] = useState<{ tipo: string; ubicacion: string } | null>(null);
  const [dias, setDias] = useState<CalendarDay[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [planChecked, setPlanChecked] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][plan]=pro&checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  useEffect(() => {
    getUserPlan().then((plan) => {
      setIsPro(plan === "pro" || plan === "pro_max");
      setPlanChecked(true);
    });
    try {
      const raw = localStorage.getItem("propia_property_prefill");
      if (raw) {
        const p = JSON.parse(raw);
        localStorage.removeItem("propia_property_prefill");
        if (p.ubicacion) { setZona(p.ubicacion); setLoadedProperty({ tipo: p.tipoPropiedad ?? "", ubicacion: p.ubicacion }); }
      }
    } catch {}
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
      if (!result.isPro) {
        setUsage({ remaining: result.remaining, count: limit - result.remaining });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        setError("Necesitás iniciar sesión para usar esta feature.");
      } else if (err instanceof Error && err.message === "LIMIT_REACHED") {
        setError("Alcanzaste el límite de 5 generaciones del mes. Actualizá a PRO para continuar sin límites.");
      } else {
        setError("Ocurrió un error al generar el calendario. Intentá de nuevo.");
      }
      setRetryDisabled(true);
      setTimeout(() => setRetryDisabled(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Día", "Fecha", "Red social", "Tipo de contenido", "Copy"];
    const rows = dias.map((d) => [
      d.dia,
      d.fecha,
      d.red,
      d.tipo_contenido,
      `"${d.copy.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `calendario-${nicho}-${zona}.csv`.replace(/\s+/g, "-").toLowerCase();
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copiado al portapapeles");
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
            <><CalendarIcon className="w-3.5 h-3.5" /> Plan Free — primeros {FREE_DAYS} días del calendario</>
          )}
        </div>
      )}

      {/* Formulario */}
      <div className="border border-[#0f3460]/10 rounded-xl p-5 sm:p-6 bg-card flex flex-col gap-5">
        {loadedProperty ? (
          <PropertyLoadedCard
            tipo={loadedProperty.tipo}
            ubicacion={loadedProperty.ubicacion}
            onClear={() => router.push("/mis-propiedades")}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 py-10 text-center border-2 border-dashed border-[#0f3460]/15 rounded-xl bg-[#0f3460]/3">
            <div className="w-14 h-14 rounded-2xl bg-[#0f3460]/8 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#0f3460]/40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-[#0f3460]">Seleccioná una propiedad primero</p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Cargá tu propiedad en Mis Propiedades y generá contenido desde ahí.
              </p>
            </div>
            <Link href="/mis-propiedades" className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0f3460] hover:bg-[#0f3460]/90 px-5 py-2.5 rounded-xl transition-colors">
              Ir a Mis Propiedades →
            </Link>
          </div>
        )}
        {loadedProperty && (
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Tipo de contenido</Label>
            <select
              value={nicho}
              onChange={(e) => setNicho(e.target.value)}
              disabled={loading}
              className="w-full border border-input bg-background rounded-md px-3 h-12 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="">Seleccioná el tipo de contenido</option>
              {NICHOS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          onClick={handleGenerar}
          disabled={loading || !nicho || !zona || retryDisabled}
          className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
        >
          <SparklesIcon className="w-4 h-4" />
          {loading
            ? isPro
              ? "Generando 30 días..."
              : "Generando preview..."
            : "Generar calendario"}
        </Button>
      </div>

      {/* Skeleton de carga */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <Skeleton className="h-10 w-full rounded-none" />
              <div className="p-4 flex flex-col gap-3 bg-white">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-9 w-24 self-end rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resultados */}
      {dias.length > 0 && !loading && (
        <div className="flex flex-col gap-5 sm:gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
                Tu plan de contenido
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-8 px-3 text-xs gap-1.5 shrink-0"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                Exportar CSV
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {isPro
                ? `${TOTAL_DAYS} días de contenido para ${nicho} en ${zona}`
                : `Primeros ${FREE_DAYS} días del calendario · Actualizá a PRO para ver los ${TOTAL_DAYS} días`}
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
