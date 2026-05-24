-- Run this once in your Supabase SQL editor
CREATE TABLE IF NOT EXISTS public.feature_usage_log (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  feature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feature_usage_log_user_created
  ON public.feature_usage_log (user_id, created_at DESC);

ALTER TABLE public.feature_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_usage_own" ON public.feature_usage_log
  USING (true) WITH CHECK (true);
