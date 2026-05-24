import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  CalendarDays,
  Video,
  TrendingUp,
  ArrowRight,
  Check,
  ChevronDown,
  Zap,
  Sparkles,
  Copy,
  Layers,
  Star,
  ShieldCheck,
} from "lucide-react";

const PRO_MAX_CHECKOUT =
  "https://propia.lemonsqueezy.com/checkout/buy/999a3318-b1c8-40d1-a379-2039fe777b1d?checkout[custom][plan]=pro_max";

interface LandingPageProps {
  checkoutUrl: string;
}

const TESTIMONIALS = [
  {
    quote: "Paso de 2 horas redactando posts a 60 segundos. Mis clientes ven más propiedades porque publico todos los días.",
    name: "Marcela G.",
    role: "Agente independiente, CABA",
    initial: "M",
    color: "#0f3460",
  },
  {
    quote: "El calendario de contenido me salvó. Antes improvisaba, ahora tengo 30 días planificados en 5 minutos.",
    name: "Lucas R.",
    role: "Inmobiliaria, Córdoba",
    initial: "L",
    color: "#00c9c9",
  },
  {
    quote: "Probé otras herramientas pero PropIA entiende el mercado. Los textos suenan naturales, no robóticos.",
    name: "Carolina M.",
    role: "Broker, Rosario",
    initial: "C",
    color: "#0f3460",
  },
];

