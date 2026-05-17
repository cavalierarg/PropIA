import PropertyForm from "@/components/PropertyForm";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 py-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-[#0f3460]">
          Generador de Posts Inmobiliarios
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Completá los datos de la propiedad y generá 5 posts listos para Instagram, Facebook y LinkedIn.
        </p>
        <div className="h-1 w-20 bg-[#00d4d4] rounded-full" />
      </section>

      <PropertyForm />
    </main>
  );
}
