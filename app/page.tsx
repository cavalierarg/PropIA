import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { getUsage } from "@/lib/actions/usage.actions";
import { getUserProperties, type SavedProperty } from "@/lib/actions/properties.actions";
import { FileText, CalendarDays, Home, Video, Sparkles, ArrowRight, Clock } from "lucide-react";
import LandingPage from "@/components/LandingPage";

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

export default async function DashboardPage() {
  const { userId } = await auth();

  // Usuario no logueado → mostrar landing page
  if (!userId) {
    const checkoutUrl =
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ??
      "https://propia.lemonsqueezy.com/checkout/buy/4c8591f9-a016-4222-a838-7cf935c84ed2";
    return <LandingPage checkoutUrl={checkoutUrl} />;
  }

  const user = await currentUser();
  const firstName = user?.firstName || "Usuario";

  const [usage, recentProperties] = await Promise.all([
    getUsage(),
    getUserProperties().then((p) => p.slice(0, 3)),
  ]);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
    : "/pricing";

  const progressPercent = usage.isPro
    ? 100
    : Math.min(100, Math.round((usage.count / usage.limit) * 100));

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">

        {/* ── SALUDO ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0f3460]">
                Hola, {firstName} 👋
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border ${
                    usage.isPro
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {usage.isPro && <Sparkles className="w-3.5 h-3.5" />}
                  Plan {usage.isPro ? "PRO" : "Free"}
                </span>
                <span className="text-sm text-slate-500">
                  {usage.isPro
                    ? "Generaciones ilimitadas"
                    : `${usage.remaining} de ${usage.limit} generaciones disponibles este mes`}
                </span>
              </div>
            </div>
            {!usage.isPro && (
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm text-sm shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade a PRO
              </a>
            )}
          </div>
        </section>

        {/* ── HERRAMIENTAS ── */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Herramientas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Link
              href="/posts"
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-[#00c9c9]/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="bg-[#0f3460]/10 p-3 rounded-xl">
                  <FileText className="w-6 h-6 text-[#0f3460]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0f3460] mt-4">Generar Posts</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Creá 5 posts listos para Instagram, Facebook y LinkedIn con inteligencia artificial.
              </p>
              <div className="flex items-center gap-1 mt-5 text-[#00c9c9] text-sm font-semibold group-hover:gap-2 transition-all">
                Ir al generador <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/calendario"
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-[#00c9c9]/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="bg-[#0f3460]/10 p-3 rounded-xl">
                  <CalendarDays className="w-6 h-6 text-[#0f3460]" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shrink-0">
                  <Sparkles className="w-3 h-3" /> PRO
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0f3460] mt-4">Calendario de Contenido</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Planificá 30 días de contenido inmobiliario optimizado para tus redes sociales.
              </p>
              <div className="flex items-center gap-1 mt-5 text-[#00c9c9] text-sm font-semibold group-hover:gap-2 transition-all">
                Ir al calendario <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/descripcion"
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-[#00c9c9]/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="bg-[#0f3460]/10 p-3 rounded-xl">
                  <Home className="w-6 h-6 text-[#0f3460]" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shrink-0">
                  <Sparkles className="w-3 h-3" /> PRO
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0f3460] mt-4">Descripción para Portal</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Generá textos optimizados para Zonaprop, Idealista, Fotocasa y otros portales.
              </p>
              <div className="flex items-center gap-1 mt-5 text-[#00c9c9] text-sm font-semibold group-hover:gap-2 transition-all">
                Ir a descripción <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/reels"
              className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md hover:border-[#00c9c9]/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="bg-[#0f3460]/10 p-3 rounded-xl">
                  <Video className="w-6 h-6 text-[#0f3460]" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shrink-0">
                  <Sparkles className="w-3 h-3" /> PRO
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0f3460] mt-4">Guion para Reels</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                Creá guiones escena por escena para tus reels y videos inmobiliarios.
              </p>
              <div className="flex items-center gap-1 mt-5 text-[#00c9c9] text-sm font-semibold group-hover:gap-2 transition-all">
                Ir a reels <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

          </div>
        </section>

        {/* ── BARRA DE PROGRESO ── */}
        {!usage.isPro && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#0f3460]">Uso del mes</h2>
              <span className="text-sm font-medium text-slate-500">
                {usage.count} / {usage.limit} generaciones
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: "linear-gradient(90deg, #0f3460, #00c9c9)",
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2.5">
              {usage.remaining > 0
                ? `Tenés ${usage.remaining} generacion${usage.remaining !== 1 ? "es" : ""} disponible${usage.remaining !== 1 ? "s" : ""} este mes`
                : "Alcanzaste el límite del plan Free · Upgrade a PRO para seguir generando"}
            </p>
          </section>
        )}

        {/* ── ACTIVIDAD RECIENTE ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Actividad reciente
            </h2>
            {recentProperties.length > 0 && (
              <Link
                href="/mis-propiedades"
                className="text-sm text-[#00c9c9] hover:underline font-medium"
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
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="bg-[#0f3460]/10 p-2.5 rounded-xl shrink-0">
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
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#0f3460] hover:bg-[#0f3460]/90 px-4 py-2 rounded-xl transition-colors shrink-0"
                  >
                    Ver posts <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10 text-center">
              <div className="bg-[#0f3460]/5 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-[#0f3460]/40" />
              </div>
              <h3 className="text-base font-semibold text-[#0f3460]">Sin actividad todavía</h3>
              <p className="text-sm text-slate-400 mt-1 mb-5 max-w-xs mx-auto">
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
    </main>
  );
}
