"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadPropertyImage } from "@/lib/actions/flyers.actions";
import { uploadAgentLogo, getAgentLogoUrl } from "@/lib/actions/agent-logo.actions";
import { getAgentProfile } from "@/lib/actions/agent-profile.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UploadCloudIcon,
  SparklesIcon,
  DownloadIcon,
  XIcon,
  ImageIcon,
  PaletteIcon,
  TagIcon,
  DollarSignIcon,
  ChevronDown,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { LockIcon } from "lucide-react";
import PropertyLoadedCard from "@/components/PropertyLoadedCard";

type AdType  = "feed" | "story" | "banner";
type Phase   = "idle" | "generating" | "complete";

type GeneratedAd = { photoIndex: number; type: AdType; url: string };

const AD_INFO: Record<AdType, { label: string; dims: string }> = {
  feed:   { label: "Feed cuadrado",   dims: "1080 × 1080 px" },
  story:  { label: "Story vertical",  dims: "1080 × 1920 px" },
  banner: { label: "Banner Facebook", dims: "1200 × 628 px"  },
};
const AD_ORDER: AdType[] = ["feed", "story", "banner"];

const COLOR_PRESETS = [
  { label: "Azul profesional", fondo: "#0f3460", acento: "#00c9c9", texto: "#ffffff" },
  { label: "Negro elegante",   fondo: "#0a0a0a", acento: "#c9a84c", texto: "#ffffff" },
  { label: "Verde naturaleza", fondo: "#1a4a2e", acento: "#4caf50", texto: "#ffffff" },
  { label: "Rojo impacto",     fondo: "#1a0a0a", acento: "#e94560", texto: "#ffffff" },
  { label: "Blanco moderno",   fondo: "#ffffff", acento: "#0f3460", texto: "#1a1a1a" },
] as const;

const CURRENCIES = ["USD", "EUR", "ARS"] as const;
const BADGES = ["En Venta", "Alquiler", "Alquiler temporal", "Oportunidad", "Recién Llegada", "Última Unidad", "Precio Rebajado"] as const;

const BADGE_COLORS: Record<string, string> = {
  "En Venta":        "#16a34a",
  "Alquiler":        "#2563eb",
  "Alquiler temporal": "#0891b2",
  "Oportunidad":     "#ea580c",
  "Recién Llegada":  "#7c3aed",
  "Última Unidad":   "#dc2626",
  "Precio Rebajado": "#d97706",
};

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

const TIPS_GENERATE = [
  "Subiendo fotos a la nube...",
  "Generando ads en alta resolución...",
  "Aplicando diseño profesional...",
  "Preparando formatos para Meta Ads...",
];

