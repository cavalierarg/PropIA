"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { logFeatureUsage } from "@/lib/actions/analytics.actions";

export type PropertyInput = {
  tipoPropiedad: string;
  ubicacion: string;
  metrosCuadrados: string;
  precio: string;
  caracteristica1: string;
  caracteristica2: string;
  caracteristica3: string;
  dormitorios?: string;
  banios?: string;
  cocheras?: string;
  antiguedad?: string;
  piso?: string;
  expensas?: string;
  amenities?: string[];
  agenteWhatsapp?: string;
  agenteInstagram?: string;
  agenteSitioWeb?: string;
};

export type TrendingFormat = {
  id: string;
  nombre: string;
  descripcion: string;
  por_que_funciona: string;
};

export type Escena = {
  numero: number;
  duracion: string;
  que_decir: string;
  que_mostrar: string;
  texto_pantalla: string;
};

export type Slide = {
  numero: number;
  texto_principal: string;
  texto_secundario: string;
  accion: string;
};

export type FormatosResult = {
  formatos: TrendingFormat[];
  isPro: boolean;
};

export type GuionResult = {
  formato_elegido: string;
  reel: {
    duracion_total: string;
    escenas: Escena[];
  };
  story: {
    slides: Slide[];
  };
};

async function getIsPro(userId: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.plan === "pro" && data?.status === "active";
}

