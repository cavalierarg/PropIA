"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { uploadPropertyImage } from "@/lib/actions/flyers.actions";
import { investigarTendenciasAds, type AdTrend } from "@/lib/actions/ads-trends.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UploadCloudIcon,
  SparklesIcon,
  DownloadIcon,
  XIcon,
  GlobeIcon,
  CheckIcon,
  StarIcon,
  ZapIcon,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

const PRO_MAX_CHECKOUT =
  "https://propia.lemonsqueezy.com/checkout/buy/999a3318-b1c8-40d1-a379-2039fe777b1d?checkout[custom][plan]=pro_max";

type AdType = "feed" | "story" | "banner";
type Phase = "idle" | "researching" | "trends_ready" | "generating" | "complete";

type GeneratedAd = {
  photoIndex: number;
  type: AdType;
  url: string;
};

const AD_INFO: Record<AdType, { label: string; dims: string }> = {
  feed:   { label: "Feed cuadrado",   dims: "1080 × 1080 px" },
  story:  { label: "Story vertical",  dims: "1080 × 1920 px" },
  banner: { label: "Banner Facebook", dims: "1200 × 628 px"  },
};

const AD_ORDER: AdType[] = ["feed", "story", "banner"];

const TIPS_RESEARCH = [
  "Buscando tendencias en Meta Ads...",
  "Analizando formatos inmobiliarios exitosos...",
  "Investigando mejores prácticas actuales...",
  "Elaborando recomendación personalizada...",
];

const TIPS_GENERATE = [
  "Subiendo fotos a la nube...",
  "Generando ads en alta resolución...",
  "Aplicando diseño profesional PropIA...",
  "Preparando formatos para Meta Ads...",
];

