"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Building2,
} from "lucide-react";
import PropertyLoadedCard from "@/components/PropertyLoadedCard";
import { uploadCarouselPhoto } from "@/lib/actions/carousel-photo.actions";
import type { AgentProfile } from "@/lib/actions/agent-profile.actions";
import { detectVariante } from "@/lib/agent-context";
import type { VarianteEspanol } from "@/lib/agent-context";
import VarianteEspanolSelector from "@/components/VarianteEspanolSelector";
import { THEME_PRESETS, type Theme as ThemeId } from "@/lib/themes";

interface Props {
  profile: AgentProfile;
}

const THEMES = THEME_PRESETS;

const SLIDE_LABELS = [
  "Slide 1 — Foto + precio",
  "Slide 2 — Características",
  "Slide 3 — Detalles",
  "Slide 4 — Ubicación",
  "Slide 5 — Contacto",
];

const OPERACIONES = ["En Venta", "Alquiler", "Alquiler temporal"];

export default function CarouselGeneratorContent({ profile }: Props) {
  const router = useRouter();
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

  // Tema visual + color de acento (el acento puede sobreescribirse independientemente)
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("dark");
  const [colorAcento, setColorAcento] = useState(THEME_PRESETS[0].accent); // default = acento del tema "dark"
  // Fotos autocargadas desde la propiedad
  const [autoPhotosLoaded, setAutoPhotosLoaded] = useState(false);

  useEffect(() => {
    // Pre-fill desde "Usar en..." en Mis Propiedades
    try {
      const raw = localStorage.getItem("propia_property_prefill");
      if (raw) {
        const p = JSON.parse(raw);
        localStorage.removeItem("propia_property_prefill");
        const fullLocation = [p.ubicacion, p.ciudad].filter(Boolean).join(", ");
        if (fullLocation) setZona(fullLocation);
        if (p.precio) setPrecio(p.precio);
        if (p.metrosCuadrados) setMetros(p.metrosCuadrados);
        if (p.ambientes) setDormitorios(p.ambientes);
        if (p.banios) setBanios(p.banios);
        if (p.tipoPropiedad && p.ubicacion) {
          setLoadedProperty({ tipo: p.tipoPropiedad, ubicacion: p.ubicacion, precio: p.precio ?? "", metros: p.metrosCuadrados ?? "" });
        }
        // Precargar características (máx 3 desde el prefill de la propiedad)
        const chars = [p.caracteristica1, p.caracteristica2, p.caracteristica3]
          .filter((c): c is string => typeof c === "string" && c.trim().length > 0);
        if (chars.length > 0) {
          setCaracteristicas(chars.length >= 3 ? chars : [...chars, ...Array(3 - chars.length).fill("")]);
        }
        if (Array.isArray(p.foto_urls) && p.foto_urls[0]) {
          setUploadedUrl(p.foto_urls[0]);
          setLocalPreview(p.foto_urls[0]);
          setAutoPhotosLoaded(true);
        }
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
  const [loadedProperty, setLoadedProperty] = useState<{ tipo: string; ubicacion: string; precio: string; metros: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slideUrls, setSlideUrls] = useState<string[]>([]);
  const [slideBlobs, setSlideBlobs] = useState<Blob[]>([]);
  const [zipping, setZipping] = useState(false);
  const [varianteEspanol, setVarianteEspanol] = useState<VarianteEspanol>(
    profile.variante_espanol ?? detectVariante(profile.zona) ?? "neutro"
  );

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setAutoPhotosLoaded(false);
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
      theme: selectedTheme,
      accentColor: colorAcento,
      nombreAgente,
      nombreAgencia,
      whatsapp,
      instagram,
      logoUrl,
      varianteEspanol,
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
          {autoPhotosLoaded && !uploading && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-emerald-600 text-xs font-semibold">✓ Foto de tu propiedad cargada automáticamente</span>
            </div>
          )}
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

        {/* Selector de tema visual */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <h2 className="text-sm font-semibold text-[#0f3460] mb-1">Tema visual</h2>
          <p className="text-xs text-slate-400 mb-4">Elegí el estilo para todos los slides del carrusel</p>
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setSelectedTheme(theme.id);
                  setColorAcento(theme.accent); // reset acento al default del nuevo tema
                }}
                className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                  selectedTheme === theme.id
                    ? "border-[#00c9c9] bg-[#00c9c9]/5"
                    : "border-[#e2e8f0] hover:border-[#00c9c9]/40"
                }`}
              >
                {/* Preview del tema */}
                <div
                  style={{
                    width: "100%",
                    height: 72,
                    background: theme.bg,
                    borderRadius: 8,
                    overflow: "hidden",
                    padding: "8px 10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    border: theme.previewBorder ?? "none",
                  }}
                >
                  <div style={{ color: theme.accent, fontSize: 11, fontWeight: 900 }}>USD 250.000</div>
                  <div style={{ color: theme.text, fontSize: 9, opacity: 0.75 }}>Palermo · 3 dorm · 85 m²</div>
                  <div style={{ display: "flex", marginTop: "auto" }}>
                    <div style={{ backgroundColor: theme.accent, borderRadius: 4, padding: "2px 7px" }}>
                      <span style={{ color: "#000", fontSize: 8, fontWeight: 700 }}>Consultar</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">{theme.label}</span>
              </button>
            ))}
          </div>
          {/* Color de acento — sobreescribe el default del tema */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e2e8f0]">
            <div>
              <span className="text-xs font-medium text-slate-600">Color de acento</span>
              <p className="text-[10px] text-slate-400">Precio, bordes, botones</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-slate-200 flex-shrink-0" style={{ backgroundColor: colorAcento }} />
              <input type="color" value={colorAcento} onChange={(e) => setColorAcento(e.target.value)} className="w-0 h-0 opacity-0 absolute" id="carousel-acento" />
              <label htmlFor="carousel-acento" className="text-xs font-mono text-slate-400 cursor-pointer">{colorAcento.toUpperCase()}</label>
              <label htmlFor="carousel-acento" className="text-xs text-[#00c9c9] font-medium cursor-pointer hover:underline">Cambiar</label>
              <button
                type="button"
                onClick={() => { const preset = THEME_PRESETS.find(t => t.id === selectedTheme); if (preset) setColorAcento(preset.accent); }}
                className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Resetear
              </button>
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
        <VarianteEspanolSelector
          value={varianteEspanol}
          onChange={setVarianteEspanol}
          disabled={generating}
        />
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

        {slideUrls.length === 0 && !generating ? (
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
              <ImageIcon className="w-7 h-7 text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">El carrusel aparecerá aquí</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Completá el formulario y hacé clic en{" "}
                <span className="font-semibold text-[#f59e0b]">Generar carrusel</span>
              </p>
            </div>
          </div>
        ) : (
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
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
