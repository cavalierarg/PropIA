"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding.actions";
import { trackEvent } from "@/lib/meta-pixel";
import "driver.js/dist/driver.css";

interface OnboardingModalProps {
  firstName: string;
  plan: "free" | "pro" | "pro_max";
}

const TOUR_STEPS = [
  {
    element: "#nav-generar-posts",
    title: "Generá posts con IA",
    description:
      "Acá generás posts para todas tus redes. Cargás los datos de tu propiedad y la IA escribe todo.",
    side: "right" as const,
  },
  {
    element: "#main-content",
    title: "Tu panel principal",
    description:
      "Este es tu panel principal. Ves tus generaciones del mes y accedés a todas las herramientas.",
    side: "bottom" as const,
  },
  {
    element: "#nav-mis-propiedades",
    title: "Mis Propiedades",
    description:
      "Acá guardamos todas las propiedades que generaste. Podés volver a ver los posts cuando quieras.",
    side: "right" as const,
  },
  {
    element: "#sidebar-plan-badge",
    title: "Tu plan actual",
    description: "", // Populated dynamically based on plan
    side: "right" as const,
  },
];

export default function OnboardingModal({ firstName, plan }: OnboardingModalProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    trackEvent("CompleteRegistration");
  }, []);

  const planDescription =
    plan === "free"
      ? "Estás en el plan Free con 5 generaciones. Cuando estés listo podés upgradear a Pro para generaciones ilimitadas y más features."
      : "Tenés acceso a todas las herramientas de PropIA. Generaciones ilimitadas incluidas.";

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

    const { driver } = await import("driver.js");

    const steps = TOUR_STEPS.map((s) => ({
      element: s.element,
      popover: {
        title: s.title,
        description: s.element === "#sidebar-plan-badge" ? planDescription : s.description,
        side: s.side,
        align: "center" as const,
      },
    }));

    const driverObj = driver({
      showProgress: true,
      progressText: "Paso {{current}} de {{total}}",
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "Entendido, empezar",
      steps,
      onDestroyed: () => {
        completeOnboarding().then(() => router.refresh());
      },
    });

    driverObj.drive();
  }, [planDescription]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0f3460] to-[#00c9c9] flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0f3460] mb-2">
              ¡Bienvenido a PropIA, {firstName}!
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              En 3 pasos te mostramos cómo generar tu primer post inmobiliario.
            </p>
          </div>

          <div className="w-full space-y-2.5">
            {[
              "Completá los datos de tu propiedad",
              "La IA genera 5 posts en segundos",
              "Copiá y publicá en tus redes",
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3"
              >
                <span className="w-6 h-6 rounded-full bg-[#00c9c9] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-600 text-left">{text}</span>
                <CheckCircle2 className="w-4 h-4 text-[#00c9c9]/40 ml-auto shrink-0" />
              </div>
            ))}
          </div>

          <button
            onClick={handleStartTour}
            className="w-full bg-[#0f3460] hover:bg-[#0f3460]/90 text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Empezar tour <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSkip}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors -mt-2"
          >
            Saltar tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
