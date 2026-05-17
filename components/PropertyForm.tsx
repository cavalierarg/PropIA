"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generarPosts, PostResult, RecomendacionesResult } from "@/lib/actions/posts.actions";
import { getUsage } from "@/lib/actions/usage.actions";
import { CheckIcon, CopyIcon, LoaderIcon, ZapIcon } from "lucide-react";

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

  // Construye mapa de índice → badges para renderizar en cada card
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
    <div className="flex flex-col gap-8">

      {/* Indicador de uso */}
      {remaining !== null && (
        <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <ZapIcon
                className={`w-4 h-4 ${
                  isLimitReached ? "text-red-500" : isWarning ? "text-amber-500" : "text-[#00d4d4]"
                }`}
              />
              <span
                className={`font-medium ${
                  isLimitReached
                    ? "text-red-600"
                    : isWarning
                    ? "text-amber-600"
                    : "text-[#0f3460]"
                }`}
              >
                {isLimitReached
                  ? "Sin generaciones disponibles este mes"
                  : `${remaining} generación${remaining !== 1 ? "es" : ""} disponible${
                      remaining !== 1 ? "s" : ""
                    } este mes`}
              </span>
            </div>
            <span className="text-muted-foreground tabular-nums">
              {used}/{MONTHLY_LIMIT} usadas
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-5 flex flex-col gap-2">
          <p className="font-semibold text-amber-900">
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

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tipoPropiedad">Tipo de propiedad *</Label>
            <select
              id="tipoPropiedad"
              name="tipoPropiedad"
              value={form.tipoPropiedad}
              onChange={handleChange}
              className="border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
            <Label htmlFor="ubicacion">Ubicación *</Label>
            <Input
              id="ubicacion"
              name="ubicacion"
              placeholder="Ej: Polanco, Ciudad de México"
              value={form.ubicacion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="metrosCuadrados">Metros cuadrados *</Label>
            <Input
              id="metrosCuadrados"
              name="metrosCuadrados"
              type="number"
              placeholder="Ej: 85"
              value={form.metrosCuadrados}
              onChange={handleChange}
              required
              min={1}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="precio">Precio *</Label>
            <Input
              id="precio"
              name="precio"
              placeholder="Ej: USD 120.000"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label>3 Características destacadas</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="caracteristica1"
              placeholder="Ej: Luminoso"
              value={form.caracteristica1}
              onChange={handleChange}
            />
            <Input
              name="caracteristica2"
              placeholder="Ej: Terraza propia"
              value={form.caracteristica2}
              onChange={handleChange}
            />
            <Input
              name="caracteristica3"
              placeholder="Ej: A 2 cuadras del subte"
              value={form.caracteristica3}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={loading || isLimitReached}
          className="w-full md:w-auto md:self-start px-10"
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
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-[#0f3460]">Tus posts listos para publicar</h2>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>
          <div className="grid grid-cols-1 gap-5">
            {posts.map((post, index) => (
              <div
                key={index}
                className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Header de red social */}
                <div className={`px-4 py-2 text-sm font-semibold ${COLORES_RED[post.red]}`}>
                  {post.red}
                </div>

                {/* Contenido del post */}
                <div className="p-4 flex flex-col gap-3 bg-card">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">
                    {post.contenido}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-end"
                    onClick={() => handleCopy(post.contenido, index)}
                  >
                    {copiedIndex === index ? (
                      <span className="flex items-center gap-1">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                        Copiado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
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
                        className={`rounded-lg border px-3 py-2 flex flex-col gap-0.5 ${badge.className}`}
                      >
                        <span className="text-xs font-semibold">
                          {badge.emoji} {badge.label}
                        </span>
                        <span className="text-xs opacity-75">{badge.razon}</span>
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
