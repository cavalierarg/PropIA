-- Ejecutar este SQL en el editor SQL del dashboard de Supabase

CREATE TABLE IF NOT EXISTS "public"."usage" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "month" text NOT NULL,
  "count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "usage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "usage_user_id_month_key" UNIQUE ("user_id", "month")
);

ALTER TABLE "public"."usage" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON "public"."usage" FOR SELECT TO authenticated
  USING ((SELECT auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can insert own usage"
  ON "public"."usage" FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Users can update own usage"
  ON "public"."usage" FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);

GRANT ALL ON TABLE "public"."usage" TO "anon";
GRANT ALL ON TABLE "public"."usage" TO "authenticated";
GRANT ALL ON TABLE "public"."usage" TO "service_role";
