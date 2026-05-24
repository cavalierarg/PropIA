import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAgentProfile } from "@/lib/actions/agent-profile.actions";
import { getAgentLogoUrl } from "@/lib/actions/agent-logo.actions";
import PerfilForm from "@/components/PerfilForm";
import { UserCircle2Icon } from "lucide-react";

export const metadata = { title: "Mi Perfil — PropIA" };

export default async function PerfilPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, profile, logoUrl] = await Promise.all([
    currentUser(),
    getAgentProfile(),
    getAgentLogoUrl(),
  ]);

  const initialData = {
    ...profile,
    logo_url: profile.logo_url ?? logoUrl ?? undefined,
    email: profile.email ?? user?.emailAddresses[0]?.emailAddress ?? "",
    nombre_completo:
      profile.nombre_completo ??
      `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
  };

  return (
    <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-8 pb-16">
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f3460]/10 flex items-center justify-center shrink-0">
            <UserCircle2Icon className="w-5 h-5 text-[#0f3460]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl">
            Mi Perfil de Marca
          </h1>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
          Completá tu perfil una sola vez. Tus datos se cargarán automáticamente
          en todos los generadores — no tenés que completarlos cada vez.
        </p>
        <div className="h-1 w-16 bg-[#00c9c9] rounded-full" />
      </section>

      <PerfilForm initialData={initialData} />
    </main>
  );
}