export default function LandingPage({ checkoutUrl }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f3460 0%, #0a1628 100%)" }}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-[#00c9c9]/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#00c9c9]/6 blur-2xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#1a4a7a]/30 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16 gap-12">

            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#00c9c9]/15 border border-[#00c9c9]/30 text-[#00c9c9] text-xs font-semibold px-4 py-1.5 rounded-full mb-7">
                <Zap className="w-3.5 h-3.5" />
                Potenciado por Inteligencia Artificial
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-tight lg:leading-[1.1]">
                Tu asistente IA para{" "}
                <span className="text-[#00c9c9]">marketing inmobiliario</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/65 mt-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Posts, ads y contenido profesional generados en segundos. La IA trabaja, vos cerrás ventas.
              </p>

              {/* Feature chips */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-7">
                {[
                  { icon: <FileText className="w-3.5 h-3.5" />, label: "Posts para redes" },
                  { icon: <CalendarDays className="w-3.5 h-3.5" />, label: "Calendario 30 días" },
                  { icon: <Layers className="w-3.5 h-3.5" />, label: "Ads para Meta", highlight: true },
                  { icon: <Video className="w-3.5 h-3.5" />, label: "Guiones Reels" },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border ${
                      chip.highlight
                        ? "bg-[#f59e0b]/20 border-[#f59e0b]/40 text-[#f59e0b]"
                        : "bg-white/10 border-white/20 text-white/80"
                    }`}
                  >
                    {chip.icon}
                    {chip.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-8">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-[#00c9c9]/20"
                >
                  Empezar gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors border border-white/20"
                >
                  Ver cómo funciona
                  <ChevronDown className="w-5 h-5" />
                </a>
              </div>

              <p className="text-white/35 text-sm mt-6 text-center lg:text-left">
                Sin tarjeta de crédito · Empezá gratis hoy
              </p>
            </div>

            {/* Right: Browser mockup */}
            <div className="flex-shrink-0 lg:w-[480px] hidden lg:block">
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-6 bg-[#00c9c9]/10 blur-3xl rounded-full" />

                {/* Browser frame */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10">
                  {/* Browser chrome */}
                  <div className="bg-[#0d1f38] px-4 py-3 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/70" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                      <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    </div>
                    <div className="flex-1 bg-[#0a1628] rounded-md h-6 flex items-center px-3">
                      <div className="w-2 h-2 rounded-full bg-[#00c9c9]/40 mr-2" />
                      <span className="text-white/30 text-xs">propia.online</span>
                    </div>
                  </div>

                  {/* Browser content: mock app UI */}
                  <div className="bg-[#f8fafc] p-4 space-y-3">
                    {/* Sidebar + content mock */}
                    <div className="flex gap-3">
                      {/* Mini sidebar */}
                      <div className="w-28 bg-white rounded-xl border border-slate-200 p-2.5 space-y-1.5 shrink-0">
                        <div className="h-5 w-16 bg-[#0f3460] rounded-md" />
                        <div className="h-3 w-full bg-slate-100 rounded" />
                        {["#00c9c9", "#e2e8f0", "#e2e8f0", "#e2e8f0", "#e2e8f0"].map((c, i) => (
                          <div key={i} className="h-3 w-full rounded" style={{ background: c }} />
                        ))}
                      </div>

                      {/* Content area */}
                      <div className="flex-1 space-y-2.5">
                        {/* Header */}
                        <div className="bg-white rounded-xl border border-slate-200 p-3">
                          <div className="h-4 w-32 bg-[#0f3460] rounded mb-2" />
                          <div className="flex gap-2">
                            <div className="h-2 w-20 bg-slate-200 rounded" />
                            <div className="h-2 w-16 bg-slate-100 rounded" />
                          </div>
                        </div>
                        {/* Cards grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl border border-slate-200 p-2.5">
                              <div className="w-6 h-6 rounded-lg bg-[#0f3460]/10 mb-1.5" />
                              <div className="h-2 w-full bg-slate-200 rounded mb-1" />
                              <div className="h-1.5 w-3/4 bg-slate-100 rounded" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Generated posts preview */}
                    <div className="bg-white rounded-xl border border-[#00c9c9]/30 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#00c9c9]" />
                        <div className="h-2 w-24 bg-slate-200 rounded" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-100 rounded" />
                        <div className="h-2 w-5/6 bg-slate-100 rounded" />
                        <div className="h-2 w-4/6 bg-slate-100 rounded" />
                      </div>
                      <div className="h-7 bg-[#00c9c9] rounded-lg flex items-center justify-center">
                        <div className="h-2 w-16 bg-white/60 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CÓMO FUNCIONA — 3 PASOS
      ══════════════════════════════════════════════════ */}
      <section id="como-funciona" className="bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f3460]">¿Cómo funciona?</h2>
            <p className="text-slate-500 mt-3 text-lg">Tres pasos, sin complicaciones</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="relative flex flex-col items-center text-center gap-5 bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <span className="absolute top-4 right-4 text-5xl font-black text-[#0f3460]/5 select-none leading-none">1</span>
              <div className="w-16 h-16 rounded-2xl bg-[#0f3460] flex items-center justify-center shadow-md shadow-[#0f3460]/15 shrink-0">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f3460]">Cargá la propiedad</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Ingresá tipo, ubicación, precio y tres características. Solo toma 30 segundos.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col items-center text-center gap-5 bg-gradient-to-br from-[#0f3460] to-[#1a4d8f] rounded-2xl p-8 shadow-lg shadow-[#0f3460]/20">
              <span className="absolute top-4 right-4 text-5xl font-black text-white/5 select-none leading-none">2</span>
              <div className="w-16 h-16 rounded-2xl bg-[#00c9c9] flex items-center justify-center shadow-md shadow-[#00c9c9]/30 shrink-0">
                <Zap className="w-8 h-8 text-[#0f3460]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">La IA genera los posts</h3>
                <p className="text-white/65 text-sm mt-2 leading-relaxed">
                  Nuestra IA crea 5 posts personalizados: 2 para Instagram, 2 para Facebook y 1 para LinkedIn.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col items-center text-center gap-5 bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <span className="absolute top-4 right-4 text-5xl font-black text-[#0f3460]/5 select-none leading-none">3</span>
              <div className="w-16 h-16 rounded-2xl bg-[#00c9c9] flex items-center justify-center shadow-md shadow-[#00c9c9]/20 shrink-0">
                <Copy className="w-8 h-8 text-[#0f3460]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f3460]">Copiá y publicá</h3>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Copiá cada post con un clic y publicalo directamente en tus redes sociales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-20 sm:py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f3460]">Todo lo que necesitás</h2>
            <p className="text-slate-500 mt-3 text-lg">Una plataforma completa para tu marketing inmobiliario</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: FileText, title: "Generador de Posts", desc: "5 posts listos para Instagram, Facebook y LinkedIn. Personalizados para cada propiedad." },
              { icon: CalendarDays, title: "Calendario de Contenido", desc: "30 días de contenido planificado para mantener tus redes activas y organizadas." },
              { icon: Video, title: "Guiones para Reels", desc: "Guiones escena por escena para crear reels inmobiliarios que enganchen." },
              { icon: TrendingUp, title: "Análisis de Tendencias", desc: "Tendencias del mercado en tiempo real para publicar en el momento justo." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md hover:border-[#00c9c9]/30 transition-all">
                <div className="bg-[#0f3460]/10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-[#0f3460]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f3460]">{title}</h3>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            {/* Generador de Ads — PRO MAX */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f59e0b]/30 flex flex-col gap-4 hover:shadow-md hover:border-[#f59e0b]/50 transition-all relative overflow-hidden sm:col-span-2 lg:col-span-2">
              <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-full bg-[#f59e0b]/5 blur-2xl -translate-y-1/2 translate-x-1/4" />
              <div className="flex items-start justify-between gap-3 relative">
                <div className="bg-[#f59e0b]/10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6 text-[#f59e0b]" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 rounded-full px-2.5 py-1 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  PRO MAX
                </span>
              </div>
              <div className="relative">
                <h3 className="text-base font-bold text-[#0f3460]">Generador de Ads para Meta</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Subí hasta 3 fotos y generá ads en 4 estilos (Luxury, Moderno, Bold, Profesional) con tu color de marca, en 3 formatos: Feed, Story y Banner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALES
      ══════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Casos de éxito</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f3460]">Lo que dicen nuestros agentes</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 hover:shadow-md hover:border-[#00c9c9]/20 transition-all"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f3460]">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          PRECIOS
      ══════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-20 sm:py-24 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f3460]">Planes simples y transparentes</h2>
            <p className="text-slate-500 mt-3 text-lg">Empezá gratis, escalá cuando estés listo</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">
            {/* Plan Free */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white shadow-sm">
              <div className="px-6 pt-7 pb-6 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Free</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-[#0f3460]">$0</span>
                  <span className="text-slate-400 text-sm pb-1">para siempre</span>
                </div>
              </div>
              <div className="px-6 py-6 flex flex-col gap-5 flex-1">
                <ul className="flex flex-col gap-3">
                  {["5 generaciones gratis", "Posts para Instagram, Facebook y LinkedIn", "Historial de propiedades"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-[#00c9c9] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-in"
                  className="mt-auto block text-center border-2 border-[#0f3460] text-[#0f3460] font-semibold px-5 py-3 rounded-xl hover:bg-[#0f3460] hover:text-white transition-colors text-sm"
                >
                  Empezar gratis
                </Link>
              </div>
            </div>

            {/* Plan PRO — highlighted, slightly bigger */}
            <div className="bg-[#0f3460] rounded-2xl overflow-hidden flex flex-col relative shadow-2xl shadow-[#0f3460]/30 sm:scale-[1.03] sm:z-10">
              <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full bg-[#00c9c9]/10 blur-2xl -translate-y-1/2 translate-x-1/3" />
              <div className="px-6 pt-7 pb-6 border-b border-white/10 relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Pro</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#00c9c9] text-[#0f3460] px-2.5 py-1 rounded-full animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    Más popular
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">$29</span>
                  <span className="text-white/40 text-sm pb-1">/ mes</span>
                </div>
              </div>
              <div className="px-6 py-6 flex flex-col gap-5 flex-1 relative">
                <ul className="flex flex-col gap-3">
                  {["Generaciones ilimitadas", "Calendario de contenido (30 días)", "Guiones para Reels", "Descripción para portales", "Análisis de tendencias", "Soporte prioritario"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                      <Check className="w-4 h-4 text-[#00c9c9] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto block text-center bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-bold px-5 py-3 rounded-xl transition-colors text-sm"
                >
                  Probar PRO 7 días gratis
                </a>
              </div>
            </div>

            {/* Plan PRO MAX */}
            <div className="rounded-2xl overflow-hidden flex flex-col relative border-2 border-[#f59e0b] bg-white shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full bg-[#f59e0b]/10 blur-2xl -translate-y-1/2 translate-x-1/3" />
              <div className="h-1 bg-gradient-to-r from-[#f59e0b]/60 via-[#f59e0b] to-[#f59e0b]/60" />
              <div className="px-6 pt-6 pb-6 border-b border-[#f59e0b]/15 relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest">Pro Max</p>
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#f59e0b] text-white px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Más completo
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-[#0f3460]">$59</span>
                  <span className="text-slate-400 text-sm pb-1">/ mes</span>
                </div>
              </div>
              <div className="px-6 py-6 flex flex-col gap-5 flex-1 relative">
                <ul className="flex flex-col gap-3">
                  {["Todo lo del plan PRO", "Generador de Ads para Meta Ads", "4 estilos y 3 formatos de ads", "Color de marca personalizado", "Hasta 3 fotos por ad", "Descarga en PNG alta resolución"].map((f, i) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${i >= 1 ? "text-[#f59e0b]" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={PRO_MAX_CHECKOUT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto block text-center bg-[#f59e0b] hover:bg-[#e08e00] text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm"
                >
                  Probar PRO MAX 7 días gratis
                </a>
              </div>
            </div>
          </div>

          {/* Guarantee strip */}
          <div className="flex items-center justify-center gap-3 mt-10 bg-white rounded-2xl border border-slate-200 px-6 py-4">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm text-slate-600">
              <strong className="text-slate-800">Garantía de 7 días:</strong> Si no estás satisfecho, te devolvemos el dinero sin preguntas.
            </p>
          </div>

          <p className="text-center text-slate-400 text-sm mt-6">
            ¿Tenés preguntas?{" "}
            <Link href="/pricing" className="text-[#00c9c9] hover:underline font-medium">
              Ver todos los detalles de los planes →
            </Link>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
      <footer className="mt-auto" style={{ background: "#0a1628" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <Image src="/logo.png" alt="PropIA" width={32} height={32} className="rounded-full" />
                <span className="text-xl font-bold text-white tracking-tight">
                  Prop<span className="text-[#00c9c9]">IA</span>
                </span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Marketing inmobiliario potenciado por IA. Argentina & Latinoamérica.
              </p>
            </div>

            {/* Producto */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Generador de Posts", href: "/posts" },
                  { label: "Calendario", href: "/calendario" },
                  { label: "Guiones Reels", href: "/reels" },
                  { label: "Generador de Ads", href: "/ads-generator" },
                  { label: "Precios", href: "/pricing" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-white/45 hover:text-white text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cuenta */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Cuenta</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Iniciar sesión", href: "/sign-in" },
                  { label: "Registrarse", href: "/sign-up" },
                  { label: "Mi cuenta", href: "/" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-white/45 hover:text-white text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacidad", href: "#" },
                  { label: "Términos de uso", href: "#" },
                  { label: "Contacto", href: "mailto:hola@propia.online" },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-white/45 hover:text-white text-sm transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white/30 text-xs">
            <span>© {new Date().getFullYear()} PropIA. Todos los derechos reservados.</span>
            <span>Generá contenido inmobiliario con IA · Argentina & Latinoamérica</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
