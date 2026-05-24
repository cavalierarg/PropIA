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
  GalleryHorizontal,
} from "lucide-react";

interface LandingPageProps {
  checkoutUrl?: string;
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

export default function LandingPage(_props: LandingPageProps) {
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 gap-12">

            {/* Left: Text — 45% */}
            <div className="text-center lg:text-left" style={{ flex: "0 0 45%" }}>
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
                  { icon: <FileText className="w-3.5 h-3.5" />, label: "Posts para redes", highlight: null },
                  { icon: <CalendarDays className="w-3.5 h-3.5" />, label: "Calendario 30 días", highlight: null },
                  { icon: <Video className="w-3.5 h-3.5" />, label: "Guiones Reels", highlight: null },
                  { icon: <Layers className="w-3.5 h-3.5" />, label: "Ads para Meta", highlight: "pro" },
                  { icon: <GalleryHorizontal className="w-3.5 h-3.5" />, label: "Carruseles IG", highlight: "promax" },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border ${
                      chip.highlight === "promax"
                        ? "bg-[#f59e0b]/20 border-[#f59e0b]/40 text-[#f59e0b]"
                        : chip.highlight === "pro"
                        ? "bg-[#00c9c9]/15 border-[#00c9c9]/35 text-[#00c9c9]"
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

            {/* Right: Browser mockup with real screenshot */}
            <div className="hidden lg:block flex-shrink-0" style={{ width: "55%" }}>
              <div className="relative" style={{ transform: "rotate(-2deg)" }}>
                {/* Glow behind the frame */}
                <div className="absolute -inset-8 bg-[#00c9c9]/15 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -inset-4 bg-[#0f3460]/20 blur-2xl rounded-3xl pointer-events-none" />

                {/* Browser frame */}
                <div
                  className="relative rounded-2xl overflow-hidden border border-white/15"
                  style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 16px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)" }}
                >
                  {/* Browser chrome bar */}
                  <div className="bg-[#1e2a3a] px-4 py-2.5 flex items-center gap-3">
                    {/* Traffic lights */}
                    <div className="flex gap-1.5 shrink-0">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    {/* URL bar */}
                    <div className="flex-1 bg-[#131f2e] rounded-md h-6 flex items-center px-3 gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400/60 shrink-0" />
                      <span className="text-white/35 text-[11px] font-mono">propia.online</span>
                    </div>
                    {/* Action icons placeholder */}
                    <div className="flex gap-2 shrink-0">
                      <div className="w-4 h-4 rounded bg-white/5" />
                      <div className="w-4 h-4 rounded bg-white/5" />
                    </div>
                  </div>

                  {/* Screenshot */}
                  <div className="relative">
                    <Image
                      src="/dashboard-mockup.png"
                      alt="PropIA dashboard"
                      width={960}
                      height={600}
                      className="w-full block"
                      priority
                    />
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

            {/* Generador de Ads — PRO */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#00c9c9]/30 flex flex-col gap-4 hover:shadow-md hover:border-[#00c9c9]/50 transition-all relative overflow-hidden">
              <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-full bg-[#00c9c9]/5 blur-2xl -translate-y-1/2 translate-x-1/4" />
              <div className="flex items-start justify-between gap-3 relative">
                <div className="bg-[#0f3460]/10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <Layers className="w-6 h-6 text-[#0f3460]" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#00c9c9]/10 text-[#00c9c9] border border-[#00c9c9]/30 rounded-full px-2.5 py-1 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  PRO
                </span>
              </div>
              <div className="relative">
                <h3 className="text-base font-bold text-[#0f3460]">Generador de Ads para Meta</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Ads en 4 estilos (Luxury, Moderno, Bold, Profesional) listos para Feed, Story y Banner en alta resolución.
                </p>
              </div>
            </div>

            {/* Carruseles IG — PRO MAX */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f59e0b]/30 flex flex-col gap-4 hover:shadow-md hover:border-[#f59e0b]/50 transition-all relative overflow-hidden">
              <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-full bg-[#f59e0b]/5 blur-2xl -translate-y-1/2 translate-x-1/4" />
              <div className="flex items-start justify-between gap-3 relative">
                <div className="bg-[#f59e0b]/10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <GalleryHorizontal className="w-6 h-6 text-[#f59e0b]" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 rounded-full px-2.5 py-1 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  PRO MAX
                </span>
              </div>
              <div className="relative">
                <h3 className="text-base font-bold text-[#0f3460]">Carruseles de Instagram</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  5 slides 1080×1080 con tu marca: foto + stats + detalles + ubicación + contacto. Descargá en PNG o ZIP.
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
          CTA — PRECIOS
      ══════════════════════════════════════════════════ */}
      <section style={{ background: "linear-gradient(135deg, #0f3460 0%, #0a1628 100%)" }} className="py-20 sm:py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-7">
          <div className="inline-flex items-center gap-2 bg-[#00c9c9]/15 border border-[#00c9c9]/30 text-[#00c9c9] text-xs font-semibold px-4 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Desde gratis hasta Pro Max
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            ¿Listo para publicar como un profesional?
          </h2>
          <p className="text-white/60 text-lg max-w-xl leading-relaxed">
            Empezá gratis hoy. Sin tarjeta de crédito. Escalá al plan que se adapte a tu ritmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-[#00c9c9]/20"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors border border-white/20"
            >
              Ver planes y precios
            </Link>
          </div>
          <div className="flex items-center gap-3 text-white/35 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            Garantía de devolución 7 días · Sin permanencia mínima
          </div>
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