export default function AdsGeneratorContent({
  plan = "pro_max",
  proMaxCheckoutUrl,
}: {
  plan?: "pro" | "pro_max";
  proMaxCheckoutUrl?: string;
}) {
  const isProMax = plan === "pro_max";
  const router = useRouter();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  const [images,   setImages]   = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);

  const [precio,  setPrecio]  = useState("");
  const [zona,    setZona]    = useState("");
  const [metros,  setMetros]  = useState("");
  const [car1,    setCar1]    = useState("");
  const [car2,    setCar2]    = useState("");
  const [agente,  setAgente]  = useState("");

  const [dormitorios,    setDormitorios]    = useState("");
  const [banios,         setBanios]         = useState("");
  const [cocheras,       setCocheras]       = useState("");
  const [amenities,      setAmenities]      = useState<string[]>([]);
  const [agenteWhatsapp, setAgenteWhatsapp] = useState("");
  const [agenteInstagram,setAgenteInstagram]= useState("");
  const [agenteSitioWeb, setAgenteSitioWeb] = useState("");

  const [showLogo, setShowLogo] = useState(false);

  const [agentLogoUrl,     setAgentLogoUrl]     = useState<string | null>(null);
  const [agentLogoPreview, setAgentLogoPreview] = useState<string | null>(null);
  const [logoUploading,    setLogoUploading]    = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const estilo = "profesional" as const;
  const [colorFondo,  setColorFondo]  = useState("#0f3460");
  const [colorAcento, setColorAcento] = useState("#00c9c9");
  const [colorTexto,  setColorTexto]  = useState("#ffffff");
  const [moneda,     setMoneda]     = useState<string>("USD");
  const [badge,      setBadge]      = useState<string>("En Venta");

  const [phase,      setPhase]      = useState<Phase>("idle");
  const [loadedProperty, setLoadedProperty] = useState<{ tipo: string; ubicacion: string; precio: string; metros: string } | null>(null);
  const [loadingTip, setLoadingTip] = useState(0);
  const [error,      setError]      = useState("");
  const [ads,        setAds]        = useState<GeneratedAd[]>([]);

  const activeCount = images.filter(Boolean).length;
  const isLoading   = phase === "generating";
  const canGenerate = !!loadedProperty && activeCount > 0;

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setLoadingTip((p) => (p + 1) % TIPS_GENERATE.length), 3500);
    return () => clearInterval(id);
  }, [isLoading]);

  useEffect(() => {
    // Pre-fill from "Usar en..." in Mis Propiedades
    try {
      const raw = localStorage.getItem("propia_property_prefill");
      if (raw) {
        const p = JSON.parse(raw);
        localStorage.removeItem("propia_property_prefill");
        if (p.ubicacion) setZona(p.ubicacion);
        if (p.precio) setPrecio(p.precio);
        if (p.metrosCuadrados) setMetros(p.metrosCuadrados);
        if (p.caracteristica1) setCar1(p.caracteristica1);
        if (p.caracteristica2) setCar2(p.caracteristica2);
        if (p.tipoPropiedad && p.ubicacion) {
          setLoadedProperty({ tipo: p.tipoPropiedad, ubicacion: p.ubicacion, precio: p.precio ?? "", metros: p.metrosCuadrados ?? "" });
        }
      }
    } catch {}

    // Restore saved brand colors
    try {
      const saved = localStorage.getItem("propia_brand_colors");
      if (saved) {
        const p = JSON.parse(saved);
        if (p.colorFondo)  setColorFondo(p.colorFondo);
        if (p.colorAcento) setColorAcento(p.colorAcento);
        if (p.colorTexto)  setColorTexto(p.colorTexto);
      }
    } catch {}

    getAgentLogoUrl().then((url) => {
      if (url) setAgentLogoUrl(url);
    }).catch(() => {});

    getAgentProfile().then((profile) => {
      if (profile.whatsapp) setAgenteWhatsapp(profile.whatsapp);
      if (profile.instagram) setAgenteInstagram(profile.instagram);
      if (profile.sitio_web) setAgenteSitioWeb(profile.sitio_web);
      try {
        if (!localStorage.getItem("propia_brand_colors") && profile.color_marca) setColorFondo(profile.color_marca);
      } catch {
        if (profile.color_marca) setColorFondo(profile.color_marca);
      }
    }).catch(() => {});
  }, []);

  /* ── Agent logo handler ── */
  const handleLogoFile = async (file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      toast.error("Solo se aceptan archivos PNG o JPG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("El logo no puede superar los 2 MB");
      return;
    }
    const preview = URL.createObjectURL(file);
    setAgentLogoPreview(preview);
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const { url, bgRemoved } = await uploadAgentLogo(fd);
      setAgentLogoUrl(url);
      toast.success(bgRemoved ? "Logo con fondo transparente" : "Logo guardado · Sin remoción de fondo");
    } catch {
      toast.error("No se pudo subir el logo. Intentá de nuevo.");
      setAgentLogoPreview(null);
    } finally {
      setLogoUploading(false);
    }
  };

  /* ── Image handlers ── */
  const applyFile = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const ni = [...images];   ni[index] = file;  setImages(ni);
    const np = [...previews];
    if (np[index]) URL.revokeObjectURL(np[index]!);
    np[index] = URL.createObjectURL(file);
    setPreviews(np);
    setAds([]);
    if (phase === "complete") setPhase("idle");
  };

  const removeImage = (index: number) => {
    const ni = [...images];   ni[index] = null; setImages(ni);
    const np = [...previews];
    if (np[index]) URL.revokeObjectURL(np[index]!);
    np[index] = null; setPreviews(np);
  };

  const handleDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) applyFile(index, file);
  };

  /* ── Generate ── */
  const handleGenerate = async () => {
    setError(""); setPhase("generating"); setLoadingTip(0); setAds([]);
    try {
      const uploaded: { photoIndex: number; url: string }[] = [];
      for (let i = 0; i < 3; i++) {
        const img = images[i];
        if (!img) continue;
        const fd = new FormData();
        fd.append("image", img);
        const url = await uploadPropertyImage(fd);
        uploaded.push({ photoIndex: i, url });
      }

      const tasks = uploaded.flatMap(({ photoIndex, url }) =>
        AD_ORDER.map((type) => ({ photoIndex, url, type }))
      );

      const results = await Promise.allSettled(
        tasks.map(async ({ photoIndex, url, type }) => {
          const res = await fetch("/api/generate-ad", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type, imageUrl: url, precio, zona, metros, car1, car2, agente,
              dormitorios, banios, cocheras, amenities, agenteWhatsapp,
              estilo, colorMarca: colorFondo, colorAcento, colorTexto, moneda, badge,
              agentLogoUrl: agentLogoUrl ?? undefined,
            }),
          });
          if (!res.ok) {
            const errBody = await res.text().catch(() => "");
            console.error(`[ads] API error ${res.status}:`, errBody);
            throw new Error(`API error ${res.status}: ${errBody}`);
          }
          const blob = await res.blob();
          return { photoIndex, type, url: URL.createObjectURL(blob) } as GeneratedAd;
        })
      );

      const generated: GeneratedAd[] = [];
      results.forEach((r) => {
        if (r.status === "fulfilled") generated.push(r.value);
        else console.error("[ads]", r.reason);
      });

      setAds(generated);
      if (generated.length > 0) {
        toast.success(`${generated.length} ad${generated.length !== 1 ? "s" : ""} generado${generated.length !== 1 ? "s" : ""}`);
        setPhase("complete");
      } else {
        toast.error("No se pudo generar ningún ad. Intentá de nuevo.");
        setPhase("idle");
      }
    } catch {
      toast.error("Error al generar los ads. Intentá de nuevo.");
      setPhase("idle");
    }
  };

  const handleDownload = (url: string, photoIndex: number, type: AdType) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-${type}-foto${photoIndex + 1}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-8">

      {/* ── Formulario ── */}
      <div className="border border-[#0f3460]/10 rounded-xl p-5 sm:p-6 bg-card flex flex-col gap-7">
        <fieldset disabled={isLoading} className="contents">
        {loadedProperty ? (
          <PropertyLoadedCard
            tipo={loadedProperty.tipo}
            ubicacion={loadedProperty.ubicacion}
            precio={loadedProperty.precio}
            metros={loadedProperty.metros}
            onClear={() => router.push("/mis-propiedades")}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 py-10 text-center border-2 border-dashed border-[#0f3460]/15 rounded-xl bg-[#0f3460]/3">
            <div className="w-14 h-14 rounded-2xl bg-[#0f3460]/8 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#0f3460]/40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-[#0f3460]">Seleccioná una propiedad primero</p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Cargá tu propiedad en Mis Propiedades y generá contenido desde ahí con un clic.
              </p>
            </div>
            <Link
              href="/mis-propiedades"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0f3460] hover:bg-[#0f3460]/90 px-5 py-2.5 rounded-xl transition-colors"
            >
              Ir a Mis Propiedades →
            </Link>
          </div>
        )}

        {/* Fotos */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">
            Fotos de la propiedad
            <span className="text-muted-foreground ml-1.5 font-normal">(hasta 3 · la 1ra es obligatoria)</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => {
              const locked = !isProMax && i > 0;
              if (locked) {
                return (
                  <LockedImageSlot
                    key={i}
                    index={i}
                    proMaxCheckoutUrl={proMaxCheckoutUrl}
                  />
                );
              }
              return (
                <ImageSlot
                  key={i}
                  index={i}
                  preview={previews[i] ?? null}
                  onFile={(f) => applyFile(i, f)}
                  onDrop={(e) => handleDrop(i, e)}
                  onRemove={() => removeImage(i)}
                  onClickRef={() => fileInputRefs.current[i]?.click()}
                  inputRef={(el) => { fileInputRefs.current[i] = el; }}
                  required={i === 0}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {isProMax
              ? "Cada foto genera 3 formatos (Feed · Story · Banner) · JPG, PNG o WEBP · Máx 10 MB"
              : "Tu plan PRO incluye 1 foto · 3 formatos (Feed · Story · Banner) · Actualizá a PRO MAX para agregar hasta 3 fotos"}
          </p>
        </div>

        {/* ── Sección colapsable: Tu logo ── */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowLogo(!showLogo)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-[#0f3460]">Tu logo</span>
              {agentLogoUrl ? (
                <span className="text-xs bg-[#00c9c9]/15 text-[#00c9c9] border border-[#00c9c9]/30 px-2 py-0.5 rounded-full font-semibold">Guardado</span>
              ) : (
                <span className="hidden sm:inline text-xs text-slate-400 font-normal">aparecerá en todos los ads generados</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${showLogo ? "rotate-180" : ""}`} />
          </button>
          {showLogo && (
            <div className="p-4 border-t border-slate-100 flex flex-col gap-4">
              <p className="text-xs text-muted-foreground">
                Subí el logo de tu inmobiliaria para incluirlo en los ads generados.
                Aparecerá en la esquina superior izquierda de cada formato.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Preview */}
                {(agentLogoPreview ?? agentLogoUrl) ? (
                  <div className="relative group shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={agentLogoPreview ?? agentLogoUrl!}
                      alt="Logo preview"
                      className="h-20 max-w-[200px] object-contain rounded-lg border border-slate-200 bg-slate-50 p-2"
                    />
                    {logoUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
                        <div className="w-5 h-5 border-2 border-[#0f3460]/20 border-t-[#00c9c9] rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Upload area */}
                <div
                  className="flex-1 border-2 border-dashed border-[#0f3460]/20 rounded-xl cursor-pointer hover:border-[#00c9c9]/50 hover:bg-[#00c9c9]/5 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleLogoFile(f); }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 text-center">
                    <div className="w-9 h-9 rounded-xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center">
                      <UploadCloudIcon className="w-4 h-4 text-[#0f3460]/40" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {agentLogoUrl ? "Arrastrá o hacé click para cambiar el logo" : "Arrastrá o hacé click para subir el logo"}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">PNG o JPG · Máx 2 MB</p>
                  </div>
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); e.target.value = ""; }}
              />
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="border-t border-[#0f3460]/8" />

        {/* ── Diseño ── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center">
              <PaletteIcon className="w-3.5 h-3.5 text-[#0f3460]/60" />
            </div>
            <p className="text-sm font-semibold text-[#0f3460]">Diseño del ad</p>
          </div>

          {/* Colores del ad */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <PaletteIcon className="w-3.5 h-3.5 text-muted-foreground" />
              Colores del ad
            </Label>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Presets rápidos:</span>
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  title={preset.label}
                  onClick={() => { setColorFondo(preset.fondo); setColorAcento(preset.acento); setColorTexto(preset.texto); saveColors(preset.fondo, preset.acento, preset.texto); }}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${preset.fondo} 50%, ${preset.acento} 50%)` }}
                >
                  <span className="sr-only">{preset.label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Color de fondo</span>
                  <ColorPickerRow id="cp-fondo" value={colorFondo} onChange={(v) => { setColorFondo(v); saveColors(v, colorAcento, colorTexto); }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Color de acento — precio y botones</span>
                  <ColorPickerRow id="cp-acento" value={colorAcento} onChange={(v) => { setColorAcento(v); saveColors(colorFondo, v, colorTexto); }} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">Color de texto</span>
                  <ColorPickerRow id="cp-texto" value={colorTexto} onChange={(v) => { setColorTexto(v); saveColors(colorFondo, colorAcento, v); }} />
                </div>
              </div>
              <div
                className="rounded-xl overflow-hidden border border-[#0f3460]/10 flex flex-col shrink-0 w-full sm:w-[280px]"
                style={{ height: 180, backgroundColor: colorFondo }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "0 16px" }}>
                  <div style={{ color: colorAcento, fontSize: 26, fontWeight: 900, lineHeight: 1 }}>USD 120.000</div>
                  <div style={{ color: colorTexto, fontSize: 12 }}>Palermo · 3 dorm · 50 m²</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 16 }}>
                  <div style={{ backgroundColor: colorAcento, color: colorFondo, padding: "6px 16px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                    Consultá ahora
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Moneda + Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Moneda */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <DollarSignIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Moneda
              </Label>
              <div className="flex gap-2">
                {CURRENCIES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoneda(m)}
                    className={`flex-1 h-12 rounded-lg border-2 text-sm font-semibold transition-all cursor-pointer ${
                      moneda === m
                        ? "border-[#0f3460] bg-[#0f3460] text-white"
                        : "border-[#0f3460]/15 bg-card text-muted-foreground hover:border-[#0f3460]/40 hover:text-[#0f3460]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">Formato del precio en el ad</p>
            </div>

            {/* Badge */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Etiqueta
              </Label>
              <div className="relative">
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full h-12 rounded-lg border-2 border-[#0f3460]/15 bg-card text-sm font-medium px-3 pr-9 appearance-none cursor-pointer focus:outline-none focus:border-[#0f3460]/50 transition-colors"
                  style={{ color: BADGE_COLORS[badge] ?? "#111" }}
                >
                  {BADGES.map((b) => (
                    <option key={b} value={b} style={{ color: BADGE_COLORS[b] }}>
                      {b}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">Badge de estado que aparece en el ad</p>
            </div>
          </div>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !canGenerate}
          className="w-full sm:w-auto sm:self-start h-12 sm:h-11 px-8 text-base sm:text-sm bg-[#f59e0b] hover:bg-[#e08e00] text-white border-0 shadow-md font-bold"
        >
          <SparklesIcon className="w-4 h-4" />
          {isLoading ? "Generando ads..." : phase === "complete" ? "Regenerar ads" : "Generar ads"}
        </Button>
        </fieldset>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="border border-[#0f3460]/10 rounded-xl p-8 bg-card flex flex-col items-center gap-5 text-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#0f3460]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#00c9c9] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-[#0f3460]" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-[#0f3460]">
              Generando hasta {activeCount * 3} ads...
            </p>
            <p className="text-xs text-muted-foreground min-h-[1.25rem] transition-all">
              {TIPS_GENERATE[loadingTip]}
            </p>
          </div>
          <p className="text-xs text-muted-foreground/60 max-w-xs">
            La generación puede tardar entre 30 y 60 segundos según la cantidad de fotos.
          </p>
        </div>
      )}

      {/* ── Skeletons ── */}
      {phase === "generating" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: activeCount * 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="w-full aspect-square rounded-xl" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* ── Resultados ── */}
      {phase === "complete" && ads.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">Ads generados</h2>
            <p className="text-sm text-muted-foreground">
              {ads.length} ad{ads.length !== 1 ? "s" : ""} listos para Meta Ads.
            </p>
            <div className="h-1 w-16 bg-[#00c9c9] rounded-full" />
          </div>

          {[0, 1, 2].map((photoIndex) => {
            const photoAds = ads.filter((a) => a.photoIndex === photoIndex);
            if (!photoAds.length) return null;
            const preview = previews[photoIndex];
            return (
              <div key={photoIndex} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="w-12 h-12 rounded-lg object-cover border border-[#0f3460]/10" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#0f3460]/8 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-[#0f3460]/40" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#0f3460]">Foto {photoIndex + 1}</p>
                    <p className="text-xs text-muted-foreground">{photoAds.length} formato{photoAds.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {AD_ORDER.map((type) => {
                    const ad = photoAds.find((a) => a.type === type);
                    const info = AD_INFO[type];
                    if (!ad) return null;
                    return (
                      <div key={type} className="flex flex-col gap-3">
                        <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm">
                          <div className="px-4 py-3 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-[#0f3460]">{info.label}</p>
                              <p className="text-xs text-muted-foreground">{info.dims}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-[#0f3460]" />
                              <div className="w-3 h-3 rounded-full bg-[#00c9c9]" />
                            </div>
                          </div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ad.url}
                            alt={`Ad ${info.label} foto ${photoIndex + 1}`}
                            className="w-full object-contain bg-slate-100 max-h-80"
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(ad.url, photoIndex, type)}
                          className="w-full h-11 text-sm"
                        >
                          <DownloadIcon className="w-4 h-4" />
                          Descargar PNG
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Color utilities ── */
function saveColors(fondo: string, acento: string, texto: string) {
  try {
    localStorage.setItem("propia_brand_colors", JSON.stringify({ colorFondo: fondo, colorAcento: acento, colorTexto: texto }));
  } catch {}
}

function ColorPickerRow({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 h-10 border border-input rounded-lg px-3 bg-background">
      <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ backgroundColor: value }} />
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-0 h-0 opacity-0 absolute" id={id} />
      <label htmlFor={id} className="flex-1 text-xs text-muted-foreground cursor-pointer font-mono">{value.toUpperCase()}</label>
      <label htmlFor={id} className="text-xs text-[#0f3460] font-medium cursor-pointer hover:underline">Cambiar</label>
    </div>
  );
}

/* ── Locked image slot (Pro Max only) ── */
function LockedImageSlot({
  index,
  proMaxCheckoutUrl,
}: {
  index: number;
  proMaxCheckoutUrl?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        Foto {index + 1} <span className="text-muted-foreground/50">(opcional)</span>
      </p>
      <div className="border-2 border-dashed border-[#f59e0b]/25 rounded-xl bg-[#f59e0b]/3 h-36 flex flex-col items-center justify-center gap-2 px-3 text-center">
        <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center">
          <LockIcon className="w-4 h-4 text-[#f59e0b]/60" />
        </div>
        <p className="text-[11px] text-[#f59e0b] font-semibold leading-snug">PRO MAX</p>
        {proMaxCheckoutUrl && (
          <a
            href={proMaxCheckoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-400 hover:text-[#f59e0b] transition-colors underline underline-offset-2 leading-snug"
          >
            Actualizar
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Image slot ── */
function ImageSlot({
  index, preview, onFile, onDrop, onRemove, onClickRef, inputRef, required,
}: {
  index: number;
  preview: string | null;
  onFile: (f: File) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemove: () => void;
  onClickRef: () => void;
  inputRef: (el: HTMLInputElement | null) => void;
  required: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">
        Foto {index + 1} {required ? <span className="text-destructive">*</span> : "(opcional)"}
      </p>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={onClickRef}
        className="border-2 border-dashed border-[#0f3460]/20 rounded-xl cursor-pointer hover:border-[#00c9c9]/50 hover:bg-[#00c9c9]/5 transition-colors overflow-hidden"
      >
        {preview ? (
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-36 object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full">Cambiar</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="text-white bg-red-500/80 hover:bg-red-500 p-1.5 rounded-full transition-colors"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center h-36">
            <div className="w-10 h-10 rounded-xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center">
              <UploadCloudIcon className="w-5 h-5 text-[#0f3460]/40" />
            </div>
            <p className="text-xs text-muted-foreground leading-snug">Arrastrá o hacé click</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}
