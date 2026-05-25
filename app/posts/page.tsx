import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import PropertyForm from "@/components/PropertyForm";
import OnboardingBanner from "@/components/OnboardingBanner";
import { getOnboardingStatus } from "@/lib/actions/onboarding.actions";
import { getUsage } from "@/lib/actions/usage.actions";

export default async function GenerarPostsPage() {
  const { userId } = await auth();

  let showBanner = false;
  if (userId) {
    const [onboarding, usage] = await Promise.all([
      getOnboardingStatus(),
      getUsage(),
    ]);
    showBanner = onboarding.completed && usage.count === 0;
  }

  return (
    <main className="flex flex-col gap-6 py-6 sm:gap-8 sm:py-8">
      {showBanner && <OnboardingBanner />}

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
