"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  type SavedProperty,
  type PropertyEstado,
  deleteProperty,
  updatePropertyStatus,
} from "@/lib/actions/properties.actions";
import { toast } from "sonner";
import {
  BuildingIcon,
  CalendarDays,
  CalendarIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GalleryHorizontal,
  Home,
  Layers,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  TrashIcon,
  TrendingUp,
  Video,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertySaveModal from "@/components/PropertySaveModal";
import GenerarModal from "@/components/GenerarModal";

/* ── Constants ── */

const ESTADO_CONFIG: Record<
  PropertyEstado,
  { label: string; dot: string; badge: string }
> = {
  disponible: {
    label: "Disponible",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  reservada: {
    label: "Reservada",
    dot: "bg-yellow-500",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  vendida: {
    label: "Vendida",
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-500 border-slate-200",
  },
  alquilada: {
    label: "Alquilada",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const HERRAMIENTAS = [
  { label: "Generar Posts", href: "/posts", useParams: true },
  { label: "Calendario de Contenido", href: "/calendario" },
  { label: "Descripción para Portal", href: "/descripcion" },
  { label: "Guion para Reels", href: "/reels" },
  { label: "Generador de Ads", href: "/ads-generator" },
  { label: "Generador de Carruseles", href: "/carousels" },
] as const;

const TOOL_CARDS = [
  {
    label: "Generar Posts",
    desc: "5 posts para Instagram, Facebook y LinkedIn",
    icon: FileTextIcon,
    href: "/posts",
    useParams: true,
    plan: null,
  },
  {
    label: "Calendario",
    desc: "Plan de 30 días listo para publicar",
    icon: CalendarDays,
    href: "/calendario",
    plan: "pro" as const,
  },
  {
    label: "Portal Inmobiliario",
    desc: "Descripción para Zonaprop y más",
    icon: Home,
    href: "/descripcion",
    plan: "pro" as const,
  },
  {
    label: "Guiones Reels",
    desc: "Guion escena x escena con hooks virales",
    icon: Video,
    href: "/reels",
    plan: "pro" as const,
  },
  {
    label: "Tendencias",
    desc: "Qué publicar hoy según el mercado",
    icon: TrendingUp,
    href: "/tendencias",
    plan: "pro" as const,
  },
  {
    label: "Generador de Ads",
    desc: "Ads profesionales en 3 formatos",
    icon: Layers,
    href: "/ads-generator",
    plan: "pro" as const,
  },
  {
    label: "Carruseles IG",
    desc: "Carrusel de 5 slides listo para Instagram",
    icon: GalleryHorizontal,
    href: "/carousels",
    plan: "pro_max" as const,
  },
] as const;

const FILTROS = [
  { value: "todas", label: "Todas" },
  { value: "disponible", label: "Disponibles" },
  { value: "reservada", label: "Reservadas" },
  { value: "vendida", label: "Vendidas" },
  { value: "alquilada", label: "Alquiladas" },
];

/* ── Helpers ── */

function getEstado(p: SavedProperty): PropertyEstado {
  return p.estado ?? "disponible";
}

function isInactive(p: SavedProperty) {
  const e = getEstado(p);
  return e === "vendida" || e === "alquilada";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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

/* ── Main component ── */

export default function MisPropiedadesList({
  initialProperties,
}: {
  initialProperties: SavedProperty[];
}) {
  const router = useRouter();
  const [properties, setProperties] = useState(initialProperties);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editProperty, setEditProperty] = useState<SavedProperty | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [generarProperty, setGenerarProperty] = useState<SavedProperty | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [highlightProperties, setHighlightProperties] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const propiedadesRef = useRef<HTMLDivElement | null>(null);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) ?? null;

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
        setOpenStatusId(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Filtering + sorting ── */
  const filtered = properties
    .filter((p) => {
      const q = search.toLowerCase();
      if (
        q &&
        !p.ubicacion.toLowerCase().includes(q) &&
        !p.tipo_propiedad.toLowerCase().includes(q)
      )
        return false;
      if (filtro !== "todas" && getEstado(p) !== filtro) return false;
      return true;
    })
    .sort((a, b) => {
      const aInactive = isInactive(a);
      const bInactive = isInactive(b);
      if (aInactive !== bInactive) return aInactive ? 1 : -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  /* ── Counts for filter tabs ── */
  const counts = {
    todas: properties.length,
    disponible: properties.filter((p) => getEstado(p) === "disponible").length,
    reservada: properties.filter((p) => getEstado(p) === "reservada").length,
    vendida: properties.filter((p) => getEstado(p) === "vendida").length,
    alquilada: properties.filter((p) => getEstado(p) === "alquilada").length,
  };

  /* ── Actions ── */
  const handleUseIn = (
    property: SavedProperty,
    href: string,
    useParams?: boolean
  ) => {
    savePrefill(property);
    setOpenMenuId(null);
    if (useParams) {
      const params = new URLSearchParams({
        tipoPropiedad: property.tipo_propiedad,
        ubicacion: property.ubicacion,
        metrosCuadrados: property.metros_cuadrados,
        precio: property.precio,
        caracteristica1: property.caracteristica1 ?? "",
        caracteristica2: property.caracteristica2 ?? "",
        caracteristica3: property.caracteristica3 ?? "",
      });
      router.push(`${href}?${params.toString()}`);
    } else {
      router.push(href);
    }
  };

  const handleToolSelect = (tool: (typeof TOOL_CARDS)[number]) => {
    if (!selectedProperty) {
      propiedadesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightProperties(true);
      setTimeout(() => setHighlightProperties(false), 2500);
      return;
    }

    savePrefill(selectedProperty);

    if ("useParams" in tool && tool.useParams) {
      const params = new URLSearchParams({
        tipoPropiedad: selectedProperty.tipo_propiedad,
        ubicacion: selectedProperty.ubicacion,
        metrosCuadrados: selectedProperty.metros_cuadrados,
        precio: selectedProperty.precio,
        caracteristica1: selectedProperty.caracteristica1 ?? "",
        caracteristica2: selectedProperty.caracteristica2 ?? "",
        caracteristica3: selectedProperty.caracteristica3 ?? "",
      });
      router.push(`${tool.href}?${params.toString()}`);
    } else {
      router.push(tool.href);
    }
  };

  const handleStatusChange = async (id: string, estado: PropertyEstado) => {
    setOpenStatusId(null);
    const result = await updatePropertyStatus(id, estado);
    if (result.ok) {
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado } : p))
      );
      toast.success(`Estado actualizado a ${ESTADO_CONFIG[estado].label}`);
    } else {
      toast.error("No se pudo actualizar el estado");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteProperty(deleteId);
    if (result.ok) {
      if (selectedPropertyId === deleteId) setSelectedPropertyId(null);
      setProperties((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Propiedad eliminada");
    } else {
      toast.error("No se pudo eliminar la propiedad");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div ref={menuRef} className="flex flex-col gap-8">

      {/* ── ¿Qué querés generar? ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-base font-bold text-[#0f3460]">¿Qué querés generar?</h2>
          {selectedProperty ? (
            <div className="flex items-center gap-2 bg-[#00c9c9]/10 border border-[#00c9c9]/30 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c9c9] shrink-0" />
              <span className="text-xs font-semibold text-[#0f3460] truncate max-w-[200px]">
                {selectedProperty.titulo || selectedProperty.tipo_propiedad} — {selectedProperty.ubicacion}
              </span>
              <button
                onClick={() => setSelectedPropertyId(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors ml-1 shrink-0"
                aria-label="Quitar selección"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Seleccioná una propiedad abajo primero
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TOOL_CARDS.map((tool) => {
            const Icon = tool.icon;
            const isProMax = tool.plan === "pro_max";
            const isPro = tool.plan === "pro";
            const iconBg = isProMax ? "bg-[#f59e0b]/10" : isPro ? "bg-[#00c9c9]/10" : "bg-[#0f3460]/8";
            const iconColor = isProMax ? "text-[#f59e0b]" : isPro ? "text-[#00c9c9]" : "text-[#0f3460]";

            return (
              <button
                key={tool.href}
                type="button"
                onClick={() => handleToolSelect(tool)}
                className={`flex flex-col gap-2.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedProperty
                    ? "border-[#0f3460]/12 hover:border-[#00c9c9]/50 hover:bg-[#00c9c9]/4 hover:shadow-sm"
                    : "border-dashed border-[#0f3460]/15 bg-slate-50/60 hover:bg-slate-100/80"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-[#0f3460] leading-tight">{tool.label}</span>
                    {isPro && (
                      <span className="text-[9px] font-bold bg-[#00c9c9]/15 text-[#0f3460] px-1.5 py-0.5 rounded-full shrink-0">
                        PRO
                      </span>
                    )}
                    {isProMax && (
                      <span className="text-[9px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] px-1.5 py-0.5 rounded-full shrink-0">
                        MAX
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                    {tool.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {highlightProperties && (
          <div className="flex items-center gap-2 text-sm text-[#0f3460] font-medium bg-[#00c9c9]/10 border border-[#00c9c9]/25 rounded-xl px-4 py-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <span>👇</span>
            Seleccioná una propiedad de tu biblioteca para continuar
          </div>
        )}
      </div>

      <div className="h-px bg-[#e2e8f0]" />

      {/* ── Propiedades ── */}
      <div ref={propiedadesRef} className="flex flex-col gap-5 scroll-mt-6">

        {properties.length === 0 ? (
          <>
            <div className="flex flex-col items-center gap-5 py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#0f3460]/8 flex items-center justify-center">
                <BuildingIcon className="w-8 h-8 text-[#0f3460]/40" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-bold text-[#0f3460] text-xl">Tu biblioteca está vacía</p>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Cargá tus propiedades una vez y reutilizalas en cualquier herramienta con un clic.
                </p>
              </div>
              <Button
                onClick={() => setShowNewModal(true)}
                className="bg-[#00c9c9] hover:bg-[#00b3b3] text-white font-bold h-11 px-6 flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Agregar primera propiedad
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* ── Nueva propiedad + Search + Filters ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                onClick={() => setShowNewModal(true)}
                className="h-9 px-4 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white text-sm gap-1.5 sm:shrink-0"
              >
                <PlusIcon className="w-4 h-4" />
                Nueva propiedad
              </Button>
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por zona o tipo de propiedad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {FILTROS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFiltro(f.value)}
                    className={`shrink-0 h-9 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      filtro === f.value
                        ? "bg-[#0f3460] text-white border-[#0f3460]"
                        : "bg-card text-muted-foreground border-input hover:border-[#0f3460]/30 hover:text-[#0f3460]"
                    }`}
                  >
                    {f.label}
                    {counts[f.value as keyof typeof counts] > 0 && (
                      <span className={`ml-1.5 text-[10px] font-bold ${filtro === f.value ? "opacity-70" : "text-muted-foreground/60"}`}>
                        {counts[f.value as keyof typeof counts]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Results ── */}
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay propiedades que coincidan con tu búsqueda.
              </p>
            ) : (
              <>
                {(search || filtro !== "todas") && (
                  <p className="text-xs text-muted-foreground -mt-1">
                    {filtered.length} propiedad{filtered.length !== 1 ? "es" : ""}
                  </p>
                )}

                {/* ── Cards grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((property) => {
                    const estado = getEstado(property);
                    const estadoConfig = ESTADO_CONFIG[estado];
                    const inactive = isInactive(property);
                    const caracteristicas = [
                      property.caracteristica1,
                      property.caracteristica2,
                      property.caracteristica3,
                    ].filter(Boolean);
                    const isMenuOpen = openMenuId === property.id;
                    const isStatusOpen = openStatusId === property.id;
                    const isSelected = selectedPropertyId === property.id;

                    return (
                      <div
                        key={property.id}
                        className={`flex flex-col rounded-xl overflow-hidden shadow-sm transition-all ${
                          inactive ? "opacity-60 hover:opacity-80" : ""
                        } ${
                          isSelected
                            ? "ring-2 ring-[#00c9c9] border border-[#00c9c9]/40 shadow-[#00c9c9]/15"
                            : "border border-[#0f3460]/10"
                        }`}
                      >
                        {/* Foto thumbnail — clickable to select */}
                        {property.foto_urls?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={property.foto_urls[0]}
                            alt=""
                            onClick={() =>
                              setSelectedPropertyId((prev) =>
                                prev === property.id ? null : property.id
                              )
                            }
                            className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        )}

                        {/* Card header — clickable to select */}
                        <div
                          className={`px-4 py-3 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-[#00c9c9]"
                              : "bg-[#0f3460] hover:bg-[#0f3460]/90"
                          }`}
                          onClick={() =>
                            setSelectedPropertyId((prev) =>
                              prev === property.id ? null : property.id
                            )
                          }
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <BuildingIcon className="w-3.5 h-3.5 text-white/60 shrink-0" />
                            <span className="text-sm font-semibold text-white truncate">
                              {property.titulo || property.tipo_propiedad}
                            </span>
                          </div>
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                              ✓ Seleccionada
                            </span>
                          ) : property.posts.length > 0 ? (
                            <span className="text-xs text-[#00c9c9] font-medium shrink-0">
                              {property.posts.length} posts
                            </span>
                          ) : null}
                        </div>

                        {/* Card body */}
                        <div className="p-4 flex flex-col gap-3 bg-card flex-1">
                          {/* Estado badge */}
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${estadoConfig.badge}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${estadoConfig.dot}`} />
                              {estadoConfig.label}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarIcon className="w-3 h-3" />
                              {formatDate(property.created_at)}
                            </div>
                          </div>

                          {/* Location + price */}
                          <div className="flex flex-col gap-0.5">
                            <p className="font-semibold text-[#0f3460] leading-tight line-clamp-1">
                              {property.ubicacion}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">
                              {property.precio} · {property.metros_cuadrados} m²
                            </p>
                          </div>

                          {/* Características */}
                          {caracteristicas.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {caracteristicas.map((c, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-[#00c9c9]/10 text-[#0f3460] rounded-full px-2 py-0.5"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card footer — actions */}
                        <div className="px-3 py-2.5 border-t border-[#0f3460]/5 bg-card flex items-center gap-1.5 flex-wrap">

                          {/* Editar */}
                          <button
                            onClick={() => setEditProperty(property)}
                            className="flex items-center gap-1 text-xs text-[#0f3460] hover:text-[#00c9c9] font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-[#0f3460]/5"
                          >
                            <PencilIcon className="w-3.5 h-3.5" />
                            Editar
                          </button>

                          {/* Ver posts */}
                          {property.posts.length > 0 && (
                            <Link
                              href={`/mis-propiedades/${property.id}`}
                              className="flex items-center gap-1 text-xs text-[#0f3460] hover:text-[#00c9c9] font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-[#0f3460]/5"
                            >
                              <FileTextIcon className="w-3.5 h-3.5" />
                              Ver posts
                            </Link>
                          )}

                          {/* Cambiar estado */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenStatusId(isStatusOpen ? null : property.id)
                              }
                              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0f3460] font-medium transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                            >
                              <ChevronDownIcon className="w-3 h-3" />
                              Estado
                            </button>
                            {isStatusOpen && (
                              <div className="absolute bottom-full left-0 mb-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                                {(
                                  Object.entries(ESTADO_CONFIG) as [
                                    PropertyEstado,
                                    (typeof ESTADO_CONFIG)[PropertyEstado]
                                  ][]
                                ).map(([key, cfg]) => (
                                  <button
                                    key={key}
                                    onClick={() => handleStatusChange(property.id, key)}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                                      estado === key ? "bg-slate-50" : ""
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                                    {cfg.label}
                                    {estado === key && (
                                      <span className="ml-auto text-[10px] text-[#0f3460] font-bold">
                                        ✓
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Generar contenido */}
                          <button
                            onClick={() => setGenerarProperty(property)}
                            className="flex items-center gap-1 text-xs bg-[#0f3460] hover:bg-[#0f3460]/90 text-white font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <SparklesIcon className="w-3 h-3" />
                            Generar
                          </button>

                          {/* Usar en... */}
                          <div className="relative ml-auto">
                            <button
                              onClick={() =>
                                setOpenMenuId(isMenuOpen ? null : property.id)
                              }
                              className="flex items-center gap-1 text-xs bg-[#00c9c9] hover:bg-[#00b3b3] text-white font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <ExternalLinkIcon className="w-3 h-3" />
                              Usar en...
                              <ChevronDownIcon
                                className={`w-3 h-3 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                              />
                            </button>
                            {isMenuOpen && (
                              <div className="absolute bottom-full right-0 mb-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[200px]">
                                <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                  Redirigir con datos cargados
                                </p>
                                {HERRAMIENTAS.map((h) => (
                                  <button
                                    key={h.href}
                                    onClick={() =>
                                      handleUseIn(
                                        property,
                                        h.href,
                                        "useParams" in h ? h.useParams : false
                                      )
                                    }
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-[#00c9c9]/8 hover:text-[#0f3460] transition-colors cursor-pointer text-left"
                                  >
                                    {h.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Eliminar */}
                          <button
                            onClick={() => setDeleteId(property.id)}
                            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar propiedad"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {generarProperty && (
        <GenerarModal
          property={generarProperty}
          open={!!generarProperty}
          onClose={() => setGenerarProperty(null)}
        />
      )}

      {showNewModal && (
        <PropertySaveModal
          open={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSaved={(p) => setProperties((prev) => [p, ...prev])}
        />
      )}

      {editProperty && (
        <PropertySaveModal
          open={!!editProperty}
          onClose={() => setEditProperty(null)}
          editProperty={editProperty}
          onSaved={(updated) => {
            setProperties((prev) =>
              prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
            );
            setEditProperty(null);
          }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                <TrashIcon className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-[#0f3460]">¿Eliminar esta propiedad?</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Se borrarán también todos los posts y ads generados para ella.{" "}
                <strong className="text-slate-700">Esta acción no se puede deshacer.</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => !deleting && setDeleteId(null)}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
