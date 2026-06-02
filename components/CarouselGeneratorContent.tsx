"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  Loader2,
  Download,
  Archive,
  ImageIcon,
  UserCircle2,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import PropertySelector from "@/components/PropertySelector";
import { uploadCarouselPhoto } from "@/lib/actions/carousel-photo.actions";
import type { AgentProfile } from "@/lib/actions/agent-profile.actions";

interface Props {
  profile: AgentProfile;
}

const CAROUSEL_COLOR_PRESETS = [
  { label: "Azul profesional", fondo: "#0f3460", acento: "#00c9c9", texto: "#ffffff" },
  { label: "Negro elegante",   fondo: "#0a0a0a", acento: "#c9a84c", texto: "#ffffff" },
  { label: "Verde naturaleza", fondo: "#1a4a2e", acento: "#4caf50", texto: "#ffffff" },
  { label: "Rojo impacto",     fondo: "#1a0a0a", acento: "#e94560", texto: "#ffffff" },
  { label: "Blanco moderno",   fondo: "#ffffff", acento: "#0f3460", texto: "#1a1a1a" },
] as const;

function carouselSaveColors(fondo: string, acento: string, texto: string) {
  try {
    localStorage.setItem("propia_brand_colors", JSON.stringify({ colorFondo: fondo, colorAcento: acento, colorTexto: texto }));
  } catch {}
}

function CarouselColorPickerRow({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 h-10 border border-[#e2e8f0] rounded-lg px-3 bg-white">
      <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ backgroundColor: value }} />
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-0 h-0 opacity-0 absolute" id={id} />
      <label htmlFor={id} className="flex-1 text-xs text-slate-400 cursor-pointer font-mono">{value.toUpperCase()}</label>
      <label htmlFor={id} className="text-xs text-[#00c9c9] font-medium cursor-pointer hover:underline">Cambiar</label>
    </div>
  );
}

const SLIDE_LABELS = [
  "Slide 1 — Foto + precio",
  "Slide 2 — Características",
  "Slide 3 — Detalles",
  "Slide 4 — Ubicación",
  "Slide 5 — Contacto",
];

const OPERACIONES = ["En Venta", "Alquiler", "Alquiler temporal"];

