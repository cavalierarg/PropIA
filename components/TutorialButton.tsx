"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding.actions";
import "driver.js/dist/driver.css";

const TOUR_STEPS = [
  {
    element: "#nav-generar-posts",
    popover: {
      title: "Generá posts con IA",
      description:
        "Acá generás posts para todas tus redes. Cargás los datos de tu propiedad y la IA escribe todo.",
      side: "right" as const,
      align: "center" as const,
    },
  },
  {
    element: "#main-content",
    popover: {
      title: "Tu panel principal",
      description:
        "Este es tu panel principal. Ves tus generaciones del mes y accedés a todas las herramientas.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    element: "#nav-mis-propiedades",
    popover: {
      title: "Mis Propiedades",
      description:
        "Acá guardamos todas las propiedades que generaste. Podés volver a ver los posts cuando quieras.",
      side: "right" as const,
      align: "center" as const,
    },
  },
  {
    element: "#sidebar-plan-badge",
    popover: {
      title: "Tu plan actual",
      description:
        "Desde acá podés ver tu plan y upgradear cuando lo necesites.",
      side: "right" as const,
      align: "center" as const,
    },
  },
];

export default function TutorialButton() {
  const [running, setRunning] = useState(false);

  const handleClick = async () => {
    if (running || typeof window === "undefined") return;

    if (window.innerWidth < 1024) {
      // En mobile el tour no encaja bien — abrimos directamente /perfil como ayuda
      window.location.href = "/perfil";
      return;
    }

    setRunning(true);

    const { driver } = await import("driver.js");

    const driverObj = driver({
      showProgress: true,
      progressText: "Paso {{current}} de {{total}}",
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "Entendido",
      steps: TOUR_STEPS,
      onDestroyed: () => {
        setRunning(false);
        void completeOnboarding();
      },
    });

    driverObj.drive();
  };

  return (
    <button
      onClick={handleClick}
      disabled={running}
      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-500 transition-colors disabled:opacity-50"
    >
      <BookOpen className="w-3.5 h-3.5" />
      Ver tutorial de nuevo
    </button>
  );
}
