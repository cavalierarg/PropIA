"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  buscarTendencias,
  type TendenciasResult,
  type FormatoEngagement,
  type HashtagGroup,
  type TemaAgente,
  type RecomendacionHoy,
} from "@/lib/actions/tendencias.actions";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  GlobeIcon,
  HashIcon,
  LockIcon,
  RefreshCwIcon,
  SearchIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";

const COLORES_RED: Record<string, string> = {
  Instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  Facebook: "bg-blue-600 text-white",
  LinkedIn: "bg-sky-700 text-white",
};

const LOADING_TIPS = [
  "Buscando tendencias en Instagram...",
  "Analizando engagement en Facebook y LinkedIn...",
  "Investigando hashtags inmobiliarios esta semana...",
  "Identificando temas de agentes exitosos...",
  "Elaborando recomendación para hoy...",
];

export default function TendenciasContent() {
  const { user } = useUser();
  const [resultado, setResultado] = useState<TendenciasResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTip, setLoadingTip] = useState(0);
  const [error, setError] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [planChecked, setPlanChecked] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState<string | null>(null);
  const [copiedHoy, setCopiedHoy] = useState(false);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][plan]=pro&checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  useEffect(() => {
    getUserPlan().then((plan) => {
      setIsPro(plan === "pro" || plan === "pro_max");
      setPlanChecked(true);
    });
  }, []);

  // Rotate loading tips while fetching
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingTip((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalizar = async () => {
    setError("");
    setLoading(true);
    setLoadingTip(0);
    try {
      const res = await buscarTendencias();
      setResultado(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "UNAUTHENTICATED") {
          setError("Necesitás iniciar sesión para usar esta feature.");
        } else {
          setError("Ocurrió un error al investigar tendencias. Intentá de nuevo.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHashtags = async (group: HashtagGroup) => {
    const text = group.hashtags.join(" ");
    await navigator.clipboard.writeText(text);
    setCopiedHashtags(group.red_social);
    setTimeout(() => setCopiedHashtags(null), 2000);
  };

  const handleCopyHoy = async () => {
    if (!resultado) return;
    const r = resultado.recomendacion_hoy;
    const text = [
      `📌 Qué publicar hoy: ${r.tipo_contenido}`,
      ``,
      `Tema: ${r.tema}`,
      `Formato: ${r.formato}`,
      ``,
      `Hashtags: ${r.hashtags_sugeridos.join(" ")}`,
      ``,
      `💡 Tip: ${r.tip_extra}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopiedHoy(true);
    setTimeout(() => setCopiedHoy(false), 2000);
  };

  const fechaFormateada = resultado?.fecha_analisis
    ? new Date(resultado.fecha_analisis).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

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
            <>
              <SparklesIcon className="w-3.5 h-3.5" />
              Plan PRO — análisis en tiempo real
            </>
          ) : (
            <>
              <LockIcon className="w-3.5 h-3.5" />
              Feature exclusiva del Plan PRO
            </>
          )}
        </div>
      )}

      {/* Estado inicial / gate / botón */}
      {!resultado && (
        <div className="border border-[#0f3460]/10 rounded-xl p-6 sm:p-8 bg-card flex flex-col gap-6">
          {/* Info de qué analiza */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <TrendingUpIcon className="w-5 h-5 text-[#0f3460]" />,
                titulo: "Formatos con más engagement",
                desc: "Los 3 tipos de contenido que más interacciones generan hoy",
              },
              {
                icon: <HashIcon className="w-5 h-5 text-[#0f3460]" />,
                titulo: "Hashtags trending esta semana",
                desc: "Los más usados en Instagram, Facebook y LinkedIn",
              },
              {
                icon: <UsersIcon className="w-5 h-5 text-[#0f3460]" />,
                titulo: "Temas de agentes exitosos",
                desc: "Qué están publicando los agentes con más alcance",
              },
              {
                icon: <CalendarIcon className="w-5 h-5 text-[#0f3460]" />,
                titulo: "Recomendación para hoy",
                desc: "Qué publicar exactamente hoy para maximizar resultados",
              },
            ].map((item) => (
              <div
                key={item.titulo}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#0f3460]/4"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00d4d4]/15 border border-[#00d4d4]/25 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[#0f3460]">
                    {item.titulo}
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          {!planChecked ? (
            <Button
              disabled
              className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm bg-[#0f3460] text-white opacity-60"
            >
              Cargando...
            </Button>
          ) : !isPro ? (
            <LockedProGate checkoutUrl={checkoutUrl} />
          ) : loading ? (
            <LoadingState tip={LOADING_TIPS[loadingTip]} />
          ) : (
            <Button
              onClick={handleAnalizar}
              className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm bg-[#0f3460] hover:bg-[#0f3460]/90 text-white"
            >
              <span className="flex items-center gap-2">
                <GlobeIcon className="w-4 h-4" />
                Analizar tendencias ahora
              </span>
            </Button>
          )}
        </div>
      )}

      {/* Loading cuando ya hay resultado previo */}
      {resultado && loading && (
        <LoadingState tip={LOADING_TIPS[loadingTip]} />
      )}

      {/* Resultados */}
      {resultado && !loading && (
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Header con timestamp y botón actualizar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <SearchIcon className="w-3.5 h-3.5" />
                <span>Análisis generado con web search en tiempo real</span>
              </div>
              {fechaFormateada && (
                <span className="text-xs text-muted-foreground">
                  Actualizado: {fechaFormateada}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalizar}
              disabled={loading}
              className="w-full sm:w-auto h-9 px-4 text-sm shrink-0"
            >
              <RefreshCwIcon className="w-4 h-4 mr-1.5" />
              Actualizar análisis
            </Button>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          {/* ── 1. Formatos top ── */}
          <ResultSection
            icon={<TrendingUpIcon className="w-5 h-5 text-[#0f3460]" />}
            titulo="Formatos con más engagement hoy"
            subtitulo="Los 3 tipos de contenido inmobiliario que más interacciones generan"
          >
            <div className="flex flex-col gap-4">
              {resultado.formatos_top.map((fmt) => (
                <FormatoCard key={fmt.posicion} formato={fmt} />
              ))}
            </div>
          </ResultSection>

          {/* ── 2. Hashtags ── */}
          <ResultSection
            icon={<HashIcon className="w-5 h-5 text-[#0f3460]" />}
            titulo="Hashtags inmobiliarios más usados esta semana"
            subtitulo="Usá estos hashtags para aumentar el alcance de tus publicaciones"
          >
            <div className="flex flex-col gap-4">
              {resultado.hashtags.map((group) => (
                <HashtagGroupCard
                  key={group.red_social}
                  group={group}
                  copied={copiedHashtags === group.red_social}
                  onCopy={() => handleCopyHashtags(group)}
                />
              ))}
            </div>
          </ResultSection>

          {/* ── 3. Temas de agentes ── */}
          <ResultSection
            icon={<UsersIcon className="w-5 h-5 text-[#0f3460]" />}
            titulo="Temas que más comparten los agentes exitosos"
            subtitulo="Inspirate en lo que está funcionando para los mejores del sector"
          >
            <div className="flex flex-col gap-3">
              {resultado.temas_agentes.map((tema, idx) => (
                <TemaCard key={idx} tema={tema} index={idx} />
              ))}
            </div>
          </ResultSection>

          {/* ── 4. Recomendación de hoy ── */}
          <ResultSection
            icon={<ZapIcon className="w-5 h-5 text-[#0f3460]" />}
            titulo="Recomendación: qué publicar hoy"
            subtitulo="Acción concreta para maximizar tu alcance en redes hoy mismo"
            highlight
          >
            <RecomendacionCard
              rec={resultado.recomendacion_hoy}
              copied={copiedHoy}
              onCopy={handleCopyHoy}
            />
          </ResultSection>
        </div>
      )}
    </div>
  );
}

/* ── Sección envoltorio ──────────────────────────────────────────── */
function ResultSection({
  icon,
  titulo,
  subtitulo,
  children,
  highlight = false,
}: {
  icon: React.ReactNode;
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            highlight
              ? "bg-[#00d4d4]/20 border border-[#00d4d4]/40"
              : "bg-[#0f3460]/8 border border-[#0f3460]/15"
          }`}
        >
          {icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-bold text-[#0f3460] sm:text-lg leading-snug">
            {titulo}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {subtitulo}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Formato card ────────────────────────────────────────────────── */
function FormatoCard({ formato }: { formato: FormatoEngagement }) {
  const medals: Record<number, string> = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };
  return (
    <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center gap-3">
        <span className="text-xl leading-none shrink-0">{medals[formato.posicion] ?? `#${formato.posicion}`}</span>
        <span className="text-sm font-bold text-[#0f3460]">{formato.nombre}</span>
      </div>
      <div className="p-4 flex flex-col gap-3 bg-card">
        <p className="text-sm text-card-foreground leading-relaxed">
          {formato.descripcion}
        </p>
        <div className="flex flex-col gap-1.5 border-t border-[#0f3460]/8 pt-3">
          <span className="text-[10px] font-bold text-[#00d4d4] uppercase tracking-wide">
            Por qué funciona ahora
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {formato.por_que_funciona}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 bg-[#0f3460]/4 rounded-lg p-3">
          <span className="text-[10px] font-bold text-[#0f3460] uppercase tracking-wide">
            Ejemplo de hook
          </span>
          <p className="text-sm text-[#0f3460] italic leading-relaxed">
            &ldquo;{formato.ejemplo_hook}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Hashtag group card ──────────────────────────────────────────── */
function HashtagGroupCard({
  group,
  copied,
  onCopy,
}: {
  group: HashtagGroup;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between gap-3">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            COLORES_RED[group.red_social] ?? "bg-gray-100 text-gray-800"
          }`}
        >
          {group.red_social}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-xs text-muted-foreground hover:text-[#0f3460]"
          onClick={onCopy}
        >
          {copied ? (
            <span className="flex items-center gap-1.5">
              <CheckIcon className="w-3.5 h-3.5 text-green-600" />
              Copiado
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <CopyIcon className="w-3.5 h-3.5" />
              Copiar todos
            </span>
          )}
        </Button>
      </div>
      <div className="p-4 flex flex-wrap gap-2 bg-card">
        {group.hashtags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium bg-[#0f3460]/8 text-[#0f3460] border border-[#0f3460]/15 rounded-full px-3 py-1"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Tema card ───────────────────────────────────────────────────── */
function TemaCard({ tema, index }: { tema: TemaAgente; index: number }) {
  return (
    <div className="flex items-start gap-3 p-4 border border-[#0f3460]/10 rounded-xl bg-card shadow-sm">
      <span className="w-6 h-6 rounded-full bg-[#0f3460] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {index + 1}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-[#0f3460]">{tema.tema}</span>
        <span className="text-xs text-muted-foreground leading-relaxed">
          {tema.descripcion}
        </span>
      </div>
    </div>
  );
}

/* ── Recomendación de hoy ────────────────────────────────────────── */
function RecomendacionCard({
  rec,
  copied,
  onCopy,
}: {
  rec: RecomendacionHoy;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="border-2 border-[#00d4d4]/50 rounded-xl overflow-hidden shadow-md">
      <div className="h-1 bg-gradient-to-r from-[#00d4d4]/60 via-[#00d4d4] to-[#00d4d4]/60" />
      <div className="p-5 sm:p-6 flex flex-col gap-5 bg-card">
        {/* Tipo + Tema */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-[#0f3460] text-white rounded-full px-3 py-1">
              {rec.tipo_contenido}
            </span>
          </div>
          <p className="text-base font-bold text-[#0f3460] leading-snug">
            {rec.tema}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {rec.formato}
          </p>
        </div>

        {/* Hashtags */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-[#00d4d4] uppercase tracking-wide">
            Hashtags sugeridos
          </span>
          <div className="flex flex-wrap gap-2">
            {rec.hashtags_sugeridos.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium bg-[#00d4d4]/10 text-[#0f3460] border border-[#00d4d4]/30 rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tip extra */}
        <div className="flex items-start gap-3 bg-[#00d4d4]/8 border border-[#00d4d4]/25 rounded-lg p-3">
          <ZapIcon className="w-4 h-4 text-[#00d4d4] shrink-0 mt-0.5" />
          <p className="text-sm text-[#0f3460] leading-relaxed">
            {rec.tip_extra}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="self-end h-10 px-5 text-sm border-[#0f3460]/20 hover:bg-[#0f3460]/5"
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
              Copiar recomendación
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ── Loading state ───────────────────────────────────────────────── */
function LoadingState({ tip }: { tip: string }) {
  return (
    <div className="border border-[#0f3460]/10 rounded-xl p-8 bg-card flex flex-col items-center gap-5 text-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#0f3460]/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#00d4d4] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <GlobeIcon className="w-6 h-6 text-[#0f3460]" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-[#0f3460]">
          Investigando en tiempo real
        </p>
        <p className="text-xs text-muted-foreground min-h-[1.25rem] transition-all">
          {tip}
        </p>
      </div>
      <p className="text-xs text-muted-foreground/60 max-w-xs">
        La búsqueda web puede tardar entre 20 y 40 segundos
      </p>
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
        <p className="font-bold text-[#0f3460] text-base">
          Tendencias del Mercado — Solo Plan PRO
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Análisis en tiempo real con web search de los formatos, hashtags y
          temas que más engagement generan hoy en el sector inmobiliario.
        </p>
      </div>
      <Button
        asChild
        className="w-full sm:w-auto h-10 px-5 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white text-sm font-semibold shrink-0"
      >
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <SparklesIcon className="w-4 h-4" />
          Upgrade a PRO
        </a>
      </Button>
    </div>
  );
}
