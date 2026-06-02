"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveAgentProfile,
  type AgentProfile,
} from "@/lib/actions/agent-profile.actions";
import { uploadAgentLogo } from "@/lib/actions/agent-logo.actions";
import { toast } from "sonner";
import {
  BuildingIcon,
  CheckIcon,
  PhoneIcon,
  SparklesIcon,
  UploadCloudIcon,
  UserIcon,
  XIcon,
} from "lucide-react";

const TIPOS_PROPIEDAD = [
  "Casas",
  "Departamentos",
  "Terrenos",
  "Comercial",
  "Oficinas",
];

const TONOS = [
  {
    value: "profesional",
    label: "Profesional y formal",
    desc: "Lenguaje técnico, estructurado y de confianza",
    example: "\"Propiedad en zona premium. 85 m², 3 dormitorios y cochera. Consulte disponibilidad.\"",
  },
  {
    value: "amigable",
    label: "Cercano y amigable",
    desc: "Tono cálido, directo y humano",
    example: "\"¿Buscás tu próximo hogar? Este depto en Palermo tiene todo lo que necesitás.\"",
  },
  {
    value: "dinamico",
    label: "Moderno y dinámico",
    desc: "Energético, con llamadas a la acción y emojis",
    example: "\"🔥 ¡Esta es la oportunidad! Casa amplia, barrio top. ¡Escribime ya antes de que se vaya!\"",
  },
];

type FormState = {
  nombre_completo: string;
  nombre_agencia: string;
  whatsapp: string;
  email: string;
  instagram: string;
  sitio_web: string;
  zona: string;
  tipos_propiedad: string[];
  tono_voz: string;
  logo_url: string;
  color_marca: string;
};

