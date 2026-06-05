"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generarPosts, PostResult, RecomendacionesResult } from "@/lib/actions/posts.actions";
import type { ErrorGeneracion } from "@/lib/actions/posts.actions";
import { getAgentProfile } from "@/lib/actions/agent-profile.actions";
import { detectVariante } from "@/lib/agent-context";
import type { VarianteEspanol } from "@/lib/agent-context";
import VarianteEspanolSelector from "@/components/VarianteEspanolSelector";
import { saveProperty } from "@/lib/actions/properties.actions";
import { useUsage } from "@/lib/context/usage-context";
import UsageBar from "@/components/UsageBar";
import { getUserProfile } from "@/lib/actions/user-profile.actions";
import PostsView from "@/components/PostsView";
import PostsSkeleton from "@/components/PostsSkeleton";
import UpgradeModal from "@/components/UpgradeModal";
import { ZapIcon, LogInIcon, SparklesIcon, BuildingIcon } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { trackEvent } from "@/lib/meta-pixel";
import { useRef } from "react";
import PropertyLoadedCard from "@/components/PropertyLoadedCard";

export default function PropertyForm() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [form, setForm] = useState({
    tipoPropiedad: searchParams.get("tipoPropiedad") ?? "",
    ubicacion: searchParams.get("ubicacion") ?? "",
    metrosCuadrados: searchParams.get("metrosCuadrados") ?? "",
    precio: searchParams.get("precio") ?? "",
    caracteristica1: searchParams.get("caracteristica1") ?? "",
    caracteristica2: searchParams.get("caracteristica2") ?? "",
    caracteristica3: searchParams.get("caracteristica3") ?? "",
    dormitorios: "",
    banios: "",
    cocheras: "",
    antiguedad: "",
    piso: "",
    expensas: "",
    agenteWhatsapp: "",
    agenteInstagram: "",
    agenteSitioWeb: "",
  });

  const { count, remaining: ctxRemaining, limit: usageLimit, isPro, setUsage } = useUsage();
  const remaining = isPro ? null : ctxRemaining;

  const [posts, setPosts] = useState<PostResult[]>([]);
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionesResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<ErrorGeneracion | "CAMPOS_INCOMPLETOS" | null>(null);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadedProperty, setLoadedProperty] = useState<{ tipo: string; ubicacion: string; precio: string; metros: string } | null>(null);
  const [varianteEspanol, setVarianteEspanol] = useState<VarianteEspanol>("neutro");
  const hasTrackedLead = useRef(false);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][plan]=pro&checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  useEffect(() => {
    Promise.all([getUserProfile(), getAgentProfile()]).then(([userProf, agentProf]) => {
      setForm((prev) => ({
        ...prev,
        agenteWhatsapp: userProf.whatsapp ?? "",
        agenteInstagram: userProf.instagram ?? "",
        agenteSitioWeb: userProf.sitio_web ?? "",
      }));
      setVarianteEspanol(
        agentProf.variante_espanol ?? detectVariante(agentProf.zona) ?? "neutro"
      );
    });
    const tipo = searchParams.get("tipoPropiedad");
    const ubicacion = searchParams.get("ubicacion");
    if (tipo && ubicacion) {
      setLoadedProperty({
        tipo,
        ubicacion,
        precio: searchParams.get("precio") ?? "",
        metros: searchParams.get("metrosCuadrados") ?? "",
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPosts([]);
    setRecomendaciones(null);
    setUnauthenticated(false);

    if (!form.tipoPropiedad || !form.ubicacion || !form.metrosCuadrados || !form.precio) {
      setError("CAMPOS_INCOMPLETOS");
      return;
    }

    startTransition(async () => {
      const result = await generarPosts({ ...form, amenities: [], variante_espanol: varianteEspanol });

      if (!result.ok) {
        if (result.error === "LIMIT_REACHED") {
          setShowUpgradeModal(true);
        } else if (result.error === "UNAUTHENTICATED") {
          setUnauthenticated(true);
        } else {
          setError(result.error);
        }
        return;
      }

      const { posts: newPosts, recomendaciones: newRecs, remaining: newRemaining, isPro: newIsPro } = result;

      if (!newIsPro && remaining === usageLimit && !hasTrackedLead.current) {
        trackEvent("Lead");
        hasTrackedLead.current = true;
      }

      setPosts(newPosts);
      setRecomendaciones(newRecs);
      if (!newIsPro) {
        setUsage({ remaining: newRemaining, count: usageLimit - newRemaining });
      }

      saveProperty({
        tipo_propiedad: form.tipoPropiedad,
        ubicacion: form.ubicacion,
        metros_cuadrados: form.metrosCuadrados,
        precio: form.precio,
        caracteristica1: form.caracteristica1,
        caracteristica2: form.caracteristica2,
        caracteristica3: form.caracteristica3,
        posts: newPosts,
        recomendaciones: newRecs,
      }).catch(() => {});
    });
  };

  const isLimitReached = !isPro && remaining === 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      {/* Indicador de uso */}
      <UsageBar checkoutUrl={checkoutUrl} className="p-4 border rounded-xl bg-card" />

      {/* Límite alcanzado */}
      {isLimitReached && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <p className="font-semibold text-amber-900 text-sm sm:text-base">
            Agotaste tus generaciones gratuitas del mes
          </p>
          <p className="text-sm text-amber-800">
            Tus {usageLimit} generaciones mensuales ya fueron utilizadas. Se renuevan
            automáticamente el 1° del próximo mes.
          </p>
          <p className="text-sm text-amber-700">
            Con el Plan PRO obtenés generaciones ilimitadas para publicar sin pausa.
          </p>
          <Button
            asChild
            className="w-full sm:w-auto sm:self-start h-11 sm:h-10 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white"
          >
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("InitiateCheckout")}
              className="flex items-center gap-2"
            >
              <SparklesIcon className="w-4 h-4" />
              Upgrade a PRO — generaciones ilimitadas
            </a>
          </Button>
        </div>
      )}

      {/* Sesión requerida */}
      {unauthenticated && (
        <div className="border border-[#0f3460]/20 bg-[#0f3460]/5 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <p className="font-semibold text-[#0f3460] text-sm sm:text-base">
            Necesitás iniciar sesión para generar posts
          </p>
          <p className="text-sm text-muted-foreground">
            Creá tu cuenta gratis y accedé a 5 generaciones mensuales.
          </p>
          <Button asChild className="w-full sm:w-auto sm:self-start h-11 sm:h-10">
            <Link href="/sign-in" className="flex items-center gap-2">
              <LogInIcon className="w-4 h-4" />
              Iniciar sesión
            </Link>
          </Button>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
        <fieldset disabled={isPending} className="contents">

          {loadedProperty ? (
            <PropertyLoadedCard
              tipo={loadedProperty.tipo}
              ubicacion={loadedProperty.ubicacion}
              precio={loadedProperty.precio}
              metros={loadedProperty.metros}
              onClear={() => router.push("/mis-propiedades")}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-10 text-center border-2 border-dashed border-[#0f3460]/15 rounded-xl bg-[#0f3460]/3">
              <div className="w-14 h-14 rounded-2xl bg-[#0f3460]/8 flex items-center justify-center">
                <BuildingIcon className="w-7 h-7 text-[#0f3460]/40" />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-[#0f3460]">Seleccioná una propiedad primero</p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Cargá tu propiedad en Mis Propiedades y generá contenido desde ahí con un clic.
                </p>
              </div>
              <Link
                href="/mis-propiedades"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0f3460] hover:bg-[#0f3460]/90 px-5 py-2.5 rounded-xl transition-colors"
              >
                Ir a Mis Propiedades →
              </Link>
            </div>
          )}

          {loadedProperty && error && error !== "CAMPOS_INCOMPLETOS" && (
            <p className="text-destructive text-sm">
              {error === "ERROR_API"
                ? "Error al conectar con la IA. Verificá tu conexión e intentá de nuevo."
                : error === "ERROR_FORMATO"
                ? "La IA devolvió una respuesta inesperada. Intentá de nuevo."
                : error === "API_KEY_FALTANTE"
                ? "Clave de API no configurada. Contactá al soporte."
                : "Ocurrió un error al generar los posts. Intentá de nuevo."}
            </p>
          )}

          {loadedProperty && (
            <VarianteEspanolSelector
              value={varianteEspanol}
              onChange={setVarianteEspanol}
              disabled={isPending}
            />
          )}

          {loadedProperty && (
            <Button
              type="submit"
              disabled={isPending || isLimitReached}
              className="w-full sm:w-auto sm:self-start h-12 sm:h-10 px-8 text-base sm:text-sm"
            >
              <ZapIcon className="w-4 h-4" />
              {isPending ? "Generando con IA..." : "Generar 5 posts"}
            </Button>
          )}

        </fieldset>
      </form>

      {/* Skeleton */}
      {isPending && <PostsSkeleton />}

      {/* Resultados */}
      {posts.length > 0 && !isPending && (
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
                Tus posts listos para publicar
              </h2>
              <Link
                href="/mis-propiedades"
                className="text-sm text-[#00d4d4] hover:text-[#00bfbf] font-medium transition-colors shrink-0"
              >
                Ver historial →
              </Link>
            </div>
            <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
          </div>
          <PostsView posts={posts} recomendaciones={recomendaciones} />
        </div>
      )}
    </div>
  );
}
