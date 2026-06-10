import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import PropertyForm from "@/components/PropertyForm";
import OnboardingBanner from "@/components/OnboardingBanner";
import { getOnboardingStatus } from "@/lib/actions/onboarding.actions";
import { getUsage } from "@/lib/actions/usage.actions";
import { getAgentProfile } from "@/lib/actions/agent-profile.actions";

export const maxDuration = 120;

export default async function GenerarPostsPage() {
  const { userId } = await auth();

  let showBanner = false;
  let profileComplete = true;
  if (userId) {
    const [onboarding, usage, agentProfile] = await Promise.all([
      getOnboardingStatus(),
      getUsage(),
      getAgentProfile(),
    ]);
    showBanner = onboarding.completed && usage.count === 0;
    profileComplete = !!agentProfile.perfil_completado;
  }

  return (
    <main className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
      {showBanner && <OnboardingBanner />}

      {!profileComplete && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-700 flex-1">
            Completá tu perfil para que la IA personalice el contenido con tu nombre, zona y datos de contacto.
          </p>
          <Link href="/perfil" className="text-xs font-bold text-amber-700 hover:underline shrink-0">
            Ir a Perfil →
          </Link>
        </div>
      )}

      <section className="flex flex-col gap-2 sm:gap-3">
        <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl lg:text-4xl leading-tight">
          Generador de Posts Inmobiliarios
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg max-w-2xl">
          Seleccioná una propiedad desde Mis Propiedades y generá 5 posts listos para Instagram, Facebook y LinkedIn.
        </p>
        <div className="h-1 w-16 bg-[#00c9c9] rounded-full sm:w-20" />
      </section>

      <Suspense fallback={null}>
        <PropertyForm />
      </Suspense>
    </main>
  );
}
