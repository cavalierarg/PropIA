import { auth } from "@clerk/nextjs/server";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { CheckIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SubscriptionPage() {
  const { userId } = await auth();
  const plan = userId ? await getUserPlan() : "free";
  const isPro = plan === "pro";

  return (
    <main className="flex flex-col gap-8 py-8 sm:py-12 max-w-4xl mx-auto px-4">
      <section className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold text-[#0f3460] sm:text-3xl">Planes de PropIA</h1>
        <p className="text-muted-foreground">Elegí el plan que se adapta a vos</p>
        <div className="h-1 w-16 bg-[#00d4d4] rounded-full mx-auto" />
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
        {/* Plan Free */}
        <div className="border rounded-2xl p-6 flex flex-col gap-5 bg-card">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <ZapIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-lg">Free</span>
              {!isPro && (
                <span className="ml-auto text-xs bg-[#0f3460]/10 text-[#0f3460] rounded-full px-2 py-0.5 font-medium">
                  Tu plan actual
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-[#0f3460]">
              $0 <span className="text-base font-normal text-muted-foreground">/ mes</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#00d4d4]" />
              10 generaciones por mes
            </li>
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#00d4d4]" />
              5 posts por generación (Instagram, Facebook, LinkedIn)
            </li>
            <li className="flex items-start gap-2 text-muted-foreground">
              <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#00d4d4]" />
              Recomendaciones de efectividad
            </li>
          </ul>
          <div className="mt-auto">
            <Button variant="outline" className="w-full" disabled>
              Plan actual
            </Button>
          </div>
        </div>

        {/* Plan PRO */}
        <div className="border-2 border-[#00d4d4] rounded-2xl p-6 flex flex-col gap-5 bg-card relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#00d4d4] text-[#0f3460] text-xs font-bold px-3 py-1 rounded-full">
              RECOMENDADO
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[#00d4d4]" />
              <span className="font-semibold text-lg">PRO</span>
              {isPro && (
                <span className="ml-auto text-xs bg-[#00d4d4]/10 text-[#0f3460] border border-[#00d4d4]/30 rounded-full px-2 py-0.5 font-semibold">
                  Tu plan actual
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-[#0f3460]">
              Pago único <span className="text-base font-normal text-muted-foreground">para siempre</span>
            </p>
          </div>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#00d4d4]" />
              <span className="font-semibold">Generaciones ilimitadas</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#00d4d4]" />
              5 posts por generación (Instagram, Facebook, LinkedIn)
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#00d4d4]" />
              Recomendaciones de efectividad
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 mt-0.5 shrink-0 text-[#00d4d4]" />
              Sin límites mensuales nunca más
            </li>
          </ul>
          <div className="mt-auto">
            {isPro ? (
              <Button className="w-full bg-[#0f3460] hover:bg-[#0f3460]/90 text-white" disabled>
                <SparklesIcon className="w-4 h-4 mr-2" />
                Ya sos PRO
              </Button>
            ) : (
              <CheckoutButton userId={userId} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function CheckoutButton({ userId }: { userId: string | null }) {
  const checkoutUrl = userId
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][user_id]=${userId}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  return (
    <Button
      asChild
      className="w-full bg-[#0f3460] hover:bg-[#0f3460]/90 text-white"
    >
      <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
        <SparklesIcon className="w-4 h-4" />
        Obtener Plan PRO
      </a>
    </Button>
  );
}
