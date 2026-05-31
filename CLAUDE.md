# PropIA — Claude Code Instructions

## Proyecto
PropIA es una app SaaS para agentes inmobiliarios hispanohablantes. Genera posts, calendarios de contenido, guiones para Reels, descripciones para portales y ads profesionales para Meta Ads usando la API de Anthropic.

## Stack técnico

- Next.js 15 App Router con TypeScript
- Supabase (base de datos y storage)
- Clerk (autenticación)
- Lemon Squeezy (pagos)
- Vercel (deploy)
- Anthropic API con modelo claude-sonnet-4-20250514
- Tailwind CSS + shadcn/ui
- Sharp y @vercel/og para generación de imágenes

## Estructura del proyecto

- /app — páginas y API routes
- /components — componentes reutilizables
- /lib/actions — server actions
- /public — assets estáticos incluyendo logo.png

## Reglas de desarrollo

- SIEMPRE usar TypeScript estricto, nunca `any`
- SIEMPRE hacer push a GitHub al terminar cada tarea
- SIEMPRE verificar que el build compila antes de hacer push (`npx tsc --noEmit`)
- NUNCA hardcodear API keys, usar siempre variables de entorno
- NUNCA modificar archivos de autenticación de Clerk sin confirmar primero
- Usar español en todos los textos de la interfaz
- Corregir errores ortográficos en todo el contenido generado

## Planes de suscripción

- Free: 5 generaciones/mes, solo generador básico de posts
- Pro ($29/mes): generaciones ilimitadas + Calendario + Portal + Reels + Tendencias
- Pro Max ($59/mes): todo lo del Pro + Generador de Ads profesional

## Variables de entorno requeridas
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, LEMONSQUEEZY_API_KEY, NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL, LEMONSQUEEZY_WEBHOOK_SECRET

## Colores de marca

- Azul oscuro principal: #0f3460
- Cyan acento: #00c9c9
- Dorado Pro Max: #f59e0b
- Fondo oscuro: #0a1628

## Modelo de IA
Siempre usar `claude-sonnet-4-20250514` en todas las API calls a Anthropic. Para features con web search usar la herramienta `web_search_20250305`.

---

## Patrones Next.js 15 (App Router)

### Server Components por defecto
- Los componentes son Server Components por defecto — no agregar `'use client'` salvo que sea necesario para interactividad
- Fetchear datos directamente en Server Components, no en el cliente
- Envolver secciones asíncronas independientes con `<Suspense fallback={<Skeleton />}>`
- Crear `loading.tsx` y `error.tsx` en rutas importantes

### Server Actions con validación
Toda Server Action que escriba en la base de datos DEBE validar con Zod:

```typescript
"use server";
import { z } from "zod";

const schema = z.object({ titulo: z.string().min(1).max(200) });

export async function generarPost(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  // lógica...
}
```

### Anti-patrones a evitar
- `'use client'` en layouts o pages de nivel superior
- `useEffect` para fetchear datos (usar Server Components)
- Lógica pesada en Middleware (corre en cada request)
- Omitir `<Suspense>` alrededor de componentes asíncronos lentos

---

## Integración con API de Anthropic

### Streaming para respuestas largas
Usar streaming en todos los endpoints que muestran contenido generado al usuario:

```typescript
const stream = client.messages.stream({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4096,
  messages,
});
// Retornar como ReadableStream a la UI
```

### Selección de modelo por tarea
- Generación compleja (posts, reels, ads): `claude-sonnet-4-20250514`
- Clasificación simple o extracción de datos: `claude-haiku-4-20250514`

### Manejo de errores en llamadas a IA
Siempre implementar retry con backoff exponencial. Nunca dejar que un error de API llegue crudo al usuario — mostrar mensaje amigable en español.

---

## Seguridad

### Validación de inputs
- Usar Zod en TODAS las API routes y Server Actions que reciben datos externos
- Validar: tipo, longitud, formato y rango
- Rechazar inputs inválidos temprano — no intentar sanitizar y continuar

### Headers de seguridad (next.config)
Configurar en `next.config.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Rate limiting en endpoints de IA
Los endpoints de generación IA son costosos — implementar rate limiting basado en el `userId` de Clerk:
- Free: máx 5 generaciones/mes (verificar en Supabase antes de llamar a Anthropic)
- Pro/Pro Max: verificar suscripción activa antes de continuar

### Secrets
- Nunca commitear `.env.local` ni archivos con credenciales
- Rotar claves inmediatamente si se commitean por error
- Usar `NEXT_PUBLIC_` solo para valores que deben ser públicos

---

## Performance

### Carga progresiva
- Lazy load con `dynamic(() => import(...))` para componentes pesados (editores, previews de imágenes)
- Usar `next/image` para todas las imágenes con `width`, `height` y `priority` donde corresponda
- Precargar datos críticos con Server Components, diferir datos secundarios con `<Suspense>`

### Caché
- Usar `revalidateTag` o `revalidatePath` después de mutaciones
- Cachear respuestas de Anthropic cuando el input es idéntico (mismo prompt + mismos datos)

---

## Flujo de trabajo con Git

### Convención de commits
```
feat(generador): agregar soporte para múltiples plataformas
fix(ads): corregir validación de presupuesto mínimo
refactor(actions): extraer lógica de generación a helper
```

### Antes de cada push
1. `npx tsc --noEmit` — verificar tipos
2. `npm run build` — verificar que compila
3. Revisar que no hay console.log de debug en el código

---

## Optimización de tokens (Claude Code)

- Leer solo los archivos necesarios para cada tarea
- No releer archivos que ya fueron leídos en la misma sesión
- Hacer cambios quirúrgicos — no reescribir archivos completos
- Confirmar antes de hacer cambios grandes o destructivos
- Nunca agregar `Co-Authored-By: Claude` en commits salvo pedido explícito

---

## Equipo de agentes

Este proyecto usa agentes especializados en `.claude/agents/`. Para activar un agente específico, empezá tu mensaje con su prefijo:

| Prefijo | Agente | Área |
|---------|--------|------|
| `frontend:`, `diseño:`, `componente:`, `UI:` | frontend.md | Next.js, Tailwind, shadcn/ui |
| `backend:`, `api:`, `supabase:`, `servidor:` | backend.md | API routes, server actions, DB |
| `prompt:`, `ia:`, `anthropic:`, `generador:` | ia.md | Prompts de Anthropic, calidad del contenido |
| `imagen:`, `ad:`, `carrusel:`, `flyer:` | imagenes.md | @vercel/og, sharp, Ads, Carruseles |
| `negocio:`, `precio:`, `conversión:`, `estrategia:` | negocio.md | Producto, conversión, monetización |

Cada agente tiene su propio contexto y reglas optimizadas para su área.
