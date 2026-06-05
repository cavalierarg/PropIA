"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

export type PhotoAnalysisResult = {
  tipo_propiedad: string | null;
  caracteristicas: string[];
  amenities: string[];
  descripcion_libre: string;
};

const TIPO_MAP: Record<string, string> = {
  casa: "Casa",
  departamento: "Departamento",
  ph: "PH",
  terreno: "Terreno",
  oficina: "Oficina",
  local_comercial: "Local comercial",
  cochera: "Cochera",
};

const VALID_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ValidMediaType = (typeof VALID_MEDIA_TYPES)[number];

export async function analizarFotoPropiedad(imageUrl: string): Promise<PhotoAnalysisResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  if (!process.env.ANTHROPIC_API_KEY) throw new Error("API_KEY_FALTANTE");

  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("FETCH_ERROR");

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const rawType = response.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  const mediaType: ValidMediaType = VALID_MEDIA_TYPES.includes(rawType as ValidMediaType)
    ? (rawType as ValidMediaType)
    : "image/jpeg";

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: `Sos un experto en bienes raíces. Analizá esta foto y devolvé un JSON con las características visibles.

TIPOS VÁLIDOS (uno de estos o null): "casa", "departamento", "ph", "terreno", "oficina", "local_comercial", "cochera"

AMENITIES VÁLIDOS (usá nombres exactos, solo los que se vean claramente): "Cochera", "Terraza", "Quincho", "Pileta", "Balcón", "Luminosa", "Jardín", "Gimnasio"

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional:
{
  "tipo_propiedad": "departamento" | "casa" | "ph" | "terreno" | "oficina" | "local_comercial" | "cochera" | null,
  "caracteristicas": ["máx 3 características cortas y precisas visibles en la foto"],
  "amenities": ["solo amenities de la lista que se vean claramente"],
  "descripcion_libre": "una oración descriptiva de lo que se ve"
}

Solo incluí lo que claramente se ve. Si no es una foto de una propiedad, devolvé todos los campos vacíos/null.`,
          },
        ],
      },
    ],
  });

  const rawText = message.content[0]?.type === "text" ? message.content[0].text : "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("NO_PROPERTY");

  let parsed: { tipo_propiedad?: string | null; caracteristicas?: string[]; amenities?: string[]; descripcion_libre?: string };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("NO_PROPERTY");
  }

  const tipo = parsed.tipo_propiedad ? (TIPO_MAP[parsed.tipo_propiedad] ?? null) : null;

  if (!tipo && !parsed.descripcion_libre && !parsed.caracteristicas?.length) {
    throw new Error("NO_PROPERTY");
  }

  return {
    tipo_propiedad: tipo,
    caracteristicas: parsed.caracteristicas ?? [],
    amenities: parsed.amenities ?? [],
    descripcion_libre: parsed.descripcion_libre ?? "",
  };
}
