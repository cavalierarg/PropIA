"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { logFeatureUsage } from "@/lib/actions/analytics.actions";
import { buildAgentContext, type AgentProfile } from "@/lib/actions/agent-profile.actions";

export type CalendarDay = {
  dia: number;
  fecha: string;
  red: "Instagram" | "Facebook" | "LinkedIn";
  tipo_contenido: string;
  copy: string;
};

const TIPOS_CONTENIDO = [
  "Propiedad destacada",
  "Consejo para compradores",
  "Dato del mercado",
  "Historia de éxito",
  "Pregunta interactiva",
  "Guía de inversión",
  "Consejo para vendedores",
  "Comparativa de zonas",
  "Tendencia inmobiliaria",
  "Behind the scenes",
  "Testimonio de cliente",
  "Oportunidad del mes",
];

function buildPrompt(
  nicho: string,
  zona: string,
  startDateStr: string,
  diasAGenerar: number,
  offsetDia: number,
  contextBlock: string,
  toneInstruction: string
): string {
  const fechaActual = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `La fecha actual es ${fechaActual}. Usá únicamente información actualizada a esta fecha. Ignorá cualquier dato de años anteriores.
${contextBlock ? `\n${contextBlock}\n` : ""}
TONO DE VOZ: ${toneInstruction}

Sos un experto en marketing inmobiliario digital con 10 años de experiencia generando contenido que convierte en Latinoamérica.

CORRECCIÓN OBLIGATORIA: Todo el contenido generado debe estar completamente libre de errores ortográficos, gramaticales y de puntuación. Revisá y corregí automáticamente antes de responder.

DATOS DEL AGENTE:
- Nicho: ${nicho}
- Zona de trabajo: ${zona}
- El día ${offsetDia + 1} del calendario comienza el: ${startDateStr}

TU TAREA: Creá un calendario de contenido para ${diasAGenerar} días consecutivos comenzando en el día ${offsetDia + 1}.

REDES SOCIALES Y TONO:
- Instagram: visual y emocional, primera línea que detenga el scroll, emojis como separadores, CTA directa, 5 hashtags al final. Máx 120 palabras.
- Facebook: narrativo, abrí con pregunta o dato, beneficios concretos, CTA con urgencia moderada, máx 2 hashtags. Máx 150 palabras.
- LinkedIn: ejecutivo, lenguaje de inversión, datos precisos, CTA profesional, 2 hashtags. Máx 100 palabras.

DISTRIBUCIÓN para ${diasAGenerar} días: repartí entre Instagram, Facebook y LinkedIn de forma variada.

TIPOS DE CONTENIDO a rotar: ${TIPOS_CONTENIDO.join(", ")}

IMPORTANTE:
- Cada copy listo para pegar y publicar
- Español neutro (válido para Argentina, México, España)
- Numerá los días desde ${offsetDia + 1} hasta ${offsetDia + diasAGenerar}
- Calculá fechas reales consecutivas a partir de ${startDateStr}

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código markdown:
{
  "dias": [
    {
      "dia": ${offsetDia + 1},
      "fecha": "Lunes 2 de junio",
      "red": "Instagram",
      "tipo_contenido": "Propiedad destacada",
      "copy": "copy completo listo para publicar"
    }
  ]
}`;
}

async function generarBatch(
  client: Anthropic,
  nicho: string,
  zona: string,
  startDate: Date,
  diasAGenerar: number,
  offsetDia: number,
  contextBlock: string,
  toneInstruction: string
): Promise<CalendarDay[]> {
  const fecha = new Date(startDate);
  fecha.setDate(fecha.getDate() + offsetDia);
  const startDateStr = fecha.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const prompt = buildPrompt(nicho, zona, startDateStr, diasAGenerar, offsetDia, contextBlock, toneInstruction);

  let message;
  try {
    message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (apiError) {
    console.error(`[calendario.actions] Error API (offset=${offsetDia}):`, apiError);
    throw apiError;
  }

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[calendario.actions] Respuesta sin JSON:", rawText.slice(0, 300));
    throw new Error("Formato de respuesta inválido");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("[calendario.actions] Error parseando JSON:", e, "\nJSON:", jsonMatch[0].slice(0, 300));
    throw new Error("Error al procesar la respuesta de la IA");
  }

  return parsed.dias as CalendarDay[];
}

export async function generarCalendario(data: {
  nicho: string;
  zona: string;
}): Promise<{ dias: CalendarDay[]; isPro: boolean }> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const supabase = createSupabaseClient();
  const [{ data: subData }, { data: profileRow }] = await Promise.all([
    supabase.from("subscriptions").select("plan, status").eq("user_id", userId).maybeSingle(),
    supabase.from("agent_profiles").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const isPro = (subData?.plan === "pro" || subData?.plan === "pro_max") && subData?.status === "active";

  const profile: AgentProfile = profileRow ?? {};
  const { contextBlock, toneInstruction } = buildAgentContext(profile);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  let dias: CalendarDay[];

  if (!isPro) {
    // Free: 3 días en una sola llamada
    dias = await generarBatch(client, data.nicho, data.zona, startDate, 3, 0, contextBlock, toneInstruction);
  } else {
    // Pro: 30 días en dos batches de 15 para no exceder el límite de tokens
    const [batch1, batch2] = await Promise.all([
      generarBatch(client, data.nicho, data.zona, startDate, 15, 0, contextBlock, toneInstruction),
      generarBatch(client, data.nicho, data.zona, startDate, 15, 15, contextBlock, toneInstruction),
    ]);
    dias = [...batch1, ...batch2];
  }

  void logFeatureUsage("calendario");
  return { dias, isPro };
}
