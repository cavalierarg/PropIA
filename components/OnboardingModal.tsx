"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Sparkles, LayoutDashboard, Building2, Palette, Zap } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding.actions";
import { trackEvent } from "@/lib/meta-pixel";
import "driver.js/dist/driver.css";

interface OnboardingModalProps {
  firstName: string;
  plan: "free" | "pro" | "pro_max";
}

const TOUR_STEPS = [
  {
    element: "#main-content" as string | undefined,
    title: "Bienvenido a PropIA 🚀",
    description:
      "Tu panel de control con estadísticas y acceso rápido a todo.",
    side: "bottom" as const,
  },
  {
    element: "#nav-mis-propiedades" as string | undefined,
    title: "Todo arranca acá 🏠",
    description:
      "Cargá tus propiedades una sola vez. Desde acá elegís qué herramienta usar.",
    side: "right" as const,
  },
  {
    element: undefined,
    title: "7 herramientas disponibles ⚡",
    description:
      "Posts, reels, ads, carruseles, calendario, portal y tendencias. Seleccioná una propiedad y hacé clic en la que necesitás — la IA genera todo.",
    side: "bottom" as const,
  },
  {
    element: "#nav-perfil" as string | undefined,
    title: "Personalizá tu contenido 🎨",
    description:
      "Completá tu perfil de marca y la IA usará tu nombre, zona y estilo en todo el contenido que genere.",
    side: "right" as const,
  },
];

const STEPS_PREVIEW = [
  { icon: LayoutDashboard, label: "Dashboard → punto de control" },
  { icon: Building2, label: "Mis Propiedades → hub central" },
  { icon: Zap, label: "7 herramientas → posts, reels, ads y más" },
  { icon: Palette, label: "Perfil de marca → personalizá la IA" },
];

export default function OnboardingModal({ firstName, plan }: OnboardingModalProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    trackEvent("CompleteRegistration");
  }, []);

  const handleSkip = useCallback(async () => {
    setVisible(false);
    await completeOnboarding();
    router.refresh();
  }, [router]);

  const handleStartTour = useCallback(async () => {
    setVisible(false);

    if (typeof window === "undefined" || window.innerWidth < 1024) {
      await completeOnboarding();
      return;
    }

    try {
      const { driver } = await import("driver.js");

      const steps = TOUR_STEPS.map((s) => {
        const step: Record<string, unknown> = {
          popover: {
            title: s.title,
            description: s.description,
            side: s.side,
            align: "center",
          },
        };
        if (s.element) step.element = s.element;
        return step;
      });

      const driverObj = driver({
        showProgress: true,
        progressText: "{{current}}/{{total}}",
        nextBtnText: "Siguiente →",
        prevBtnText: "← Atrás",
        doneBtnText: "¡Empezar!",
        steps,
        onDestroyed: () => {
          completeOnboarding().then(() => router.refresh());
        },
      });

      driverObj.drive();
    } catch {
      await completeOnboarding();
      router.refresh();
    }
  }, [router]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="rounded-2xl p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-300"
        style={{
          background: "linear-gradient(135deg, #0f3460 0%, #0a1628 100%)",
          border: "1px solid rgba(0, 201, 201, 0.2)",
        }}
      >
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(0, 201, 201, 0.15)",
              border: "1px solid rgba(0, 201, 201, 0.3)",
            }}
          >
            <Sparkles className="w-7 h-7 text-[#00c9c9]" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              ¡Bienvenido, {firstName}! 👋
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              En 4 pasos te mostramos cómo sacarle el máximo provecho a PropIA.
            </p>
          </div>

          <div className="w-full space-y-2">
            {STEPS_PREVIEW.map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(0,201,201,0.15)",
                    color: "#00c9c9",
                    border: "1px solid rgba(0,201,201,0.3)",
                  }}
                >
                  {i + 1}
                </span>
                <Icon className="w-4 h-4 shrink-0" style={{ color: "rgba(0,201,201,0.65)" }} />
                <span className="text-sm text-left" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStartTour}
            className="w-full font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
            style={{ background: "#00c9c9", color: "#0f3460" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#00b3b3")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#00c9c9")}
          >
            Empezar tour <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSkip}
            className="text-sm transition-colors -mt-2"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)")}
          >
            Saltar tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
