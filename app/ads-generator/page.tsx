import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import AdsGeneratorContent from "@/components/AdsGeneratorContent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SparklesIcon,
  CheckIcon,
  MonitorIcon,
  SmartphoneIcon,
  RectangleHorizontalIcon,
} from "lucide-react";

const PRO_CHECKOUT =
  "https://propia.lemonsqueezy.com/checkout/buy/4c8591f9-a016-4222-a838-7cf935c84ed2";
const PRO_MAX_CHECKOUT =
  "https://propia.lemonsqueezy.com/checkout/buy/999a3318-b1c8-40d1-a379-2039fe777b1d";

export const dynamic = "force-dynamic";
export const metadata = { title: "Generador de Ads — PropIA" };

export default async function AdsGeneratorPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan();

  /* ── Upgrade page solo para Free ──────────────────────────── */
  if (plan === "free") {
    const checkoutUrl = `${PRO_CHECKOUT}?checkout[custom][plan]=pro&checkout[custom][user_id]=${userId}`;

    return (
      <div className="flex flex-col min-h-[80vh]">
        <div className="max-w-3xl mx-auto w-full py-12 sm:py-16 px-4 flex flex-col items-center gap-10">

          {/* Badge + heading */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#00c9c9]/10 text-[#00c9c9] border border-[#00c9c9]/25 rounded-full px-3 py-1.5">
              <SparklesIcon className="w-3.5 h-3.5" />
              Disponible en Plan PRO
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0f3460] leading-tight">
              Generador de Ads para Meta Ads
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-xl mx-auto">
              Generá ads profesionales en 4 estilos y 3 formatos listos para publicar en Instagram y Facebook.
            </p>
          </div>

          {/* Preview difuminado */}
          <div className="w-full relative select-none" aria-hidden>
            <div className="blur-sm pointer-events-none">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { bg: "#0f3460", label: "Feed 1080×1080", h: "h-40" },
                  { bg: "#091b33", label: "Story 1080×1920", h: "h-40" },
                  { bg: "#0f3460", label: "Banner 1200×628", h: "h-40" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div
                      className={`${item.h} rounded-xl flex flex-col items-end justify-end p-3`}
                      style={{ background: `linear-gradient(135deg, ${item.bg} 0%, #1a4a7a 100%)` }}
                    >
                      <div className="w-16 h-5 rounded-full bg-[#00c9c9]/70" />
                    </div>
                    <div className="h-3 w-24 bg-slate-200 rounded-full" />
                    <div className="h-8 bg-slate-100 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-[#00c9c9]/30 shadow-lg text-center">
                <p className="text-sm font-bold text-[#0f3460]">Desbloqueá con PRO</p>
                <p className="text-xs text-slate-500 mt-1">Ads en 4 estilos · 3 formatos</p>
              </div>
            </div>
          </div>

          {/* Formatos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {[
              {
                icon: <MonitorIcon className="w-5 h-5 text-[#0f3460]" />,
                title: "Feed cuadrado",
                desc: "1080 × 1080 px · Ideal para feed de Instagram y Facebook.",
                dims: "1080 × 1080",
              },
              {
                icon: <SmartphoneIcon className="w-5 h-5 text-[#0f3460]" />,
                title: "Story vertical",
                desc: "1080 × 1920 px · Para Stories de Instagram y Facebook.",
                dims: "1080 × 1920",
              },
              {
                icon: <RectangleHorizontalIcon className="w-5 h-5 text-[#0f3460]" />,
                title: "Banner Facebook",
                desc: "1200 × 628 px · Para anuncios en el feed de Facebook.",
                dims: "1200 × 628",
              },
            ].map((f) => (
              <div key={f.title} className="border border-[#00c9c9]/20 rounded-xl p-4 bg-[#00c9c9]/5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <span className="text-sm font-semibold text-[#0f3460]">{f.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                <span className="text-xs font-mono text-[#00c9c9]/80">{f.dims}</span>
              </div>
            ))}
          </div>

          {/* Beneficios */}
          <ul className="flex flex-col gap-2.5 text-sm text-left w-full max-w-md">
            {[
              "1 foto por sesión · 3 formatos = 3 ads listos para publicar (PRO)",
              "4 estilos de diseño: Luxury, Moderno, Bold y Profesional",
              "Incluido en el plan PRO — generaciones ilimitadas",
              "Hasta 3 fotos + carruseles + descarga en ZIP (PRO MAX)",
            ].map((item, i) => (
              <li key={item} className="flex items-center gap-3 text-slate-700">
                <CheckIcon className={`w-4 h-4 shrink-0 ${i === 3 ? "text-[#f59e0b]" : "text-[#00c9c9]"}`} />
                {item}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <Button
              asChild
              className="h-13 px-10 text-base font-bold bg-[#0f3460] hover:bg-[#0f3460]/90 text-white border-0 shadow-lg"
            >
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                <SparklesIcon className="w-5 h-5" />
                Upgrade a PRO — $29/mes
              </a>
            </Button>
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2">
              Ver todos los planes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Generador para Pro y Pro Max ──────────────────────────── */
  const proMaxCheckoutUrl = `${PRO_MAX_CHECKOUT}?checkout[custom][plan]=pro_max&checkout[custom][user_id]=${userId}`;

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-10 px-4">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl">
            Generador de Ads
          </h1>
          {plan === "pro_max" ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/25 rounded-full px-2.5 py-1">
              <SparklesIcon className="w-3 h-3" />
              PRO MAX — 3 formatos × hasta 3 fotos
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#00c9c9]/10 text-[#00c9c9] border border-[#00c9c9]/25 rounded-full px-2.5 py-1">
              <SparklesIcon className="w-3 h-3" />
              PRO — 3 formatos × 1 foto
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {plan === "pro_max"
            ? "Completá los datos y generá hasta 9 ads en alta resolución."
            : "Subí una foto y generá 3 ads profesionales listos para Meta Ads."}
        </p>
        <div className="h-1 w-16 bg-[#00c9c9] rounded-full" />
      </div>

      <AdsGeneratorContent plan={plan} proMaxCheckoutUrl={proMaxCheckoutUrl} />
    </div>
  );
}
