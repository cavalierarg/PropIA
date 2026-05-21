"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { uploadPropertyImage } from "@/lib/actions/flyers.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UploadCloudIcon,
  SparklesIcon,
  DownloadIcon,
  LockIcon,
} from "lucide-react";
import { toast } from "sonner";

const PRO_MAX_CHECKOUT =
  "https://propia.lemonsqueezy.com/checkout/buy/999a3318-b1c8-40d1-a379-2039fe777b1d?checkout[custom][plan]=pro_max";

type FlyerType = "feed" | "story" | "banner";

const FLYER_INFO: Record<FlyerType, { label: string; dims: string; proMaxOnly: boolean }> = {
  feed:   { label: "Feed cuadrado",    dims: "1080 × 1080 px", proMaxOnly: false },
  story:  { label: "Story vertical",   dims: "1080 × 1920 px", proMaxOnly: true  },
  banner: { label: "Banner Facebook",  dims: "1200 × 628 px",  proMaxOnly: true  },
};

const FLYER_ORDER: FlyerType[] = ["feed", "story", "banner"];

export default function FlyersContent({ plan }: { plan: "pro" | "pro_max" }) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [precio, setPrecio]           = useState("");
  const [zona, setZona]               = useState("");
  const [metros, setMetros]           = useState("");
  const [car1, setCar1]               = useState("");
  const [car2, setCar2]               = useState("");
  const [agente, setAgente]           = useState("");

  const [uploading, setUploading]     = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [flyers, setFlyers]           = useState<Partial<Record<FlyerType, string>>>({});

  const isProMax = plan === "pro_max";
  const checkoutUrl = user
    ? `${PRO_MAX_CHECKOUT}&checkout[custom][user_id]=${user.id}`
    : PRO_MAX_CHECKOUT;

  /* ── Handlers de imagen ─────────────────────────────────── */
  const applyFile = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFlyers({});
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) applyFile(file);
  };

  /* ── Generar ────────────────────────────────────────────── */
  const generateFlyer = async (type: FlyerType, uploadedUrl: string): Promise<string> => {
    const res = await fetch("/api/generate-flyer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, imageUrl: uploadedUrl, precio, zona, metros, car1, car2, agente }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  };

  const handleGenerate = async () => {
    if (!imageFile || !precio || !zona || !metros) {
      toast.error("Completá imagen, precio, zona y metros cuadrados.");
      return;
    }

    setFlyers({});
    setUploading(true);

    let uploadedUrl: string;
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      uploadedUrl = await uploadPropertyImage(fd);
    } catch {
      toast.error("Error al subir la imagen. Intentá de nuevo.");
      setUploading(false);
      return;
    }

    setUploading(false);
    setGenerating(true);

    try {
      const types: FlyerType[] = isProMax ? ["feed", "story", "banner"] : ["feed"];
      const results = await Promise.allSettled(
        types.map((t) => generateFlyer(t, uploadedUrl))
      );

      const newFlyers: Partial<Record<FlyerType, string>> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled") newFlyers[types[i]] = r.value;
        else console.error(`[flyers] Error en ${types[i]}:`, r.reason);
      });

      setFlyers(newFlyers);
      const count = Object.keys(newFlyers).length;
      if (count > 0) toast.success(`${count} flyer${count > 1 ? "s" : ""} generado${count > 1 ? "s" : ""} correctamente`);
      else toast.error("No se pudo generar ningún flyer. Intentá de nuevo.");
    } catch {
      toast.error("Error al generar los flyers. Intentá de nuevo.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (url: string, type: FlyerType) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `flyer-${type}-propia.png`;
    a.click();
  };

  const isLoading   = uploading || generating;
  const hasResults  = Object.keys(flyers).length > 0;

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-8">

      {/* Formulario */}
      <div className="border border-[#0f3460]/10 rounded-xl p-5 sm:p-6 bg-card flex flex-col gap-6">

        {/* Upload de imagen */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Foto de la propiedad *</Label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#0f3460]/20 rounded-xl cursor-pointer hover:border-[#00c9c9]/50 hover:bg-[#00c9c9]/5 transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview de la propiedad"
                  className="w-full max-h-72 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <span className="text-white text-sm font-semibold bg-black/40 px-4 py-2 rounded-full">
                    Cambiar imagen
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center">
                  <UploadCloudIcon className="w-7 h-7 text-[#0f3460]/50" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0f3460]">Arrastrá o hacé click para subir</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG o WEBP · Máx 10 MB</p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
          />
        </div>

        {/* Campos del formulario */}
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
            <Input value={agente} onChange={(e) => setAgente(e.target.value)} placeholder="Ej: María García Propiedades" className="h-12 text-base" />
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

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !imageFile || !precio || !zona || !metros}
          className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
        >
          <SparklesIcon className="w-4 h-4" />
          {uploading ? "Subiendo imagen..." : generating ? `Generando flyer${isProMax ? "s" : ""}...` : `Generar flyer${isProMax ? "s" : ""}`}
        </Button>
      </div>

      {/* Skeletons de carga */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(isProMax ? [1, 2, 3] : [1]).map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="w-full aspect-square rounded-xl" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Resultados */}
      {hasResults && !isLoading && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">Flyers generados</h2>
            <p className="text-sm text-muted-foreground">
              {isProMax ? "3 formatos listos para Meta Ads." : "1 formato generado · Actualizá a Pro Max para los 3 formatos."}
            </p>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FLYER_ORDER.map((type) => {
              const info = FLYER_INFO[type];
              const flyerUrl = flyers[type];

              if (info.proMaxOnly && !isProMax) {
                return <LockedFlyer key={type} info={info} checkoutUrl={checkoutUrl} />;
              }

              return (
                <div key={type} className="flex flex-col gap-3">
                  <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="px-4 py-3 bg-[#0f3460]/5 border-b border-[#0f3460]/10 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#0f3460]">{info.label}</p>
                        <p className="text-xs text-muted-foreground">{info.dims}</p>
                      </div>
                      <span className="text-xs font-semibold bg-[#00c9c9]/10 text-[#0f3460] border border-[#00c9c9]/25 rounded-full px-2.5 py-0.5">
                        Pro
                      </span>
                    </div>
                    {/* Imagen */}
                    {flyerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={flyerUrl}
                        alt={`Flyer ${info.label}`}
                        className="w-full object-contain bg-slate-100 max-h-80"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                        Error al generar
                      </div>
                    )}
                  </div>
                  {flyerUrl && (
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(flyerUrl, type)}
                      className="w-full h-11 text-sm"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Descargar PNG
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta bloqueada ──────────────────────────────────────── */
function LockedFlyer({
  info,
  checkoutUrl,
}: {
  info: { label: string; dims: string };
  checkoutUrl: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm relative">
        {/* Fondo borroso */}
        <div className="blur-sm pointer-events-none select-none" aria-hidden>
          <div className="px-4 py-3 bg-[#0f3460]/5 border-b border-[#0f3460]/10">
            <div className="h-4 w-28 bg-[#0f3460]/15 rounded-full mb-1.5" />
            <div className="h-3 w-20 bg-[#0f3460]/10 rounded-full" />
          </div>
          <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200" />
        </div>

        {/* Overlay de bloqueo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-white/80 backdrop-blur-[2px] rounded-xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/25 flex items-center justify-center">
            <LockIcon className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold text-[#0f3460] text-sm">{info.label}</p>
            <p className="text-xs text-muted-foreground">{info.dims}</p>
            <p className="text-xs text-slate-500 mt-1">Exclusivo del plan Pro Max</p>
          </div>
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#f59e0b] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#e08e00] transition-colors"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            Upgrade a Pro Max
          </a>
        </div>
      </div>
    </div>
  );
}
