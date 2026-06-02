import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProperties } from "@/lib/actions/properties.actions";
import MisPropiedadesList from "@/components/MisPropiedadesList";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Mis Propiedades — PropIA" };

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
              Tu biblioteca de propiedades. Cargalas una vez y reutilizalas en cualquier herramienta con un clic.
            </p>
          </div>
        </div>
        <div className="h-1 w-16 bg-[#00c9c9] rounded-full sm:w-20" />
      </section>

      <MisPropiedadesList initialProperties={properties} />

    </main>
  );
}
