"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/meta-pixel";

export default function PaymentSuccessPage() {
  useEffect(() => {
    trackEvent("Subscribe", { currency: "USD", value: 29 });
    trackEvent("Purchase", { currency: "USD", value: 29 });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f3460] to-[#0a1628] px-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#00c9c9]/15 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-[#00c9c9]" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#0f3460] mb-2">
            ¡Suscripción activada!
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Tu plan PRO ya está activo. Podés empezar a generar contenido
            ilimitado ahora mismo.
          </p>
        </div>

        <div className="w-full bg-slate-50 rounded-2xl p-4 flex flex-col gap-2 text-sm text-slate-600">
          {[
            "Generaciones ilimitadas activadas",
            "Calendario de contenido habilitado",
            "Guiones para Reels disponibles",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00c9c9] shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <Link
          href="/posts"
          className="w-full bg-[#0f3460] hover:bg-[#0f3460]/90 text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-center"
        >
          Ir al generador de posts
        </Link>

        <p className="text-xs text-slate-400">
          ¿Alguna pregunta?{" "}
          <a
            href="mailto:cavalierarg@gmail.com"
            className="underline hover:text-slate-600"
          >
            cavalierarg@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
