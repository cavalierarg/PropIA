import { Suspense } from "react";
import PropertyForm from "@/components/PropertyForm";

export default function GenerarPostsPage() {
  return (
    <main className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
      <section className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl lg:text-4xl leading-tight">
          Generador de Posts Inmobiliarios
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg max-w-2xl">
          Completá los datos de la propiedad y generá 5 posts listos para Instagram, Facebook y LinkedIn.
        </p>
        <div className="h-1 w-16 bg-[#00c9c9] rounded-full sm:w-20" />
      </section>

      <Suspense fallback={null}>
        <PropertyForm />
      </Suspense>
    </main>
  );
}