function buildPropiedadStr(data: PropertyInput): string {
  const caracteristicas = [data.caracteristica1, data.caracteristica2, data.caracteristica3]
    .filter(Boolean)
    .join(", ");
  const extras = [
    data.dormitorios ? `- Dormitorios: ${data.dormitorios}` : "",
    data.banios ? `- Baños: ${data.banios}` : "",
    data.cocheras ? `- Cocheras: ${data.cocheras}` : "",
    data.antiguedad ? `- Antigüedad: ${data.antiguedad}` : "",
    data.piso ? `- Piso: ${data.piso}` : "",
    data.expensas ? `- Expensas: ${data.expensas}` : "",
    data.amenities?.length ? `- Amenities: ${data.amenities.join(", ")}` : "",
    data.agenteWhatsapp ? `- WhatsApp del agente: ${data.agenteWhatsapp}` : "",
    data.agenteInstagram ? `- Instagram del agente: @${data.agenteInstagram.replace(/^@/, "")}` : "",
    data.agenteSitioWeb ? `- Sitio web: ${data.agenteSitioWeb}` : "",
  ].filter(Boolean).join("\n");

  return [
    `- Tipo: ${data.tipoPropiedad}`,
    `- Ubicación: ${data.ubicacion}`,
    `- Superficie: ${data.metrosCuadrados} m²`,
    `- Precio: ${data.precio}`,
    extras || "",
    caracteristicas ? `- Destacados: ${caracteristicas}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function buscarFormatosTrending(
  data: PropertyInput
): Promise<FormatosResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const isPro = await getIsPro(userId);
  if (!isPro) throw new Error("PRO_REQUIRED");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const propiedad = buildPropiedadStr(data);

  const prompt = `Sos un experto en marketing inmobiliario y video content para Instagram Reels y TikTok. Investigá con web search cuáles son los formatos de video que están generando más engagement para el sector inmobiliario en Instagram y TikTok en este momento.

CORRECCIÓN OBLIGATORIA: Todo el contenido generado debe estar completamente libre de errores ortográficos, gramaticales y de puntuación. Revisá y corregí automáticamente antes de responder.

DATOS: Usá únicamente los datos proporcionados. No inventes ni asumas características que no fueron especificadas.

Buscá información sobre: "real estate reels trends 2025", "trending real estate video formats instagram tiktok", "viral real estate content ideas 2025".

Luego elegí los 3 formatos más efectivos y adaptálos para esta propiedad específica:
${propiedad}

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código markdown:
{
  "formatos": [
    {
      "id": "formato_1",
      "nombre": "Nombre del formato (ej: Tour en 60 segundos)",
      "descripcion": "Cómo funciona este formato de video paso a paso, qué muestra y cómo se estructura (2-3 oraciones concretas)",
      "por_que_funciona": "Por qué genera engagement y resultados para este tipo de propiedad específica (1-2 oraciones con razones concretas)"
    },
    {
      "id": "formato_2",
      "nombre": "...",
      "descripcion": "...",
      "por_que_funciona": "..."
    },
    {
      "id": "formato_3",
      "nombre": "...",
      "descripcion": "...",
      "por_que_funciona": "..."
    }
  ]
}`;

  const tools: Anthropic.ToolUnion[] = [
    { type: "web_search_20250305", name: "web_search", max_uses: 3 },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    tools,
    messages: [{ role: "user", content: prompt }],
  });

  // web_search_20250305 is a server-side tool — Anthropic executes the search
  // automatically. The response returns with stop_reason "end_turn" and includes
  // text + server_tool_use + web_search_tool_result blocks. Get the last text block.
  const textBlocks = response.content.filter(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  const rawText = textBlocks[textBlocks.length - 1]?.text ?? "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[reels.actions] Sin JSON en respuesta:", rawText.slice(0, 300));
    throw new Error("Formato de respuesta inválido");
  }

  let parsed: { formatos: TrendingFormat[] };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("[reels.actions] Error parseando JSON:", e);
    throw new Error("Error al procesar la respuesta de la IA");
  }

  return { formatos: parsed.formatos, isPro };
}

export async function generarGuion(
  data: PropertyInput,
  formato: TrendingFormat
): Promise<GuionResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const isPro = await getIsPro(userId);
  if (!isPro) throw new Error("PRO_REQUIRED");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const propiedad = buildPropiedadStr(data);

  const prompt = `Sos un director de contenido especialista en video marketing inmobiliario. Generá un guion completo y detallado para un Reel de Instagram usando el siguiente formato trending.

CORRECCIÓN OBLIGATORIA: Todo el contenido generado debe estar completamente libre de errores ortográficos, gramaticales y de puntuación. Revisá y corregí automáticamente antes de responder.

DATOS: Usá únicamente los datos proporcionados. No inventes ni asumas características que no fueron especificadas.

FORMATO ELEGIDO: ${formato.nombre}
Descripción: ${formato.descripcion}

PROPIEDAD:
${propiedad}

INSTRUCCIONES PARA EL REEL (30-60 segundos total, 4-6 escenas):
- Escena 1: Hook de 3-5 segundos que detenga el scroll inmediatamente — pregunta directa, dato sorprendente o afirmación polémica relacionada a la propiedad
- Cada escena especifica exactamente qué decir (palabras concretas, tono natural como si lo dijera el agente), qué filmar y cómo encuadrar la cámara, duración en segundos, y texto superpuesto en pantalla (si aplica)
- Ritmo dinámico, cortes cada 5-10 segundos
- CTA claro y directo en la última escena
- Sin guión de locutor formal — tiene que sonar espontáneo y auténtico

INSTRUCCIONES PARA LA STORY (3 slides complementarios al Reel):
- Slide 1: Engancha con contexto o dato llamativo de la propiedad
- Slide 2: Detalle principal o propuesta de valor
- Slide 3: CTA con elemento interactivo (encuesta, pregunta, link)

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código:
{
  "formato_elegido": "${formato.nombre}",
  "reel": {
    "duracion_total": "ej: 45 segundos",
    "escenas": [
      {
        "numero": 1,
        "duracion": "ej: 5 segundos",
        "que_decir": "Texto exacto y natural a decir mirando a cámara",
        "que_mostrar": "Descripción detallada de qué filmar, ángulo, movimiento de cámara",
        "texto_pantalla": "Texto superpuesto en el video (dejar vacío si no aplica)"
      }
    ]
  },
  "story": {
    "slides": [
      {
        "numero": 1,
        "texto_principal": "Texto grande y llamativo del slide",
        "texto_secundario": "Texto de apoyo más pequeño",
        "accion": "Sticker, encuesta, pregunta o elemento interactivo sugerido"
      }
    ]
  }
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[reels.actions] Sin JSON en guion:", rawText.slice(0, 300));
    throw new Error("Formato de respuesta inválido");
  }

  let result: GuionResult;
  try {
    result = JSON.parse(jsonMatch[0]) as GuionResult;
  } catch (e) {
    console.error("[reels.actions] Error parseando guion:", e);
    throw new Error("Error al procesar el guion");
  }

  void logFeatureUsage("reels");
  return result;
}