export default function CarouselGeneratorContent({ profile }: Props) {
  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form state — property data
  const [precio, setPrecio] = useState("");
  const [operacion, setOperacion] = useState("En Venta");
  const [zona, setZona] = useState(profile.zona ?? "");
  const [metros, setMetros] = useState("");
  const [dormitorios, setDormitorios] = useState("");
  const [banios, setBanios] = useState("");
  const [cocheras, setCocheras] = useState("");
  const [caracteristicas, setCaracteristicas] = useState<string[]>(["", "", ""]);

  // Colors — editable, pre-loaded from localStorage or profile
  const [colorFondo,  setColorFondo]  = useState(profile.color_marca ?? "#0f3460");
  const [colorAcento, setColorAcento] = useState("#00c9c9");
  const [colorTexto,  setColorTexto]  = useState("#ffffff");

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
  }, []);

  // Agent data (from profile, read-only)
  const nombreAgente = profile.nombre_completo ?? "";
  const nombreAgencia = profile.nombre_agencia ?? "";
  const whatsapp = profile.whatsapp ?? "";
  const instagram = profile.instagram ?? "";
  const logoUrl = profile.logo_url ?? "";

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideUrls, setSlideUrls] = useState<string[]>([]);
  const [slideBlobs, setSlideBlobs] = useState<Blob[]>([]);
  const [zipping, setZipping] = useState(false);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setLocalPreview(URL.createObjectURL(file));
    setUploadedUrl(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const url = await uploadCarouselPhoto(fd);
      setUploadedUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir la foto");
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function addCaracteristica() {
    if (caracteristicas.length < 7) setCaracteristicas((p) => [...p, ""]);
  }

  function removeCaracteristica(i: number) {
    setCaracteristicas((p) => p.filter((_, idx) => idx !== i));
  }

  function updateCaracteristica(i: number, val: string) {
    setCaracteristicas((p) => p.map((c, idx) => (idx === i ? val : c)));
  }

  async function handleGenerate() {
    if (!uploadedUrl) { setError("Subí una foto de la propiedad primero."); return; }
    if (!precio.trim()) { setError("Completá el precio."); return; }
    if (!zona.trim()) { setError("Completá la zona/ubicación."); return; }
    if (!metros.trim()) { setError("Completá los m²."); return; }

    setError(null);
    setGenerating(true);

    // Revoke previous object URLs
    slideUrls.forEach((u) => URL.revokeObjectURL(u));
    setSlideUrls([]);
    setSlideBlobs([]);

    const payload = {
      imageUrl: uploadedUrl,
      precio: precio.trim(),
      operacion,
      zona: zona.trim(),
      metros: metros.trim(),
      dormitorios: dormitorios.trim(),
      banios: banios.trim(),
      cocheras: cocheras.trim(),
      caracteristicas: caracteristicas.filter((c) => c.trim()),
      colorMarca: colorFondo,
      accentColor: colorAcento,
      colorTexto,
      nombreAgente,
      nombreAgencia,
      whatsapp,
      instagram,
      logoUrl,
    };

    try {
      const responses = await Promise.all(
        [1, 2, 3, 4, 5].map((slide) =>
          fetch("/api/generate-carousel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slide, ...payload }),
          })
        )
      );

      const failed = responses.find((r) => !r.ok);
      if (failed) {
        const body = await failed.json().catch(() => ({}));
        throw new Error(body.error ?? `Error generando slides (${failed.status})`);
      }

      const blobs = await Promise.all(responses.map((r) => r.blob()));
      const urls = blobs.map((b) => URL.createObjectURL(b));
      setSlideBlobs(blobs);
      setSlideUrls(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido al generar el carrusel");
    } finally {
      setGenerating(false);
    }
  }

  function downloadSlide(url: string, idx: number) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `carrusel-slide-${idx + 1}.png`;
    a.click();
  }

  async function downloadAll() {
    if (slideBlobs.length === 0) return;
    setZipping(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      slideBlobs.forEach((blob, i) => {
        zip.file(`carrusel-slide-${i + 1}.png`, blob);
      });
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "carrusel-propia.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Error al generar el ZIP.");
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
      {/* ── FORM ── */}
      <div className="flex flex-col gap-6">
        <fieldset disabled={generating} className="contents">
        <PropertySelector
          onSelect={(prefill) => {
            setZona(prefill.ubicacion);
            setPrecio(prefill.precio);
            setMetros(prefill.metrosCuadrados);
          }}
        />

        {/* Photo upload */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <h2 className="text-sm font-semibold text-[#0f3460] mb-4">Foto de la propiedad *</h2>
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
              uploading ? "border-[#00c9c9] bg-[#00c9c9]/5 cursor-wait" :
              localPreview ? "border-[#00c9c9]/40 bg-[#00c9c9]/5" :
              "border-[#e2e8f0] hover:border-[#00c9c9]/60 hover:bg-slate-50"
            } ${localPreview ? "h-52" : "h-44"}`}
          >
            {localPreview ? (
              <>
                <Image src={localPreview} alt="Preview" fill className="rounded-xl object-cover" />
                {uploading && (
                  <div className="absolute inset-0 rounded-xl bg-black/40 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                    <span className="text-white text-xs font-medium">Subiendo...</span>
                  </div>
                )}
                {uploadedUrl && !uploading && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    ✓ Lista
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  {uploading ? <Loader2 className="w-5 h-5 text-[#00c9c9] animate-spin" /> : <Upload className="w-5 h-5 text-slate-400" />}
                </div>
                <p className="text-sm text-slate-500 text-center">
                  {uploading ? "Subiendo foto…" : "Hacé clic para subir la foto de la propiedad"}
                </p>
                <p className="text-xs text-slate-400">JPG o PNG · máx. 15 MB</p>
              </>
            )}
          </div>
          {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
          {localPreview && !uploading && (
            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-[#00c9c9] hover:underline mt-2">
              Cambiar foto
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} />
        </div>

        {/* Property data */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <h2 className="text-sm font-semibold text-[#0f3460] mb-4">Datos de la propiedad</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Precio */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Precio *</label>
              <input
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="USD 250.000"
                className="h-10 rounded-lg border border-[#e2e8f0] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40"
              />
            </div>
            {/* Operación */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Operación</label>
              <select
                value={operacion}
                onChange={(e) => setOperacion(e.target.value)}
                className="h-10 rounded-lg border border-[#e2e8f0] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40 bg-white"
              >
                {OPERACIONES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            {/* Metros */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Superficie m² *</label>
              <input
                value={metros}
                onChange={(e) => setMetros(e.target.value)}
                placeholder="120"
                className="h-10 rounded-lg border border-[#e2e8f0] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40"
              />
            </div>
            {/* Zona */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Zona / Ubicación *</label>
              <input
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                placeholder="Palermo, Buenos Aires"
                className="h-10 rounded-lg border border-[#e2e8f0] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40"
              />
            </div>
            {/* Dormitorios / Baños / Cocheras */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Dormitorios</label>
              <input value={dormitorios} onChange={(e) => setDormitorios(e.target.value)} placeholder="3" className="h-10 rounded-lg border border-[#e2e8f0] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Baños</label>
              <input value={banios} onChange={(e) => setBanios(e.target.value)} placeholder="2" className="h-10 rounded-lg border border-[#e2e8f0] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Cocheras</label>
              <input value={cocheras} onChange={(e) => setCocheras(e.target.value)} placeholder="1" className="h-10 rounded-lg border border-[#e2e8f0] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40" />
            </div>
          </div>
        </div>

        {/* Características adicionales */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#0f3460]">Características adicionales</h2>
              <p className="text-xs text-slate-400 mt-0.5">Aparecen en el slide 3 con checkmarks</p>
            </div>
            {caracteristicas.length < 7 && (
              <button onClick={addCaracteristica} className="flex items-center gap-1 text-xs text-[#00c9c9] font-semibold hover:underline">
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            {caracteristicas.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#00c9c9] flex items-center justify-center shrink-0">
                  <span className="text-white text-[11px] font-bold">✓</span>
                </div>
                <input
                  value={c}
                  onChange={(e) => updateCaracteristica(i, e.target.value)}
                  placeholder={`Ej: ${["Luminoso", "Seguridad 24hs", "Piscina", "Balcón", "Parrilla", "Cochera cubierta", "Jardín"][i] ?? "Característica"}`}
                  maxLength={45}
                  className="flex-1 h-9 rounded-lg border border-[#e2e8f0] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c9c9]/40"
                />
                {caracteristicas.length > 1 && (
                  <button onClick={() => removeCaracteristica(i)} className="text-slate-300 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Colores del ad */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <h2 className="text-sm font-semibold text-[#0f3460] mb-4">Colores del carrusel</h2>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs text-slate-400">Presets rápidos:</span>
            {CAROUSEL_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                title={preset.label}
                onClick={() => { setColorFondo(preset.fondo); setColorAcento(preset.acento); setColorTexto(preset.texto); carouselSaveColors(preset.fondo, preset.acento, preset.texto); }}
                className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${preset.fondo} 50%, ${preset.acento} 50%)` }}
              >
                <span className="sr-only">{preset.label}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Color de fondo</span>
                <CarouselColorPickerRow id="cc-fondo" value={colorFondo} onChange={(v) => { setColorFondo(v); carouselSaveColors(v, colorAcento, colorTexto); }} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Color de acento — precio y botones</span>
                <CarouselColorPickerRow id="cc-acento" value={colorAcento} onChange={(v) => { setColorAcento(v); carouselSaveColors(colorFondo, v, colorTexto); }} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Color de texto</span>
                <CarouselColorPickerRow id="cc-texto" value={colorTexto} onChange={(v) => { setColorTexto(v); carouselSaveColors(colorFondo, colorAcento, v); }} />
              </div>
            </div>
            <div
              className="rounded-xl overflow-hidden border border-[#e2e8f0] flex flex-col shrink-0 w-full sm:w-[280px]"
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

        {/* Agent data (read-only) */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#0f3460]">Datos de marca (slide 5)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Cargados desde tu perfil</p>
            </div>
            <Link href="/perfil" className="text-xs text-[#00c9c9] hover:underline flex items-center gap-1">
              <UserCircle2 className="w-3.5 h-3.5" /> Editar perfil
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Agente</span>
              <span className="text-sm text-slate-700">{nombreAgente || <span className="text-slate-300 italic">Sin configurar</span>}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Agencia</span>
              <span className="text-sm text-slate-700">{nombreAgencia || <span className="text-slate-300 italic">Sin configurar</span>}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">WhatsApp</span>
              <span className="text-sm text-slate-700">{whatsapp || <span className="text-slate-300 italic">Sin configurar</span>}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Instagram</span>
              <span className="text-sm text-slate-700">{instagram ? `@${instagram.replace(/^@/, "")}` : <span className="text-slate-300 italic">Sin configurar</span>}</span>
            </div>
          </div>
        </div>

        {/* Generate button */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}
        <button
          onClick={handleGenerate}
          disabled={generating || uploading || !uploadedUrl}
          className="flex items-center justify-center gap-2 w-full h-12 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed text-[#0f3460] font-bold text-sm rounded-xl transition-colors shadow-sm"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generando carrusel…</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generar carrusel</>
          )}
        </button>
        </fieldset>
      </div>

      {/* ── SLIDES PREVIEW ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0f3460]">Vista previa</h2>
          {slideUrls.length === 5 && (
            <button
              onClick={downloadAll}
              disabled={zipping}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0f3460] bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {zipping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5 text-[#f59e0b]" />}
              Descargar ZIP
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {SLIDE_LABELS.map((label, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#e2e8f0] overflow-hidden">
              {/* Slide header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2e8f0]">
                <span className="text-xs font-semibold text-slate-600">{label}</span>
                {slideUrls[i] && (
                  <button
                    onClick={() => downloadSlide(slideUrls[i], i)}
                    className="flex items-center gap-1 text-xs text-[#00c9c9] font-semibold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> PNG
                  </button>
                )}
              </div>
              {/* Slide image */}
              <div className="aspect-square bg-slate-50 flex items-center justify-center">
                {generating && !slideUrls[i] ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs">Generando…</span>
                  </div>
                ) : slideUrls[i] ? (
                  <div className="relative w-full h-full">
                    <Image src={slideUrls[i]} alt={label} fill className="object-contain" unoptimized />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-300">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-xs">Slide {i + 1}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
