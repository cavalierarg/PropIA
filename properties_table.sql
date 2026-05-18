-- Crear tabla properties
-- Ejecutar en: Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  tipo_propiedad text NOT NULL,
  ubicacion text NOT NULL,
  metros_cuadrados text NOT NULL,
  precio text NOT NULL,
  caracteristica1 text DEFAULT '',
  caracteristica2 text DEFAULT '',
  caracteristica3 text DEFAULT '',
  posts jsonb NOT NULL DEFAULT '[]',
  recomendaciones jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_can_manage_own_properties ON public.properties
  FOR ALL USING (user_id = (auth.jwt() ->> 'sub'));
