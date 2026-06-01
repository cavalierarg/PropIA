"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

export type CarouselTrend = {
  id: string;
  nombre: string;
  descripcion: string;
  por_que_funciona: string;
};

export type CarouselTrendsResult = {
  tendencias: CarouselTrend[];
};

async function getIsPro(userId: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.plan === "pro_max" && data?.status === "active";
}

export async function buscarTendenciasCarrusel(
  tipoPropiedad: string,
  zona: string
): Promise<CarouselTrendsResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const isProMax = await getIsPro(userId);
  if (!isProMax) throw new Error("PRO_MAX_REQUIRED");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const fechaActual = new Date().toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const year = new Date().getFullYear();

  const prompt = `La fecha actual es ${fechaActual}. Usá únicamente información actualizada a esta fecha.

Sos un experto en marketing inmobiliario digital especializado en contenido para Instagram. Investigá con web search cuáles son las estructuras de carruseles de Instagram que están generando más engagement para el sector inmobiliario en ${year}.

CORRECCIÓN OBLIGATORIA: Todo el contenido debe estar libre de errores ortográficos, gramaticales y de puntuación.

PROPIEDAD: ${tipoPropiedad} en ${zona}

Buscá información sobre: "real estate instagram carousel ${year} engagement", "carrusel inmobiliario instagram tendencias ${year}", "best real estate carousel format instagram ${year}", "multi-slide real estate post examples ${year}".

Identificá las 3 estructuras de carrusel más efectivas para esta propiedad y adaptálas.

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código markdown:
{
  "tendencias": [
    {
      "id": "tendencia_1",
      "nombre": "Nombre del estilo de carrusel (ej: Antes y Después, Tour Rápido, Historia de Inversión)",
      "descripcion": "Cómo se estructura cada slide y qué contenido va en cada uno (2-3 oraciones concretas)",
      "por_que_funciona": "Por qué genera más guardados y consultas para este tipo de propiedad (1-2 oraciones con razones concretas)"
    },
    { "id": "tendencia_2", "nombre": "...", "descripcion": "...", "por_que_funciona": "..." },
    { "id": "tendencia_3", "nombre": "...", "descripcion": "...", "por_que_funciona": "..." }
  ]
}`;

  const tools: Anthropic.ToolUnion[] = [
    { type: "web_search_20250305", name: "web_search", max_uses: 3 },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    tools,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlocks = response.content.filter(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  const rawText = textBlocks[textBlocks.length - 1]?.text ?? "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[carousel-trends] Sin JSON en respuesta:", rawText.slice(0, 300));
    throw new Error("Formato de respuesta inválido");
  }

  let parsed: CarouselTrendsResult;
  try {
    parsed = JSON.parse(jsonMatch[0]) as CarouselTrendsResult;
  } catch (e) {
    console.error("[carousel-trends] Error parseando JSON:", e);
    throw new Error("Error al procesar la respuesta de la IA");
  }

  return parsed;
}
