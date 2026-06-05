-- Migration v3: Agregar campos de detalle de propiedad
-- Ejecutar en: Supabase Dashboard > SQL Editor

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS banios           text DEFAULT '',
  ADD COLUMN IF NOT EXISTS plantas          text DEFAULT '',
  ADD COLUMN IF NOT EXISTS antiguedad       text DEFAULT '',
  ADD COLUMN IF NOT EXISTS orientacion      text DEFAULT '',
  ADD COLUMN IF NOT EXISTS apto_credito     boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS apto_profesional boolean DEFAULT false;
