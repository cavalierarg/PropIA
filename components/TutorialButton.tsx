"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/onboarding.actions";
import "driver.js/dist/driver.css";

const TOUR_STEPS = [
  {
    element: "#main-content",
    popover: {
      title: "Bienvenido a PropIA 🚀",
      description:
        "Tu panel de control con estadísticas y acceso rápido a todo.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    element: "#nav-mis-propiedades",
    popover: {
      title: "Todo arranca acá 🏠",
      description:
        "Cargá tus propiedades una sola vez. Desde acá elegís qué herramienta usar.",
      side: "right" as const,
      align: "center" as const,
    },
  },
  {
    // floating step — no element, shows centered popover
    popover: {
      title: "7 herramientas disponibles ⚡",
      description:
        "Posts, reels, ads, carruseles, calendario, portal y tendencias. Seleccioná una propiedad y hacé clic en la que necesitás.",
      align: "center" as const,
    },
  },
  {
    element: "#nav-perfil",
    popover: {
      title: "Personalizá tu contenido 🎨",
      description:
        "Completá tu perfil de marca y la IA usará tu nombre, zona y estilo en todo el contenido.",
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
      window.location.href = "/mis-propiedades";
      return;
    }

    setRunning(true);

    const { driver } = await import("driver.js");

    const driverObj = driver({
      showProgress: true,
      progressText: "{{current}}/{{total}}",
      nextBtnText: "Siguiente →",
      prevBtnText: "← Atrás",
      doneBtnText: "¡Listo!",
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
