"use client";

import { useState, useRef, useEffect } from "react";
import { uploadPropertyImage } from "@/lib/actions/flyers.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { toast } from "sonner";

type AdType  = "feed" | "story" | "banner";
type AdStyle = "luxury" | "moderno" | "bold" | "profesional";
type Phase   = "idle" | "generating" | "complete";

type GeneratedAd = { photoIndex: number; type: AdType; url: string };

const AD_INFO: Record<AdType, { label: string; dims: string }> = {
  feed:   { label: "Feed cuadrado",   dims: "1080 × 1080 px" },
  story:  { label: "Story vertical",  dims: "1080 × 1920 px" },
  banner: { label: "Banner Facebook", dims: "1200 × 628 px"  },
};
const AD_ORDER: AdType[] = ["feed", "story", "banner"];

const STYLES: { id: AdStyle; label: string; desc: string; palette: string[] }[] = [
  {
    id: "luxury",
    label: "Luxury",
    desc: "Fondo negro, detalles dorados, tipografía elegante",
    palette: ["#0a0a0a", "#c9a84c", "#ffffff"],
  },
  {
    id: "moderno",
    label: "Moderno",
    desc: "Fondo blanco, foto redondeada, diseño minimalista",
    palette: ["#ffffff", "#111111", "#e5e5e5"],
  },
  {
    id: "bold",
    label: "Bold",
    desc: "Foto full con overlay, precio superpuesto enorme",
    palette: ["#000000", "#ffffff", "#555555"],
  },
  {
    id: "profesional",
    label: "Profesional",
    desc: "Fondo de color de marca, franja lateral con foto",
    palette: ["brand", "#ffffff", "#cccccc"],
  },
];

const CURRENCIES = ["USD", "EUR", "ARS"] as const;
const BADGES = ["En Venta", "Alquiler", "Oportunidad", "Recién Llegada", "Última Unidad", "Precio Rebajado"] as const;

const BADGE_COLORS: Record<string, string> = {
  "En Venta":        "#16a34a",
  "Alquiler":        "#2563eb",
  "Oportunidad":     "#ea580c",
  "Recién Llegada":  "#7c3aed",
  "Última Unidad":   "#dc2626",
  "Precio Rebajado": "#d97706",
};

const TIPS_GENERATE = [
  "Subiendo fotos a la nube...",
  "Generando ads en alta resolución...",
  "Aplicando diseño profesional...",
  "Preparando formatos para Meta Ads...",
];

export default function AdsGeneratorContent() {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  const [images,   setImages]   = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);

  const [precio,  setPrecio]  = useState("");
  const [zona,    setZona]    = useState("");
  const [metros,  setMetros]  = useState("");
  const [car1,    setCar1]    = useState("");
  const [car2,    setCar2]    = useState("");
  const [agente,  setAgente]  = useState("");

  const [estilo,     setEstilo]     = useState<AdStyle>("moderno");
  const [colorMarca, setColorMarca] = useState("#0f3460");
  const [moneda,     setMoneda]     = useState<string>("USD");
  const [badge,      setBadge]      = useState<string>("En Venta");

  const [phase,      setPhase]      = useState<Phase>("idle");
  const [loadingTip, setLoadingTip] = useState(0);
  const [error,      setError]      = useState("");
  const [ads,        setAds]        = useState<GeneratedAd[]>([]);

  const activeCount = images.filter(Boolean).length;
  const isLoading   = phase === "generating";
  const canGenerate = activeCount > 0 && !!precio && !!zona && !!metros;

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setLoadingTip((p) => (p + 1) % TIPS_GENERATE.length), 3500);
    return () => clearInterval(id);
  }, [isLoading]);

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
              estilo, colorMarca, moneda, badge,
            }),
          });
          if (!res.ok) throw new Error(`API error ${res.status}`);
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
    a.download = `ad-${estilo}-${type}-foto${photoIndex + 1}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col gap-8">

      {/* ── Formulario ── */}
      <div className="border border-[#0f3460]/10 rounded-xl p-5 sm:p-6 bg-card flex flex-col gap-7">

        {/* Fotos */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">
            Fotos de la propiedad
            <span className="text-muted-foreground ml-1.5 font-normal">(hasta 3 · la 1ra es obligatoria)</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
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
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Cada foto genera 3 formatos (Feed · Story · Banner) · JPG, PNG o WEBP · Máx 10 MB
          </p>
        </div>

        {/* Datos de la propiedad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Precio *</Label>
            <Input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej: 185.000" className="h-12 text-base" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Zona *</Label>
            <Input value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Ej: Palermo, CABA" className="h-12 text-base" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Metros cuadrados *</Label>
            <Input type="number" value={metros} onChange={(e) => setMetros(e.target.value)} placeholder="Ej: 85" className="h-12 text-base" min={1} />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Nombre o agencia</Label>
            <Input value={agente} onChange={(e) => setAgente(e.target.value)} placeholder="Ej: García Propiedades" className="h-12 text-base" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Característica 1</Label>
            <Input value={car1} onChange={(e) => setCar1(e.target.value)} placeholder="Ej: Luminoso con vista al parque" className="h-12 text-base" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Característica 2</Label>
            <Input value={car2} onChange={(e) => setCar2(e.target.value)} placeholder="Ej: Cochera cubierta incluida" className="h-12 text-base" />
          </div>
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

          {/* Estilo */}
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium">Estilo de plantilla</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STYLES.map((s) => {
                const active = estilo === s.id;
                const showBrand = s.id === "profesional";
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setEstilo(s.id)}
                    className={`flex flex-col gap-2.5 rounded-xl border-2 p-3.5 text-left transition-all cursor-pointer ${
                      active
                        ? "border-[#0f3460] bg-[#0f3460]/5 shadow-sm"
                        : "border-[#0f3460]/12 bg-card hover:border-[#0f3460]/30 hover:bg-[#0f3460]/3"
                    }`}
                  >
                    <div className="flex gap-1.5">
                      {s.palette.map((c, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: (showBrand && c === "brand") ? colorMarca : c }}
                        />
                      ))}
                    </div>
                    <div>
                      <p className={`text-sm font-bold leading-tight ${active ? "text-[#0f3460]" : "text-foreground"}`}>
                        {s.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{s.desc}</p>
                    </div>
                    {active && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-3 h-3 rounded-full bg-[#0f3460] flex items-center justify-center">
                          <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
                            <path d="M1 2.5L2.8 4L6 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-[10px] font-semibold text-[#0f3460]">Seleccionado</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color + Moneda + Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Color de marca */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <PaletteIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Color de marca
              </Label>
              <div className="flex items-center gap-3 h-12 border border-input rounded-lg px-3 bg-background">
                <div
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: colorMarca }}
                />
                <input
                  type="color"
                  value={colorMarca}
                  onChange={(e) => setColorMarca(e.target.value)}
                  className="w-0 h-0 opacity-0 absolute"
                  id="color-picker"
                />
                <label htmlFor="color-picker" className="flex-1 text-sm text-muted-foreground cursor-pointer">
                  {colorMarca.toUpperCase()}
                </label>
                <label htmlFor="color-picker" className="text-xs text-[#0f3460] font-medium cursor-pointer hover:underline">
                  Cambiar
                </label>
              </div>
              <p className="text-[11px] text-muted-foreground">Aplica a acentos y detalles según el estilo</p>
            </div>

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
              {ads.length} ad{ads.length !== 1 ? "s" : ""} · Estilo <span className="font-semibold capitalize">{estilo}</span> · listos para Meta Ads.
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
