-- Crear tabla subscriptions
-- Ejecutar en: Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id)
);

-- Activar Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo pueden leer su propia suscripción
CREATE POLICY "users_can_read_own_subscription"
  ON public.subscriptions
  FOR SELECT
  USING (user_id = (auth.jwt() ->> 'sub'));

-- El webhook usa service_role key y bypasea RLS automáticamente
