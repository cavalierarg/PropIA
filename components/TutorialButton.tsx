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
        "Este es tu panel de control. Desde acá ves tus estadísticas, accedés a todo y seguís tu progreso del mes.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    element: "#nav-mis-propiedades",
    popover: {
      title: "Empezá por tus propiedades 🏠",
      description:
        "Cargá tus propiedades una sola vez y usálas en todas las herramientas. Es el corazón de PropIA.",
      side: "right" as const,
      align: "center" as const,
    },
  },
  {
    element: "#nav-generar-posts",
    popover: {
      title: "Generá contenido en segundos ⚡",
      description:
        "Desde cada propiedad elegís qué generar: posts, reels, ads, carruseles, calendario y más. La IA escribe, vos cerrás ventas.",
      side: "right" as const,
      align: "center" as const,
    },
  },
  {
    element: "#nav-perfil",
    popover: {
      title: "Personalizá tu contenido 🎨",
      description:
        "Completá tu perfil de marca una vez y la IA usará tu nombre, zona y estilo en todo el contenido que genere.",
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
