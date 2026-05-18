import Link from "next/link";
import { CheckIcon, XIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHECKOUT_URL =
  "https://propia.lemonsqueezy.com/checkout/buy/4c8591f9-a016-4222-a838-7cf935c84ed2";

const FREE_FEATURES: { text: string; included: boolean }[] = [
  { text: "10 posts generados por mes", included: true },
  { text: "5 formatos de post para redes sociales", included: true },
  { text: "Descripción para portal — versión corta", included: true },
  { text: "Historial de propiedades guardadas", included: true },
  { text: "Calendario de contenido — preview 3 días", included: true },
  { text: "Posts ilimitados", included: false },
  { text: "Descripción versión larga (~400 palabras)", included: false },
  { text: "Calendario de 30 días completo", included: false },
  { text: "Guion para Reels con tendencias en tiempo real", included: false },
];

const PRO_FEATURES: { text: string }[] = [
  { text: "Posts ilimitados" },
  { text: "5 formatos de post para redes sociales" },
  { text: "Descripción corta + larga (~400 palabras)" },
  { text: "Calendario de contenido completo — 30 días" },
  { text: "Guion para Reels con tendencias en tiempo real" },
  { text: "Historial de propiedades guardadas" },
  { text: "Soporte prioritario por email" },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Puedo cancelar mi suscripción cuando quiera?",
    a: "Sí, podés cancelar en cualquier momento desde tu cuenta en Lemon Squeezy. No hay permanencia mínima ni cargos adicionales por cancelación. Tu plan PRO sigue activo hasta el final del período ya pagado.",
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

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-[#0f3460] py-16 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 self-center bg-[#00d4d4]/15 border border-[#00d4d4]/30 rounded-full px-4 py-1.5 text-sm font-semibold text-[#00d4d4]">
            <ZapIcon className="w-3.5 h-3.5" />
            Planes y precios
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Elegí tu plan
          </h1>
          <p className="text-base sm:text-lg text-white/65 max-w-lg mx-auto leading-relaxed">
            Empezá gratis y escalá cuando estés listo. Sin tarjeta de crédito
            requerida para el plan gratuito.
          </p>
        </div>
      </section>

      {/* ── Cards ────────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-12 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">

            {/* Plan Free */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <div className="p-6 sm:p-8 flex flex-col gap-6">
                {/* Heading */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Plan Free
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-5xl font-extrabold text-[#0f3460]">$0</span>
                    <span className="text-slate-400 text-base">/mes</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    Para empezar a generar contenido inmobiliario con IA.
                  </p>
                </div>

                {/* CTA */}
                <Button
                  asChild
                  variant="outline"
                  className="h-12 text-sm font-semibold border-[#0f3460]/20 text-[#0f3460] hover:bg-[#0f3460]/5 hover:border-[#0f3460]/40"
                >
                  <Link href="/">Empezar gratis</Link>
                </Button>

                {/* Divider */}
                <div className="h-px bg-slate-100" />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {FREE_FEATURES.map((f) => (
                    <li key={f.text} className="flex items-start gap-3">
                      {f.included ? (
                        <CheckIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XIcon className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm leading-snug ${
                          f.included ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Plan PRO */}
            <div className="bg-white rounded-2xl border-2 border-[#00d4d4] shadow-xl flex flex-col relative mt-5 sm:mt-0">
              {/* "Más popular" badge */}
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="inline-flex items-center gap-1.5 bg-[#00d4d4] text-[#0f3460] text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Más popular
                </span>
              </div>

              {/* Subtle teal glow at top */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#00d4d4]/60 via-[#00d4d4] to-[#00d4d4]/60 rounded-t-[14px]" />

              <div className="p-6 sm:p-8 flex flex-col gap-6">
                {/* Heading */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#00d4d4] uppercase tracking-widest">
                    Plan PRO
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-5xl font-extrabold text-[#0f3460]">$49</span>
                    <span className="text-slate-400 text-base">/mes</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    Para agentes que publican contenido todos los días.
                  </p>
                </div>

                {/* CTA */}
                <Button
                  asChild
                  className="h-12 text-sm font-semibold bg-[#0f3460] hover:bg-[#0f3460]/90 text-white shadow-md"
                >
                  <a
                    href={CHECKOUT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Comenzar prueba gratis 7 días
                  </a>
                </Button>
                <p className="text-center text-xs text-slate-400 -mt-3">
                  Sin cargo hasta que terminen los 7 días
                </p>

                {/* Divider */}
                <div className="h-px bg-slate-100" />

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {PRO_FEATURES.map((f) => (
                    <li key={f.text} className="flex items-start gap-3">
                      <CheckIcon className="w-4 h-4 text-[#00d4d4] shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-snug">
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Garantía ─────────────────────────────────────────────────── */}
      <section className="bg-slate-50 pb-12 sm:pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="border border-slate-200 bg-white rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-slate-600">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <CheckIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="leading-relaxed">
              <strong className="text-slate-800">Garantía de satisfacción.</strong>{" "}
              Si dentro de los primeros 7 días de prueba el plan PRO no cumple tus
              expectativas, no se te cobra nada. Podés cancelar en cualquier momento.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-100 py-14 sm:py-20 px-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-10 sm:gap-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f3460]">
              Preguntas frecuentes
            </h2>
            <div className="h-1 w-12 bg-[#00d4d4] rounded-full" />
          </div>

          <div className="flex flex-col">
            {FAQ.map((item, idx) => (
              <div
                key={item.q}
                className={`py-6 flex flex-col gap-2.5 ${
                  idx < FAQ.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <h3 className="font-semibold text-[#0f3460] text-base leading-snug">
                  {item.q}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
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
              <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
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
