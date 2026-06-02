"use client";

import { useState } from "react";
import { FolderOpenIcon, SearchIcon, XIcon, BuildingIcon } from "lucide-react";
import { getUserProperties, type SavedProperty } from "@/lib/actions/properties.actions";

export interface PropertyPrefill {
  tipoPropiedad: string;
  ubicacion: string;
  precio: string;
  metrosCuadrados: string;
  caracteristica1: string;
  caracteristica2: string;
  caracteristica3: string;
}

interface Props {
  onSelect: (prefill: PropertyPrefill, property: SavedProperty) => void;
}

export default function PropertySelector({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleOpen = async () => {
    setOpen(true);
    if (properties.length > 0) return;
    setLoading(true);
    try {
      const data = await getUserProperties();
      setProperties(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (property: SavedProperty) => {
    const prefill: PropertyPrefill = {
      tipoPropiedad: property.tipo_propiedad ?? "",
      ubicacion: property.ubicacion ?? "",
      precio: property.precio ?? "",
      metrosCuadrados: property.metros_cuadrados ?? "",
      caracteristica1: property.caracteristica1 ?? "",
      caracteristica2: property.caracteristica2 ?? "",
      caracteristica3: property.caracteristica3 ?? "",
    };
    onSelect(prefill, property);
    setOpen(false);
    setSearch("");
  };

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (p.titulo ?? "").toLowerCase().includes(q) ||
      p.ubicacion.toLowerCase().includes(q) ||
      p.tipo_propiedad.toLowerCase().includes(q)
    );
  });

  const active = properties.filter(
    (p) => (p.estado ?? "disponible") === "disponible" || (p.estado ?? "") === "reservada"
  );
  const hasActive = active.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#0f3460] bg-[#0f3460]/6 hover:bg-[#0f3460]/12 border border-[#0f3460]/15 px-3.5 py-2 rounded-xl transition-colors"
      >
        <FolderOpenIcon className="w-4 h-4" />
        Cargar propiedad guardada
        {hasActive && (
          <span className="text-[10px] bg-[#00c9c9]/20 text-[#0f3460] font-bold px-1.5 py-0.5 rounded-full">
            {active.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setOpen(false); setSearch(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0f3460]">Seleccioná una propiedad</h3>
              <button
                type="button"
                onClick={() => { setOpen(false); setSearch(""); }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, zona o tipo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-[#0f3460]/20 border-t-[#0f3460] rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                  <BuildingIcon className="w-8 h-8 text-slate-200" />
                  <p className="text-sm text-slate-400">
                    {properties.length === 0
                      ? "No tenés propiedades guardadas todavía"
                      : "Ninguna coincide con tu búsqueda"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-50">
                  {filtered.map((p) => {
                    const estado = p.estado ?? "disponible";
                    const inactive = estado === "vendida" || estado === "alquilada";
                    const foto = (p.foto_urls ?? [])[0];
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelect(p)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#00c9c9]/6 transition-colors text-left ${inactive ? "opacity-50" : ""}`}
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0 flex items-center justify-center">
                          {foto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={foto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BuildingIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#0f3460] truncate">
                            {p.titulo || p.tipo_propiedad}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{p.ubicacion}</p>
                          <p className="text-xs text-slate-400">
                            {p.moneda ?? "USD"} {p.precio} · {p.metros_cuadrados} m²
                          </p>
                        </div>
                        {/* Estado badge */}
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          estado === "disponible" ? "bg-green-50 text-green-700 border-green-200" :
                          estado === "reservada" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
