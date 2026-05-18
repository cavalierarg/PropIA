import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProperties } from "@/lib/actions/properties.actions";
import Link from "next/link";
import { ArrowRightIcon, BuildingIcon, CalendarIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function MisPropiedadesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const properties = await getUserProperties();

  return (
    <main className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
      <section className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl lg:text-4xl leading-tight">
              Mis Propiedades
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg max-w-2xl">
              Historial de propiedades con los posts generados por IA.
            </p>
          </div>
          <Button asChild className="shrink-0 h-10 px-4 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white hidden sm:flex items-center gap-2">
            <Link href="/">
              <PlusIcon className="w-4 h-4" />
              Nueva propiedad
            </Link>
          </Button>
        </div>
        <div className="h-1 w-16 bg-[#00d4d4] rounded-full sm:w-20" />
      </section>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0f3460]/5 flex items-center justify-center">
            <BuildingIcon className="w-8 h-8 text-[#0f3460]/40" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-[#0f3460] text-lg">Todavía no generaste propiedades</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Cuando generes posts para una propiedad, aparecerá acá para que puedas revisarlos cuando quieras.
            </p>
          </div>
          <Button asChild className="bg-[#0f3460] hover:bg-[#0f3460]/90 text-white">
            <Link href="/" className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Generar primera propiedad
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {properties.map((property) => {
            const caracteristicas = [
              property.caracteristica1,
              property.caracteristica2,
              property.caracteristica3,
            ].filter(Boolean);

            return (
              <Link
                key={property.id}
                href={`/mis-propiedades/${property.id}`}
                className="group flex flex-col gap-0 border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#00d4d4]/40 transition-all duration-200"
              >
                {/* Header */}
                <div className="bg-[#0f3460] px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white truncate">
                    {property.tipo_propiedad}
                  </span>
                  <span className="text-xs text-[#00d4d4] font-medium shrink-0">
                    {property.posts.length} posts
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3 bg-card flex-1">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-[#0f3460] leading-tight">
                      {property.ubicacion}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {property.precio} · {property.metros_cuadrados} m²
                    </p>
                  </div>

                  {caracteristicas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {caracteristicas.map((c, i) => (
                        <span
                          key={i}
                          className="text-xs bg-[#00d4d4]/10 text-[#0f3460] rounded-full px-2 py-0.5"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {property.posts[0]?.contenido.slice(0, 100)}...
                  </p>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-[#0f3460]/5 bg-card flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {formatDate(property.created_at)}
                  </div>
                  <span className="text-xs font-medium text-[#0f3460] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver posts
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Mobile CTA */}
      {properties.length > 0 && (
        <Button asChild className="sm:hidden w-full h-12 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white">
          <Link href="/" className="flex items-center justify-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Nueva propiedad
          </Link>
        </Button>
      )}
    </main>
  );
}
