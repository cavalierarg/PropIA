"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { generarDescripcion, DescripcionResult } from "@/lib/actions/descripcion.actions";
import { getUserProfile, saveUserProfile } from "@/lib/actions/user-profile.actions";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, CopyIcon, LockIcon, SparklesIcon, ChevronDown } from "lucide-react";
import PropertySelector from "@/components/PropertySelector";
import PropertyLoadedCard from "@/components/PropertyLoadedCard";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const TIPOS_PROPIEDAD = [
  "Casa",
  "Departamento",
  "PH",
  "Oficina",
  "Local comercial",
  "Terreno",
  "Cochera",
];

const AMENITIES_LIST = [
  "Pileta",
  "Gimnasio",
  "Seguridad 24hs",
  "Jardín",
  "Terraza",
  "Balcón",
  "Vista panorámica",
  "Parrilla",
  "Quincho",
  "Apto mascotas",
];

export default function DescripcionContent() {
  const { user } = useUser();
  const [form, setForm] = useState({
    tipoPropiedad: "",
    ubicacion: "",
    metrosCuadrados: "",
    precio: "",
    caracteristica1: "",
    caracteristica2: "",
    caracteristica3: "",
    dormitorios: "",
    banios: "",
    cocheras: "",
    antiguedad: "",
    piso: "",
    expensas: "",
    agenteWhatsapp: "",
    agenteInstagram: "",
    agenteSitioWeb: "",
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [showDatos, setShowDatos] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);
  const [showContacto, setShowContacto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadedProperty, setLoadedProperty] = useState<{ tipo: string; ubicacion: string; precio: string; metros: string } | null>(null);
  const [result, setResult] = useState<DescripcionResult | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedLong, setCopiedLong] = useState(false);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  useEffect(() => {
    // Pre-fill from "Usar en..." in Mis Propiedades
    try {
      const raw = localStorage.getItem("propia_property_prefill");
      if (raw) {
        const p = JSON.parse(raw);
        localStorage.removeItem("propia_property_prefill");
        setForm((prev) => ({
          ...prev,
          tipoPropiedad: p.tipoPropiedad || prev.tipoPropiedad,
          ubicacion: p.ubicacion || prev.ubicacion,
          metrosCuadrados: p.metrosCuadrados || prev.metrosCuadrados,
          precio: p.precio || prev.precio,
          caracteristica1: p.caracteristica1 || prev.caracteristica1,
          caracteristica2: p.caracteristica2 || prev.caracteristica2,
          caracteristica3: p.caracteristica3 || prev.caracteristica3,
        }));
        if (p.tipoPropiedad && p.ubicacion) {
          setLoadedProperty({ tipo: p.tipoPropiedad, ubicacion: p.ubicacion, precio: p.precio ?? "", metros: p.metrosCuadrados ?? "" });
        }
      }
    } catch {}

    getUserPlan().then((plan) => setIsPro(plan === "pro" || plan === "pro_max"));
    getUserProfile().then((profile) => {
      setForm((prev) => ({
        ...prev,
        agenteWhatsapp: profile.whatsapp ?? "",
        agenteInstagram: profile.instagram ?? "",
        agenteSitioWeb: profile.sitio_web ?? "",
      }));
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setAmenities((prev) =>
      checked ? [...prev, amenity] : prev.filter((a) => a !== amenity)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    if (form.agenteWhatsapp || form.agenteInstagram || form.agenteSitioWeb) {
      saveUserProfile({
        whatsapp: form.agenteWhatsapp || undefined,
        instagram: form.agenteInstagram || undefined,
        sitio_web: form.agenteSitioWeb || undefined,
      }).catch(() => {});
    }

    try {
      const res = await generarDescripcion({ ...form, amenities });
      setResult(res);
      setIsPro(res.isPro);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        setError("Necesitás iniciar sesión para generar descripciones.");
      } else {
        setError("Ocurrió un error al generar la descripción. Intentá de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, type: "short" | "long") => {
    await navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
    if (type === "short") {
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2000);
    } else {
      setCopiedLong(true);
      setTimeout(() => setCopiedLong(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
        <fieldset disabled={loading} className="contents">
        {loadedProperty ? (
          <PropertyLoadedCard
            tipo={loadedProperty.tipo}
            ubicacion={loadedProperty.ubicacion}
            precio={loadedProperty.precio}
            metros={loadedProperty.metros}
            onClear={() => setLoadedProperty(null)}
          />
        ) : (
          <PropertySelector
            onSelect={(prefill) => {
              setForm((prev) => ({
                ...prev,
                tipoPropiedad: prefill.tipoPropiedad,
                ubicacion: prefill.ubicacion,
                precio: prefill.precio,
                metrosCuadrados: prefill.metrosCuadrados,
                caracteristica1: prefill.caracteristica1,
                caracteristica2: prefill.caracteristica2,
                caracteristica3: prefill.caracteristica3,
              }));
              setLoadedProperty({ tipo: prefill.tipoPropiedad, ubicacion: prefill.ubicacion, precio: prefill.precio, metros: prefill.metrosCuadrados });
            }}
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tipoPropiedad" className="text-sm font-medium">
              Tipo de propiedad *
            </Label>
            <select
              id="tipoPropiedad"
              name="tipoPropiedad"
              value={form.tipoPropiedad}
              onChange={handleChange}
              className="w-full border border-input bg-background rounded-md px-3 h-12 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              required
            >
              <option value="">Seleccioná un tipo</option>
              {TIPOS_PROPIEDAD.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ubicacion" className="text-sm font-medium">
              Ubicación *
            </Label>
            <Input
              id="ubicacion"
              name="ubicacion"
              placeholder="Ej: Palermo, Buenos Aires"
              value={form.ubicacion}
              onChange={handleChange}
              required
              className="h-12 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="metrosCuadrados" className="text-sm font-medium">
              Metros cuadrados *
            </Label>
            <Input
              id="metrosCuadrados"
              name="metrosCuadrados"
              type="number"
              inputMode="numeric"
              placeholder="Ej: 85"
              value={form.metrosCuadrados}
              onChange={handleChange}
              required
              min={1}
              className="h-12 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="precio" className="text-sm font-medium">
              Precio *
            </Label>
            <Input
              id="precio"
              name="precio"
              placeholder="Ej: USD 120.000"
              value={form.precio}
              onChange={handleChange}
              required
              className="h-12 text-base"
            />
          </div>
        </div>

        {/* Características */}
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-medium">3 Características destacadas</Label>
          <p className="text-xs text-muted-foreground -mt-1">Todos los campos son opcionales. Completá solo los que aplican a tu propiedad.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Input
              name="caracteristica1"
              placeholder="Ej: Luminoso"
              value={form.caracteristica1}
              onChange={handleChange}
              className="h-12 text-base"
            />
            <Input
              name="caracteristica2"
              placeholder="Ej: Terraza propia"
              value={form.caracteristica2}
              onChange={handleChange}
              className="h-12 text-base"
            />
            <Input
              name="caracteristica3"
              placeholder="Ej: A 2 cuadras del subte"
              value={form.caracteristica3}
              onChange={handleChange}
              className="h-12 text-base"
            />
          </div>
        </div>

        {/* ── Sección colapsable: Datos de la propiedad ── */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDatos(!showDatos)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-[#0f3460]">Datos de la propiedad</span>
              <span className="hidden sm:inline text-xs text-slate-400 font-normal">
                dormitorios, baños, cocheras…
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                showDatos ? "rotate-180" : ""
              }`}
            />
          </button>

          {showDatos && (
            <div className="p-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <p className="text-xs text-muted-foreground col-span-full">Todos los campos son opcionales. Completá solo los que aplican a tu propiedad.</p>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Dormitorios</Label>
                <select
                  name="dormitorios"
                  value={form.dormitorios}
                  onChange={handleChange}
                  className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  <option value="">No tiene</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5+">5+</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Baños</Label>
                <select
                  name="banios"
                  value={form.banios}
                  onChange={handleChange}
                  className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  <option value="">No tiene</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Cocheras</Label>
                <select
                  name="cocheras"
                  value={form.cocheras}
                  onChange={handleChange}
                  className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  <option value="">No tiene</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Antigüedad</Label>
                <select
                  name="antiguedad"
                  value={form.antiguedad}
                  onChange={handleChange}
                  className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  <option value="">—</option>
                  <option value="A estrenar">A estrenar</option>
                  <option value="0-5 años">0–5 años</option>
                  <option value="5-10 años">5–10 años</option>
                  <option value="10-20 años">10–20 años</option>
                  <option value="20+ años">20+ años</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">
                  Piso <span className="text-slate-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  name="piso"
                  placeholder="Opcional — dejar vacío si no aplica"
                  value={form.piso}
                  onChange={handleChange}
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                <Label className="text-sm font-medium text-slate-600">
                  Expensas <span className="text-slate-400 font-normal">(opcional)</span>
                </Label>
                <Input
                  name="expensas"
                  placeholder="Opcional — dejar vacío si no aplica"
                  value={form.expensas}
                  onChange={handleChange}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Sección colapsable: Amenities ── */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAmenities(!showAmenities)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-[#0f3460]">Características adicionales</span>
              {amenities.length > 0 ? (
                <span className="text-xs bg-[#0f3460] text-white px-2 py-0.5 rounded-full font-semibold">
                  {amenities.length} seleccionado{amenities.length !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="hidden sm:inline text-xs text-slate-400 font-normal">
                  pileta, gimnasio, seguridad, jardín…
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                showAmenities ? "rotate-180" : ""
              }`}
            />
          </button>

          {showAmenities && (
            <div className="p-4 border-t border-slate-100">
              <p className="text-xs text-muted-foreground mb-3">Todos los campos son opcionales. Completá solo los que aplican a tu propiedad.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES_LIST.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={amenities.includes(amenity)}
                      onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0f3460] focus:ring-[#0f3460] cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-[#0f3460] transition-colors">
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sección colapsable: Contacto del agente ── */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowContacto(!showContacto)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-[#0f3460]">Contacto del agente</span>
              <span className="hidden sm:inline text-xs text-slate-400 font-normal">
                WhatsApp, Instagram, sitio web
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                showContacto ? "rotate-180" : ""
              }`}
            />
          </button>

          {showContacto && (
            <div className="p-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <p className="text-xs text-muted-foreground col-span-full">Todos los campos son opcionales. Completá solo los que aplican a tu propiedad.</p>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">WhatsApp</Label>
                <Input
                  name="agenteWhatsapp"
                  placeholder="Opcional — dejar vacío si no aplica"
                  value={form.agenteWhatsapp}
                  onChange={handleChange}
                  className="h-10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Instagram</Label>
                <Input
                  name="agenteInstagram"
                  placeholder="Opcional — dejar vacío si no aplica"
                  value={form.agenteInstagram}
                  onChange={handleChange}
                  className="h-10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Sitio web</Label>
                <Input
                  name="agenteSitioWeb"
                  placeholder="Opcional — dejar vacío si no aplica"
                  value={form.agenteSitioWeb}
                  onChange={handleChange}
                  className="h-10 text-sm"
                />
              </div>
              <p className="col-span-full text-xs text-slate-400">
                Tu información de contacto se guarda automáticamente y se usa en las CTAs de la descripción.
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
        >
          <SparklesIcon className="w-4 h-4" />
          {loading ? "Generando descripción..." : "Generar descripción"}
        </Button>
        </fieldset>
      </form>

      {/* Skeleton de carga */}
      {loading && (
        <div className="flex flex-col gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
              <Skeleton className="h-10 w-full rounded-none" />
              <div className="p-5 flex flex-col gap-3 bg-white">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-9 w-24 self-end rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resultados */}
      {result && !loading && (
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
              Descripciones generadas
            </h2>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>

          <div className="flex flex-col gap-5">
            {/* Versión corta — siempre visible */}
            <DescripcionCard
              titulo="Versión Corta"
              subtitulo="~200 palabras · ideal para el título del anuncio"
              texto={result.version_corta}
              copied={copiedShort}
              onCopy={() => handleCopy(result.version_corta, "short")}
              badge={{ label: "Gratis", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
            />

            {/* Versión larga — PRO */}
            {result.isPro && result.version_larga ? (
              <DescripcionCard
                titulo="Versión Larga"
                subtitulo="~400 palabras · para la descripción completa del portal"
                texto={result.version_larga}
                copied={copiedLong}
                onCopy={() => handleCopy(result.version_larga!, "long")}
                badge={{ label: "PRO", className: "bg-[#00d4d4]/10 text-[#0f3460] border-[#00d4d4]/30" }}
                highlight
              />
            ) : !result.isPro ? (
              <LockedLongVersion checkoutUrl={checkoutUrl} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta de descripción ──────────────────────────────────────── */
function DescripcionCard({
  titulo,
  subtitulo,
  texto,
  copied,
  onCopy,
  badge,
  highlight = false,
}: {
  titulo: string;
  subtitulo: string;
  texto: string;
  copied: boolean;
  onCopy: () => void;
  badge: { label: string; className: string };
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-xl overflow-hidden shadow-sm ${
        highlight ? "border-[#00d4d4]/40 ring-1 ring-[#00d4d4]/20" : "border-[#0f3460]/10"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-[#0f3460]">{titulo}</span>
          <span className="text-xs text-muted-foreground">{subtitulo}</span>
        </div>
        <span
          className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 shrink-0 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Texto */}
      <div className="p-4 sm:p-5 flex flex-col gap-4 bg-card">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground break-words">
          {texto}
        </p>
        <p className="text-xs text-slate-400 -mt-2 text-right">
          {texto.length} caracteres
        </p>
        <Button
          type="button"
          variant="outline"
          className="self-end h-11 px-5 text-sm"
          onClick={onCopy}
        >
          {copied ? (
            <span className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-600" />
              Copiado
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CopyIcon className="w-4 h-4" />
              Copiar
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ── Versión larga bloqueada ─────────────────────────────────────── */
function LockedLongVersion({ checkoutUrl }: { checkoutUrl: string }) {
  return (
    <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm relative">
      {/* Contenido borroso */}
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        <div className="px-4 py-3 sm:px-5 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-3.5 w-28 bg-[#0f3460]/15 rounded-full" />
            <div className="h-3 w-44 bg-[#0f3460]/10 rounded-full" />
          </div>
          <div className="h-5 w-10 bg-[#00d4d4]/30 rounded-full" />
        </div>
        <div className="p-4 sm:p-5 flex flex-col gap-2.5 bg-card">
          {[100, 92, 87, 100, 78, 95, 83, 100, 70, 88, 60, 94].map((w, i) => (
            <div key={i} className="h-3 bg-muted rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/75 backdrop-blur-[1px] rounded-xl p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center">
            <LockIcon className="w-5 h-5 text-[#0f3460]/70" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold text-[#0f3460] text-base">Versión Larga · ~400 palabras</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Descripción completa con ambientes detallados, barrio, conectividad y potencial de inversión.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="h-10 px-5 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white text-sm font-semibold"
        >
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            Upgrade a PRO para desbloquear
          </a>
        </Button>
      </div>
    </div>
  );
}