export default function PerfilForm({
  initialData,
}: {
  initialData: Partial<AgentProfile>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "true";

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    nombre_completo: initialData.nombre_completo ?? "",
    nombre_agencia: initialData.nombre_agencia ?? "",
    whatsapp: initialData.whatsapp ?? "",
    email: initialData.email ?? "",
    instagram: initialData.instagram ?? "",
    sitio_web: initialData.sitio_web ?? "",
    zona: initialData.zona ?? "",
    tipos_propiedad: initialData.tipos_propiedad ?? [],
    tono_voz: initialData.tono_voz ?? "profesional",
    logo_url: initialData.logo_url ?? "",
    color_marca: initialData.color_marca ?? "#0f3460",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData.logo_url ?? null
  );
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTipo = (tipo: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      tipos_propiedad: checked
        ? [...prev.tipos_propiedad, tipo]
        : prev.tipos_propiedad.filter((t) => t !== tipo),
    }));
  };

  const handleRemoveLogo = async () => {
    setLogoPreview(null);
    setForm((p) => ({ ...p, logo_url: "" }));
    await saveAgentProfile({ logo_url: "" }).catch(() => {});
  };

  const handleLogoFile = async (file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      toast.error("Solo se aceptan archivos PNG o JPG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("El logo no puede superar los 2 MB");
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const { url, bgRemoved } = await uploadAgentLogo(fd);
      setForm((prev) => ({ ...prev, logo_url: url }));
      if (bgRemoved) {
        toast.success("Logo subido con fondo transparente");
      } else {
        toast.success("Logo subido · El fondo no se pudo remover automáticamente");
      }
    } catch {
      toast.error("No se pudo subir el logo. Intentá de nuevo.");
      setLogoPreview(null);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre_completo.trim()) {
      toast.error("El nombre completo es requerido");
      return;
    }
    if (!form.whatsapp.trim()) {
      toast.error("El WhatsApp es requerido para continuar");
      return;
    }
    setSaving(true);
    try {
      const result = await saveAgentProfile(form);
      if (!result.ok) {
        const firstError = Object.values(result.errors).flat()[0];
        toast.error(firstError ?? "Error al guardar el perfil. Intentá de nuevo.");
        return;
      }
      toast.success("Perfil guardado correctamente");
      router.refresh();
      router.push("/");
    } catch {
      toast.error("No se pudo guardar el perfil. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {isSetup && (
        <div className="flex items-start gap-3 bg-[#00c9c9]/8 border border-[#00c9c9]/25 rounded-xl px-4 py-3.5">
          <SparklesIcon className="w-4 h-4 text-[#00c9c9] shrink-0 mt-0.5" />
          <p className="text-sm text-[#0f3460] leading-relaxed">
            <strong>¡Bienvenido a PropIA!</strong> Completá tu perfil de marca
            una sola vez — tus datos se cargarán automáticamente en todos los
            generadores.
          </p>
        </div>
      )}

      {/* ── Logo ──────────────────────────────────── */}
      <Card title="Logo de la agencia" icon={<BuildingIcon className="w-4 h-4 text-[#0f3460]" />}>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {logoPreview ? (
            <div className="relative shrink-0 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-24 max-w-[200px] object-contain rounded-xl border border-slate-200 bg-slate-50 p-2"
              />
              {logoUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
                  <div className="w-5 h-5 border-2 border-[#0f3460]/20 border-t-[#00c9c9] rounded-full animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          <div
            className="flex-1 border-2 border-dashed border-[#0f3460]/20 rounded-xl cursor-pointer hover:border-[#00c9c9]/50 hover:bg-[#00c9c9]/5 transition-colors"
            onClick={() => logoInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleLogoFile(f);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 text-center">
              <div className="w-9 h-9 rounded-xl bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center">
                <UploadCloudIcon className="w-4 h-4 text-[#0f3460]/40" />
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                {logoPreview
                  ? "Arrastrá o hacé click para cambiar el logo"
                  : "Arrastrá o hacé click para subir el logo"}
              </p>
              <p className="text-[11px] text-muted-foreground/60">
                PNG o JPG · Máx 2 MB · Aparece en todos los ads generados
              </p>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleLogoFile(f);
              e.target.value = "";
            }}
          />
        </div>
      </Card>

      {/* ── Datos personales ──────────────────────── */}
      <Card title="Datos del agente" icon={<UserIcon className="w-4 h-4 text-[#0f3460]" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre completo *">
            <Input
              name="nombre_completo"
              value={form.nombre_completo}
              onChange={handleChange}
              placeholder="Ej: María García"
              className="h-11"
              required
            />
          </Field>
          <Field label="Nombre de la agencia">
            <Input
              name="nombre_agencia"
              value={form.nombre_agencia}
              onChange={handleChange}
              placeholder="Ej: García Propiedades"
              className="h-11"
            />
          </Field>
          <Field label="Email">
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="h-11"
            />
          </Field>
          <Field label="Zona donde trabajás">
            <Input
              name="zona"
              value={form.zona}
              onChange={handleChange}
              placeholder="Ej: Palermo, CABA · Gran Buenos Aires"
              className="h-11"
            />
          </Field>
        </div>
      </Card>

      {/* ── Contacto ──────────────────────────────── */}
      <Card title="Contacto" icon={<PhoneIcon className="w-4 h-4 text-[#0f3460]" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="WhatsApp *"
            hint="Con código de país · Ej: +54 9 11 1234-5678"
          >
            <Input
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="+54 9 11 1234-5678"
              className="h-11"
              required
            />
          </Field>
          <Field label="Instagram" hint="Sin @ · aparece en los ads">
            <Input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="tuagencia"
              className="h-11"
            />
          </Field>
          <Field label="Sitio web" className="sm:col-span-2">
            <Input
              name="sitio_web"
              value={form.sitio_web}
              onChange={handleChange}
              placeholder="https://tuagencia.com"
              className="h-11"
            />
          </Field>
        </div>
      </Card>

      {/* ── Tipos de propiedad ────────────────────── */}
      <Card
        title="Tipos de propiedad que manejás"
        icon={<BuildingIcon className="w-4 h-4 text-[#0f3460]" />}
      >
        <div className="flex flex-wrap gap-2.5">
          {TIPOS_PROPIEDAD.map((tipo) => {
            const active = form.tipos_propiedad.includes(tipo);
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => handleTipo(tipo, !active)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all cursor-pointer ${
                  active
                    ? "border-[#0f3460] bg-[#0f3460] text-white"
                    : "border-[#0f3460]/15 text-slate-600 hover:border-[#0f3460]/40 hover:text-[#0f3460]"
                }`}
              >
                {active && <CheckIcon className="w-3.5 h-3.5" />}
                {tipo}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Esta información ayuda a la IA a generar contenido más específico para
          tu mercado.
        </p>
      </Card>

      {/* ── Tono de voz ───────────────────────────── */}
      <Card
        title="Tono de voz preferido"
        icon={<SparklesIcon className="w-4 h-4 text-[#0f3460]" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TONOS.map((tono) => {
            const active = form.tono_voz === tono.value;
            return (
              <button
                key={tono.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, tono_voz: tono.value }))}
                className={`flex flex-col gap-1.5 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                  active
                    ? "border-[#0f3460] bg-[#0f3460]/5 shadow-sm"
                    : "border-[#0f3460]/12 hover:border-[#0f3460]/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-bold leading-tight ${
                      active ? "text-[#0f3460]" : "text-foreground"
                    }`}
                  >
                    {tono.label}
                  </p>
                  {active && (
                    <div className="w-4 h-4 rounded-full bg-[#0f3460] flex items-center justify-center shrink-0">
                      <CheckIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {tono.desc}
                </p>
                <p className="text-[10px] text-slate-400 italic leading-snug border-t border-slate-100 pt-1.5 mt-0.5">
                  {tono.example}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── Submit ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="h-12 px-8 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white font-bold text-sm"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              Guardar perfil
            </>
          )}
        </Button>
        {!isSetup && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="h-12 text-slate-500"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

/* ── Helper sub-components ── */
function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#0f3460]/10 rounded-2xl p-5 sm:p-6 bg-card flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#0f3460]/8 border border-[#0f3460]/15 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="text-sm font-semibold text-[#0f3460]">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
