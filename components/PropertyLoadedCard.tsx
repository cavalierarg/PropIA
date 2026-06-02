"use client";

import { BuildingIcon, XIcon, PencilIcon } from "lucide-react";

interface Props {
  tipo: string;
  titulo?: string | null;
  ubicacion: string;
  precio?: string | null;
  metros?: string | null;
  foto?: string | null;
  onClear: () => void;
}

export default function PropertyLoadedCard({ tipo, titulo, ubicacion, precio, metros, foto, onClear }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#0f3460]/5 border border-[#0f3460]/15 rounded-xl">
      {/* Thumbnail */}
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/20" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-[#0f3460]/15 flex items-center justify-center shrink-0">
          <BuildingIcon className="w-5 h-5 text-[#0f3460]/60" />
        </div>
      )}

      {/* Info */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-xs font-bold text-[#0f3460] uppercase tracking-wide">Propiedad cargada</p>
        <p className="text-sm font-semibold text-[#0f3460] truncate">
          {titulo || tipo} — {ubicacion}
        </p>
        {(precio || metros) && (
          <p className="text-xs text-slate-500">
            {precio && <span>{precio}</span>}
            {precio && metros && <span> · </span>}
            {metros && <span>{metros} m²</span>}
          </p>
        )}
      </div>

      {/* Cambiar */}
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0f3460] px-2 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
      >
        <PencilIcon className="w-3 h-3" />
        Cambiar
      </button>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
        title="Quitar propiedad"
      >
        <XIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
