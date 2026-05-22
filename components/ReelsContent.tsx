"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  buscarFormatosTrending,
  generarGuion,
  type TrendingFormat,
  type Escena,
  type Slide,
  type GuionResult,
} from "@/lib/actions/reels.actions";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { getUserProfile, saveUserProfile } from "@/lib/actions/user-profile.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CameraIcon,
  CheckIcon,
  ChevronDown,
  CopyIcon,
  LoaderIcon,
  LockIcon,
  RefreshCwIcon,
  SparklesIcon,
  TrendingUpIcon,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";

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

type Step = "form" | "formatos" | "guion";

const FORM_EMPTY = {
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
};

export default function ReelsContent() {
  const { user } = useUser();
  const [form, setForm] = useState(FORM_EMPTY);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [showDatos, setShowDatos] = useState(false);
  const [showAmenities, setShowAmenities] = useState(false);
  const [showContacto, setShowContacto] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [formatos, setFormatos] = useState<TrendingFormat[]>([]);
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<TrendingFormat | null>(null);
  const [guion, setGuion] = useState<GuionResult | null>(null);
  const [loadingFormatos, setLoadingFormatos] = useState(false);
  const [loadingGuion, setLoadingGuion] = useState(false);
  const [error, setError] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [planChecked, setPlanChecked] = useState(false);
  const [copiedEscena, setCopiedEscena] = useState<number | null>(null);
  const [copiedSlide, setCopiedSlide] = useState<number | null>(null);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  useEffect(() => {
    getUserPlan().then((plan) => {
      setIsPro(plan === "pro");
      setPlanChecked(true);
    });
    getUserProfile().then((profile) => {
      setForm((prev) => ({
        ...prev,
        agenteWhatsapp: profile.whatsapp ?? "",
        agenteInstagram: profile.instagram ?? "",
        agenteSitioWeb: profile.sitio_web ?? "",
      }));
    });
  }, []);

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setAmenities((prev) =>
      checked ? [...prev, amenity] : prev.filter((a) => a !== amenity)
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isFormValid =
    form.tipoPropiedad && form.ubicacion && form.metrosCuadrados && form.precio;

  const handleInvestigar = async () => {
    if (!isFormValid) return;
    setError("");
    setLoadingFormatos(true);
    setFormatos([]);
    setFormatoSeleccionado(null);
    setGuion(null);
    setStep("form");

    if (form.agenteWhatsapp || form.agenteInstagram || form.agenteSitioWeb) {
      saveUserProfile({
        whatsapp: form.agenteWhatsapp || undefined,
        instagram: form.agenteInstagram || undefined,
        sitio_web: form.agenteSitioWeb || undefined,
      }).catch(() => {});
    }

    try {
      const result = await buscarFormatosTrending({ ...form, amenities });
      setFormatos(result.formatos);
      setStep("formatos");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "UNAUTHENTICATED") {
          setError("Necesitás iniciar sesión para usar esta feature.");
        } else {
          setError("Ocurrió un error al investigar tendencias. Intentá de nuevo.");
        }
      }
    } finally {
      setLoadingFormatos(false);
    }
  };

  const handleGenerarGuion = async () => {
    if (!formatoSeleccionado) return;
    setError("");
    setLoadingGuion(true);

    try {
      const result = await generarGuion({ ...form, amenities }, formatoSeleccionado);
      setGuion(result);
      setStep("guion");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        setError("Necesitás iniciar sesión para usar esta feature.");
      } else {
        setError("Ocurrió un error al generar el guion. Intentá de nuevo.");
      }
    } finally {
      setLoadingGuion(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setFormatos([]);
    setFormatoSeleccionado(null);
    setGuion(null);
    setError("");
    setAmenities([]);
  };

  const handleCopyEscena = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedEscena(idx);
    setTimeout(() => setCopiedEscena(null), 2000);
    toast.success("Copiado al portapapeles");
  };

  const handleCopySlide = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedSlide(idx);
    setTimeout(() => setCopiedSlide(null), 2000);
    toast.success("Copiado al portapapeles");
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Plan badge */}
      {planChecked && (
        <div
          className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isPro
              ? "bg-[#00d4d4]/10 text-[#0f3460] border-[#00d4d4]/30"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {isPro ? (
            <>
              <SparklesIcon className="w-3.5 h-3.5" />
              Plan PRO — acceso completo
            </>
          ) : (
            <>
              <LockIcon className="w-3.5 h-3.5" />
              Feature exclusiva del Plan PRO
            </>
          )}
        </div>
      )}

      {/* Formulario */}
      <div className="border border-[#0f3460]/10 rounded-xl p-5 sm:p-6 bg-card flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Tipo de propiedad *</Label>
            <select
              name="tipoPropiedad"
              value={form.tipoPropiedad}
              onChange={handleChange}
              className="w-full border border-input bg-background rounded-md px-3 h-12 text-base focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
            >
              <option value="">Seleccioná un tipo</option>
              {TIPOS_PROPIEDAD.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Ubicación *</Label>
            <Input
              name="ubicacion"
              placeholder="Ej: Palermo, Buenos Aires"
              value={form.ubicacion}
              onChange={handleChange}
              className="h-12 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Metros cuadrados *</Label>
            <Input
              name="metrosCuadrados"
              type="number"
              inputMode="numeric"
              placeholder="Ej: 85"
              value={form.metrosCuadrados}
              onChange={handleChange}
              min={1}
              className="h-12 text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Precio *</Label>
            <Input
              name="precio"
              placeholder="Ej: USD 120.000"
              value={form.precio}
              onChange={handleChange}
              className="h-12 text-base"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">3 características destacadas</Label>
          <p className="text-xs text-muted-foreground">Todos los campos son opcionales. Completá solo los que aplican a tu propiedad.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <span className="hidden sm:inline text-xs text-slate-400 font-normal">dormitorios, baños, cocheras…</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${showDatos ? "rotate-180" : ""}`} />
          </button>
          {showDatos && (
            <div className="p-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <p className="text-xs text-muted-foreground col-span-full">Todos los campos son opcionales. Completá solo los que aplican a tu propiedad.</p>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Dormitorios</Label>
                <select name="dormitorios" value={form.dormitorios} onChange={handleChange} className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
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
                <select name="banios" value={form.banios} onChange={handleChange} className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                  <option value="">No tiene</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Cocheras</Label>
                <select name="cocheras" value={form.cocheras} onChange={handleChange} className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                  <option value="">No tiene</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Antigüedad</Label>
                <select name="antiguedad" value={form.antiguedad} onChange={handleChange} className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                  <option value="">—</option>
                  <option value="A estrenar">A estrenar</option>
                  <option value="0-5 años">0–5 años</option>
                  <option value="5-10 años">5–10 años</option>
                  <option value="10-20 años">10–20 años</option>
                  <option value="20+ años">20+ años</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Piso <span className="text-slate-400 font-normal">(opcional)</span></Label>
                <Input name="piso" placeholder="Opcional — dejar vacío si no aplica" value={form.piso} onChange={handleChange} className="h-10 text-sm" />
              </div>
              <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
                <Label className="text-sm font-medium text-slate-600">Expensas <span className="text-slate-400 font-normal">(opcional)</span></Label>
                <Input name="expensas" placeholder="Opcional — dejar vacío si no aplica" value={form.expensas} onChange={handleChange} className="h-10 text-sm" />
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
                <span className="hidden sm:inline text-xs text-slate-400 font-normal">pileta, gimnasio, seguridad, jardín…</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${showAmenities ? "rotate-180" : ""}`} />
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
                    <span className="text-sm text-slate-700 group-hover:text-[#0f3460] transition-colors">{amenity}</span>
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
              <span className="hidden sm:inline text-xs text-slate-400 font-normal">WhatsApp, Instagram, sitio web</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${showContacto ? "rotate-180" : ""}`} />
          </button>
          {showContacto && (
            <div className="p-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <p className="text-xs text-muted-foreground col-span-full">Todos los campos son opcionales. Completá solo los que aplican a tu propiedad.</p>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">WhatsApp</Label>
                <Input name="agenteWhatsapp" placeholder="Opcional — dejar vacío si no aplica" value={form.agenteWhatsapp} onChange={handleChange} className="h-10 text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Instagram</Label>
                <Input name="agenteInstagram" placeholder="Opcional — dejar vacío si no aplica" value={form.agenteInstagram} onChange={handleChange} className="h-10 text-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-slate-600">Sitio web</Label>
                <Input name="agenteSitioWeb" placeholder="Opcional — dejar vacío si no aplica" value={form.agenteSitioWeb} onChange={handleChange} className="h-10 text-sm" />
              </div>
              <p className="col-span-full text-xs text-slate-400">Tu información de contacto se guarda automáticamente y se usa en las CTAs del guion.</p>
            </div>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        {!planChecked ? (
          <Button
            disabled
            className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm bg-[#0f3460] text-white opacity-60"
          >
            <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
            Cargando...
          </Button>
        ) : !isPro ? (
          <LockedProGate checkoutUrl={checkoutUrl} />
        ) : (
          <Button
            onClick={handleInvestigar}
            disabled={loadingFormatos || !isFormValid}
            className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
          >
            <TrendingUpIcon className="w-4 h-4" />
            {loadingFormatos ? "Investigando tendencias..." : "Investigar formatos trending"}
          </Button>
        )}
      </div>

      {/* Sección de formatos trending */}
      {step !== "form" && formatos.length > 0 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
              Formatos que están funcionando ahora
            </h2>
            <p className="text-sm text-muted-foreground">
              Elegí el formato que más se adapte a tu propiedad y estilo
            </p>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {formatos.map((fmt) => (
              <FormatoCard
                key={fmt.id}
                formato={fmt}
                selected={formatoSeleccionado?.id === fmt.id}
                onClick={() =>
                  setFormatoSeleccionado(
                    formatoSeleccionado?.id === fmt.id ? null : fmt
                  )
                }
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGenerarGuion}
              disabled={loadingGuion || !formatoSeleccionado}
              className="w-full sm:w-auto h-12 sm:h-10 px-8 text-base sm:text-sm bg-[#0f3460] hover:bg-[#0f3460]/90 text-white"
            >
              {loadingGuion ? (
                <span className="flex items-center gap-2">
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                  Generando guion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <VideoIcon className="w-4 h-4" />
                  {formatoSeleccionado
                    ? `Generar guion — ${formatoSeleccionado.nombre}`
                    : "Seleccioná un formato"}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleInvestigar}
              disabled={loadingFormatos}
              className="w-full sm:w-auto h-12 sm:h-10 px-5 text-base sm:text-sm"
            >
              <span className="flex items-center gap-2">
                <RefreshCwIcon className="w-4 h-4" />
                Reinvestigar
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Guion completo */}
      {step === "guion" && guion && (
        <GuionDisplay
          guion={guion}
          copiedEscena={copiedEscena}
          copiedSlide={copiedSlide}
          onCopyEscena={handleCopyEscena}
          onCopySlide={handleCopySlide}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

/* ── Tarjeta de formato trending ─────────────────────────────────── */
function FormatoCard({
  formato,
  selected,
  onClick,
}: {
  formato: TrendingFormat;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border rounded-xl p-4 flex flex-col gap-3 transition-all ${
        selected
          ? "border-[#00d4d4] ring-2 ring-[#00d4d4]/30 bg-[#00d4d4]/5"
          : "border-[#0f3460]/10 hover:border-[#0f3460]/25 bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-bold text-[#0f3460] leading-tight">
          {formato.nombre}
        </span>
        {selected && (
          <span className="shrink-0 w-5 h-5 rounded-full bg-[#00d4d4] flex items-center justify-center">
            <CheckIcon className="w-3 h-3 text-white" />
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {formato.descripcion}
      </p>
      <div className="flex flex-col gap-1 border-t border-[#0f3460]/8 pt-2.5 mt-auto">
        <span className="text-[10px] font-semibold text-[#00d4d4] uppercase tracking-wide">
          Por qué funciona
        </span>
        <p className="text-xs text-[#0f3460]/80 leading-relaxed">
          {formato.por_que_funciona}
        </p>
      </div>
    </button>
  );
}

/* ── Guion completo ──────────────────────────────────────────────── */
function GuionDisplay({
  guion,
  copiedEscena,
  copiedSlide,
  onCopyEscena,
  onCopySlide,
  onReset,
}: {
  guion: GuionResult;
  copiedEscena: number | null;
  copiedSlide: number | null;
  onCopyEscena: (text: string, idx: number) => void;
  onCopySlide: (text: string, idx: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
            Guion completo
          </h2>
          <p className="text-sm text-muted-foreground">
            {guion.formato_elegido} · {guion.reel.duracion_total}
          </p>
          <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="shrink-0 h-9 px-4 text-sm"
        >
          <RefreshCwIcon className="w-4 h-4 mr-1.5" />
          Nuevo guion
        </Button>
      </div>

      {/* Guion del Reel */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center shrink-0">
            <VideoIcon className="w-4.5 h-4.5 text-[#0f3460]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0f3460]">Guion del Reel</h3>
            <p className="text-xs text-muted-foreground">
              Instagram Reels · TikTok · {guion.reel.duracion_total}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {guion.reel.escenas.map((escena, idx) => (
            <EscenaCard
              key={idx}
              escena={escena}
              copied={copiedEscena === idx}
              onCopy={() => {
                const lines = [
                  `ESCENA ${escena.numero} · ${escena.duracion}`,
                  "",
                  `🎤 QUÉ DECIR:`,
                  escena.que_decir,
                  "",
                  `📹 QUÉ MOSTRAR:`,
                  escena.que_mostrar,
                ];
                if (escena.texto_pantalla) {
                  lines.push("", `✏️ TEXTO EN PANTALLA:`, escena.texto_pantalla);
                }
                onCopyEscena(lines.join("\n"), idx);
              }}
            />
          ))}
        </div>
      </div>

      {/* Guion de Story */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00d4d4]/15 border border-[#00d4d4]/30 flex items-center justify-center shrink-0">
            <CameraIcon className="w-4.5 h-4.5 text-[#0f3460]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0f3460]">Guion de Story</h3>
            <p className="text-xs text-muted-foreground">
              Instagram Stories · 3 slides complementarios
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {guion.story.slides.map((slide, idx) => (
            <SlideCard
              key={idx}
              slide={slide}
              copied={copiedSlide === idx}
              onCopy={() => {
                const text = [
                  `SLIDE ${slide.numero}`,
                  "",
                  slide.texto_principal,
                  slide.texto_secundario,
                  "",
                  `💡 Acción: ${slide.accion}`,
                ].join("\n");
                onCopySlide(text, idx);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta de escena ───────────────────────────────────────────── */
function EscenaCard({
  escena,
  copied,
  onCopy,
}: {
  escena: Escena;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold text-[#0f3460] tabular-nums leading-none w-7 shrink-0">
            {String(escena.numero).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground">{escena.duracion}</span>
        </div>
        {escena.numero === 1 && (
          <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
            Hook
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col gap-4 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-[#0f3460] uppercase tracking-wide flex items-center gap-1">
              🎤 Qué decir
            </span>
            <p className="text-sm leading-relaxed text-card-foreground">
              {escena.que_decir}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-[#0f3460] uppercase tracking-wide flex items-center gap-1">
              📹 Qué mostrar
            </span>
            <p className="text-sm leading-relaxed text-card-foreground">
              {escena.que_mostrar}
            </p>
          </div>
        </div>

        {escena.texto_pantalla && (
          <div className="flex flex-col gap-1.5 border-t border-[#0f3460]/8 pt-3">
            <span className="text-[10px] font-semibold text-[#0f3460] uppercase tracking-wide">
              ✏️ Texto en pantalla
            </span>
            <p className="text-sm text-card-foreground font-medium">
              {escena.texto_pantalla}
            </p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="self-end h-9 px-4 text-sm"
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
              Copiar escena
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ── Tarjeta de slide de Story ───────────────────────────────────── */
function SlideCard({
  slide,
  copied,
  onCopy,
}: {
  slide: Slide;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="border border-[#00d4d4]/25 rounded-xl overflow-hidden shadow-sm bg-card flex flex-col">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#00d4d4]/8 border-b border-[#00d4d4]/20 flex items-center gap-2">
        <span className="text-sm font-bold text-[#0f3460]">
          Slide {slide.numero}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-[#0f3460] leading-snug">
            {slide.texto_principal}
          </p>
          {slide.texto_secundario && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {slide.texto_secundario}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-[#0f3460]/8 pt-2.5 mt-auto">
          <span className="text-[10px] font-semibold text-[#00d4d4] uppercase tracking-wide">
            Acción / Sticker
          </span>
          <p className="text-xs text-[#0f3460]/80">{slide.accion}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="self-end h-9 px-4 text-sm mt-2"
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

/* ── Gate PRO ────────────────────────────────────────────────────── */
function LockedProGate({ checkoutUrl }: { checkoutUrl: string }) {
  return (
    <div className="border-2 border-dashed border-[#00d4d4]/40 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#00d4d4]/5">
      <div className="w-12 h-12 rounded-2xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center shrink-0">
        <LockIcon className="w-5 h-5 text-[#0f3460]/70" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="font-bold text-[#0f3460] text-base">
          Guion para Reels — Solo Plan PRO
        </p>
        <p className="text-sm text-muted-foreground">
          Investigación de tendencias con IA + guion escena por escena para
          Reels y Stories. Pasate al PRO para empezar a grabar hoy.
        </p>
      </div>
      <Button
        asChild
        className="w-full sm:w-auto h-10 px-5 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white text-sm font-semibold shrink-0"
      >
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <SparklesIcon className="w-4 h-4" />
          Upgrade a PRO
        </a>
      </Button>
    </div>
  );
}
