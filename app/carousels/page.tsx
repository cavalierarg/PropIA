import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { getAgentProfile } from "@/lib/actions/agent-profile.actions";
import CarouselGeneratorContent from "@/components/CarouselGeneratorContent";
import Link from "next/link";
import { SparklesIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRO_MAX_CHECKOUT =
  "https://propia.lemonsqueezy.com/checkout/buy/999a3318-b1c8-40d1-a379-2039fe777b1d";

export const dynamic = "force-dynamic";
export const metadata = { title: "Generador de Carruseles — PropIA" };

export default async function CarouselsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [plan, profile] = await Promise.all([getUserPlan(), getAgentProfile()]);

  if (plan !== "pro_max") {
    const checkoutUrl = `${PRO_MAX_CHECKOUT}?checkout[custom][plan]=pro_max&checkout[custom][user_id]=${userId}`;
    return (
      <div className="flex flex-col min-h-[80vh]">
        <div className="max-w-3xl mx-auto w-full py-12 sm:py-16 px-4 flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/25 rounded-full px-3 py-1.5">
              <SparklesIcon className="w-3.5 h-3.5" />
              Exclusivo PRO MAX
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0f3460] leading-tight">
              Generador de Carruseles de Instagram
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-xl mx-auto">
              Generá un carrusel de 5 slides en 1080×1080 con el diseño de tu marca, listo para publicar en Instagram.
            </p>
          </div>

          {/* Preview difuminado */}
          <div className="w-full relative select-none" aria-hidden>
            <div className="blur-sm pointer-events-none">
              <div className="flex gap-3 overflow-hidden">
                {[
                  { label: "Slide 1 — Foto", bg: "#0f3460" },
                  { label: "Slide 2 — Stats", bg: "#0a1628" },
                  { label: "Slide 3 — Detalles", bg: "#ffffff" },
                  { label: "Slide 4 — Ubicación", bg: "#0a1628" },
                  { label: "Slide 5 — Contacto", bg: "#f8fafc" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="h-36 rounded-xl flex-1 min-w-0 flex items-end p-3"
                    style={{ background: s.bg, border: "1px solid #e2e8f0" }}
                  >
                    <span className="text-[10px] text-white/60">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-[#f59e0b]/30 shadow-lg text-center">
                <p className="text-sm font-bold text-[#0f3460]">Desbloqueá con PRO MAX</p>
                <p className="text-xs text-slate-500 mt-1">5 slides · 1080×1080 · ZIP</p>
              </div>
            </div>
          </div>

          {/* Features list */}
          <ul className="flex flex-col gap-2.5 text-sm text-left w-full max-w-md">
            {[
              "5 slides en 1080×1080 listos para Instagram",
              "Colores y logo de tu marca aplicados automáticamente",
              "Slide 1: foto de propiedad con precio superpuesto",
              "Slide 2: stats visuales (dorm., baños, m², cocheras)",
              "Slide 3: características con checkmarks",
              "Slide 4: ubicación y precio destacados",
              "Slide 5: datos de contacto con CTA",
              "Descarga individual o todas en ZIP",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700">
                <CheckIcon className="w-4 h-4 shrink-0 text-[#f59e0b]" />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-center gap-3">
            <Button
              asChild
              className="h-13 px-10 text-base font-bold bg-[#f59e0b] hover:bg-[#d97706] text-[#0f3460] border-0 shadow-lg"
            >
              <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                <SparklesIcon className="w-5 h-5" />
                Upgrade a PRO MAX — $59/mes
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

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-10 px-4">
      <div className="flex flex-col gap-2 mb-8">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl">
            Generador de Carruseles
          </h1>
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/25 rounded-full px-2.5 py-1">
            <SparklesIcon className="w-3 h-3" />
            PRO MAX
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Completá los datos de la propiedad y generá un carrusel de 5 slides listo para Instagram.
        </p>
        <div className="h-1 w-16 bg-[#f59e0b] rounded-full" />
      </div>
      <CarouselGeneratorContent profile={profile} />
    </div>
  );
}
