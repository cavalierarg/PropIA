'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { trackEvent } from '@/lib/meta-pixel';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Brain,
  TrendingDown,
  FileText,
  Zap,
  Copy,
  Star,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PRO_CHECKOUT_REDIRECT = '/checkout-redirect?plan=pro';
const PRO_MAX_CHECKOUT_REDIRECT = '/checkout-redirect?plan=pro_max';


// ─── Fade-in wrapper con IntersectionObserver ────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (el) {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(28px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {children}
    </div>
  );
}

// ─── Datos ───────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      'Antes me pasaba 2 horas escribiendo posts para cada propiedad. Ahora en 60 segundos tengo 5 opciones listas para Instagram y Facebook. Cerré 3 ventas este mes gracias al contenido que genera PropIA.',
    name: 'Carlos Mendoza',
    role: 'Agente inmobiliario',
    city: 'Buenos Aires, Argentina',
    metric: '3 ventas este mes',
    initials: 'CM',
    avatarBg: 'linear-gradient(135deg, #0f3460, #1a4a7a)',
  },
  {
    quote:
      'Lo que más me sorprendió fue la calidad del contenido para LinkedIn. Los posts suenan profesionales y específicos para cada propiedad. Mi equipo de 4 agentes lo usa todos los días.',
    name: 'Laura Jiménez',
    role: 'Directora de agencia',
    city: 'Madrid, España',
    metric: 'Equipo de 4 agentes',
    initials: 'LJ',
    avatarBg: 'linear-gradient(135deg, #00c9c9, #00a0a0)',
  },
  {
    quote:
      'El generador de reels me cambió la vida. Antes no sabía qué grabar ni qué decir. Ahora tengo el guion completo escena por escena y mis videos tienen el doble de alcance.',
    name: 'Roberto Silva',
    role: 'Agente independiente',
    city: 'Ciudad de México',
    metric: '2× de alcance en videos',
    initials: 'RS',
    avatarBg: 'linear-gradient(135deg, #1a5c3a, #2d8a5e)',
  },
];

