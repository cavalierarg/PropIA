"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

export type CalendarDay = {
  dia: number;
  fecha: string;
  red: "Instagram" | "Facebook" | "LinkedIn";
  tipo_contenido: string;
  copy: string;
};

export async function generarCalendario(data: {
  nicho: string;
  zona: string;
}): Promise<{ dias: CalendarDay[]; isPro: boolean }> {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const supabase = createSupabaseClient();
  const { data: subData } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  const isPro = subData?.plan === "pro" && subData?.status === "active";
  const diasAGenerar = isPro ? 30 : 3;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDateStr = tomorrow.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Sos un experto en marketing inmobiliario digital con 10 años de experiencia generando contenido que convierte en Latinoamérica.

DATOS DEL AGENTE:
- Nicho: ${data.nicho}
- Zona de trabajo: ${data.zona}
- El calendario comienza el: ${startDateStr}

TU TAREA: Creá un calendario de contenido para ${diasAGenerar} días consecutivos.

REDES SOCIALES Y TONO:
- Instagram: visual y emocional, emojis estratégicos como separadores, primera línea que detenga el scroll, CTA directa, 5-7 hashtags al final, máx 280 palabras
- Facebook: narrativo y persuasivo, abrí con pregunta o dato que conecte, describí beneficios concretos, CTA con urgencia moderada, máx 3 hashtags, máx 350 palabras
- LinkedIn: ejecutivo, enmarcar la propiedad como activo de inversión, lenguaje financiero accesible, datos precisos, CTA profesional, 2-3 hashtags, máx 280 palabras

DISTRIBUCIÓN (para 30 días: 13 Instagram, 10 Facebook, 7 LinkedIn — para 3 días: 1 de cada red)

TIPOS DE CONTENIDO — variá al máximo usando estos:
"Propiedad destacada", "Consejo para compradores", "Dato del mercado", "Historia de éxito", "Pregunta interactiva", "Guía de inversión", "Consejo para vendedores", "Comparativa de zonas", "Tendencia inmobiliaria", "Behind the scenes", "Testimonio de cliente", "Oportunidad del mes"

REGLAS PARA LOS COPIES:
- Español neutro válido en Argentina, México, Colombia y España (sin regionalismos)
- Cada copy 100% listo para pegar y publicar
- Emojis como separadores visuales, no decorativos
- CTA clara en cada post
- Calculá las fechas reales a partir del ${startDateStr} (${diasAGenerar} días consecutivos)

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código markdown:
{
  "dias": [
    {
      "dia": 1,
      "fecha": "Lunes 2 de junio",
      "red": "Instagram",
      "tipo_contenido": "Propiedad destacada",
      "copy": "copy completo listo para publicar"
    }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: isPro ? 8000 : 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[calendario.actions] Respuesta sin JSON:", rawText.slice(0, 200));
    throw new Error("Formato de respuesta inválido");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("[calendario.actions] Error parseando JSON:", e);
    throw new Error("Error al procesar la respuesta de la IA");
  }

  return { dias: parsed.dias as CalendarDay[], isPro };
}
