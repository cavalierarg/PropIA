"use client";

import { useState, useEffect } from "react";
import { XIcon, UploadCloudIcon, Loader2Icon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  savePropertyManual,
  updateProperty,
  type SavedProperty,
  type PropertyManualData,
  type PropertyEstado,
} from "@/lib/actions/properties.actions";
import { uploadPropertyImage } from "@/lib/actions/flyers.actions";
import { toast } from "sonner";

const TIPOS = ["Casa", "Departamento", "PH", "Terreno", "Oficina", "Local comercial", "Cochera"];
const MONEDAS = ["USD", "ARS", "EUR"];
const ESTADOS: PropertyEstado[] = ["disponible", "reservada", "vendida", "alquilada"];
const ESTADO_LABELS: Record<PropertyEstado, string> = {
  disponible: "Disponible",
  reservada: "Reservada",
  vendida: "Vendida",
  alquilada: "Alquilada",
};
const AMENITIES_LIST = [
  "Cochera", "Terraza", "Quincho", "Pileta", "Seguridad 24hs",
  "Balcón", "Luminosa", "Jardín", "Gimnasio", "Apto mascotas",
];

export interface PropertySaveModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (property: SavedProperty) => void;
  prefill?: Partial<PropertyManualData>;
  editProperty?: SavedProperty;
}

const EMPTY_FORM: PropertyManualData = {
  tipo_propiedad: "",
  titulo: "",
  ubicacion: "",
  barrio: "",
  ciudad: "",
  precio: "",
  moneda: "USD",
  metros_cuadrados: "",
  ambientes: "",
  caracteristica1: "",
  caracteristica2: "",
  caracteristica3: "",
  amenities: [],
  descripcion_libre: "",
  estado: "disponible",
  foto_urls: [],
};

