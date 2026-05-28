'use client';

import { useEffect, useRef, type ReactNode } from 'react';
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
      'Pasé de publicar 2 veces por semana a publicar todos los días. En 30 días conseguí 3 clientes nuevos.',
    name: 'Marcela G.',
    city: 'Buenos Aires',
    metric: '+3 clientes en 30 días',
    initials: 'MG',
  },
  {
    quote:
      'El calendario de contenido me cambió la vida. Antes improvisaba, ahora tengo 30 días planificados en 5 minutos y mis seguidores aumentaron un 60%.',
    name: 'Lucas R.',
    city: 'Córdoba',
    metric: '+60% de seguidores',
    initials: 'LR',
  },
  {
    quote:
      'Antes tardaba 2 horas redactando posts. Ahora en 60 segundos tengo todo listo. Cerré 2 ventas más este mes gracias a la constancia.',
    name: 'Carolina M.',
    city: 'Rosario',
    metric: '2 ventas extra este mes',
    initials: 'CM',
  },
];

// ─── Componente principal ────────────────────────────────────────────────────
export default function LandingPage() {
  const lineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

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
          paddingTop: 88,
          paddingBottom: 96,
        }}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-[#00c9c9]/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#00c9c9]/[0.05] blur-2xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#1a4a7a]/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16 gap-12">

            {/* ── Columna izquierda ── */}
            <div className="lg:w-[46%]">
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
                ¿Cuántas horas perdés por semana{' '}
                <span className="text-[#00c9c9]">escribiendo posts</span>{' '}
                de propiedades?
              </h1>

              {/* Subtítulo */}
              <p
                className="text-white/60 mt-7 leading-relaxed"
                style={{ fontSize: 'clamp(16px, 1.8vw, 20px)' }}
              >
                PropIA genera 5 posts profesionales para Instagram, Facebook y
                LinkedIn en{' '}
                <span
                  className="text-white font-bold"
                  style={{
                    backgroundImage:
                      'linear-gradient(transparent calc(100% - 3px), #00c9c9 3px)',
                    backgroundRepeat: 'no-repeat',
                    paddingBottom: '3px',
                  }}
                >
                  60 segundos
                </span>
                . La IA escribe, vos cerrás ventas.
              </p>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-2 bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-black px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-xl shadow-[#00c9c9]/25 hover:shadow-[#00c9c9]/40 hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Empezar gratis
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 border border-white/25 hover:border-white/50 hover:bg-white/[0.06]"
                >
                  Ver cómo funciona
                </a>
              </div>

              {/* Prueba social */}
              <div className="flex items-center gap-3 mt-7">
                <div className="flex -space-x-2 shrink-0">
                  {(['M', 'L', 'C', 'J'] as const).map((initial, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#0a1628] flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: i % 2 === 0 ? '#00c9c9' : '#1a4d8f' }}
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-white/40 text-sm">
                  Más de{' '}
                  <span className="text-white/70 font-semibold">100 agentes</span>{' '}
                  ya usan PropIA en Latinoamérica
                </p>
              </div>
            </div>

            {/* ── Columna derecha: mockup ── */}
            <div className="hidden lg:block lg:w-[54%]">
              <div className="relative" style={{ transform: 'rotate(-1.5deg)' }}>
                <div className="absolute -inset-10 bg-[#00c9c9]/10 blur-3xl rounded-full pointer-events-none" />
                <div
                  className="relative rounded-2xl overflow-hidden border border-white/[0.1]"
                  style={{
                    boxShadow:
                      '0 48px 96px rgba(0,0,0,0.55), 0 16px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Barra del navegador */}
                  <div className="bg-[#1e2a3a] px-4 py-2.5 flex items-center gap-3">
                    <div className="flex gap-1.5 shrink-0">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <div className="flex-1 bg-[#131f2e] rounded-md h-6 flex items-center px-3 gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400/60 shrink-0" />
                      <span className="text-white/35 text-[11px] font-mono">
                        propia.online
                      </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <div className="w-4 h-4 rounded bg-white/5" />
                      <div className="w-4 h-4 rounded bg-white/5" />
                    </div>
                  </div>
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
          SECCIÓN 4 — TESTIMONIALES
      ══════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: '#f7f9fc', paddingTop: 120, paddingBottom: 120 }}>
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
                      style={{
                        background: 'linear-gradient(135deg, #0f3460, #00c9c9)',
                      }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0f3460]">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.city}</p>
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
                    href="/sign-in"
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
                      { text: 'Selector de color de marca completo', gold: true },
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
              href="/sign-in"
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

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Privacidad', href: '#' },
                  { label: 'Términos de uso', href: '#' },
                  { label: 'Contacto', href: 'mailto:hola@propia.online' },
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
