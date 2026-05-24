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

- SIEMPRE usar TypeScript estricto, nunca any
- SIEMPRE hacer push a GitHub al terminar cada tarea
- SIEMPRE verificar que el build compila antes de hacer push
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

## Optimización de tokens

- Leer solo los archivos necesarios para cada tarea
- No releer archivos que ya fueron leídos en la misma sesión
- Hacer cambios quirúrgicos, no reescribir archivos completos
- Confirmar antes de hacer cambios grandes o destructivos

## Colores de marca

- Azul oscuro principal: #0f3460
- Cyan acento: #00c9c9
- Dorado Pro Max: #f59e0b
- Fondo oscuro: #0a1628

## Modelo de IA
Siempre usar claude-sonnet-4-20250514 en todas las API calls a Anthropic. Para features con web search usar la herramienta web_search_20250305.
