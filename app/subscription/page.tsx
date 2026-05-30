import { auth } from "@clerk/nextjs/server";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { CheckIcon, SparklesIcon, ZapIcon, CrownIcon } from "lucide-react";

const BASE_PRO = "https://propia.lemonsqueezy.com/checkout/buy/4c8591f9-a016-4222-a838-7cf935c84ed2";
const BASE_PRO_MAX = "https://propia.lemonsqueezy.com/checkout/buy/999a3318-b1c8-40d1-a379-2039fe777b1d";

function buildUrl(base: string, plan: string, userId: string) {
  return `${base}?checkout[custom][plan]=${plan}&checkout[custom][user_id]=${userId}`;
}

export default async function SubscriptionPage() {
  const { userId } = await auth();
  const plan = userId ? await getUserPlan() : "free";
  const isPro = plan === "pro";
  const isProMax = plan === "pro_max";
  const isAnyPro = isPro || isProMax;

  const proUrl = userId ? buildUrl(BASE_PRO, "pro", userId) : "/sign-in";
  const proMaxUrl = userId ? buildUrl(BASE_PRO_MAX, "pro_max", userId) : "/sign-in";

  return (
    <main className="flex flex-col gap-8 py-8 sm:py-12 max-w-5xl mx-auto px-4">
      <section className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl">Tu suscripción</h1>
        <p className="text-slate-500">
          {isProMax
            ? "Estás en el plan más completo de PropIA."
            : isPro
            ? "Estás en el plan PRO. Generaciones ilimitadas activadas."
            : "Estás en el plan gratuito. Tenés 5 generaciones por mes."}
        </p>
        <div className="h-1 w-16 bg-[#00c9c9] rounded-full mx-auto" />
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">

        {/* Plan Free */}
        <div className={`border rounded-2xl p-6 flex flex-col gap-5 bg-white shadow-sm ${!isAnyPro ? "border-[#0f3460]/30 ring-2 ring-[#0f3460]/10" : "border-slate-200"}`}>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <ZapIcon className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">Free</span>
              {!isAnyPro && (
                <span className="ml-auto text-xs bg-[#0f3460]/10 text-[#0f3460] rounded-full px-2 py-0.5 font-semibold">
                  Tu plan
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-[#0f3460]">
              $0 <span className="text-base font-normal text-slate-400">/ mes</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm text-slate-500">
            {[
              "5 generaciones por mes",
              "Posts para Instagram, Facebook y LinkedIn",
              "Historial de propiedades guardadas",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#00c9c9]" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-auto">
            <button disabled className="w-full border border-slate-200 text-slate-400 font-semibold py-2.5 rounded-xl text-sm cursor-not-allowed">
              {!isAnyPro ? "Plan actual" : "Plan básico"}
            </button>
          </div>
        </div>

        {/* Plan PRO */}
        <div className={`border-2 rounded-2xl p-6 flex flex-col gap-5 bg-white shadow-sm relative ${isPro ? "border-[#00c9c9] ring-2 ring-[#00c9c9]/15" : "border-[#00c9c9]/40"}`}>
          {!isPro && !isProMax && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#00c9c9] text-[#0f3460] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                Más popular
              </span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-[#00c9c9]" />
              <span className="font-semibold text-[#0f3460]">PRO</span>
              {isPro && (
                <span className="ml-auto text-xs bg-[#00c9c9]/10 text-[#0f3460] border border-[#00c9c9]/30 rounded-full px-2 py-0.5 font-semibold">
                  Tu plan
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-[#0f3460]">
              $29 <span className="text-base font-normal text-slate-400">/ mes</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
            {[
              "Generaciones ilimitadas",
              "Calendario de contenido (30 días)",
              "Guiones para Reels",
              "Descripción para portales",
              "Análisis de tendencias",
              "Generador de Ads básico",
              "Soporte prioritario",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#00c9c9]" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-auto">
            {isPro ? (
              <button disabled className="w-full bg-[#00c9c9]/10 text-[#0f3460] font-semibold py-2.5 rounded-xl text-sm cursor-not-allowed">
                Plan actual
              </button>
            ) : isProMax ? (
              <button disabled className="w-full border border-slate-200 text-slate-400 font-semibold py-2.5 rounded-xl text-sm cursor-not-allowed">
                Incluido en PRO MAX
              </button>
            ) : (
              <a
                href={proUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-[#0f3460] hover:bg-[#0f3460]/90 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Probar 7 días gratis
              </a>
            )}
          </div>
        </div>

        {/* Plan PRO MAX */}
        <div className={`border-2 rounded-2xl p-6 flex flex-col gap-5 bg-white shadow-sm relative ${isProMax ? "border-[#f59e0b] ring-2 ring-[#f59e0b]/15" : "border-[#f59e0b]/40"}`}>
          <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#f59e0b]/60 via-[#f59e0b] to-[#f59e0b]/60 rounded-t-2xl" />
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-2">
              <CrownIcon className="w-4 h-4 text-[#f59e0b]" />
              <span className="font-semibold text-[#f59e0b]">PRO MAX</span>
              {isProMax && (
                <span className="ml-auto text-xs bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 rounded-full px-2 py-0.5 font-semibold">
                  Tu plan
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-[#0f3460]">
              $59 <span className="text-base font-normal text-slate-400">/ mes</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
            {[
              { text: "Todo lo del plan PRO", gold: false },
              { text: "Ads avanzados: hasta 3 fotos", gold: true },
              { text: "Carruseles IG: 5 slides 1080×1080", gold: true },
              { text: "Paleta de 3 colores personalizables por ad", gold: true },
              { text: "Descarga en ZIP", gold: true },
            ].map(({ text, gold }) => (
              <li key={text} className="flex items-start gap-2">
                <CheckIcon className={`w-4 h-4 mt-0.5 shrink-0 ${gold ? "text-[#f59e0b]" : "text-[#00c9c9]"}`} />
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-auto">
            {isProMax ? (
              <button disabled className="w-full bg-[#f59e0b]/10 text-[#f59e0b] font-semibold py-2.5 rounded-xl text-sm cursor-not-allowed">
                Plan actual
              </button>
            ) : (
              <a
                href={proMaxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center bg-[#f59e0b] hover:bg-[#e08e00] text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                {isPro ? "Actualizar a PRO MAX" : "Probar 7 días gratis"}
              </a>
            )}
          </div>
        </div>

      </div>

      <p className="text-center text-xs text-slate-400 mt-2">
        Cancelá en cualquier momento desde tu cuenta en Lemon Squeezy · Garantía de devolución 7 días
      </p>
    </main>
  );
}