// ─── Componente principal ────────────────────────────────────────────────────
export default function LandingPage() {
  const { isSignedIn } = useUser();
  const ctaHref = isSignedIn ? "/" : "/sign-up";
  const lineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent('ViewContent', { content_name: 'Landing', content_category: 'pricing' });
  }, []);

  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && lineRef.current) {
          lineRef.current.style.width = '100%';
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 1 — HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f3460 0%, #0a1628 100%)',
          paddingTop: 72,
          paddingBottom: 72,
        }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-[#00c9c9]/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#00c9c9]/[0.05] blur-2xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#1a4a7a]/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16">

            {/* ── Columna izquierda: texto ── */}
            <div className="flex-1 lg:max-w-[560px]">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#00c9c9]/[0.14] border border-[#00c9c9]/30 text-[#00c9c9] text-[11px] font-bold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                IA para agentes inmobiliarios
              </div>

              {/* H1 */}
              <h1
                className="font-black text-white"
                style={{
                  fontSize: 'clamp(36px, 4.5vw, 64px)',
                  lineHeight: 1.07,
                  letterSpacing: '-0.025em',
                }}
              >
                Generá 5 posts profesionales para tu propiedad{' '}
                <span className="text-[#00c9c9]">en 60 segundos.</span>
              </h1>

              {/* Subtítulo */}
              <p
                className="text-white/60 mt-7 leading-relaxed"
                style={{ fontSize: 'clamp(16px, 1.8vw, 20px)' }}
              >
                PropIA genera posts, reels, ads y calendarios para tus propiedades en segundos.{' '}
                <span className="text-white font-semibold">
                  La IA escribe, vos cerrás ventas.
                </span>
              </p>

              {/* Botones */}
              <div className="flex flex-col items-start sm:items-start gap-3 mt-10">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center gap-2 bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-black px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-xl shadow-[#00c9c9]/25 hover:shadow-[#00c9c9]/40 hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Empezar gratis
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors duration-200"
                >
                  Ver cómo funciona <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Precio visible */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4">
                <span className="text-white/50 text-sm">
                  Plan PRO desde{' '}
                  <span className="text-white font-bold">$29/mes</span>
                </span>
                <span className="text-white/20 hidden sm:inline">·</span>
                <span className="text-white/50 text-sm flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00c9c9] shrink-0" />
                  7 días gratis sin tarjeta
                </span>
                <span className="text-white/20 hidden sm:inline">·</span>
                <span className="text-white/50 text-sm flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00c9c9] shrink-0" />
                  Cancelá cuando quieras
                </span>
              </div>

              {/* Prueba social */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-white/60 text-sm ml-1">5.0</span>
                </div>
                <div className="w-px h-4 bg-white/15 hidden sm:block" />
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#00c9c9] shrink-0" />
                  Garantía de devolución 7 días
                </div>
                <div className="w-px h-4 bg-white/15 hidden sm:block" />
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Check className="w-4 h-4 text-[#00c9c9] shrink-0" />
                  Funciona con Claude AI de Anthropic
                </div>
              </div>

              {/* Video mobile (debajo del CTA, solo en mobile) */}
              <div className="mt-8 lg:hidden">
                <div className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl"
                  style={{ aspectRatio: '9/16' }}
                >
                  <iframe
                    src="https://www.youtube.com/embed/DRi9i6uwdmQ?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1&playlist=DRi9i6uwdmQ"
                    title="Demo PropIA"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </div>
            </div>

            {/* ── Columna derecha: iPhone frame con video (solo desktop) ── */}
            <div className="hidden lg:flex flex-shrink-0 items-center justify-center">
              {/* iPhone 14 Pro style */}
              <div className="relative" style={{ width: 220 }}>
                {/* Cuerpo del iPhone */}
                <div
                  className="relative bg-[#111] rounded-[44px] p-[3.5px]"
                  style={{
                    boxShadow: '0 0 0 1px #333, 0 0 0 2px #1a1a1a, 0 32px 80px rgba(0,0,0,0.75), 0 0 40px rgba(0,201,201,0.08)',
                  }}
                >
                  {/* Botón silencio (izquierda arriba) */}
                  <div className="absolute -left-[4px] top-[72px] w-[3px] h-[28px] bg-[#222] rounded-l-sm" />
                  {/* Botones volumen (izquierda) */}
                  <div className="absolute -left-[4px] top-[114px] w-[3px] h-[38px] bg-[#222] rounded-l-sm" />
                  <div className="absolute -left-[4px] top-[162px] w-[3px] h-[38px] bg-[#222] rounded-l-sm" />
                  {/* Botón encendido (derecha) */}
                  <div className="absolute -right-[4px] top-[106px] w-[3px] h-[60px] bg-[#222] rounded-r-sm" />

                  {/* Pantalla */}
                  <div
                    className="relative rounded-[41px] overflow-hidden bg-black"
                    style={{ aspectRatio: '9/19.5' }}
                  >
                    {/* Dynamic Island */}
                    <div
                      className="absolute top-[13px] left-1/2 -translate-x-1/2 z-20 bg-black rounded-full"
                      style={{ width: 78, height: 24 }}
                    />
                    {/* Video */}
                    <iframe
                      src="https://www.youtube.com/embed/DRi9i6uwdmQ?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1&playlist=DRi9i6uwdmQ"
                      title="Demo PropIA"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 2 — EL PROBLEMA
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ background: '#0a1628', paddingTop: 120, paddingBottom: 120 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-[#00c9c9] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
              El problema
            </p>
            <h2
              className="text-white font-black"
              style={{
                fontSize: 'clamp(32px, 4vw, 56px)',
                lineHeight: 1.1,
                letterSpacing: '-0.022em',
              }}
            >
              El problema que{' '}
              <span className="text-white/40">nadie habla</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                Icon: Clock,
                title: '30 minutos por propiedad',
                desc: 'Cada vez que tenés una propiedad nueva perdés media hora escribiendo posts distintos para cada red social.',
                delay: 0,
              },
              {
                Icon: Brain,
                title: 'Bloqueo creativo',
                desc: '¿Qué escribo hoy? ¿Cómo lo digo diferente? La página en blanco es el enemigo del agente.',
                delay: 130,
              },
              {
                Icon: TrendingDown,
                title: 'Inconsistencia que cuesta ventas',
                desc: 'Sin contenido regular perdés visibilidad. El algoritmo premia a quien publica todos los días.',
                delay: 260,
              },
            ].map(({ Icon, title, desc, delay }) => (
              <FadeIn key={title} delay={delay}>
                <div
                  className="rounded-2xl p-8 h-full"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shrink-0"
                    style={{ background: 'rgba(0,201,201,0.15)' }}
                  >
                    <Icon className="w-6 h-6 text-[#00c9c9]" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3 leading-snug">
                    {title}
                  </h3>
                  <p className="text-white/48 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 3 — CÓMO FUNCIONA
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="como-funciona"
        className="bg-white"
        style={{ paddingTop: 120, paddingBottom: 120 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-[#00c9c9] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
              El proceso
            </p>
            <h2
              className="text-[#0f3460] font-black"
              style={{
                fontSize: 'clamp(32px, 4vw, 56px)',
                lineHeight: 1.1,
                letterSpacing: '-0.022em',
              }}
            >
              ¿Cómo funciona?
            </h2>
            <p className="text-slate-400 mt-4 text-lg">
              De cero a publicado en menos de 2 minutos
            </p>
          </FadeIn>

          {/* Steps con línea conectora animada */}
          <div ref={stepsRef} className="relative">
            {/* Track de la línea */}
            <div className="hidden sm:block absolute top-[52px] left-[16.67%] right-[16.67%] h-[2px] bg-slate-100 overflow-hidden">
              <div
                ref={lineRef}
                className="h-full rounded-full"
                style={{
                  width: '0%',
                  background: 'linear-gradient(90deg, #0f3460, #00c9c9)',
                  transition: 'width 1.3s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
              {[
                {
                  Icon: FileText,
                  title: 'Cargá la propiedad',
                  desc: 'Ingresá tipo, ubicación, precio y tres características.',
                  time: '~30 seg',
                  highlight: false,
                  delay: 0,
                },
                {
                  Icon: Zap,
                  title: 'La IA genera los posts',
                  desc: '5 posts personalizados: 2 para Instagram, 2 para Facebook y 1 para LinkedIn.',
                  time: '~20 seg',
                  highlight: true,
                  delay: 150,
                },
                {
                  Icon: Copy,
                  title: 'Copiá y publicá',
                  desc: 'Un clic por post. Listo para pegar directo en tus redes.',
                  time: '~10 seg',
                  highlight: false,
                  delay: 300,
                },
              ].map(({ Icon, title, desc, time, highlight, delay }) => (
                <FadeIn key={title} delay={delay} className="flex flex-col items-center text-center">
                  {/* Círculo ícono */}
                  <div
                    className="w-[104px] h-[104px] rounded-full flex items-center justify-center mb-5 relative z-10 shrink-0"
                    style={
                      highlight
                        ? {
                            background: 'linear-gradient(135deg, #0f3460, #00c9c9)',
                            boxShadow: '0 16px 40px rgba(0,201,201,0.35)',
                          }
                        : {
                            background: '#f0f5ff',
                            border: '2px solid #e8eef8',
                          }
                    }
                  >
                    <Icon
                      className="w-10 h-10"
                      style={{ color: highlight ? '#fff' : '#0f3460' }}
                    />
                  </div>

                  {/* Badge de tiempo */}
                  <span
                    className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full mb-4"
                    style={
                      highlight
                        ? {
                            background: 'rgba(0,201,201,0.1)',
                            color: '#00c9c9',
                            border: '1px solid rgba(0,201,201,0.25)',
                          }
                        : {
                            background: '#f0f5ff',
                            color: '#0f3460',
                          }
                    }
                  >
                    {time}
                  </span>

                  <h3 className="text-[#0f3460] font-bold text-xl mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-[240px]">
                    {desc}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 3.5 — EJEMPLO DE POST GENERADO
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{ background: '#f7f9fc', paddingTop: 96, paddingBottom: 96 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <p className="text-[#00c9c9] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
              Resultado real
            </p>
            <h2
              className="font-black text-[#0f3460]"
              style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', lineHeight: 1.1 }}
            >
              Así queda un post generado con PropIA
            </h2>
            <p className="text-slate-500 mt-4 text-base max-w-xl mx-auto">
              Cargás los datos de la propiedad y la IA genera 5 versiones listas para publicar.
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Input */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Datos ingresados
                </p>
                <div className="flex flex-col gap-2.5 text-sm text-slate-600">
                  {[
                    { label: 'Propiedad', value: 'Departamento' },
                    { label: 'Ubicación', value: 'Palermo, Buenos Aires' },
                    { label: 'Superficie', value: '65 m²' },
                    { label: 'Precio', value: 'USD 185.000' },
                    { label: 'Características', value: '2 ambientes · 1 baño · Balcón · Luminoso' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-2">
                      <span className="font-semibold text-[#0f3460] min-w-[100px] shrink-0">{label}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output */}
              <div className="relative bg-white rounded-2xl border border-[#00c9c9]/40 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0f3460] to-[#00c9c9] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-[#00c9c9] uppercase tracking-widest">
                    Post generado — Instagram
                  </p>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {`🏠 Oportunidad única en Palermo

65 m² de puro aprovechamiento. Departamento de 2 ambientes con balcón al frente, iluminación natural todo el día y ubicación inmejorable.

✔️ A pasos del transporte
✔️ Expensas bajas
✔️ Ideal inversores o primera vivienda

📍 Palermo, Buenos Aires
💰 USD 185.000

¿Querés conocerlo? Escribime y coordinamos una visita 👇`}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Generado en</span>
                  <span className="text-xs font-bold text-[#0f3460]">12 segundos</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                    <Copy className="w-3.5 h-3.5" />
                    Listo para copiar
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-colors shadow-lg"
              >
                Generá tu primer post gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-slate-400 mt-3">
                Sin tarjeta · 5 generaciones gratuitas · Listo en 60 segundos
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 4 — TESTIMONIALES
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#fff', paddingTop: 120, paddingBottom: 120 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-[#00c9c9] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
              Casos reales
            </p>
            <h2
              className="text-[#0f3460] font-black"
              style={{
                fontSize: 'clamp(32px, 4vw, 56px)',
                lineHeight: 1.1,
                letterSpacing: '-0.022em',
              }}
            >
              Lo que dicen los agentes
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 120}>
                <div
                  className="bg-white rounded-2xl p-7 h-full flex flex-col gap-5"
                  style={{
                    borderLeft: '4px solid #00c9c9',
                    boxShadow: '0 4px 28px rgba(15,52,96,0.08)',
                  }}
                >
                  {/* Estrellas */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Cita */}
                  <p className="text-slate-600 text-sm leading-relaxed flex-1 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Métrica */}
                  <div
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg self-start"
                    style={{ background: 'rgba(0,201,201,0.1)', color: '#00b3b3' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {t.metric}
                  </div>

                  {/* Autor */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ background: t.avatarBg }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0f3460]">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role} · {t.city}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 5 — PLANES
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="precio"
        className="bg-slate-50"
        style={{ paddingTop: 120, paddingBottom: 120 }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-14">
            <p className="text-[#00c9c9] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
              Precios
            </p>
            <h2
              className="text-[#0f3460] font-black"
              style={{
                fontSize: 'clamp(32px, 4vw, 56px)',
                lineHeight: 1.1,
                letterSpacing: '-0.022em',
              }}
            >
              Planes simples y transparentes
            </h2>
            <p className="text-slate-400 mt-4 text-lg">
              Empezá gratis, escalá cuando estés listo
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center">

            {/* ── Plan Free ── */}
            <FadeIn delay={0}>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                <div className="px-6 pt-7 pb-6 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Free</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-[#0f3460]">$0</span>
                    <span className="text-slate-400 text-sm pb-1">para siempre</span>
                  </div>
                </div>
                <div className="px-6 py-6 flex flex-col gap-5 flex-1">
                  <ul className="flex flex-col gap-3">
                    {[
                      '5 generaciones gratis',
                      'Posts para Instagram, Facebook y LinkedIn',
                      'Historial de propiedades',
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-[#00c9c9] shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={ctaHref}
                    className="mt-auto block text-center border-2 border-[#0f3460] text-[#0f3460] font-semibold px-5 py-3 rounded-xl hover:bg-[#0f3460] hover:text-white transition-colors text-sm"
                  >
                    Empezar gratis
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* ── Plan Pro (destacado) ── */}
            <FadeIn delay={120}>
              <div className="relative sm:scale-[1.04] sm:z-10">
                <div
                  className="rounded-2xl p-px"
                  style={{ background: 'linear-gradient(135deg, #00c9c9 0%, #0f3460 50%, #00c9c9 100%)' }}
                >
                  <div className="bg-[#0f3460] rounded-2xl overflow-hidden flex flex-col">
                    <div className="pointer-events-none absolute top-0 right-0 w-40 h-40 rounded-full bg-[#00c9c9]/10 blur-2xl -translate-y-1/2 translate-x-1/3" />
                    <div className="px-6 pt-7 pb-6 border-b border-white/10 relative">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Pro</p>
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#00c9c9] text-[#0f3460] px-2.5 py-1 rounded-full">
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
                        {[
                          'Generaciones ilimitadas',
                          'Calendario de contenido (30 días)',
                          'Guiones para Reels',
                          'Descripción para portales',
                          'Análisis de tendencias',
                          'Generador de Ads básico (1 foto, 3 formatos, 4 estilos)',
                          'Soporte prioritario',
                        ].map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                            <Check className="w-4 h-4 text-[#00c9c9] shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={PRO_CHECKOUT_REDIRECT}
                        className="mt-auto block text-center bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-black px-5 py-3 rounded-xl transition-colors text-sm shadow-lg shadow-[#00c9c9]/20"
                      >
                        Probar PRO 7 días gratis
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ── Plan Pro Max ── */}
            <FadeIn delay={240}>
              <div className="bg-white rounded-2xl overflow-hidden flex flex-col border-2 border-[#f59e0b] shadow-sm relative">
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
                    {[
                      { text: 'Todo lo del plan PRO', gold: false },
                      { text: 'Ads avanzados: hasta 3 fotos simultáneas', gold: true },
                      { text: 'Carruseles IG: 5 slides 1080×1080 con tu marca', gold: true },
                      { text: 'Paleta de 3 colores por ad: fondo, acento y texto', gold: true },
                      { text: 'Descarga en ZIP de todos los formatos', gold: true },
                      { text: 'Publicación directa a Instagram y Facebook (próx.)', gold: true },
                    ].map(({ text, gold }) => (
                      <li key={text} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${gold ? 'text-[#f59e0b]' : 'text-emerald-500'}`} />
                        {text}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={PRO_MAX_CHECKOUT_REDIRECT}
                    className="mt-auto block text-center bg-[#f59e0b] hover:bg-[#e08e00] text-white font-black px-5 py-3 rounded-xl transition-colors text-sm"
                  >
                    Probar PRO MAX 7 días gratis
                  </Link>
                </div>
              </div>
            </FadeIn>

          </div>

          {/* Garantía */}
          <FadeIn delay={300} className="mt-8">
            <div className="flex items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 px-6 py-4">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-slate-600">
                <strong className="text-slate-800">Garantía de 7 días:</strong> Si no estás
                satisfecho, te devolvemos el dinero sin preguntas.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECCIÓN 6 — CTA FINAL
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#0a1628', paddingTop: 128, paddingBottom: 128 }}
      >
        {/* Patrón de puntos */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Blobs de color */}
        <div className="pointer-events-none absolute -top-48 left-1/4 w-[500px] h-[500px] rounded-full bg-[#00c9c9]/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 right-1/4 w-[500px] h-[500px] rounded-full bg-[#0f3460]/50 blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2
              className="text-white font-black"
              style={{
                fontSize: 'clamp(40px, 5.5vw, 72px)',
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
              }}
            >
              Empezá hoy,{' '}
              <span className="text-[#00c9c9]">gratis.</span>
            </h2>
            <p className="text-white/50 mt-6 text-xl leading-relaxed">
              Sin tarjeta de crédito. Sin límite de tiempo en el plan gratuito.
            </p>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-3 bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-black px-10 py-5 rounded-2xl text-lg transition-all duration-200 shadow-2xl shadow-[#00c9c9]/30 hover:shadow-[#00c9c9]/50 hover:-translate-y-0.5 mt-10"
            >
              Crear mi cuenta gratis
              <ArrowRight className="w-6 h-6" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#060d18' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Image
                  src="/logo.png"
                  alt="PropIA"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-xl font-bold text-white tracking-tight">
                  Prop<span className="text-[#00c9c9]">IA</span>
                </span>
              </div>
              <p className="text-white/35 text-sm leading-relaxed">
                Marketing inmobiliario potenciado por IA. Argentina &
                Latinoamérica.
              </p>
            </div>

            {/* Producto */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Generador de Posts', href: '/posts' },
                  { label: 'Calendario', href: '/calendario' },
                  { label: 'Guiones Reels', href: '/reels' },
                  { label: 'Generador de Ads', href: '/ads-generator' },
                  { label: 'Precios', href: '/pricing' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/40 hover:text-white text-sm transition-colors"
                    >
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
                  { label: 'Iniciar sesión', href: '/sign-in' },
                  { label: 'Registrarse', href: '/sign-up' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/40 hover:text-white text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contacto</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'cavalierarg@gmail.com', href: 'mailto:cavalierarg@gmail.com' },
                  { label: '@propia.app', href: 'https://instagram.com/propia.app' },
                  { label: 'Privacidad', href: 'mailto:cavalierarg@gmail.com?subject=Política de privacidad' },
                  { label: 'Términos de uso', href: 'mailto:cavalierarg@gmail.com?subject=Términos de uso' },
                ].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-white/40 hover:text-white text-sm transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-white/25 text-xs">
            <span>© {new Date().getFullYear()} PropIA. Todos los derechos reservados.</span>
            <span>Marketing inmobiliario con IA · Argentina & Latinoamérica</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
