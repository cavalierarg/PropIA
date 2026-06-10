import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import TendenciasContent from "@/components/TendenciasContent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SparklesIcon, CheckIcon } from "lucide-react";

const PRO_CHECKOUT =
  "https://propia.lemonsqueezy.com/checkout/buy/4c8591f9-a016-4222-a838-7cf935c84ed2";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
export const metadata = { title: "Tendencias del Mercado — PropIA" };

export default async function TendenciasPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan();

  if (plan === "free") {
    const checkoutUrl = `${PRO_CHECKOUT}?checkout[custom][plan]=pro&checkout[custom][user_id]=${userId}`;

    return (
      <div className="flex flex-col min-h-[80vh]">
        <div className="max-w-3xl mx-auto w-full py-12 sm:py-16 px-4 flex flex-col items-center gap-10">

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#00c9c9]/10 text-[#00c9c9] border border-[#00c9c9]/25 rounded-full px-3 py-1.5">
              <SparklesIcon className="w-3.5 h-3.5" />
              Disponible en Plan PRO
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0f3460] leading-tight">
              Tendencias del Mercado
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-xl mx-auto">
              La IA investiga en tiempo real qué contenido inmobiliario está generando más engagement en Instagram, Facebook y LinkedIn. Exclusivo del Plan Pro.
            </p>
          </div>

          {/* Preview difuminado */}
          <div className="w-full relative select-none" aria-hidden>
            <div className="blur-sm pointer-events-none">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["Instagram", "Facebook", "LinkedIn"].map((red) => (
                  <div key={red} className="rounded-xl border border-slate-200 p-4 flex flex-col gap-3 bg-slate-50">
                    <div className="h-4 bg-slate-200 rounded-full w-1/2" />
                    <div className="h-3 bg-slate-200 rounded-full w-full" />
                    <div className="h-3 bg-slate-200 rounded-full w-4/5" />
                    <div className="h-3 bg-slate-200 rounded-full w-3/5" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 border border-[#00c9c9]/30 shadow-lg text-center">
                <p className="text-sm font-bold text-[#0f3460]">Desbloqueá con PRO</p>
                <p className="text-xs text-slate-500 mt-1">Instagram · Facebook · LinkedIn · En tiempo real</p>
              </div>
            </div>
          </div>

          <ul className="flex flex-col gap-2.5 text-sm text-left w-full max-w-md">
            {[
              "Análisis en tiempo real de tendencias inmobiliarias",
              "Datos de Instagram, Facebook y LinkedIn",
              "Formatos y temas con mayor engagement del momento",
              "Generaciones ilimitadas incluidas en el plan PRO",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700">
                <CheckIcon className="w-4 h-4 shrink-0 text-[#00c9c9]" />
                {item}
              </li>
            ))}
          </ul>

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

  return (
    <main className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
      <section className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl lg:text-4xl leading-tight">
          Tendencias del Mercado
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg max-w-2xl">
          La IA investiga en tiempo real qué contenido inmobiliario está generando
          más engagement en Instagram, Facebook y LinkedIn ahora mismo.
        </p>
        <div className="h-1 w-16 bg-[#00d4d4] rounded-full sm:w-20" />
      </section>

      <TendenciasContent initialIsPro={plan === "pro" || plan === "pro_max"} />
    </main>
  );
}
