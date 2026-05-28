"use client";

import { X, Sparkles, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/meta-pixel";

interface UpgradeModalProps {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0f3460] to-[#00c9c9] flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#0f3460] mb-2">
              Agotaste tus generaciones del mes
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Con el Plan PRO generás contenido ilimitado para todas tus propiedades, todos los días.
            </p>
          </div>

          <div className="w-full bg-slate-50 rounded-2xl p-4 flex flex-col gap-2.5 text-sm text-slate-600">
            {[
              "Generaciones ilimitadas este mes y siempre",
              "Calendario de contenido de 30 días",
              "Guiones para Reels con tendencias reales",
              "Análisis de tendencias del mercado",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 text-[#00c9c9] shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <div className="w-full flex flex-col gap-3">
            <Link
              href="/checkout-redirect?plan=pro"
              onClick={() => {
                trackEvent("InitiateCheckout");
                onClose();
              }}
              className="w-full bg-[#0f3460] hover:bg-[#0f3460]/90 text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Empezar 7 días gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-slate-400">
              Sin tarjeta requerida · Cancelá cuando quieras
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors -mt-2"
          >
            Quizás más tarde
          </button>
        </div>
      </div>
    </div>
  );
}
