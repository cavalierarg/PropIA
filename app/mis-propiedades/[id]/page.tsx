import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getProperty } from "@/lib/actions/properties.actions";
import PostsView from "@/components/PostsView";
import Link from "next/link";
import { ArrowLeftIcon, RefreshCwIcon, CalendarIcon, MapPinIcon, RulerIcon, TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostResult, RecomendacionesResult } from "@/lib/actions/posts.actions";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildRegenerateUrl(property: {
  tipo_propiedad: string;
  ubicacion: string;
  metros_cuadrados: string;
  precio: string;
  caracteristica1: string;
  caracteristica2: string;
  caracteristica3: string;
}) {
  const params = new URLSearchParams({
    tipoPropiedad: property.tipo_propiedad,
    ubicacion: property.ubicacion,
    metrosCuadrados: property.metros_cuadrados,
    precio: property.precio,
    caracteristica1: property.caracteristica1 ?? "",
    caracteristica2: property.caracteristica2 ?? "",
    caracteristica3: property.caracteristica3 ?? "",
  });
  return `/posts?${params.toString()}`;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const regenerateUrl = buildRegenerateUrl(property);
  const caracteristicas = [
    property.caracteristica1,
    property.caracteristica2,
    property.caracteristica3,
  ].filter(Boolean);

  return (
    <main className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
      {/* Navegación */}
      <div className="flex items-center gap-3">
        <Link
          href="/mis-propiedades"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#0f3460] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Mis Propiedades
        </Link>
      </div>

      {/* Encabezado de la propiedad */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold bg-[#0f3460] text-white rounded-full px-3 py-1">
                {property.tipo_propiedad}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl leading-tight">
              {property.ubicacion}
            </h1>
          </div>
          <Button
            asChild
            className="w-full sm:w-auto shrink-0 h-11 sm:h-10 bg-[#00d4d4] hover:bg-[#00bfbf] text-[#0f3460] font-semibold"
          >
            <Link href={regenerateUrl} className="flex items-center justify-center gap-2">
              <RefreshCwIcon className="w-4 h-4" />
              Regenerar posts
            </Link>
          </Button>
        </div>
        <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
      </section>

      {/* Datos de la propiedad */}
      <div className="border border-[#0f3460]/10 rounded-xl p-4 sm:p-5 bg-card flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-start gap-2">
            <TagIcon className="w-4 h-4 text-[#00d4d4] mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Precio</span>
              <span className="text-sm font-semibold text-[#0f3460]">{property.precio}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <RulerIcon className="w-4 h-4 text-[#00d4d4] mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Superficie</span>
              <span className="text-sm font-semibold text-[#0f3460]">{property.metros_cuadrados} m²</span>
            </div>
          </div>
          <div className="flex items-start gap-2 col-span-2 sm:col-span-1">
            <CalendarIcon className="w-4 h-4 text-[#00d4d4] mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Generado</span>
              <span className="text-sm font-semibold text-[#0f3460]">{formatDate(property.created_at)}</span>
            </div>
          </div>
        </div>

        {caracteristicas.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">Características</span>
            <div className="flex flex-wrap gap-2">
              {caracteristicas.map((c, i) => (
                <span
                  key={i}
                  className="text-sm bg-[#00d4d4]/10 text-[#0f3460] border border-[#00d4d4]/20 rounded-full px-3 py-1"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts */}
      <section className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-[#0f3460] sm:text-2xl">
            Posts generados
          </h2>
          <div className="h-1 w-16 bg-[#00d4d4] rounded-full" />
        </div>
        <PostsView
          posts={property.posts as PostResult[]}
          recomendaciones={property.recomendaciones as RecomendacionesResult | null}
        />
      </section>

      {/* CTA inferior */}
      <div className="flex justify-center pt-2">
        <Button
          asChild
          className="h-11 px-6 bg-[#00d4d4] hover:bg-[#00bfbf] text-[#0f3460] font-semibold"
        >
          <Link href={regenerateUrl} className="flex items-center gap-2">
            <RefreshCwIcon className="w-4 h-4" />
            Regenerar con nuevos datos
          </Link>
        </Button>
      </div>
    </main>
  );
}
