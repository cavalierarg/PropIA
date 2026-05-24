import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { getUsage } from "@/lib/actions/usage.actions";
import { getUserProperties } from "@/lib/actions/properties.actions";
import {
  FileText,
  CalendarDays,
  Home,
  Video,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  TrendingUp,
  Building2,
  BarChart3,
} from "lucide-react";
import LandingPage from "@/components/LandingPage";
import { Greeting } from "@/components/Greeting";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 2) return "hace un momento";
  if (diffMinutes < 60) return `hace ${diffMinutes} minutos`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
}

type Feature = {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string | null;
  badgeColor: "amber" | "gold" | null;
  accent: string;
};

const FEATURES: Feature[] = [
  {
    href: "/posts",
    icon: FileText,
    title: "Generar Posts",
    description: "5 posts para Instagram, Facebook y LinkedIn generados con IA en segundos.",
    badge: null,
    badgeColor: null,
    accent: "#0f3460",
  },
  {
    href: "/calendario",
    icon: CalendarDays,
    title: "Calendario de Contenido",
    description: "30 días de contenido planificado para mantener tus redes activas.",
    badge: "PRO",
    badgeColor: "amber",
    accent: "#0f3460",
  },
  {
    href: "/descripcion",
    icon: Home,
    title: "Descripción para Portal",
    description: "Textos optimizados para Zonaprop, Idealista, Fotocasa y más portales.",
    badge: "PRO",
    badgeColor: "amber",
    accent: "#0f3460",
  },
  {
    href: "/reels",
    icon: Video,
    title: "Guión para Reels",
    description: "Guiones escena por escena para videos inmobiliarios que enganchen.",
    badge: "PRO",
    badgeColor: "amber",
    accent: "#0f3460",
  },
  {
    href: "/tendencias",
    icon: TrendingUp,
    title: "Tendencias del Mercado",
    description: "Análisis en tiempo real para publicar cuando el mercado lo pide.",
    badge: "PRO",
    badgeColor: "amber",
    accent: "#0f3460",
  },
  {
    href: "/ads-generator",
    icon: Layers,
    title: "Generador de Ads",
    description: "Ads profesionales para Meta Ads en 4 estilos y 3 formatos.",
    badge: "PRO",
    badgeColor: "amber",
    accent: "#0f3460",
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    const checkoutUrl =
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ??
      "https://propia.lemonsqueezy.com/checkout/buy/4c8591f9-a016-4222-a838-7cf935c84ed2";
    return <LandingPage checkoutUrl={checkoutUrl} />;
  }

  const user = await currentUser();
  const firstName = user?.firstName ?? "Usuario";

  const [usage, allProperties] = await Promise.all([
    getUsage(),
    getUserProperties(),
  ]);

  const recentProperties = allProperties.slice(0, 3);
  const totalProperties = allProperties.length;

  const checkoutUrl = `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? ""}?checkout[custom][user_id]=${userId}`;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-7 pb-10">

      {/* ── SALUDO + STATS ── */}
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0f3460] mb-1">
          <Greeting firstName={firstName} /> 👋
        </h1>
        <p className="text-sm text-slate-500">
          {usage.isPro
            ? "Generaciones ilimitadas disponibles"
            : `${usage.remaining} de ${usage.limit} generaciones restantes este mes`}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#0f3460]/10 flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5 text-[#0f3460]" style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Este mes</span>
            </div>
            <p className="text-3xl font-extrabold text-[#0f3460]">{usage.count}</p>
            <p className="text-xs text-slate-400 mt-0.5">generaciones realizadas</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#00c9c9]/10 flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5 text-[#00c9c9]" style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</span>
            </div>
            <p className="text-3xl font-extrabold text-[#0f3460]">{totalProperties}</p>
            <p className="text-xs text-slate-400 mt-0.5">propiedades guardadas</p>
          </div>
        </div>

        {/* Usage bar for free users */}
        {!usage.isPro && (
          <div className="mt-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#0f3460]">Uso del plan Free</span>
              <span className="text-xs font-medium text-slate-500">
                {usage.count}/{usage.limit}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((usage.count / usage.limit) * 100))}%`,
                  background:
                    usage.count >= usage.limit
                      ? "#ef4444"
                      : "linear-gradient(90deg, #0f3460, #00c9c9)",
                }}
              />
            </div>
            {usage.remaining === 0 ? (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Alcanzaste el límite · Upgrade a PRO
              </a>
            ) : (
              <p className="text-xs text-slate-400">
                Tenés {usage.remaining} generacion{usage.remaining !== 1 ? "es" : ""} disponible{usage.remaining !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── HERRAMIENTAS ── */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Herramientas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isGold = feature.badgeColor === "gold";

            return (
              <Link
                key={feature.href}
                href={feature.href}
                className={`group bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all duration-200 flex flex-col gap-4 ${
                  isGold
                    ? "border-[#f59e0b]/25 hover:border-[#f59e0b]/50"
                    : "border-[#e2e8f0] hover:border-[#00c9c9]/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: isGold ? "#f59e0b1a" : "#0f34601a" }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: isGold ? "#f59e0b" : "#0f3460" }}
                    />
                  </div>
                  {feature.badge && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isGold
                          ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {feature.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0f3460] mb-1">{feature.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                </div>

                <div
                  className="flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
                  style={{ color: isGold ? "#f59e0b" : "#00c9c9" }}
                >
                  Ir ahora <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── ACTIVIDAD RECIENTE ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Actividad reciente
          </h2>
          {recentProperties.length > 0 && (
            <Link
              href="/mis-propiedades"
              className="text-xs text-[#00c9c9] hover:underline font-semibold"
            >
              Ver todas →
            </Link>
          )}
        </div>

        {recentProperties.length > 0 ? (
          <div className="space-y-3">
            {recentProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="bg-[#0f3460]/8 p-2.5 rounded-xl shrink-0" style={{ background: "#0f346014" }}>
                    <Home className="w-4 h-4 text-[#0f3460]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f3460]">
                      {prop.tipo_propiedad} en {prop.ubicacion}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatDate(prop.created_at)}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/mis-propiedades/${prop.id}`}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#0f3460] hover:bg-[#0f3460]/90 px-4 py-2 rounded-xl transition-colors shrink-0"
                >
                  Ver posts <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-10 text-center">
            {/* SVG illustration */}
            <div className="flex justify-center mb-5">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="40" fill="#0f3460" fillOpacity="0.05" />
                <rect x="22" y="32" width="36" height="28" rx="4" fill="#0f3460" fillOpacity="0.15" />
                <path d="M40 20L58 32H22L40 20Z" fill="#0f3460" fillOpacity="0.2" />
                <rect x="32" y="44" width="16" height="16" rx="2" fill="#00c9c9" fillOpacity="0.5" />
                <circle cx="40" cy="38" r="3" fill="#0f3460" fillOpacity="0.3" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0f3460] mb-1">Sin actividad todavía</h3>
            <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto">
              Cuando generes posts para una propiedad, aparecerán acá para acceder fácilmente.
            </p>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 bg-[#00c9c9] hover:bg-[#00b3b3] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              Generar mi primer post
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
