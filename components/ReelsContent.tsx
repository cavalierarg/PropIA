"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  buscarFormatosTrending,
  generarGuion,
  type TrendingFormat,
  type Escena,
  type Slide,
  type GuionResult,
} from "@/lib/actions/reels.actions";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { getUserProfile } from "@/lib/actions/user-profile.actions";
import { useUsage } from "@/lib/context/usage-context";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CameraIcon,
  CheckIcon,
  CopyIcon,
  LoaderIcon,
  LockIcon,
  RefreshCwIcon,
  SparklesIcon,
  TrendingUpIcon,
  VideoIcon,
} from "lucide-react";
import Link from "next/link";
import PropertyLoadedCard from "@/components/PropertyLoadedCard";
import { toast } from "sonner";

type Step = "form" | "formatos" | "guion";

const FORM_EMPTY = {
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
};

export default function ReelsContent() {
  const { user } = useUser();
  const router = useRouter();
  const { limit, setUsage } = useUsage();
  const [form, setForm] = useState(FORM_EMPTY);
  const [step, setStep] = useState<Step>("form");
  const [formatos, setFormatos] = useState<TrendingFormat[]>([]);
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<TrendingFormat | null>(null);
  const [guion, setGuion] = useState<GuionResult | null>(null);
  const [loadingFormatos, setLoadingFormatos] = useState(false);
  const [loadingGuion, setLoadingGuion] = useState(false);
  const [loadedProperty, setLoadedProperty] = useState<{ tipo: string; ubicacion: string; precio: string; metros: string } | null>(null);
  const [error, setError] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [planChecked, setPlanChecked] = useState(false);
  const [copiedEscena, setCopiedEscena] = useState<number | null>(null);
  const [copiedSlide, setCopiedSlide] = useState<number | null>(null);

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

    getUserPlan().then((plan) => {
      setIsPro(plan === "pro" || plan === "pro_max");
      setPlanChecked(true);
    });
    getUserProfile().then((profile) => {
      setForm((prev) => ({
        ...prev,
        agenteWhatsapp: profile.whatsapp ?? "",
        agenteInstagram: profile.instagram ?? "",
        agenteSitioWeb: profile.sitio_web ?? "",
      }));
    });
  }, []);

  const handleInvestigar = async () => {
    if (!loadedProperty) return;
    setError("");
    setLoadingFormatos(true);
    setFormatos([]);
    setFormatoSeleccionado(null);
    setGuion(null);
    setStep("form");

    try {
      const result = await buscarFormatosTrending({ ...form, amenities: [] });
      setFormatos(result.formatos);
      setStep("formatos");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "UNAUTHENTICATED") {
          setError("Necesitás iniciar sesión para usar esta feature.");
        } else {
          setError("Ocurrió un error al investigar tendencias. Intentá de nuevo.");
        }
      }
    } finally {
      setLoadingFormatos(false);
    }
  };

  const handleGenerarGuion = async () => {
    if (!loadedProperty || !formatoSeleccionado || formatos.length === 0) return;
    setError("");
    setLoadingGuion(true);

    try {
      const result = await generarGuion({ ...form, amenities: [] }, formatoSeleccionado);
      setGuion(result);
      setStep("guion");
      if (!isPro) {
        setUsage({ remaining: result.remaining, count: limit - result.remaining });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        setError("Necesitás iniciar sesión para usar esta feature.");
      } else if (err instanceof Error && err.message === "LIMIT_REACHED") {
        setError("Alcanzaste el límite de 5 generaciones del mes. Actualizá a PRO para continuar sin límites.");
      } else {
        setError("Ocurrió un error al generar el guion. Intentá de nuevo.");
      }
    } finally {
      setLoadingGuion(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setFormatos([]);
    setFormatoSeleccionado(null);
    setGuion(null);
    setError("");
  };

  const handleCopyEscena = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedEscena(idx);
    setTimeout(() => setCopiedEscena(null), 2000);
    toast.success("Copiado al portapapeles");
  };

  const handleCopySlide = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedSlide(idx);
    setTimeout(() => setCopiedSlide(null), 2000);
    toast.success("Copiado al portapapeles");
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Plan badge */}
      {planChecked && (
        <div
          className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isPro
              ? "bg-[#00d4d4]/10 text-[#0f3460] border-[#00d4d4]/30"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {isPro ? (
            <><SparklesIcon className="w-3.5 h-3.5" />Plan PRO — acceso completo</>
          ) : (
            <><LockIcon className="w-3.5 h-3.5" />Feature exclusiva del Plan PRO</>
          )}
        </div>
      )}

      {/* Propiedad + acción */}
      <div className="border border-[#0f3460]/10 rounded-xl p-5 sm:p-6 bg-card flex flex-col gap-5">
        <fieldset disabled={loadingFormatos} className="contents">

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

          {!planChecked ? (
            <Button
              disabled
              className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm bg-[#0f3460] text-white opacity-60"
            >
              <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
              Cargando...
            </Button>
          ) : !isPro ? (
            <LockedProGate checkoutUrl={checkoutUrl} />
          ) : (
            <Button
              onClick={handleInvestigar}
              disabled={loadingFormatos || !loadedProperty}
              className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
            >
              <TrendingUpIcon className="w-4 h-4" />
              {loadingFormatos ? "Investigando tendencias..." : "Investigar formatos trending"}
            </Button>
          )}

        </fieldset>
      </div>

      {/* Formatos trending */}
      {step !== "form" && formatos.length > 0 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
              Formatos que están funcionando ahora
            </h2>
            <p className="text-sm text-muted-foreground">
              Elegí el formato que más se adapte a tu propiedad y estilo
            </p>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {formatos.map((fmt) => (
              <FormatoCard
                key={fmt.id}
                formato={fmt}
                selected={formatoSeleccionado?.id === fmt.id}
                disabled={loadingGuion}
                onClick={() =>
                  setFormatoSeleccionado(formatoSeleccionado?.id === fmt.id ? null : fmt)
                }
              />
            ))}
          </div>

          {loadingGuion && (
            <p className="text-xs text-amber-600 font-medium">
              Generando guion... no cambies el formato hasta que termine.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGenerarGuion}
              disabled={loadingGuion || !formatoSeleccionado}
              className="w-full sm:w-auto h-12 sm:h-10 px-8 text-base sm:text-sm bg-[#0f3460] hover:bg-[#0f3460]/90 text-white"
            >
              {loadingGuion ? (
                <span className="flex items-center gap-2">
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                  Generando guion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <VideoIcon className="w-4 h-4" />
                  {formatoSeleccionado
                    ? `Generar guion — ${formatoSeleccionado.nombre}`
                    : "Seleccioná un formato"}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleInvestigar}
              disabled={loadingFormatos}
              className="w-full sm:w-auto h-12 sm:h-10 px-5 text-base sm:text-sm"
            >
              <span className="flex items-center gap-2">
                <RefreshCwIcon className="w-4 h-4" />
                Reinvestigar
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Guion */}
      {step === "guion" && guion && (
        <GuionDisplay
          guion={guion}
          copiedEscena={copiedEscena}
          copiedSlide={copiedSlide}
          onCopyEscena={handleCopyEscena}
          onCopySlide={handleCopySlide}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

/* ── Tarjeta de formato trending ─────────────────────────────────── */
function FormatoCard({
  formato,
  selected,
  onClick,
  disabled,
}: {
  formato: TrendingFormat;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`text-left border rounded-xl p-4 flex flex-col gap-3 transition-all ${
        selected
          ? "border-[#00d4d4] ring-2 ring-[#00d4d4]/30 bg-[#00d4d4]/5"
          : "border-[#0f3460]/10 bg-card"
      } ${disabled ? "opacity-50 cursor-not-allowed" : !selected ? "hover:border-[#0f3460]/25" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-bold text-[#0f3460] leading-tight">{formato.nombre}</span>
        {selected && (
          <span className="shrink-0 w-5 h-5 rounded-full bg-[#00d4d4] flex items-center justify-center">
            <CheckIcon className="w-3 h-3 text-white" />
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{formato.descripcion}</p>
      <div className="flex flex-col gap-1 border-t border-[#0f3460]/8 pt-2.5 mt-auto">
        <span className="text-[10px] font-semibold text-[#00d4d4] uppercase tracking-wide">Por qué funciona</span>
        <p className="text-xs text-[#0f3460]/80 leading-relaxed">{formato.por_que_funciona}</p>
      </div>
    </button>
  );
}

/* ── Guion completo ──────────────────────────────────────────────── */
function GuionDisplay({
  guion, copiedEscena, copiedSlide, onCopyEscena, onCopySlide, onReset,
}: {
  guion: GuionResult;
  copiedEscena: number | null;
  copiedSlide: number | null;
  onCopyEscena: (text: string, idx: number) => void;
  onCopySlide: (text: string, idx: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">Guion completo</h2>
          <p className="text-sm text-muted-foreground">
            {guion.formato_elegido} · {guion.reel.duracion_total}
          </p>
          <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="shrink-0 h-9 px-4 text-sm">
          <RefreshCwIcon className="w-4 h-4 mr-1.5" />
          Nuevo guion
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center shrink-0">
            <VideoIcon className="w-4 h-4 text-[#0f3460]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0f3460]">Guion del Reel</h3>
            <p className="text-xs text-muted-foreground">
              Instagram Reels · TikTok · {guion.reel.duracion_total}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {guion.reel.escenas.map((escena, idx) => (
            <EscenaCard
              key={idx}
              escena={escena}
              copied={copiedEscena === idx}
              onCopy={() => {
                const lines = [
                  `ESCENA ${escena.numero} · ${escena.duracion}`,
                  "", `🎤 QUÉ DECIR:`, escena.que_decir,
                  "", `📹 QUÉ MOSTRAR:`, escena.que_mostrar,
                ];
                if (escena.texto_pantalla) {
                  lines.push("", `✏️ TEXTO EN PANTALLA:`, escena.texto_pantalla);
                }
                onCopyEscena(lines.join("\n"), idx);
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00d4d4]/15 border border-[#00d4d4]/30 flex items-center justify-center shrink-0">
            <CameraIcon className="w-4 h-4 text-[#0f3460]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0f3460]">Guion de Story</h3>
            <p className="text-xs text-muted-foreground">Instagram Stories · 3 slides complementarios</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {guion.story.slides.map((slide, idx) => (
            <SlideCard
              key={idx}
              slide={slide}
              copied={copiedSlide === idx}
              onCopy={() => {
                const text = [
                  `SLIDE ${slide.numero}`, "",
                  slide.texto_principal, slide.texto_secundario,
                  "", `💡 Acción: ${slide.accion}`,
                ].join("\n");
                onCopySlide(text, idx);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta de escena ───────────────────────────────────────────── */
function EscenaCard({ escena, copied, onCopy }: { escena: Escena; copied: boolean; onCopy: () => void }) {
  return (
    <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold text-[#0f3460] tabular-nums leading-none w-7 shrink-0">
            {String(escena.numero).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">{escena.duracion}</span>
        </div>
        {escena.numero === 1 && (
          <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
            Hook
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-4 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-[#0f3460] uppercase tracking-wide">🎤 Qué decir</span>
            <p className="text-sm leading-relaxed text-card-foreground">{escena.que_decir}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-[#0f3460] uppercase tracking-wide">📹 Qué mostrar</span>
            <p className="text-sm leading-relaxed text-card-foreground">{escena.que_mostrar}</p>
          </div>
        </div>
        {escena.texto_pantalla && (
          <div className="flex flex-col gap-1.5 border-t border-[#0f3460]/8 pt-3">
            <span className="text-[10px] font-semibold text-[#0f3460] uppercase tracking-wide">✏️ Texto en pantalla</span>
            <p className="text-sm text-card-foreground font-medium">{escena.texto_pantalla}</p>
          </div>
        )}
        <Button type="button" variant="outline" className="self-end h-9 px-4 text-sm" onClick={onCopy}>
          {copied ? (
            <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4 text-green-600" />Copiado</span>
          ) : (
            <span className="flex items-center gap-2"><CopyIcon className="w-4 h-4" />Copiar escena</span>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ── Tarjeta de slide ────────────────────────────────────────────── */
function SlideCard({ slide, copied, onCopy }: { slide: Slide; copied: boolean; onCopy: () => void }) {
  return (
    <div className="border border-[#00d4d4]/25 rounded-xl overflow-hidden shadow-sm bg-card flex flex-col">
      <div className="px-4 py-2.5 bg-[#00d4d4]/8 border-b border-[#00d4d4]/20 flex items-center gap-2">
        <span className="text-sm font-bold text-[#0f3460]">Slide {slide.numero}</span>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-[#0f3460] leading-snug">{slide.texto_principal}</p>
          {slide.texto_secundario && (
            <p className="text-xs text-muted-foreground leading-relaxed">{slide.texto_secundario}</p>
          )}
        </div>
        <div className="flex flex-col gap-1 border-t border-[#0f3460]/8 pt-2.5 mt-auto">
          <span className="text-[10px] font-semibold text-[#00d4d4] uppercase tracking-wide">Acción / Sticker</span>
          <p className="text-xs text-[#0f3460]/80">{slide.accion}</p>
        </div>
        <Button type="button" variant="outline" className="self-end h-9 px-4 text-sm mt-2" onClick={onCopy}>
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

/* ── Gate PRO ────────────────────────────────────────────────────── */
function LockedProGate({ checkoutUrl }: { checkoutUrl: string }) {
  return (
    <div className="border-2 border-dashed border-[#00d4d4]/40 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#00d4d4]/5">
      <div className="w-12 h-12 rounded-2xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center shrink-0">
        <LockIcon className="w-5 h-5 text-[#0f3460]/70" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="font-bold text-[#0f3460] text-base">Guion para Reels — Solo Plan PRO</p>
        <p className="text-sm text-muted-foreground">
          Investigación de tendencias con IA + guion escena por escena para Reels y Stories.
          Pasate al PRO para empezar a grabar hoy.
        </p>
      </div>
      <Button
        asChild
        className="w-full sm:w-auto h-10 px-5 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white text-sm font-semibold shrink-0"
      >
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <SparklesIcon className="w-4 h-4" />
          Upgrade a PRO
        </a>
      </Button>
    </div>
  );
}
