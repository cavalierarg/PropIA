"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generarPosts, PostResult, RecomendacionesResult } from "@/lib/actions/posts.actions";
import { getUsage } from "@/lib/actions/usage.actions";
import { CheckIcon, CopyIcon, LoaderIcon, ZapIcon, LogInIcon } from "lucide-react";
import Link from "next/link";

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

const COLORES_RED: Record<string, string> = {
  Instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  Facebook: "bg-blue-600 text-white",
  LinkedIn: "bg-sky-700 text-white",
};

const BADGE_CONFIG = {
  mayor_engagement: {
    emoji: "⭐",
    label: "Recomendado para más engagement",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  mayor_consultas: {
    emoji: "🎯",
    label: "Recomendado para más consultas",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  inversores: {
    emoji: "💼",
    label: "Recomendado para inversores",
    className: "bg-[#0f3460]/5 text-[#0f3460] border-[#0f3460]/20",
  },
} as const;

export default function PropertyForm() {
  const [form, setForm] = useState({
    tipoPropiedad: "",
    ubicacion: "",
    metrosCuadrados: "",
    precio: "",
    caracteristica1: "",
    caracteristica2: "",
    caracteristica3: "",
  });
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [unauthenticated, setUnauthenticated] = useState(false);

  useEffect(() => {
    getUsage().then(({ remaining }) => setRemaining(remaining));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      const { posts: newPosts, recomendaciones: newRecs, remaining: newRemaining } =
        await generarPosts(form);
      setPosts(newPosts);
      setRecomendaciones(newRecs);
      setRemaining(newRemaining);
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

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isLimitReached = remaining === 0;
  const isWarning = remaining !== null && remaining > 0 && remaining <= 3;
  const used = remaining !== null ? MONTHLY_LIMIT - remaining : 0;

  type BadgeItem = { emoji: string; label: string; razon: string; className: string };
  const recsBadges: Record<number, BadgeItem[]> = {};
  if (recomendaciones) {
    for (const key of ["mayor_engagement", "mayor_consultas", "inversores"] as const) {
      const rec = recomendaciones[key];
      if (rec && rec.indice >= 0 && rec.indice < posts.length) {
        if (!recsBadges[rec.indice]) recsBadges[rec.indice] = [];
        recsBadges[rec.indice].push({ ...BADGE_CONFIG[key], razon: rec.razon });
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">

      {/* Indicador de uso */}
      {remaining !== null && (
        <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card">
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
                  : `${remaining} generación${remaining !== 1 ? "es" : ""} disponible${
                      remaining !== 1 ? "s" : ""
                    } este mes`}
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
        </div>
      )}

      {/* Mensaje de límite alcanzado */}
      {isLimitReached && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 sm:p-5 flex flex-col gap-2">
          <p className="font-semibold text-amber-900 text-sm sm:text-base">
            Agotaste tus generaciones gratuitas del mes
          </p>
          <p className="text-sm text-amber-800">
            Tus {MONTHLY_LIMIT} generaciones mensuales ya fueron utilizadas. Se renuevan
            automáticamente el 1° del próximo mes.
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Pronto habrá planes de suscripción disponibles con generaciones ilimitadas. ¡Gracias
            por usar PropIA!
          </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

          {/* Tipo de propiedad */}
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

          {/* Ubicación */}
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

          {/* Metros cuadrados */}
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

          {/* Precio */}
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

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={loading || isLimitReached}
          className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoaderIcon className="w-4 h-4 animate-spin" />
              Generando posts...
            </span>
          ) : (
            "Generar posts"
          )}
        </Button>
      </form>

      {/* Resultados */}
      {posts.length > 0 && (
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
              Tus posts listos para publicar
            </h2>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            {posts.map((post, index) => (
              <div
                key={index}
                className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Header de red social */}
                <div className={`px-4 py-2.5 text-sm font-semibold ${COLORES_RED[post.red]}`}>
                  {post.red}
                </div>

                {/* Contenido del post */}
                <div className="p-4 flex flex-col gap-4 bg-card">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground break-words">
                    {post.contenido}
                  </p>
                  {/* Botón copiar — mínimo 44px de alto para táctil cómodo */}
                  <Button
                    type="button"
                    variant="outline"
                    className="self-end h-11 px-5 text-sm"
                    onClick={() => handleCopy(post.contenido, index)}
                  >
                    {copiedIndex === index ? (
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

                {/* Badges de recomendación */}
                {recsBadges[index] && (
                  <div className="border-t border-[#0f3460]/10 px-4 py-3 bg-card flex flex-col gap-2">
                    {recsBadges[index].map((badge, i) => (
                      <div
                        key={i}
                        className={`rounded-lg border px-3 py-2.5 flex flex-col gap-1 ${badge.className}`}
                      >
                        <span className="text-xs font-semibold leading-tight">
                          {badge.emoji} {badge.label}
                        </span>
                        <span className="text-xs opacity-75 leading-snug">{badge.razon}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
