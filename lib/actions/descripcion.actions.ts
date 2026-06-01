"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { logFeatureUsage } from "@/lib/actions/analytics.actions";
import { buildAgentContext, type AgentProfile } from "@/lib/actions/agent-profile.actions";

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

export type DescripcionResult = {
  version_corta: string;
  version_larga: string | null;
  isPro: boolean;
};

export async function generarDescripcion(data: PropertyInput): Promise<DescripcionResult> {
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

  const contactoWhatsapp = data.agenteWhatsapp || profile.whatsapp || "";
  const contactoInstagram = data.agenteInstagram || profile.instagram || "";
  const contactoSitioWeb = data.agenteSitioWeb || profile.sitio_web || "";

  const fechaActual = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    contactoWhatsapp ? `- WhatsApp del agente: ${contactoWhatsapp}` : "",
    contactoInstagram ? `- Instagram del agente: @${contactoInstagram.replace(/^@/, "")}` : "",
    contactoSitioWeb ? `- Sitio web: ${contactoSitioWeb}` : "",
  ].filter(Boolean).join("\n");

  const propiedad = [
    `- Tipo: ${data.tipoPropiedad}`,
    `- Ubicación: ${data.ubicacion}`,
    `- Superficie: ${data.metrosCuadrados} m²`,
    `- Precio: ${data.precio}`,
    extras || "",
    caracteristicas ? `- Destacados: ${caracteristicas}` : "",
  ].filter(Boolean).join("\n");

  const agentContextLine = contextBlock ? `\n${contextBlock}\n\nTONO DE VOZ: ${toneInstruction}\n` : `\nTONO DE VOZ: ${toneInstruction}\n`;

  const prompt = isPro
    ? `La fecha actual es ${fechaActual}. Usá únicamente información actualizada a esta fecha. Ignorá cualquier dato de años anteriores.
${agentContextLine}
Sos un redactor especialista en anuncios inmobiliarios para portales como Idealista, Zonaprop, Fotocasa y MercadoLibre. Tu texto posiciona bien en buscadores y persuade al comprador a contactar.

CORRECCIÓN OBLIGATORIA: Todo el contenido generado debe estar completamente libre de errores ortográficos, gramaticales y de puntuación. Revisá y corregí automáticamente antes de responder.

DATOS: Usá únicamente los datos proporcionados. No inventes ni asumas características que no fueron especificadas.

PROPIEDAD:
${propiedad}

GENERÁ DOS VERSIONES:

VERSIÓN CORTA (~200 palabras):
- Primera línea: titular con tipo + zona (ej: "Departamento luminoso en Palermo con terraza propia")
- Descripción técnica y precisa de los espacios, orientación y calidades de construcción
- 2-3 beneficios concretos de la ubicación (conectividad, servicios, valor de zona)
- Cierre con CTA directa ("Consultá disponibilidad hoy mismo" / "Coordiná tu visita sin compromiso")
- Sin emojis. Tono profesional, vocabulario inmobiliario preciso

VERSIÓN LARGA (~400 palabras):
- Expandí la versión corta con más profundidad y detalle
- Describí cada ambiente brevemente (living, cocina, dormitorios, baños, extras)
- Sumá información sobre el barrio: conectividad real (transporte, autopistas), servicios (colegios, supermercados, espacios verdes, gastronomía)
- Mencioná potencial de inversión o rentabilidad estimada si aplica
- Agregá al final un bloque de características técnicas: "Características: X m², X ambientes, piso X, expensas $X, etc." usando solo los datos disponibles
- Cierre elaborado con dos CTAs diferenciados (comprador que busca hogar vs. inversor)
- Sin emojis. Mismo tono profesional

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código:
{
  "version_corta": "texto completo versión corta",
  "version_larga": "texto completo versión larga"
}`
    : `La fecha actual es ${fechaActual}. Usá únicamente información actualizada a esta fecha. Ignorá cualquier dato de años anteriores.
${agentContextLine}
Sos un redactor especialista en anuncios inmobiliarios para portales como Idealista, Zonaprop, Fotocasa y MercadoLibre.

CORRECCIÓN OBLIGATORIA: Todo el contenido generado debe estar completamente libre de errores ortográficos, gramaticales y de puntuación. Revisá y corregí automáticamente antes de responder.

DATOS: Usá únicamente los datos proporcionados. No inventes ni asumas características que no fueron especificadas.

PROPIEDAD:
${propiedad}

GENERÁ UNA DESCRIPCIÓN CORTA (~200 palabras):
- Primera línea: titular con tipo + zona (ej: "Departamento luminoso en Palermo con terraza propia")
- Descripción técnica y precisa de los espacios, orientación y calidades de construcción
- 2-3 beneficios concretos de la ubicación (conectividad, servicios, valor de zona)
- Cierre con CTA directa ("Consultá disponibilidad hoy mismo" / "Coordiná tu visita sin compromiso")
- Sin emojis. Tono profesional, vocabulario inmobiliario preciso

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código:
{
  "version_corta": "texto completo de la descripción"
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: isPro ? 2500 : 1200,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[descripcion.actions] Sin JSON en respuesta:", rawText.slice(0, 200));
    throw new Error("Formato de respuesta inválido");
  }

  let parsed: { version_corta: string; version_larga?: string };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("[descripcion.actions] Error parseando JSON:", e);
    throw new Error("Error al procesar la respuesta de la IA");
  }

  void logFeatureUsage("descripcion");
  return {
    version_corta: parsed.version_corta,
    version_larga: isPro ? (parsed.version_larga ?? null) : null,
    isPro,
  };
}
