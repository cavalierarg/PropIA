import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { getUsage, getHasEverGenerated } from "@/lib/actions/usage.actions";
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
  GalleryHorizontal,
  UserCircle,
} from "lucide-react";
import LandingPage from "@/components/LandingPage";
import { Greeting } from "@/components/Greeting";
import OnboardingChecklist, { type ChecklistItem } from "@/components/OnboardingChecklist";
import { getOnboardingStatus } from "@/lib/actions/onboarding.actions";
import { getAgentProfile } from "@/lib/actions/agent-profile.actions";
import UsageBar from "@/components/UsageBar";

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
  {
    href: "/carousels",
    icon: GalleryHorizontal,
    title: "Carruseles de Instagram",
    description: "5 slides con tu marca listos para publicar.",
    badge: "PRO MAX",
    badgeColor: "gold",
    accent: "#0f3460",
  },
];

function getNextRenewalDate(): string {
  const next = new Date();
  next.setDate(1);
  next.setMonth(next.getMonth() + 1);
  return next.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <LandingPage />;
  }

  const user = await currentUser();
  const firstName = user?.firstName ?? "Usuario";
  const nextRenewal = getNextRenewalDate();

  const [usage, allProperties, onboarding, agentProfile, hasGenerated] = await Promise.all([
    getUsage(),
    getUserProperties(),
    getOnboardingStatus(),
    getAgentProfile(),
    getHasEverGenerated(),
  ]);

  const recentProperties = allProperties.slice(0, 3);
  const totalProperties = allProperties.length;

  const checklistItems: ChecklistItem[] = onboarding.completed
    ? [
        {
          id: "perfil_completado",
          label: "Completá tu perfil de marca",
          done: !!agentProfile.perfil_completado,
          href: "/perfil",
        },
        {
          id: "propiedad_guardada",
          label: "Cargá tu primera propiedad",
          done: totalProperties > 0,
          href: "/mis-propiedades",
        },
        {
          id: "primer_post",
          label: "Generá contenido desde Mis Propiedades",
          done: hasGenerated,
          href: "/mis-propiedades",
        },
        {
          id: "primer_post_publicado",
          label: "Copiá y publicá tu primer post en Instagram",
          done: !!onboarding.steps.primer_post_publicado,
          stepKey: "primer_post_publicado",
        },
      ]
    : [];

  const checkoutUrl = `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? ""}?checkout[custom][plan]=pro&checkout[custom][user_id]=${userId}`;

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

        {/* Usage bar */}
        {!usage.isPro && (
          <UsageBar
            checkoutUrl={checkoutUrl}
            renewalDate={nextRenewal}
            className="mt-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-4"
          />
        )}
      </section>

      {/* ── BANNER PERFIL INCOMPLETO ── */}
      {!agentProfile.perfil_completado && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <UserCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 leading-snug">
              Completá tu perfil para que la IA genere contenido personalizado
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Agregá tu nombre, zona y tono de voz para mejores resultados.
            </p>
          </div>
          <Link
            href="/perfil"
            className="shrink-0 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Completar →
          </Link>
        </div>
      )}

      {/* ── PRIMEROS PASOS ── */}
      {checklistItems.length > 0 && (
        <OnboardingChecklist items={checklistItems} />
      )}

      {/* ── WHATSAPP AYUDA ── */}
      <a
        href="https://wa.me/5492944299692?text=Hola!%20Tengo%20una%20consulta%20sobre%20PropIA%20%F0%9F%91%8B"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 w-full rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 hover:bg-[#25D366]/10 px-4 py-3 transition-colors"
      >
        <span
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: "#25D366" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-[#128c3f]">¿Necesitás ayuda? Escribinos por WhatsApp</span>
      </a>

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
