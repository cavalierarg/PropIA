-- Run this once in your Supabase SQL editor
CREATE TABLE IF NOT EXISTS public.agent_profiles (
  user_id TEXT PRIMARY KEY,
  nombre_completo TEXT,
  nombre_agencia TEXT,
  whatsapp TEXT,
  email TEXT,
  instagram TEXT,
  sitio_web TEXT,
  zona TEXT,
  tipos_propiedad TEXT[] DEFAULT '{}',
  tono_voz TEXT DEFAULT 'profesional',
  logo_url TEXT,
  color_marca TEXT DEFAULT '#0f3460',
  perfil_completado BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_own_profile" ON public.agent_profiles
  USING (true) WITH CHECK (true);
