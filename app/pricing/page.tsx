"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  CheckIcon,
  XIcon,
  SparklesIcon,
  ZapIcon,
  ShieldCheckIcon,
  UsersRoundIcon,
  BrainCircuitIcon,
  StarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE_PRO =
  "https://propia.lemonsqueezy.com/checkout/buy/4c8591f9-a016-4222-a838-7cf935c84ed2";
const BASE_PRO_MAX =
  "https://propia.lemonsqueezy.com/checkout/buy/999a3318-b1c8-40d1-a379-2039fe777b1d";

function buildCheckoutUrl(base: string, plan: string, userId?: string | null): string {
  const params = new URLSearchParams();
  params.set("checkout[custom][plan]", plan);
  if (userId) params.set("checkout[custom][user_id]", userId);
  return `${base}?${params.toString()}`;
}

const PRO_MONTHLY = 29;
const PRO_MAX_MONTHLY = 59;
const PRO_ANNUAL_MONTHLY = Math.round(PRO_MONTHLY * 0.8); // $39/mes
const PRO_MAX_ANNUAL_MONTHLY = Math.round(PRO_MAX_MONTHLY * 0.8); // $79/mes
const PRO_ANNUAL_SAVINGS = PRO_MONTHLY * 12 - PRO_ANNUAL_MONTHLY * 12;
const PRO_MAX_ANNUAL_SAVINGS = PRO_MAX_MONTHLY * 12 - PRO_MAX_ANNUAL_MONTHLY * 12;

type FeatureValue = boolean | string;

const FEATURES: {
  text: string;
  free: FeatureValue;
  pro: FeatureValue;
  proMax: FeatureValue;
}[] = [
  { text: "Posts generados por mes", free: "5 posts gratis", pro: "Ilimitados", proMax: "Ilimitados" },
  { text: "Formatos de post (Instagram, Facebook, LinkedIn)", free: true, pro: true, proMax: true },
  { text: "Historial de propiedades guardadas", free: true, pro: true, proMax: true },
  { text: "Descripción para portal — versión corta", free: true, pro: true, proMax: true },
  { text: "Descripción para portal — versión larga (~400 palabras)", free: false, pro: true, proMax: true },
  { text: "Calendario de contenido", free: "Preview 3 días", pro: "30 días completo", proMax: "30 días completo" },
  { text: "Guión para Reels con tendencias en tiempo real", free: false, pro: true, proMax: true },
  { text: "Análisis de tendencias del mercado", free: false, pro: true, proMax: true },
  { text: "Generador de Ads — básico", free: false, pro: "1 foto · 3 formatos (Feed, Story, Banner) · 4 estilos", proMax: true },
  { text: "Generador de Ads — avanzado", free: false, pro: false, proMax: "Hasta 3 fotos · selector de color completo · descarga en ZIP" },
  { text: "Carruseles de Instagram (5 slides 1080×1080)", free: false, pro: false, proMax: "Foto + stats + detalles + ubicación + contacto · PNG y ZIP" },
  { text: "Publicación directa a Instagram y Facebook", free: false, pro: false, proMax: "Próximamente" },
  { text: "Soporte prioritario por email", free: false, pro: true, proMax: true },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Puedo cancelar mi suscripción cuando quiera?",
    a: "Sí, podés cancelar en cualquier momento desde tu cuenta en Lemon Squeezy. No hay permanencia mínima ni cargos adicionales por cancelación. Tu plan sigue activo hasta el final del período ya pagado.",
  },
  {
    q: "¿Los textos funcionan para el mercado latinoamericano?",
    a: "Completamente. PropIA genera contenido en español rioplatense y neutro, adaptado para los principales portales de Argentina, España y Latinoamérica: Zonaprop, Fotocasa, Idealista y MercadoLibre.",
  },
  {
    q: "¿Qué pasa cuando llego al límite del plan gratuito?",
    a: "Podés seguir viendo los posts generados anteriormente, pero no podrás crear nuevos hasta que se renueve el mes o actualices al plan PRO para tener generaciones ilimitadas.",
  },
  {
    q: "¿Los textos son únicos para cada propiedad?",
    a: "Sí. Cada texto se genera con los datos específicos de tu propiedad: tipo, ubicación, superficie, precio y características. No son plantillas — la IA crea contenido original y personalizado para cada inmueble.",
  },
];

