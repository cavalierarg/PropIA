"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generarPosts, PostResult, RecomendacionesResult } from "@/lib/actions/posts.actions";
import { getUsage } from "@/lib/actions/usage.actions";
import { saveProperty } from "@/lib/actions/properties.actions";
import { getUserProfile, saveUserProfile } from "@/lib/actions/user-profile.actions";
import PostsView from "@/components/PostsView";
import PostsSkeleton from "@/components/PostsSkeleton";
import { ZapIcon, LogInIcon, SparklesIcon, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const MONTHLY_LIMIT = 10;

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

export default function PropertyForm() {
  const { user } = useUser();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    tipoPropiedad: searchParams.get("tipoPropiedad") ?? "",
    ubicacion: searchParams.get("ubicacion") ?? "",
    metrosCuadrados: searchParams.get("metrosCuadrados") ?? "",
    precio: searchParams.get("precio") ?? "",
    caracteristica1: searchParams.get("caracteristica1") ?? "",
    caracteristica2: searchParams.get("caracteristica2") ?? "",
    caracteristica3: searchParams.get("caracteristica3") ?? "",
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

  const [posts, setPosts] = useState<PostResult[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [unauthenticated, setUnauthenticated] = useState(false);

  const isRegenerando = searchParams.get("regenerar") === "1";

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  useEffect(() => {
    getUsage().then((usage) => {
      setIsPro(usage.isPro);
      setRemaining(usage.isPro ? null : usage.remaining);
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
    setPosts([]);
    setRecomendaciones(null);
    setUnauthenticated(false);

    if (!form.tipoPropiedad || !form.ubicacion || !form.metrosCuadrados || !form.precio) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      if (form.agenteWhatsapp || form.agenteInstagram || form.agenteSitioWeb) {
        saveUserProfile({
          whatsapp: form.agenteWhatsapp || undefined,
          instagram: form.agenteInstagram || undefined,
          sitio_web: form.agenteSitioWeb || undefined,
        }).catch(() => {});
      }

      const { posts: newPosts, recomendaciones: newRecs, remaining: newRemaining, isPro: newIsPro } =
        await generarPosts({ ...form, amenities });

      setPosts(newPosts);
      setRecomendaciones(newRecs);
      setIsPro(newIsPro);
      setRemaining(newIsPro ? null : newRemaining);

      saveProperty({
        tipo_propiedad: form.tipoPropiedad,
        ubicacion: form.ubicacion,
        metros_cuadrados: form.metrosCuadrados,
        precio: form.precio,
        caracteristica1: form.caracteristica1,
        caracteristica2: form.caracteristica2,
        caracteristica3: form.caracteristica3,
        posts: newPosts,
        recomendaciones: newRecs,
      }).catch(() => {});
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "LIMIT_REACHED") {
        setRemaining(0);
      } else if (err instanceof Error && err.message === "UNAUTHENTICATED") {
        setUnauthenticated(true);
      } else {
        setError(
          "Ocurrió un error al generar los posts. Verifica tu clave de API e intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = !isPro && remaining === 0;
  const isWarning = !isPro && remaining !== null && remaining > 0 && remaining <= 3;
  const used = remaining !== null ? MONTHLY_LIMIT - remaining : 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">

      {/* Banner: regenerando desde historial */}
      {isRegenerando && (
        <div className="border border-[#00d4d4]/30 bg-[#00d4d4]/5 rounded-xl p-3 sm:p-4 flex items-center gap-3">
          <SparklesIcon className="w-4 h-4 text-[#00d4d4] shrink-0" />
          <p className="text-sm text-[#0f3460]">
            Formulario pre-cargado desde tu historial. Modificá lo que quieras y generá nuevos posts.
          </p>
        </div>
      )}

      {/* Indicador de uso */}
      {(remaining !== null || isPro) && (
        <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card">
          {isPro ? (
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-[#00d4d4] shrink-0" />
              <span className="font-semibold text-sm text-[#0f3460]">
                Plan PRO activo — generaciones ilimitadas
              </span>
              <span className="ml-auto text-xs bg-[#00d4d4]/10 text-[#0f3460] border border-[#00d4d4]/30 rounded-full px-2 py-0.5 font-semibold">
                PRO
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <ZapIcon
                    className={`w-4 h-4 shrink-0 ${
                      isLimitReached ? "text-red-500" : isWarning ? "text-amber-500" : "text-[#00d4d4]"
                    }`}
                  />
                  <span
                    className={`font-medium text-sm leading-tight ${
                      isLimitReached ? "text-red-600" : isWarning ? "text-amber-600" : "text-[#0f3460]"
                    }`}
                  >
                    {isLimitReached
                      ? "Sin generaciones disponibles este mes"
                      : `${remaining} generación${remaining !== 1 ? "es" : ""} disponible${remaining !== 1 ? "s" : ""} este mes`}
                  </span>
                </div>
                <span className="text-muted-foreground tabular-nums shrink-0 text-xs sm:text-sm">
                  {used}/{MONTHLY_LIMIT}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isLimitReached ? "bg-red-400" : isWarning ? "bg-amber-400" : "bg-[#00d4d4]"
                  }`}
                  style={{ width: `${(used / MONTHLY_LIMIT) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Mensaje de límite alcanzado */}
      {isLimitReached && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <p className="font-semibold text-amber-900 text-sm sm:text-base">
            Agotaste tus generaciones gratuitas del mes
          </p>
          <p className="text-sm text-amber-800">
            Tus {MONTHLY_LIMIT} generaciones mensuales ya fueron utilizadas. Se renuevan
            automáticamente el 1° del próximo mes.
          </p>
          <p className="text-sm text-amber-700">
            Con el Plan PRO obtenés generaciones ilimitadas para publicar sin pausa.
          </p>
          <Button
            asChild
            className="w-full sm:w-auto sm:self-start h-11 sm:h-10 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white"
          >
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Upgrade a PRO — generaciones ilimitadas
            </a>
          </Button>
        </div>
      )}

      {/* Banner: sesión requerida */}
      {unauthenticated && (
        <div className="border border-[#0f3460]/20 bg-[#0f3460]/5 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <p className="font-semibold text-[#0f3460] text-sm sm:text-base">
            Necesitás iniciar sesión para generar posts
          </p>
          <p className="text-sm text-muted-foreground">
            Creá tu cuenta gratis y accedé a 10 generaciones mensuales.
          </p>
          <Button asChild className="w-full sm:w-auto sm:self-start h-11 sm:h-10">
            <Link href="/sign-in" className="flex items-center gap-2">
              <LogInIcon className="w-4 h-4" />
              Iniciar sesión
            </Link>
          </Button>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">

        {/* ── Campos principales ── */}
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
              {TIPOS_PROPIEDAD.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
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
              placeholder="Ej: Polanco, Ciudad de México"
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
                  Piso{" "}
                  <span className="text-slate-400 font-normal">(opcional)</span>
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
                  Expensas{" "}
                  <span className="text-slate-400 font-normal">(opcional)</span>
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
                Tu información de contacto se guarda automáticamente al generar posts y se usa en las CTAs.
              </p>
            </div>
          )}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={loading || isLimitReached}
          className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
        >
          <ZapIcon className="w-4 h-4" />
          {loading ? "Generando con IA..." : "Generar 5 posts"}
        </Button>
      </form>

      {/* Skeleton de carga */}
      {loading && <PostsSkeleton />}

      {/* Resultados */}
      {posts.length > 0 && !loading && (
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
                Tus posts listos para publicar
              </h2>
              <Link
                href="/mis-propiedades"
                className="text-sm text-[#00d4d4] hover:text-[#00bfbf] font-medium transition-colors shrink-0"
              >
                Ver historial →
              </Link>
            </div>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>
          <PostsView posts={posts} recomendaciones={recomendaciones} />
        </div>
      )}
    </div>
  );
}
