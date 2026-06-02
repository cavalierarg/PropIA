-- Migration v2: Mis Propiedades como biblioteca reutilizable
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS titulo          text DEFAULT '',
  ADD COLUMN IF NOT EXISTS barrio          text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ciudad          text DEFAULT '',
  ADD COLUMN IF NOT EXISTS moneda          text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS ambientes       text DEFAULT '',
  ADD COLUMN IF NOT EXISTS amenities       text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS descripcion_libre text DEFAULT '',
  ADD COLUMN IF NOT EXISTS foto_urls       text[] DEFAULT '{}';
