"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

export type AdTrend = {
  numero: number;
  titulo: string;
  descripcion: string;
  por_que_funciona: string;
  recomendado: boolean;
};

export type AdTrendsResult = {
  tendencias: AdTrend[];
  fecha_analisis: string;
};

export async function investigarTendenciasAds(): Promise<AdTrendsResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (data?.plan !== "pro_max" || data?.status !== "active") {
    throw new Error("PRO_MAX_REQUIRED");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `Sos un experto en publicidad digital inmobiliaria y Meta Ads. Hoy es ${hoy}.

Investigá con web search qué formatos de ads inmobiliarios están siendo tendencia AHORA MISMO en Meta Ads (Facebook e Instagram Ads). Buscá:
1. "real estate Meta Ads formats trending 2025 high performance"
2. "best performing real estate Facebook Instagram ads 2025"
3. "inmobiliaria ads Meta Ads tendencia formato 2025"

Basándote en lo que encontrás, identificá los 3 formatos de ads inmobiliarios más efectivos en este momento en Meta Ads para el sector inmobiliario.

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código markdown:
{
  "tendencias": [
    {
      "numero": 1,
      "titulo": "Nombre del formato de ad (ej: Carrusel de fotos con precio destacado)",
      "descripcion": "Descripción detallada del formato: cómo se estructura visualmente, qué incluye, cómo se presenta (2-3 oraciones)",
      "por_que_funciona": "Por qué este formato genera buenos resultados en Meta Ads para inmobiliarias en este momento (datos concretos si están disponibles)",
      "recomendado": true
    },
    {
      "numero": 2,
      "titulo": "...",
      "descripcion": "...",
      "por_que_funciona": "...",
      "recomendado": false
    },
    {
      "numero": 3,
      "titulo": "...",
      "descripcion": "...",
      "por_que_funciona": "...",
      "recomendado": false
    }
  ],
  "fecha_analisis": "${new Date().toISOString()}"
}

El campo "recomendado" debe ser true SOLO para la tendencia que más recomendás usar. Solo una puede ser recomendada.`;

  const tools: Anthropic.ToolUnion[] = [
    { type: "web_search_20250305", name: "web_search", max_uses: 4 },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    tools,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlocks = response.content.filter(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  const rawText = textBlocks[textBlocks.length - 1]?.text ?? "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[ads-trends] Sin JSON:", rawText.slice(0, 300));
    throw new Error("Formato de respuesta inválido");
  }

  try {
    return JSON.parse(jsonMatch[0]) as AdTrendsResult;
  } catch (e) {
    console.error("[ads-trends] Error parseando JSON:", e);
    throw new Error("Error al procesar la respuesta de la IA");
  }
}
