"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { generarDescripcion, DescripcionResult } from "@/lib/actions/descripcion.actions";
import { getUserProfile } from "@/lib/actions/user-profile.actions";
import { useUsage } from "@/lib/context/usage-context";

import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon, LockIcon, SparklesIcon, Building2 } from "lucide-react";
import Link from "next/link";
import PropertyLoadedCard from "@/components/PropertyLoadedCard";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function DescripcionContent({ initialIsPro }: { initialIsPro: boolean }) {
  const { user } = useUser();
  const router = useRouter();
  const { limit, setUsage } = useUsage();

  const [form, setForm] = useState({
    tipoPropiedad: "",
    ubicacion: "",
    metrosCuadrados: "",
    precio: "",
    caracteristica1: "",
    caracteristica2: "",
    caracteristica3: "",
    dormitorios: "",
    banios: "",
    cocheras: "",
    antiguedad: "",
    piso: "",
    expensas: "",
    agenteWhatsapp: "",
    agenteInstagram: "",
    agenteSitioWeb: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadedProperty, setLoadedProperty] = useState<{ tipo: string; ubicacion: string; precio: string; metros: string } | null>(null);
  const [result, setResult] = useState<DescripcionResult | null>(null);
  const [isPro, setIsPro] = useState(initialIsPro);
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedLong, setCopiedLong] = useState(false);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][plan]=pro&checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("propia_property_prefill");
      if (raw) {
        const p = JSON.parse(raw);
        localStorage.removeItem("propia_property_prefill");
        setForm((prev) => ({
          ...prev,
          tipoPropiedad: p.tipoPropiedad || prev.tipoPropiedad,
          ubicacion: p.ubicacion || prev.ubicacion,
          metrosCuadrados: p.metrosCuadrados || prev.metrosCuadrados,
          precio: p.precio || prev.precio,
          caracteristica1: p.caracteristica1 || prev.caracteristica1,
          caracteristica2: p.caracteristica2 || prev.caracteristica2,
          caracteristica3: p.caracteristica3 || prev.caracteristica3,
        }));
        if (p.tipoPropiedad && p.ubicacion) {
          setLoadedProperty({ tipo: p.tipoPropiedad, ubicacion: p.ubicacion, precio: p.precio ?? "", metros: p.metrosCuadrados ?? "" });
        }
      }
    } catch {}

    getUserProfile().then((profile) => {
      setForm((prev) => ({
        ...prev,
        agenteWhatsapp: profile.whatsapp ?? "",
        agenteInstagram: profile.instagram ?? "",
        agenteSitioWeb: profile.sitio_web ?? "",
      }));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await generarDescripcion({ ...form, amenities: [] });
      setResult(res);
      setIsPro(res.isPro);
      if (!res.isPro) {
        setUsage({ remaining: res.remaining, count: limit - res.remaining });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        setError("Necesitás iniciar sesión para generar descripciones.");
      } else if (err instanceof Error && err.message === "LIMIT_REACHED") {
        setError("Alcanzaste el límite de 5 generaciones del mes. Actualizá a PRO para continuar sin límites.");
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
        <fieldset disabled={loading} className="contents">

          {loadedProperty ? (
            <PropertyLoadedCard
              tipo={loadedProperty.tipo}
              ubicacion={loadedProperty.ubicacion}
              precio={loadedProperty.precio}
              metros={loadedProperty.metros}
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
                  Cargá tu propiedad en Mis Propiedades y generá contenido desde ahí con un clic.
                </p>
              </div>
              <Link
                href="/mis-propiedades"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0f3460] hover:bg-[#0f3460]/90 px-5 py-2.5 rounded-xl transition-colors"
              >
                Ir a Mis Propiedades →
              </Link>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          {loadedProperty && (
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
            >
              <SparklesIcon className="w-4 h-4" />
              {loading ? "Generando descripción..." : "Generar descripción"}
            </Button>
          )}

        </fieldset>
      </form>

      {/* Skeleton */}
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
            <DescripcionCard
              titulo="Versión Corta"
              subtitulo="~200 palabras · ideal para el título del anuncio"
              texto={result.version_corta}
              copied={copiedShort}
              onCopy={() => handleCopy(result.version_corta, "short")}
              badge={{ label: "Gratis", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
            />

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
      <div className="px-4 py-3 sm:px-5 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#0f3460]">{titulo}</span>
          <span className="text-xs text-muted-foreground">{subtitulo}</span>
        </div>
        <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 shrink-0 ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      <div className="p-4 sm:p-5 flex flex-col gap-4 bg-card">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground break-words">
          {texto}
        </p>
        <p className="text-xs text-slate-400 -mt-2 text-right">{texto.length} caracteres</p>
        <Button type="button" variant="outline" className="self-end h-11 px-5 text-sm" onClick={onCopy}>
          {copied ? (
            <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-green-600" />Copiado</span>
          ) : (
            <span className="flex items-center gap-2"><CopyIcon className="w-4 h-4" />Copiar</span>
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
        <Button asChild className="h-10 px-5 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white text-sm font-semibold">
          <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            Upgrade a PRO para desbloquear
          </a>
        </Button>
      </div>
    </div>
  );
}