function FeatureCell({
  value,
  variant,
}: {
  value: FeatureValue;
  variant: "free" | "pro" | "proMax";
}) {
  if (value === true) {
    return (
      <CheckIcon
        className={`w-5 h-5 mx-auto ${
          variant === "proMax"
            ? "text-amber-500"
            : variant === "pro"
            ? "text-emerald-500"
            : "text-emerald-400"
        }`}
      />
    );
  }
  if (value === false) {
    return <XIcon className="w-5 h-5 mx-auto text-slate-300" />;
  }
  return (
    <span
      className={`text-xs font-semibold ${
        variant === "proMax"
          ? "text-amber-600"
          : variant === "pro"
          ? "text-[#00c9c9]"
          : "text-slate-500"
      }`}
    >
      {value}
    </span>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useUser();

  const proPrice = isAnnual ? PRO_ANNUAL_MONTHLY : PRO_MONTHLY;
  const proMaxPrice = isAnnual ? PRO_MAX_ANNUAL_MONTHLY : PRO_MAX_MONTHLY;

  const checkoutUrlPro = buildCheckoutUrl(BASE_PRO, "pro", user?.id);
  const checkoutUrlProMax = buildCheckoutUrl(BASE_PRO_MAX, "pro_max", user?.id);

  return (
    <div className="flex flex-col min-h-screen">

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section className="bg-[#0f3460] py-16 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 bg-[#00c9c9]/15 border border-[#00c9c9]/30 rounded-full px-4 py-1.5 text-sm font-semibold text-[#00c9c9]">
            <ZapIcon className="w-3.5 h-3.5" />
            Planes y precios
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Elegí tu plan
          </h1>

          <p className="text-base sm:text-lg text-white/65 max-w-lg leading-relaxed">
            Empezá gratis y escalá cuando estés listo. Sin tarjeta de crédito
            requerida para el plan gratuito.
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-2 mt-1 bg-white/8 border border-white/15 rounded-full px-5 py-2">
            <div className="flex -space-x-1.5">
              {["#4f7ba4", "#2d6a8f", "#5b8db8", "#3a7aab"].map((c, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-[#0f3460]"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="text-white/80 text-sm font-medium">
              Más de{" "}
              <span className="text-[#00c9c9] font-bold">50 agentes</span>{" "}
              ya usan PropIA
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRUST STRIP
      ══════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-100 py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <BrainCircuitIcon className="w-4 h-4 text-[#0f3460] shrink-0" />
            <span>
              Funciona con{" "}
              <span className="font-semibold text-slate-700">
                Claude AI de Anthropic
              </span>
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Garantía de devolución 7 días</span>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <UsersRoundIcon className="w-4 h-4 text-[#0f3460] shrink-0" />
            <span>+50 agentes activos</span>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1 font-medium text-slate-700">5.0</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TOGGLE + CARDS
      ══════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Toggle mensual / anual */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span
              className={`text-sm font-medium transition-colors ${
                !isAnnual ? "text-[#0f3460]" : "text-slate-400"
              }`}
            >
              Mensual
            </span>

            <button
              onClick={() => setIsAnnual((v) => !v)}
              aria-label="Cambiar entre facturación mensual y anual"
              className={`relative w-12 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c9c9] ${
                isAnnual ? "bg-[#0f3460]" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  isAnnual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium transition-colors ${
                  isAnnual ? "text-[#0f3460]" : "text-slate-400"
                }`}
              >
                Anual
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                −20%
              </span>
            </div>
          </div>

          {isAnnual && (
            <p className="text-center text-sm text-emerald-600 font-medium -mt-6 mb-8">
              Ahorrás hasta{" "}
              <span className="font-bold">${PRO_MAX_ANNUAL_SAVINGS}/año</span>{" "}
              con el plan anual
            </p>
          )}

          {/* ── Tarjetas de plan ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 items-start">

            {/* Plan Free */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-5 sm:p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Plan Free
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-4xl font-extrabold text-[#0f3460]">
                      $0
                    </span>
                    <span className="text-slate-400 text-base">/mes</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    5 generaciones gratuitas para empezar.
                  </p>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="h-11 text-sm font-semibold border-[#0f3460]/20 text-[#0f3460] hover:bg-[#0f3460]/5 hover:border-[#0f3460]/40"
                >
                  <Link href="/sign-in">Empezar gratis</Link>
                </Button>

                <div className="h-px bg-slate-100" />

                <ul className="flex flex-col gap-2.5">
                  {FEATURES.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5">
                      {f.free === true ? (
                        <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : f.free === false ? (
                        <XIcon className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      ) : (
                        <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-xs leading-snug ${
                          f.free !== false ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {typeof f.free === "string"
                          ? `${f.text}: ${f.free}`
                          : f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Plan PRO */}
            <div className="bg-white rounded-2xl border-2 border-[#00c9c9] shadow-2xl shadow-[#00c9c9]/15 flex flex-col relative mt-5 sm:mt-0 sm:scale-[1.05] sm:z-10">
              {/* "Más popular" badge */}
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="inline-flex items-center gap-1.5 bg-[#00c9c9] text-[#0f3460] text-xs font-bold px-4 py-1.5 rounded-full shadow-md animate-pulse">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Más popular
                </span>
              </div>

              {/* Top glow */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#00c9c9]/60 via-[#00c9c9] to-[#00c9c9]/60 rounded-t-[14px]" />

              <div className="p-5 sm:p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#00c9c9] uppercase tracking-widest">
                    Plan PRO
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-4xl font-extrabold text-[#0f3460]">
                      ${proPrice}
                    </span>
                    <span className="text-slate-400 text-base">/mes</span>
                    {isAnnual && (
                      <span className="ml-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full self-center">
                        Antes ${PRO_MONTHLY}
                      </span>
                    )}
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ahorrás ${PRO_ANNUAL_SAVINGS}/año
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    Para agentes que publican contenido todos los días.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    className="h-11 text-sm font-semibold bg-[#0f3460] hover:bg-[#0f3460]/90 text-white shadow-md"
                  >
                    <a href={checkoutUrlPro} target="_blank" rel="noopener noreferrer">
                      Comenzar prueba gratis 7 días
                    </a>
                  </Button>
                  <p className="text-center text-xs text-slate-400">
                    Sin cargo hasta que terminen los 7 días
                  </p>
                </div>

                <div className="h-px bg-slate-100" />

                <ul className="flex flex-col gap-2.5">
                  {FEATURES.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5">
                      {f.pro === false ? (
                        <XIcon className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      ) : (
                        <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs leading-snug ${f.pro === false ? "text-slate-400" : "text-slate-700"}`}>
                        {typeof f.pro === "string"
                          ? `${f.text}: ${f.pro}`
                          : f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Plan PRO MAX */}
            <div className="bg-white rounded-2xl border-2 border-[#f59e0b] shadow-xl flex flex-col relative mt-5 sm:mt-0">
              {/* "Más completo" badge */}
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="inline-flex items-center gap-1.5 bg-[#f59e0b] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Más completo
                </span>
              </div>

              {/* Top glow */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#f59e0b]/60 via-[#f59e0b] to-[#f59e0b]/60 rounded-t-[14px]" />

              <div className="p-5 sm:p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest">
                    Plan PRO MAX
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-4xl font-extrabold text-[#0f3460]">
                      ${proMaxPrice}
                    </span>
                    <span className="text-slate-400 text-base">/mes</span>
                    {isAnnual && (
                      <span className="ml-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full self-center">
                        Antes ${PRO_MAX_MONTHLY}
                      </span>
                    )}
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ahorrás ${PRO_MAX_ANNUAL_SAVINGS}/año
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    Todo el plan PRO más Ads avanzados, Carruseles de Instagram (5 slides 1080×1080 con tu marca) y descarga en ZIP.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    className="h-11 text-sm font-semibold bg-[#f59e0b] hover:bg-[#e08e00] text-white shadow-md border-0"
                  >
                    <a href={checkoutUrlProMax} target="_blank" rel="noopener noreferrer">
                      Comenzar prueba gratis 7 días
                    </a>
                  </Button>
                  <p className="text-center text-xs text-slate-400">
                    Sin cargo hasta que terminen los 7 días
                  </p>
                </div>

                <div className="h-px bg-slate-100" />

                <ul className="flex flex-col gap-2.5">
                  {FEATURES.map((f) => (
                    <li key={f.text} className="flex items-start gap-2.5">
                      <CheckIcon className={`w-4 h-4 shrink-0 mt-0.5 ${
                        f.text === "Generador de Ads para Meta Ads"
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }`} />
                      <span className="text-xs text-slate-700 leading-snug">
                        {typeof f.proMax === "string"
                          ? `${f.text}: ${f.proMax}`
                          : f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMPARACIÓN DE FEATURES
      ══════════════════════════════════════════════ */}
      <section className="bg-white border-t border-slate-100 py-14 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0f3460] text-center mb-2">
            Comparación detallada
          </h2>
          <p className="text-slate-500 text-center text-sm mb-10">
            Todo lo que incluye cada plan
          </p>

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] bg-slate-50 border-b border-slate-200">
              <div className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Feature
              </div>
              <div className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest text-center border-l border-slate-200 w-24">
                Free
              </div>
              <div className="px-5 py-3 text-xs font-bold text-[#00c9c9] uppercase tracking-widest text-center border-l border-slate-200 bg-[#00c9c9]/5 w-28">
                PRO ✦
              </div>
              <div className="px-5 py-3 text-xs font-bold text-[#f59e0b] uppercase tracking-widest text-center border-l border-slate-200 bg-[#f59e0b]/5 w-32">
                PRO MAX ✦
              </div>
            </div>

            {/* Rows */}
            {FEATURES.map((f, idx) => (
              <div
                key={f.text}
                className={`grid grid-cols-[1fr_auto_auto_auto] ${
                  idx < FEATURES.length - 1 ? "border-b border-slate-100" : ""
                } ${idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}`}
              >
                <div className="px-4 py-3.5 text-sm text-slate-700 font-medium flex items-center">
                  {f.text}
                </div>
                <div className="px-5 py-3.5 flex items-center justify-center border-l border-slate-100 w-24">
                  <FeatureCell value={f.free} variant="free" />
                </div>
                <div className="px-5 py-3.5 flex items-center justify-center border-l border-slate-100 bg-[#00c9c9]/5 w-28">
                  <FeatureCell value={f.pro} variant="pro" />
                </div>
                <div className="px-5 py-3.5 flex items-center justify-center border-l border-slate-100 bg-[#f59e0b]/5 w-32">
                  <FeatureCell value={f.proMax} variant="proMax" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          GARANTÍA + CONFIANZA
      ══════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-t border-slate-100 py-14 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Garantía */}
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1.5">
                Garantía de satisfacción total
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Si dentro de los primeros{" "}
                <strong className="text-slate-700">7 días</strong> el plan no
                cumple tus expectativas, te devolvemos el dinero sin hacer
                preguntas. Podés cancelar en cualquier momento.
              </p>
            </div>
          </div>

          {/* Claude AI */}
          <div className="bg-[#0f3460] rounded-2xl shadow-sm p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-full bg-[#00c9c9]/10 blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative w-12 h-12 rounded-xl bg-[#00c9c9]/15 border border-[#00c9c9]/30 flex items-center justify-center shrink-0">
              <BrainCircuitIcon className="w-6 h-6 text-[#00c9c9]" />
            </div>
            <div className="relative">
              <h3 className="text-base font-bold text-white mb-1.5">
                Funciona con Claude AI de Anthropic
              </h3>
              <p className="text-sm text-white/65 leading-relaxed">
                PropIA usa{" "}
                <span className="text-[#00c9c9] font-semibold">Claude Sonnet</span>,
                el modelo de IA más avanzado de Anthropic, para generar contenido
                inmobiliario de máxima calidad, natural y sin errores.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SOCIAL PROOF
      ══════════════════════════════════════════════ */}
      <section className="bg-white border-t border-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            Lo que dicen nuestros usuarios
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                quote:
                  "Paso de 2 horas redactando posts a 60 segundos. Mis clientes ven más propiedades porque publico todos los días.",
                name: "M. García",
                role: "Agente independiente, CABA",
              },
              {
                quote:
                  "El calendario de contenido me salvó. Antes improvisaba, ahora tengo 30 días planificados en 5 minutos.",
                name: "L. Rodríguez",
                role: "Inmobiliaria, Córdoba",
              },
              {
                quote:
                  "Probé otras herramientas pero PropIA entiende el mercado inmobiliario. Los textos suenan naturales, no robóticos.",
                name: "C. Martínez",
                role: "Broker, Rosario",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 text-left"
              >
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-semibold text-[#0f3460]">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-t border-slate-100 py-14 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-10 sm:gap-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f3460]">
              Preguntas frecuentes
            </h2>
            <div className="h-1 w-12 bg-[#00c9c9] rounded-full" />
          </div>

          <div className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            {FAQ.map((item, idx) => (
              <div
                key={item.q}
                className={idx < FAQ.length - 1 ? "border-b border-slate-100" : ""}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-[#0f3460] text-sm sm:text-base leading-snug">
                    {item.q}
                  </span>
                  <span
                    className={`text-[#00c9c9] text-xl font-light shrink-0 transition-transform ${
                      openFaq === idx ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 sm:px-6 pb-5 text-sm text-slate-500 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="flex flex-col items-center gap-4 pt-2 text-center">
            <p className="text-sm text-slate-500">
              ¿Tenés otra pregunta? Escribinos a{" "}
              <a
                href="mailto:hola@propia.online"
                className="text-[#0f3460] font-medium underline underline-offset-2"
              >
                hola@propia.online
              </a>
            </p>
            <Button
              asChild
              className="h-11 px-8 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white font-semibold text-sm"
            >
              <a href={checkoutUrlPro} target="_blank" rel="noopener noreferrer">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Empezar prueba gratis 7 días
              </a>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