export default function PropertySaveModal({
  open,
  onClose,
  onSaved,
  prefill,
  editProperty,
}: PropertySaveModalProps) {
  const [form, setForm] = useState<PropertyManualData>(EMPTY_FORM);
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editProperty) {
      setForm({
        tipo_propiedad: editProperty.tipo_propiedad ?? "",
        titulo: editProperty.titulo ?? "",
        ubicacion: editProperty.ubicacion ?? "",
        barrio: editProperty.barrio ?? "",
        ciudad: editProperty.ciudad ?? "",
        precio: editProperty.precio ?? "",
        moneda: editProperty.moneda || "USD",
        metros_cuadrados: editProperty.metros_cuadrados ?? "",
        ambientes: editProperty.ambientes ?? "",
        caracteristica1: editProperty.caracteristica1 ?? "",
        caracteristica2: editProperty.caracteristica2 ?? "",
        caracteristica3: editProperty.caracteristica3 ?? "",
        amenities: editProperty.amenities ?? [],
        descripcion_libre: editProperty.descripcion_libre ?? "",
        estado: editProperty.estado ?? "disponible",
        foto_urls: editProperty.foto_urls ?? [],
      });
      setFotoPreviews(editProperty.foto_urls ?? []);
    } else {
      setForm({ ...EMPTY_FORM, ...prefill });
      setFotoPreviews([]);
    }
  }, [open, editProperty, prefill]);

  if (!open) return null;

  const set = <K extends keyof PropertyManualData>(key: K, value: PropertyManualData[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleAmenity = (item: string, checked: boolean) => {
    setForm((p) => ({
      ...p,
      amenities: checked
        ? [...(p.amenities ?? []), item]
        : (p.amenities ?? []).filter((a) => a !== item),
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 3 - (form.foto_urls?.length ?? 0);
    if (remaining <= 0) { toast.error("Máximo 3 fotos"); return; }
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("image", file);
        const url = await uploadPropertyImage(fd);
        urls.push(url);
      }
      const newUrls = [...(form.foto_urls ?? []), ...urls];
      set("foto_urls", newUrls);
      setFotoPreviews(newUrls);
      toast.success(`${urls.length} foto${urls.length > 1 ? "s" : ""} subida${urls.length > 1 ? "s" : ""}`);
    } catch {
      toast.error("No se pudo subir la foto");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (idx: number) => {
    const newUrls = (form.foto_urls ?? []).filter((_, i) => i !== idx);
    set("foto_urls", newUrls);
    setFotoPreviews(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tipo_propiedad || !form.ubicacion || !form.precio || !form.metros_cuadrados) {
      toast.error("Completá tipo, ubicación, precio y m²");
      return;
    }
    setSaving(true);
    try {
      if (editProperty) {
        const result = await updateProperty(editProperty.id, form);
        if (!result.ok) { toast.error("No se pudo guardar"); return; }
        toast.success("Propiedad actualizada");
        onSaved({ ...editProperty, ...form } as SavedProperty);
      } else {
        const result = await savePropertyManual(form);
        if (!result.ok) { toast.error("No se pudo guardar"); return; }
        toast.success("Propiedad guardada en tu biblioteca");
        onSaved({ id: result.id!, user_id: "", created_at: new Date().toISOString(), posts: [], recomendaciones: null, ...form } as SavedProperty);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-[#0f3460]">
            {editProperty ? "Editar propiedad" : "Guardar propiedad"}
          </h2>
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
          {/* Fotos */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Fotos <span className="text-slate-400 font-normal">(hasta 3)</span></Label>
            <div className="flex gap-3 flex-wrap">
              {fotoPreviews.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {fotoPreviews.length < 3 && (
                <label className={`w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#00c9c9]/60 hover:bg-slate-50 transition-colors shrink-0 ${uploading ? "opacity-50 cursor-wait" : ""}`}>
                  {uploading ? <Loader2Icon className="w-5 h-5 text-slate-400 animate-spin" /> : <UploadCloudIcon className="w-5 h-5 text-slate-300" />}
                  <span className="text-[10px] text-slate-400">Subir foto</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          {/* Tipo + Título */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Tipo de propiedad *</Label>
              <select
                value={form.tipo_propiedad}
                onChange={(e) => set("tipo_propiedad", e.target.value)}
                className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                required
              >
                <option value="">Seleccioná un tipo</option>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Título descriptivo</Label>
              <Input
                placeholder='Ej: "Casa Palermo 3 dorm"'
                value={form.titulo ?? ""}
                onChange={(e) => set("titulo", e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-1">
              <Label className="text-sm font-medium">Dirección / Zona *</Label>
              <Input
                placeholder="Ej: Palermo, CABA"
                value={form.ubicacion}
                onChange={(e) => set("ubicacion", e.target.value)}
                required
                className="h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Barrio</Label>
              <Input placeholder="Ej: Palermo Soho" value={form.barrio ?? ""} onChange={(e) => set("barrio", e.target.value)} className="h-10 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Ciudad</Label>
              <Input placeholder="Ej: Buenos Aires" value={form.ciudad ?? ""} onChange={(e) => set("ciudad", e.target.value)} className="h-10 text-sm" />
            </div>
          </div>

          {/* Precio + m² + ambientes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Moneda</Label>
              <select value={form.moneda ?? "USD"} onChange={(e) => set("moneda", e.target.value)} className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Precio *</Label>
              <Input placeholder="Ej: 120.000" value={form.precio} onChange={(e) => set("precio", e.target.value)} required className="h-10 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Superficie m² *</Label>
              <Input type="number" min={1} placeholder="85" value={form.metros_cuadrados} onChange={(e) => set("metros_cuadrados", e.target.value)} required className="h-10 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Ambientes</Label>
              <select value={form.ambientes ?? ""} onChange={(e) => set("ambientes", e.target.value)} className="w-full border border-input bg-background rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                <option value="">—</option>
                {["1", "2", "3", "4", "5", "6+"].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Características */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Características destacadas</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder="Ej: Luminoso" value={form.caracteristica1 ?? ""} onChange={(e) => set("caracteristica1", e.target.value)} className="h-10 text-sm" />
              <Input placeholder="Ej: Terraza propia" value={form.caracteristica2 ?? ""} onChange={(e) => set("caracteristica2", e.target.value)} className="h-10 text-sm" />
              <Input placeholder="Ej: 2 cuadras del subte" value={form.caracteristica3 ?? ""} onChange={(e) => set("caracteristica3", e.target.value)} className="h-10 text-sm" />
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Amenities</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITIES_LIST.map((item) => {
                const checked = (form.amenities ?? []).includes(item);
                return (
                  <label key={item} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleAmenity(item, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0f3460] cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-[#0f3460] transition-colors">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Descripción libre */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Descripción adicional</Label>
            <textarea
              rows={3}
              placeholder="Detalles adicionales, observaciones, puntos de venta únicos..."
              value={form.descripcion_libre ?? ""}
              onChange={(e) => set("descripcion_libre", e.target.value)}
              className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Estado</Label>
            <div className="flex gap-2 flex-wrap">
              {ESTADOS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => set("estado", e)}
                  className={`h-8 px-3 rounded-full text-xs font-semibold border transition-all ${
                    form.estado === e
                      ? "bg-[#0f3460] text-white border-[#0f3460]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#0f3460]/40"
                  }`}
                >
                  {ESTADO_LABELS[e]}
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => !saving && onClose()} disabled={saving} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || uploading} className="flex-1 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white">
              {saving ? (
                <span className="flex items-center gap-2"><Loader2Icon className="w-4 h-4 animate-spin" /> Guardando...</span>
              ) : (
                <span className="flex items-center gap-2"><CheckIcon className="w-4 h-4" /> {editProperty ? "Guardar cambios" : "Guardar propiedad"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