export default function AdsGeneratorContent() {
  const { user } = useUser();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  const [images, setImages]   = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);

  const [precio, setPrecio] = useState("");
  const [zona, setZona]     = useState("");
  const [metros, setMetros] = useState("");
  const [car1, setCar1]     = useState("");
  const [car2, setCar2]     = useState("");
  const [agente, setAgente] = useState("");

  const [phase, setPhase]         = useState<Phase>("idle");
  const [loadingTip, setLoadingTip] = useState(0);
  const [error, setError]         = useState("");
  const [trends, setTrends]       = useState<AdTrend[]>([]);
  const [ads, setAds]             = useState<GeneratedAd[]>([]);

  const checkoutUrl = user
    ? `${PRO_MAX_CHECKOUT}&checkout[custom][user_id]=${user.id}`
    : PRO_MAX_CHECKOUT;

  const activeCount = images.filter(Boolean).length;
  const isLoading = phase === "researching" || phase === "generating";
  const currentTips = phase === "researching" ? TIPS_RESEARCH : TIPS_GENERATE;

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingTip((p) => (p + 1) % currentTips.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isLoading, currentTips.length]);

  /* ── Imagen handlers ── */
  const applyFile = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);

    const newPreviews = [...previews];
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!);
    newPreviews[index] = URL.createObjectURL(file);
    setPreviews(newPreviews);

    setAds([]);
    if (phase === "complete") setPhase("trends_ready");
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);

    const newPreviews = [...previews];
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!);
    newPreviews[index] = null;
    setPreviews(newPreviews);
  };

  const handleDrop = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) applyFile(index, file);
  };

  /* ── Investigar tendencias ── */
  const handleResearch = async () => {
    if (activeCount === 0) {
      toast.error("Subí al menos una foto antes de investigar tendencias.");
      return;
    }
    if (!precio || !zona || !metros) {
      toast.error("Completá precio, zona y metros cuadrados primero.");
      return;
    }

    setError("");
    setPhase("researching");
    setLoadingTip(0);

    try {
      const result = await investigarTendenciasAds();
      setTrends(result.tendencias);
      setPhase("trends_ready");
    } catch {
      setError("Error al investigar tendencias. Intentá de nuevo.");
      setPhase("idle");
    }
  };

  /* ── Generar ads ── */
  const handleGenerate = async () => {
    setError("");
    setPhase("generating");
    setLoadingTip(0);
    setAds([]);

    try {
      const uploadResults: { photoIndex: number; url: string }[] = [];

      for (let i = 0; i < 3; i++) {
        const img = images[i];
        if (!img) continue;
        const fd = new FormData();
        fd.append("image", img);
        const url = await uploadPropertyImage(fd);
        uploadResults.push({ photoIndex: i, url });
      }

      const adTasks = uploadResults.flatMap(({ photoIndex, url }) =>
        AD_ORDER.map((type) => ({ photoIndex, url, type }))
      );

      const results = await Promise.allSettled(
        adTasks.map(async ({ photoIndex, url, type }) => {
          const res = await fetch("/api/generate-ad", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, imageUrl: url, precio, zona, metros, car1, car2, agente }),
          });
          if (!res.ok) throw new Error(`API error ${res.status}`);
          const blob = await res.blob();
          return { photoIndex, type, url: URL.createObjectURL(blob) } as GeneratedAd;
        })
      );

      const generated: GeneratedAd[] = [];
      results.forEach((r) => {
        if (r.status === "fulfilled") generated.push(r.value);
        else console.error("[ads] Error:", r.reason);
      });

      setAds(generated);

      if (generated.length > 0) {
        toast.success(`${generated.length} ad${generated.length !== 1 ? "s" : ""} generado${generated.length !== 1 ? "s" : ""}`);
        setPhase("complete");
      } else {
        toast.error("No se pudo generar ningún ad. Intentá de nuevo.");
        setPhase("trends_ready");
      }
    } catch {
      toast.error("Error al generar los ads. Intentá de nuevo.");
      setPhase("trends_ready");
    }
  };

  const handleDownload = (url: string, photoIndex: number, type: AdType) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `ad-${type}-foto${photoIndex + 1}.png`;
    a.click();
  };

  /* ── Render ── */
  return (
    <div className="flex flex-col gap-8">

      {/* ── Formulario ── */}
      <div className="border border-[#0f3460]/10 rounded-xl p-5 sm:p-6 bg-card flex flex-col gap-6">

        {/* Upload de hasta 3 fotos */}
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
            Cada foto genera 3 formatos (Feed, Story, Banner) · JPG, PNG o WEBP · Máx 10 MB
          </p>
        </div>

        {/* Campos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Precio *</Label>
            <Input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej: USD 185.000" className="h-12 text-base" />
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

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          onClick={handleResearch}
          disabled={isLoading || activeCount === 0 || !precio || !zona || !metros}
          className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm bg-[#0f3460] hover:bg-[#0f3460]/90 text-white"
        >
          <GlobeIcon className="w-4 h-4" />
          {phase === "researching" ? "Investigando tendencias..." : "Investigar tendencias en Meta Ads"}
        </Button>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <LoadingPanel
          tip={currentTips[loadingTip]}
          phase={phase}
          photoCount={activeCount}
        />
      )}

      {/* ── Tendencias ── */}
      {(phase === "trends_ready" || phase === "complete") && trends.length > 0 && !isLoading && (
        <TrendsSection
          trends={trends}
          onGenerate={handleGenerate}
          alreadyGenerated={phase === "complete"}
        />
      )}

      {/* ── Generating skeletons ── */}
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
              {ads.length} ad{ads.length !== 1 ? "s" : ""} en alta resolución listos para Meta Ads.
            </p>
            <div className="h-1 w-16 bg-[#00c9c9] rounded-full" />
          </div>

          {/* Agrupar por foto */}
          {[0, 1, 2].map((photoIndex) => {
            const photoAds = ads.filter((a) => a.photoIndex === photoIndex);
            if (photoAds.length === 0) return null;
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

/* ── Slot de imagen ── */
function ImageSlot({
  index,
  preview,
  onFile,
  onDrop,
  onRemove,
  onClickRef,
  inputRef,
  required,
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
              <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full">
                Cambiar
              </span>
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

/* ── Loading panel ── */
function LoadingPanel({ tip, phase, photoCount }: { tip: string; phase: Phase; photoCount: number }) {
  const isGenerating = phase === "generating";
  return (
    <div className="border border-[#0f3460]/10 rounded-xl p-8 bg-card flex flex-col items-center gap-5 text-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#0f3460]/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#00c9c9] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          {isGenerating ? (
            <SparklesIcon className="w-6 h-6 text-[#0f3460]" />
          ) : (
            <GlobeIcon className="w-6 h-6 text-[#0f3460]" />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-[#0f3460]">
          {isGenerating ? `Generando hasta ${photoCount * 3} ads...` : "Investigando en tiempo real"}
        </p>
        <p className="text-xs text-muted-foreground min-h-[1.25rem] transition-all">{tip}</p>
      </div>
      <p className="text-xs text-muted-foreground/60 max-w-xs">
        {isGenerating
          ? "La generación puede tardar entre 30 y 60 segundos según la cantidad de fotos."
          : "La búsqueda web puede tardar entre 20 y 40 segundos."}
      </p>
    </div>
  );
}

/* ── Sección de tendencias ── */
function TrendsSection({
  trends,
  onGenerate,
  alreadyGenerated,
}: {
  trends: AdTrend[];
  onGenerate: () => void;
  alreadyGenerated: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00c9c9]/15 border border-[#00c9c9]/30 flex items-center justify-center">
            <ZapIcon className="w-4 h-4 text-[#0f3460]" />
          </div>
          <h2 className="text-base font-bold text-[#0f3460] sm:text-lg">
            Tendencias actuales en Meta Ads inmobiliario
          </h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Investigación en tiempo real · Datos obtenidos ahora mismo con web search
        </p>
        <div className="h-1 w-12 bg-[#00c9c9] rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {trends.map((trend) => (
          <TrendCard key={trend.numero} trend={trend} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
        <Button
          onClick={onGenerate}
          className="w-full sm:w-auto h-12 sm:h-11 px-8 text-base sm:text-sm bg-[#f59e0b] hover:bg-[#e08e00] text-white border-0 shadow-md font-bold"
        >
          <SparklesIcon className="w-4 h-4" />
          {alreadyGenerated ? "Regenerar ads" : "Generar ads ahora"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Se generarán los 3 formatos para cada foto subida
        </p>
      </div>
    </div>
  );
}

/* ── Tarjeta de tendencia ── */
function TrendCard({ trend }: { trend: AdTrend }) {
  return (
    <div className={`border rounded-xl overflow-hidden shadow-sm flex flex-col ${
      trend.recomendado
        ? "border-[#00c9c9]/50 shadow-[#00c9c9]/10"
        : "border-[#0f3460]/10"
    }`}>
      {trend.recomendado && (
        <div className="h-1 bg-gradient-to-r from-[#00c9c9]/60 via-[#00c9c9] to-[#00c9c9]/60" />
      )}
      <div className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${
        trend.recomendado ? "bg-[#00c9c9]/8 border-[#00c9c9]/20" : "bg-[#0f3460]/5 border-[#0f3460]/10"
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#0f3460] text-white text-xs font-bold flex items-center justify-center shrink-0">
            {trend.numero}
          </span>
          <p className="text-sm font-bold text-[#0f3460] leading-snug">{trend.titulo}</p>
        </div>
        {trend.recomendado && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#00c9c9] text-[#0f3460] rounded-full px-2.5 py-1 shrink-0">
            <StarIcon className="w-2.5 h-2.5" />
            Recomendado
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 bg-card flex-1">
        <p className="text-xs text-slate-600 leading-relaxed">{trend.descripcion}</p>
        <div className="border-t border-[#0f3460]/8 pt-3 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#00c9c9] uppercase tracking-wide">
            Por qué funciona ahora
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">{trend.por_que_funciona}</p>
        </div>
      </div>
    </div>
  );
}
