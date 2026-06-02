"use client";

import { useRouter } from "next/navigation";
import { XIcon, FileTextIcon, CalendarDaysIcon, HomeIcon, VideoIcon, LayersIcon, GalleryHorizontalIcon, TrendingUpIcon } from "lucide-react";
import type { SavedProperty } from "@/lib/actions/properties.actions";

interface Props {
  property: SavedProperty;
  open: boolean;
  onClose: () => void;
  userPlan?: "free" | "pro" | "pro_max";
}

const TOOLS = [
  {
    label: "Generar Posts",
    desc: "5 posts para Instagram, Facebook y LinkedIn",
    icon: FileTextIcon,
    href: "/posts",
    useParams: true,
    plan: null,
    color: "text-[#0f3460]",
    bg: "bg-[#0f3460]/8",
  },
  {
    label: "Calendario 30 días",
    desc: "Plan de contenido mensual completo",
    icon: CalendarDaysIcon,
    href: "/calendario",
    plan: "pro",
    color: "text-[#00c9c9]",
    bg: "bg-[#00c9c9]/10",
  },
  {
    label: "Descripción para Portal",
    desc: "Texto para Zonaprop, Idealista, Fotocasa",
    icon: HomeIcon,
    href: "/descripcion",
    plan: "pro",
    color: "text-[#00c9c9]",
    bg: "bg-[#00c9c9]/10",
  },
  {
    label: "Guion para Reels",
    desc: "Script escena a escena con hooks fuertes",
    icon: VideoIcon,
    href: "/reels",
    plan: "pro",
    color: "text-[#00c9c9]",
    bg: "bg-[#00c9c9]/10",
  },
  {
    label: "Tendencias del mercado",
    desc: "Análisis de tendencias con búsqueda en tiempo real",
    icon: TrendingUpIcon,
    href: "/tendencias",
    plan: "pro",
    color: "text-[#00c9c9]",
    bg: "bg-[#00c9c9]/10",
  },
  {
    label: "Generador de Ads",
    desc: "3 formatos listos para Meta Ads",
    icon: LayersIcon,
    href: "/ads-generator",
    plan: "pro",
    color: "text-[#00c9c9]",
    bg: "bg-[#00c9c9]/10",
  },
  {
    label: "Carruseles Instagram",
    desc: "5 slides 1080×1080 con tu marca",
    icon: GalleryHorizontalIcon,
    href: "/carousels",
    plan: "pro_max",
    color: "text-[#f59e0b]",
    bg: "bg-[#f59e0b]/10",
  },
] as const;

function savePrefill(property: SavedProperty) {
  try {
    localStorage.setItem(
      "propia_property_prefill",
      JSON.stringify({
        tipoPropiedad: property.tipo_propiedad,
        ubicacion: property.ubicacion,
        precio: property.precio,
        metrosCuadrados: property.metros_cuadrados,
        caracteristica1: property.caracteristica1 ?? "",
        caracteristica2: property.caracteristica2 ?? "",
        caracteristica3: property.caracteristica3 ?? "",
      })
    );
  } catch {}
}

export default function GenerarModal({ property, open, onClose, userPlan = "free" }: Props) {
  const router = useRouter();

  if (!open) return null;

  const handleSelect = (tool: typeof TOOLS[number]) => {
    savePrefill(property);
    onClose();

    if ("useParams" in tool && tool.useParams) {
      const params = new URLSearchParams({
        tipoPropiedad: property.tipo_propiedad,
        ubicacion: property.ubicacion,
        metrosCuadrados: property.metros_cuadrados,
        precio: property.precio,
        caracteristica1: property.caracteristica1 ?? "",
        caracteristica2: property.caracteristica2 ?? "",
        caracteristica3: property.caracteristica3 ?? "",
      });
      router.push(`${tool.href}?${params.toString()}`);
    } else {
      router.push(tool.href);
    }
  };

  const planRank = { free: 0, pro: 1, pro_max: 2 };
  const userRank = planRank[userPlan];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#0f3460]">¿Qué querés generar?</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[320px]">
              {property.titulo || property.tipo_propiedad} — {property.ubicacion}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Tools grid */}
        <div className="overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TOOLS.map((tool) => {
              const toolRank = tool.plan === null ? 0 : tool.plan === "pro" ? 1 : 2;
              const locked = toolRank > userRank;
              const Icon = tool.icon;

              return (
                <button
                  key={tool.href}
                  type="button"
                  onClick={() => !locked && handleSelect(tool)}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                    locked
                      ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                      : "border-[#0f3460]/10 hover:border-[#00c9c9]/40 hover:bg-[#00c9c9]/4 cursor-pointer"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl ${tool.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${tool.color}`} style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-[#0f3460]">{tool.label}</span>
                      {tool.plan === "pro" && (
                        <span className="text-[9px] font-bold bg-[#00c9c9]/15 text-[#0f3460] px-1.5 py-0.5 rounded-full">PRO</span>
                      )}
                      {tool.plan === "pro_max" && (
                        <span className="text-[9px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] px-1.5 py-0.5 rounded-full">MAX</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 leading-snug">{tool.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
