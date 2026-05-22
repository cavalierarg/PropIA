"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";

const MONTHLY_LIMIT = 10;

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export type PostResult = {
  red: "Instagram" | "Facebook" | "LinkedIn";
  contenido: string;
};

export type Recomendacion = {
  indice: number;
  razon: string;
};

export type RecomendacionesResult = {
  mayor_engagement: Recomendacion;
  mayor_consultas: Recomendacion;
  inversores: Recomendacion;
};

export type PropertyData = {
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

export const generarPosts = async (
  data: PropertyData
): Promise<{ posts: PostResult[]; recomendaciones: RecomendacionesResult; remaining: number; isPro: boolean }> => {
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const supabase = createSupabaseClient();
  const month = getCurrentMonth();

  const { data: subData } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  const isPro = subData?.plan === "pro" && subData?.status === "active";

  const { data: usageData } = await supabase
    .from("usage")
    .select("count")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();

  const currentCount = usageData?.count ?? 0;

  if (!isPro && currentCount >= MONTHLY_LIMIT) {
    throw new Error("LIMIT_REACHED");
  }

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
    data.agenteWhatsapp ? `- WhatsApp del agente: ${data.agenteWhatsapp}` : "",
    data.agenteInstagram ? `- Instagram del agente: @${data.agenteInstagram.replace(/^@/, "")}` : "",
    data.agenteSitioWeb ? `- Sitio web: ${data.agenteSitioWeb}` : "",
  ].filter(Boolean).join("\n");

  const prompt = `Eres un experto en marketing inmobiliario digital con 10 años de experiencia vendiendo propiedades de alto valor en Latinoamérica. Tu misión es crear posts que generen consultas reales y cierren ventas. Escribís en español neutro válido para México, España y Colombia. Sin regionalismos.

CORRECCIÓN OBLIGATORIA: Todo el contenido generado debe estar completamente libre de errores ortográficos, gramaticales y de puntuación. Revisá y corregí automáticamente antes de responder. Los datos del usuario pueden tener pequeños errores tipográficos — corregalos implícitamente.

DATOS: Usá únicamente los datos proporcionados. No inventes ni asumas características que no fueron especificadas.

PROPIEDAD A PROMOCIONAR:
- Tipo: ${data.tipoPropiedad}
- Ubicación: ${data.ubicacion}
- Superficie: ${data.metrosCuadrados} m²
- Precio: ${data.precio}
${extras ? extras + "\n" : ""}- Destacados: ${caracteristicas || "ninguno especificado"}

CREÁ EXACTAMENTE 5 POSTS ORIENTADOS A VENTAS, con el tono preciso de cada red:

📸 2 POSTS PARA INSTAGRAM (visual y emocional):
- Primera línea gancho que detenga el scroll: máx. 10 palabras de alto impacto
- Hacé que el lector imagine vivir o invertir ahí — describí sensaciones y estilo de vida
- Emojis estratégicos como separadores visuales, no decorativos
- Destacá exclusividad, smart living o la oportunidad de la zona
- CTA directa al final: si hay WhatsApp del agente usalo ("Escribinos al [número]"), si no: "Escribinos al DM 📩" / "Consultá precio final ⬇️" / "Agendá tu visita"
- 5-8 hashtags relevantes al sector y la ciudad al final
- Máximo 300 palabras

📘 2 POSTS PARA FACEBOOK (narrativo y persuasivo):
- Abrí con una pregunta o afirmación que conecte emocionalmente con el lector
- Relatá los beneficios como si describieras un día de vida real en esa propiedad
- Mencioná ventajas concretas de la zona: conectividad, servicios, revalorización
- Incluí un dato de valor que ancle la percepción de precio (precio/m², comparativa, potencial de renta)
- CTA con urgencia moderada: "Consultanos hoy antes de que se vaya" / "Quedan pocas unidades disponibles"
- Máximo 400 palabras. Máximo 3 hashtags

💼 1 POST PARA LINKEDIN (ejecutivo, orientado a inversión):
- Enmarcá la propiedad como activo de inversión, no solo como hogar
- Mencioná potencial de renta estimada, plusvalía de zona o costo por m² vs. mercado
- Lenguaje financiero accesible: "rendimiento", "plusvalía", "activo tangible", "flujo de caja"
- Datos precisos generan credibilidad: precio/m², contexto del mercado local
- Tono ejecutivo y directo, sin exageraciones
- CTA profesional: "¿Querés más detalles? Escribime al DM" / "Conectemos"
- 2-3 hashtags: #InversionInmobiliaria #RealEstate #Propiedades
- Máximo 300 palabras

ANÁLISIS DE EFECTIVIDAD:
Después de crear los posts, analizá cuál es el más efectivo para cada objetivo.
Los índices van del 0 al 4 en orden: Instagram(0), Instagram(1), Facebook(2), Facebook(3), LinkedIn(4).
Cada recomendación debe ser para un índice diferente cuando sea posible.

Respondé ÚNICAMENTE con este JSON válido, sin texto adicional ni bloques de código:
{
  "posts": [
    {"red": "Instagram", "contenido": "..."},
    {"red": "Instagram", "contenido": "..."},
    {"red": "Facebook", "contenido": "..."},
    {"red": "Facebook", "contenido": "..."},
    {"red": "LinkedIn", "contenido": "..."}
  ],
  "recomendaciones": {
    "mayor_engagement": {
      "indice": 0,
      "razon": "Una sola frase explicando por qué este post generará más likes y compartidos"
    },
    "mayor_consultas": {
      "indice": 2,
      "razon": "Una sola frase explicando por qué este post generará más mensajes directos"
    },
    "inversores": {
      "indice": 4,
      "razon": "Una sola frase explicando por qué este post atrae mejor al perfil inversor"
    }
  }
}`;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[posts.actions] ERROR: ANTHROPIC_API_KEY no está definida en las variables de entorno");
    throw new Error("API key no configurada");
  }

  let message;
  try {
    message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (apiError) {
    console.error("[posts.actions] ERROR al llamar a la API de Anthropic:", apiError);
    throw apiError;
  }

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  console.log("[posts.actions] Respuesta de Anthropic (primeros 200 chars):", rawText.slice(0, 200));

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[posts.actions] ERROR: respuesta sin JSON válido. Texto completo:", rawText);
    throw new Error("La respuesta de la IA no tiene el formato esperado");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error("[posts.actions] ERROR al parsear JSON:", parseError, "\nJSON recibido:", jsonMatch[0]);
    throw parseError;
  }

  const newCount = currentCount + 1;
  const { error: upsertError } = await supabase
    .from("usage")
    .upsert({ user_id: userId, month, count: newCount }, { onConflict: "user_id,month" });

  if (upsertError) {
    console.error("[posts.actions] ERROR al actualizar usage en Supabase:", upsertError);
  }

  return {
    posts: parsed.posts as PostResult[],
    recomendaciones: parsed.recomendaciones as RecomendacionesResult,
    remaining: isPro ? -1 : Math.max(0, MONTHLY_LIMIT - newCount),
    isPro,
  };
};
