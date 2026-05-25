-- Agregar columnas de onboarding a agent_profiles
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.agent_profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_steps JSONB DEFAULT '{}';
