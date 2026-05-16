"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generarPosts, PostResult } from "@/lib/actions/posts.actions";
import { CheckIcon, CopyIcon, LoaderIcon } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPosts([]);

    if (!form.tipoPropiedad || !form.ubicacion || !form.metrosCuadrados || !form.precio) {
      setError("Por favor completá todos los campos obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const result = await generarPosts(form);
      setPosts(result);
    } catch {
      setError("Ocurrió un error al generar los posts. Verificá tu clave de API e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de propiedad */}
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

          {/* Ubicación */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ubicacion">Ubicación *</Label>
            <Input
              id="ubicacion"
              name="ubicacion"
              placeholder="Ej: Palermo, Buenos Aires"
              value={form.ubicacion}
              onChange={handleChange}
              required
            />
          </div>

          {/* Metros cuadrados */}
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

          {/* Precio */}
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

        {/* Características */}
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

        <Button type="submit" disabled={loading} className="w-full md:w-auto md:self-start px-10">
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
          <h2 className="text-2xl font-bold">Tus posts listos para publicar</h2>
          <div className="grid grid-cols-1 gap-5">
            {posts.map((post, index) => (
              <div
                key={index}
                className="border rounded-xl overflow-hidden shadow-sm"
              >
                <div className={`px-4 py-2 text-sm font-semibold ${COLORES_RED[post.red]}`}>
                  {post.red}
                </div>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
