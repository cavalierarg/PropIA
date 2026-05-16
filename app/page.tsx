import PropertyForm from "@/components/PropertyForm";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 py-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Generador de Posts Inmobiliarios</h1>
        <p className="text-muted-foreground text-lg">
          Completá los datos de la propiedad y generá 5 posts listos para Instagram, Facebook y LinkedIn.
        </p>
      </section>

      <PropertyForm />
    </main>
  );
}
