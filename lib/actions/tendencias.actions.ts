"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { logFeatureUsage } from "@/lib/actions/analytics.actions";
import { buildAgentContext, detectVariante, getVariantInstruction } from "@/lib/agent-context";
import type { VarianteEspanol } from "@/lib/agent-context";
import type { AgentProfile } from "@/lib/actions/agent-profile.actions";

export type FormatoEngagement = {
  posicion: number;
  nombre: string;
  descripcion: string;
  por_que_funciona: string;
  ejemplo_hook: string;
};

export type HashtagGroup = {
  red_social: "Instagram" | "Facebook" | "LinkedIn";
  hashtags: string[];
};

export type TemaAgente = {
  tema: string;
  descripcion: string;
};

export type RecomendacionHoy = {
  tipo_contenido: string;
  tema: string;
  formato: string;
  hashtags_sugeridos: string[];
  tip_extra: string;
};

export type TendenciasResult = {
  formatos_top: FormatoEngagement[];
  hashtags: HashtagGroup[];
  temas_agentes: TemaAgente[];
  recomendacion_hoy: RecomendacionHoy;
  fecha_analisis: string;
};

export async function buscarTendencias(variante_espanol?: VarianteEspanol): Promise<TendenciasResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const supabase = createSupabaseAdminClient();
  const [{ data }, { data: profileRow }] = await Promise.all([
    supabase.from("subscriptions").select("plan, status").eq("user_id", userId).maybeSingle(),
    supabase.from("agent_profiles").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  if (!((data?.plan === "pro" || data?.plan === "pro_max") && data?.status === "active")) {
    throw new Error("PRO_REQUIRED");
  }

  const profile: AgentProfile = profileRow ?? {};
  const { contextBlock } = buildAgentContext(profile);

  const variante: VarianteEspanol =
    variante_espanol ??
    profile.variante_espanol ??
    detectVariante(profile.zona);
  const variantInstruction = getVariantInstruction(variante);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `Sos un analista de marketing digital especializado en el sector inmobiliario. Hoy es ${hoy}.
${contextBlock ? `\n${contextBlock}\n` : ""}
VARIANTE DE ESPAÑOL: ${variantInstruction}

Investigá con web search las tendencias actuales de contenido inmobiliario en redes sociales. Buscá:
1. "real estate instagram reels trending 2025 engagement"
2. "real estate hashtags trending instagram facebook linkedin 2025"
3. "real estate agents content ideas that go viral social media 2025"
4. "contenido inmobiliario viral instagram 2025"

Basándote en lo que encontrás, respondé con datos precisos y actualizados sobre:
- Qué formatos de contenido están generando más interacciones HOY en Instagram, Facebook y LinkedIn para el sector inmobiliario
- Qué hashtags inmobiliarios están siendo más usados ESTA SEMANA
- Qué temas están publicando los agentes más exitosos
- Qué conviene publicar hoy específicamente

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código markdown:
{
  "formatos_top": [
    {
      "posicion": 1,
      "nombre": "Nombre del formato (ej: Tour virtual en Reels)",
      "descripcion": "Descripción de cómo se hace y qué incluye (2 oraciones)",
      "por_que_funciona": "Por qué genera engagement en este momento específico (1-2 oraciones con datos si los hay)",
      "ejemplo_hook": "Ejemplo concreto de frase de apertura para este formato"
    },
    {
      "posicion": 2,
      "nombre": "...",
      "descripcion": "...",
      "por_que_funciona": "...",
      "ejemplo_hook": "..."
    },
    {
      "posicion": 3,
      "nombre": "...",
      "descripcion": "...",
      "por_que_funciona": "...",
      "ejemplo_hook": "..."
    }
  ],
  "hashtags": [
    {
      "red_social": "Instagram",
      "hashtags": ["#inmobiliaria", "#propiedades", "#casaenventas", "#departamentos", "#bienesraices", "#realestateagent", "#househunting"]
    },
    {
      "red_social": "Facebook",
      "hashtags": ["#inmobiliaria", "#compraventa", "#alquiler", "#propiedadesenventa", "#bienesraices"]
    },
    {
      "red_social": "LinkedIn",
      "hashtags": ["#realestate", "#proptech", "#mercadoinmobiliario", "#agenteinmobiliario", "#tendenciasimmobiliarias"]
    }
  ],
  "temas_agentes": [
    {
      "tema": "Nombre del tema (ej: Comparativa antes/después de reformas)",
      "descripcion": "Por qué este tema resuena y genera conversación (1 oración)"
    },
    {
      "tema": "...",
      "descripcion": "..."
    },
    {
      "tema": "...",
      "descripcion": "..."
    },
    {
      "tema": "...",
      "descripcion": "..."
    },
    {
      "tema": "...",
      "descripcion": "..."
    }
  ],
  "recomendacion_hoy": {
    "tipo_contenido": "Tipo de post recomendado para hoy (ej: Reel educativo)",
    "tema": "Tema específico y concreto para publicar hoy",
    "formato": "Descripción del formato y estructura del post",
    "hashtags_sugeridos": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
    "tip_extra": "Consejo adicional de timing, caption o estrategia para maximizar alcance hoy"
  },
  "fecha_analisis": "${new Date().toISOString()}"
}`;

  const tools: Anthropic.ToolUnion[] = [
    { type: "web_search_20250305", name: "web_search", max_uses: 5 },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    tools,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlocks = response.content.filter(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  const rawText = textBlocks[textBlocks.length - 1]?.text ?? "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[tendencias.actions] Sin JSON:", rawText.slice(0, 300));
    throw new Error("Formato de respuesta inválido");
  }

  let result: TendenciasResult;
  try {
    result = JSON.parse(jsonMatch[0]) as TendenciasResult;
  } catch (e) {
    console.error("[tendencias.actions] Error parseando JSON:", e);
    throw new Error("Error al procesar la respuesta de la IA");
  }

  void logFeatureUsage("tendencias");
  return result;
}
