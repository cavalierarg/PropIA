"use server";

import Anthropic from "@anthropic-ai/sdk";

export type PostResult = {
  red: "Instagram" | "Facebook" | "LinkedIn";
  contenido: string;
};

export type PropertyData = {
  tipoPropiedad: string;
  ubicacion: string;
  metrosCuadrados: string;
  precio: string;
  caracteristica1: string;
  caracteristica2: string;
  caracteristica3: string;
};

export const generarPosts = async (data: PropertyData): Promise<PostResult[]> => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Eres un experto en marketing inmobiliario en Argentina. Tu tono es profesional pero cercano, como un agente de confianza que habla con un cliente.

Genera 5 posts en español para la siguiente propiedad:

- Tipo de propiedad: ${data.tipoPropiedad}
- Ubicación: ${data.ubicacion}
- Metros cuadrados: ${data.metrosCuadrados} m²
- Precio: ${data.precio}
- Características destacadas: ${data.caracteristica1}, ${data.caracteristica2}, ${data.caracteristica3}

Crea exactamente:
- 2 posts para Instagram: con emojis, hashtags al final, máximo 300 palabras, llamada a la acción para contactar
- 2 posts para Facebook: más detallados, narrativos, sin exceso de hashtags, máximo 400 palabras
- 1 post para LinkedIn: tono profesional orientado a inversión, datos concretos, máximo 300 palabras

Responde ÚNICAMENTE con un JSON válido con esta estructura, sin texto adicional:
{
  "posts": [
    {"red": "Instagram", "contenido": "..."},
    {"red": "Instagram", "contenido": "..."},
    {"red": "Facebook", "contenido": "..."},
    {"red": "Facebook", "contenido": "..."},
    {"red": "LinkedIn", "contenido": "..."}
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("La respuesta de la IA no tiene el formato esperado");

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.posts as PostResult[];
};
