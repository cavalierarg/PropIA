import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import FlyersContent from "@/components/FlyersContent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SparklesIcon,
  ImageIcon,
  CheckIcon,
  LayoutTemplateIcon,
} from "lucide-react";

const PRO_MAX_CHECKOUT =
  "https://propia.lemonsqueezy.com/checkout/buy/999a3318-b1c8-40d1-a379-2039fe777b1d";

export const metadata = { title: "Generador de Flyers — PropIA" };

export default async function FlyersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan();

  /* ── Upgrade page para usuarios Free ─────────────────────── */
  if (plan === "free") {
    const checkoutUrl = `${PRO_MAX_CHECKOUT}?checkout[custom][plan]=pro_max&checkout[custom][user_id]=${userId}`;

    return (
      <div className="flex flex-col min-h-[80vh]">
        <div className="max-w-2xl mx-auto w-full py-16 sm:py-20 px-4 flex flex-col items-center gap-10 text-center">

          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-[#f59e0b]/10 border border-[#f59e0b]/25 flex items-center justify-center">
            <LayoutTemplateIcon className="w-10 h-10 text-[#f59e0b]" />
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/25 rounded-full px-3 py-1.5 self-center">
              <SparklesIcon className="w-3.5 h-3.5" />
              Exclusivo Pro Max
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0f3460] leading-tight">
              Generador de Flyers para Meta Ads
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-lg mx-auto">
              Subí una foto de tu propiedad y generá flyers profesionales en segundos, listos para Instagram, Stories y Facebook Ads.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
            {[
              {
                title: "Feed cuadrado",
                desc: "1080 × 1080 px ideal para feed de Instagram y Facebook.",
                dims: "1080 × 1080",
              },
              {
                title: "Story vertical",
                desc: "1080 × 1920 px para Stories de Instagram y Facebook.",
                dims: "1080 × 1920",
              },
              {
                title: "Banner Facebook",
                desc: "1200 × 628 px para anuncios en el feed de Facebook.",
                dims: "1200 × 628",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border border-[#f59e0b]/20 rounded-xl p-4 bg-[#f59e0b]/5 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-[#f59e0b] shrink-0" />
                  <span className="text-sm font-semibold text-[#0f3460]">{f.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                <span className="text-xs font-mono text-[#f59e0b]/80">{f.dims}</span>
              </div>
            ))}
          </div>

          {/* Benefits list */}
          <ul className="flex flex-col gap-2.5 text-sm text-left w-full max-w-sm">
            {[
              "Diseño profesional con tu foto y datos",
              "Logo PropIA en cada flyer",
              "Descargá en PNG de alta resolución",
              "Generaciones ilimitadas",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700">
                <CheckIcon className="w-4 h-4 text-[#f59e0b] shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <Button
              asChild
              className="h-13 px-10 text-base font-bold bg-[#f59e0b] hover:bg-[#e08e00] text-white border-0 shadow-lg"
            >
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                <SparklesIcon className="w-5 h-5" />
                Upgrade a Pro Max — $99/mes
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

  /* ── Feature completa para Pro y Pro Max ─────────────────── */
  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-10 px-4">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl">
            Generador de Flyers
          </h1>
          {plan === "pro_max" ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/25 rounded-full px-2.5 py-1">
              <SparklesIcon className="w-3 h-3" />
              PRO MAX — 3 formatos
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#00c9c9]/10 text-[#0f3460] border border-[#00c9c9]/25 rounded-full px-2.5 py-1">
              <SparklesIcon className="w-3 h-3" />
              PRO — Feed cuadrado
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Completá los datos de la propiedad y generá flyers profesionales listos para Meta Ads.
        </p>
        <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
      </div>

      <FlyersContent plan={plan as "pro" | "pro_max"} />
    </div>
  );
}
