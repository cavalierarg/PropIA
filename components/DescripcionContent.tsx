"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { generarDescripcion, DescripcionResult } from "@/lib/actions/descripcion.actions";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, CopyIcon, LoaderIcon, LockIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const TIPOS_PROPIEDAD = [
  "Casa",
  "Departamento",
  "PH",
  "Oficina",
  "Local comercial",
  "Terreno",
  "Cochera",
];

export default function DescripcionContent() {
  const { user } = useUser();
  const [form, setForm] = useState({
    tipoPropiedad: "",
    ubicacion: "",
    metrosCuadrados: "",
    precio: "",
    caracteristica1: "",
    caracteristica2: "",
    caracteristica3: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DescripcionResult | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedLong, setCopiedLong] = useState(false);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  useEffect(() => {
    getUserPlan().then((plan) => setIsPro(plan === "pro"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await generarDescripcion(form);
      setResult(res);
      setIsPro(res.isPro);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        setError("Necesitás iniciar sesión para generar descripciones.");
      } else {
        setError("Ocurrió un error al generar la descripción. Intentá de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, type: "short" | "long") => {
    await navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
    if (type === "short") {
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2000);
    } else {
      setCopiedLong(true);
      setTimeout(() => setCopiedLong(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tipoPropiedad" className="text-sm font-medium">
              Tipo de propiedad *
            </Label>
            <select
              id="tipoPropiedad"
              name="tipoPropiedad"
              value={form.tipoPropiedad}
              onChange={handleChange}
              className="w-full border border-input bg-background rounded-md px-3 h-12 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              required
            >
              <option value="">Seleccioná un tipo</option>
              {TIPOS_PROPIEDAD.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ubicacion" className="text-sm font-medium">
              Ubicación *
            </Label>
            <Input
              id="ubicacion"
              name="ubicacion"
              placeholder="Ej: Palermo, Buenos Aires"
              value={form.ubicacion}
              onChange={handleChange}
              required
              className="h-12 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="metrosCuadrados" className="text-sm font-medium">
              Metros cuadrados *
            </Label>
            <Input
              id="metrosCuadrados"
              name="metrosCuadrados"
              type="number"
              inputMode="numeric"
              placeholder="Ej: 85"
              value={form.metrosCuadrados}
              onChange={handleChange}
              required
              min={1}
              className="h-12 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="precio" className="text-sm font-medium">
              Precio *
            </Label>
            <Input
              id="precio"
              name="precio"
              placeholder="Ej: USD 120.000"
              value={form.precio}
              onChange={handleChange}
              required
              className="h-12 text-base"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-medium">3 Características destacadas</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Input
              name="caracteristica1"
              placeholder="Ej: Luminoso"
              value={form.caracteristica1}
              onChange={handleChange}
              className="h-12 text-base"
            />
            <Input
              name="caracteristica2"
              placeholder="Ej: Terraza propia"
              value={form.caracteristica2}
              onChange={handleChange}
              className="h-12 text-base"
            />
            <Input
              name="caracteristica3"
              placeholder="Ej: A 2 cuadras del subte"
              value={form.caracteristica3}
              onChange={handleChange}
              className="h-12 text-base"
            />
          </div>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
        >
          <SparklesIcon className="w-4 h-4" />
          {loading ? "Generando descripción..." : "Generar descripción"}
        </Button>
      </form>

      {/* Skeleton de carga */}
      {loading && (
        <div className="flex flex-col gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <Skeleton className="h-10 w-full rounded-none" />
              <div className="p-5 flex flex-col gap-3 bg-white">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-9 w-24 self-end rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resultados */}
      {result && !loading && (
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
              Descripciones generadas
            </h2>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>

          <div className="flex flex-col gap-5">
            {/* Versión corta — siempre visible */}
            <DescripcionCard
              titulo="Versión Corta"
              subtitulo="~200 palabras · ideal para el título del anuncio"
              texto={result.version_corta}
              copied={copiedShort}
              onCopy={() => handleCopy(result.version_corta, "short")}
              badge={{ label: "Gratis", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
            />

            {/* Versión larga — PRO */}
            {result.isPro && result.version_larga ? (
              <DescripcionCard
                titulo="Versión Larga"
                subtitulo="~400 palabras · para la descripción completa del portal"
                texto={result.version_larga}
                copied={copiedLong}
                onCopy={() => handleCopy(result.version_larga!, "long")}
                badge={{ label: "PRO", className: "bg-[#00d4d4]/10 text-[#0f3460] border-[#00d4d4]/30" }}
                highlight
              />
            ) : !result.isPro ? (
              <LockedLongVersion checkoutUrl={checkoutUrl} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de descripción ──────────────────────────────────────── */
function DescripcionCard({
  titulo,
  subtitulo,
  texto,
  copied,
  onCopy,
  badge,
  highlight = false,
}: {
  titulo: string;
  subtitulo: string;
  texto: string;
  copied: boolean;
  onCopy: () => void;
  badge: { label: string; className: string };
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-xl overflow-hidden shadow-sm ${
        highlight ? "border-[#00d4d4]/40 ring-1 ring-[#00d4d4]/20" : "border-[#0f3460]/10"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#0f3460]">{titulo}</span>
          <span className="text-xs text-muted-foreground">{subtitulo}</span>
        </div>
        <span
          className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Texto */}
      <div className="p-4 sm:p-5 flex flex-col gap-4 bg-card">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground break-words">
          {texto}
        </p>
        <Button
          type="button"
          variant="outline"
          className="self-end h-11 px-5 text-sm"
          onClick={onCopy}
        >
          {copied ? (
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

/* ── Versión larga bloqueada ─────────────────────────────────────── */
function LockedLongVersion({ checkoutUrl }: { checkoutUrl: string }) {
  return (
    <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm relative">
      {/* Contenido borroso */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        <div className="px-4 py-3 sm:px-5 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-3.5 w-28 bg-[#0f3460]/15 rounded-full" />
            <div className="h-3 w-44 bg-[#0f3460]/10 rounded-full" />
          </div>
          <div className="h-5 w-10 bg-[#00d4d4]/30 rounded-full" />
        </div>
        <div className="p-4 sm:p-5 flex flex-col gap-2.5 bg-card">
          {[100, 92, 87, 100, 78, 95, 83, 100, 70, 88, 60, 94].map((w, i) => (
            <div key={i} className="h-3 bg-muted rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/75 backdrop-blur-[1px] rounded-xl p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center">
            <LockIcon className="w-5 h-5 text-[#0f3460]/70" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold text-[#0f3460] text-base">Versión Larga · ~400 palabras</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Descripción completa con ambientes detallados, barrio, conectividad y potencial de inversión.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="h-10 px-5 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white text-sm font-semibold"
        >
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            Upgrade a PRO para desbloquear
          </a>
        </Button>
      </div>
    </div>
  );
}
