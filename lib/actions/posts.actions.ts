"use server";

import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { logFeatureUsage } from "@/lib/actions/analytics.actions";
import { checkAndIncrementUsage } from "@/lib/actions/usage.actions";
import { buildAgentContext, detectVariante, getVariantInstruction } from "@/lib/agent-context";
import type { VarianteEspanol } from "@/lib/agent-context";
import type { AgentProfile } from "@/lib/actions/agent-profile.actions";

const MONTHLY_LIMIT = 5;

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
  variante_espanol?: VarianteEspanol;
};

export type ErrorGeneracion =
  | "UNAUTHENTICATED"
  | "LIMIT_REACHED"
  | "API_KEY_FALTANTE"
  | "ERROR_API"
  | "ERROR_FORMATO";

export type ResultadoGeneracion =
  | { ok: true; posts: PostResult[]; recomendaciones: RecomendacionesResult; remaining: number; isPro: boolean; profileEmpty: boolean }
  | { ok: false; error: ErrorGeneracion };

export const generarPosts = async (data: PropertyData): Promise<ResultadoGeneracion> => {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "UNAUTHENTICATED" };

  // checkAndIncrementUsage usa admin client (sin JWT) para evitar excepciones en el upsert
  const usageResult = await checkAndIncrementUsage(userId);
  if (!usageResult.allowed) return { ok: false, error: "LIMIT_REACHED" };

  const { isPro } = usageResult;

  const supabase = createSupabaseClient();

  const { data: profileRow } = await supabase
    .from("agent_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const profile: AgentProfile = profileRow ?? {};
  const { contextBlock, toneInstruction, profileEmpty } = buildAgentContext(profile);

  const variante: VarianteEspanol =
    data.variante_espanol ??
    profile.variante_espanol ??
    detectVariante(data.ubicacion || profile.zona);
  const variantInstruction = getVariantInstruction(variante);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[posts.actions] ERROR: ANTHROPIC_API_KEY no está definida");
    return { ok: false, error: "API_KEY_FALTANTE" };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const caracteristicas = [data.caracteristica1, data.caracteristica2, data.caracteristica3]
    .filter(Boolean)
    .join(", ");

  const contactoWhatsapp = data.agenteWhatsapp || profile.whatsapp || "";
  const contactoInstagram = data.agenteInstagram || profile.instagram || "";
  const contactoSitioWeb = data.agenteSitioWeb || profile.sitio_web || "";

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

  const fechaActual = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `La fecha actual es ${fechaActual}. Usá únicamente información actualizada a esta fecha. Ignorá cualquier dato de años anteriores.
${contextBlock ? `\n${contextBlock}\n` : ""}
TONO DE VOZ: ${toneInstruction}
VARIANTE DE ESPAÑOL: ${variantInstruction}

Eres un experto en marketing inmobiliario digital con 10 años de experiencia vendiendo propiedades de alto valor. Tu misión es crear posts que generen consultas reales y cierren ventas.

CORRECCIÓN OBLIGATORIA: Todo el contenido generado debe estar completamente libre de errores ortográficos, gramaticales y de puntuación. Revisá y corregí automáticamente antes de responder. Los datos del usuario pueden tener pequeños errores tipográficos — corregalos implícitamente.

IMPORTANTE — LÍMITE DE HASHTAGS (regla absoluta, nunca la rompas): Instagram entre 3 y 5 hashtags máximo, nunca más. Facebook máximo 3 hashtags. LinkedIn máximo 2 hashtags o ninguno.

DATOS: Usá únicamente los datos proporcionados. No inventes ni asumas características que no fueron especificadas.

PROPIEDAD A PROMOCIONAR:
- Tipo: ${data.tipoPropiedad}
- Ubicación: ${data.ubicacion}
- Superficie: ${data.metrosCuadrados} m²
- Precio: ${data.precio}
${extras ? extras + "\n" : ""}- Destacados: ${caracteristicas || "ninguno especificado"}

CREÁ EXACTAMENTE 5 POSTS ORIENTADOS A VENTAS, con el tono preciso de cada red:

HOOKS — Para la primera línea de cada post, elegí el estilo más efectivo para esta propiedad específica — NO uses siempre preguntas. Estilos disponibles: Hook de dato impactante (ej: 'Este depto en Palermo vale menos que un auto 0km'), Hook de revelación (ej: 'Lo que muy poca gente sabe de esta zona'), Hook de controversia (ej: 'La propiedad que todos quieren pero nadie se anima a comprar'), Hook de urgencia (ej: '48 horas para verla antes de que se venda'), Hook de curiosidad (ej: 'Por qué este precio no tiene sentido — y por qué eso es bueno para vos'), Hook narrativo (ej: 'Hace 3 meses esto estaba abandonado. Hoy vale esto'), Hook de beneficio directo (ej: 'Comprás esto hoy y en 2 años duplicaste tu inversión'). Variá el estilo entre los 5 posts — nunca uses el mismo tipo de hook dos veces.

CTAs — Para el llamado a la acción de cada post, elegí el estilo más coherente con el hook y la red — nunca uses el genérico 'Contactame' o 'Escribime': CTA de escasez (ej: 'Solo atiendo a los primeros 3 interesados esta semana'), CTA de exclusividad (ej: 'Mandame un mensaje con la palabra PALERMO y te paso los detalles que no puse acá'), CTA de beneficio (ej: 'Escribime hoy y te consigo la visita antes de que salga al mercado'), CTA de curiosidad (ej: 'Si querés saber el precio real mandame un DM — no lo puse acá a propósito'), CTA social (ej: 'Guardá este post si conocés a alguien que esté buscando en esta zona'), CTA de urgencia (ej: 'Las consultas cierran el viernes — después de eso ya tiene dueño'). Si hay WhatsApp del agente, incorporalo en el CTA de forma natural.

📸 2 POSTS PARA INSTAGRAM (visual y emocional):
CRÍTICO: Los dos posts de Instagram DEBEN tener estructuras completamente distintas — nunca la misma forma ni el mismo tipo de hook.

INSTAGRAM 1 — Storytelling emocional:
- Primera línea: hook emocional (sensaciones, aspiraciones, estilo de vida), máx. 10 palabras
- Estructura narrativa en 2-3 párrafos cortos que lleven al lector a imaginar vivir o invertir ahí
- Describí texturas, luz, ritmo del barrio — hacé que el lector se vea ahí adentro
- CTA suave al final: invitación sin presión (ej: "Si te imaginaste algo parecido, contame")
- 3-5 emojis integrados naturalmente dentro del texto — NUNCA en bloque al final
- 3 a 5 hashtags al final (NUNCA más de 5): mezcla de populares (#RealEstate, #Propiedades) + locales de la ciudad/zona
- Máximo 300 palabras

INSTAGRAM 2 — Datos y lista de highlights:
- Primera línea: hook de dato concreto o número impactante (precio/m², superficie, rendimiento), máx. 10 palabras
- Estructura en lista con viñetas o ítems numerados — cada punto breve, concreto y verificable
- Sin párrafos narrativos — solo datos, características y ventajas directas
- CTA directo al final: acción clara e inmediata (ej: "Mandame un DM con la palabra INTERESADO")
- 3-5 emojis integrados naturalmente dentro del texto — NUNCA en bloque al final
- 3 a 5 hashtags al final (NUNCA más de 5): mezcla de populares (#RealEstate, #Propiedades) + locales de la ciudad/zona
- Máximo 300 palabras

📘 2 POSTS PARA FACEBOOK (narrativo y persuasivo):
- Primera línea: hook elegido según los estilos de arriba
- Relatá los beneficios como si describieras un día de vida real en esa propiedad
- Mencioná ventajas concretas de la zona: conectividad, servicios, revalorización
- Incluí un dato de valor que ancle la percepción de precio (precio/m², comparativa, potencial de renta)
- CTA al final según los estilos de arriba — coherente con el hook
- Máximo 400 palabras. Máximo 3 hashtags discretos al final (NUNCA más de 3) — sin hashtags virales ni de tendencia, solo del sector y la zona

💼 1 POST PARA LINKEDIN (ejecutivo, orientado a inversión):
- Primera línea: hook de dato impactante o beneficio directo — orientado al inversor
- Enmarcá la propiedad como activo de inversión, no solo como hogar
- Mencioná potencial de renta estimada, plusvalía de zona o costo por m² vs. mercado
- Lenguaje financiero accesible: "rendimiento", "plusvalía", "activo tangible", "flujo de caja"
- Datos precisos generan credibilidad: precio/m², contexto del mercado local
- CTA profesional según los estilos de arriba — tono ejecutivo, no genérico
- Sin hashtags o máximo 2 muy específicos al sector (ej: #InversionInmobiliaria #RealEstateLatam) — NUNCA más de 2. LinkedIn penaliza el exceso de hashtags
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

  let message;
  try {
    message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (apiError) {
    console.error("[posts.actions] ERROR al llamar a la API de Anthropic:", apiError);
    return { ok: false, error: "ERROR_API" };
  }

  const rawText = message.content[0]?.type === "text" ? message.content[0].text : "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("[posts.actions] ERROR: respuesta sin JSON válido:", rawText);
    return { ok: false, error: "ERROR_FORMATO" };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error("[posts.actions] ERROR al parsear JSON:", parseError);
    return { ok: false, error: "ERROR_FORMATO" };
  }

  await logFeatureUsage("posts");

  return {
    ok: true,
    posts: parsed.posts as PostResult[],
    recomendaciones: parsed.recomendaciones as RecomendacionesResult,
    remaining: usageResult.remaining,
    isPro,
    profileEmpty,
  };
};
