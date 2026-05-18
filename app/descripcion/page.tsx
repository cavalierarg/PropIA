import DescripcionContent from "@/components/DescripcionContent";

export default function DescripcionPage() {
  return (
    <main className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
      <section className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl lg:text-4xl leading-tight">
          Descripción para Portal
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg max-w-2xl">
          Texto profesional optimizado para Idealista, Zonaprop, Fotocasa y MercadoLibre. Más técnico y detallado que los posts de redes sociales.
        </p>
        <div className="h-1 w-16 bg-[#00d4d4] rounded-full sm:w-20" />
      </section>

      <DescripcionContent />
    </main>
  );
}
