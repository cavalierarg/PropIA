import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const CHECKOUT_PRO =
  "https://propia.lemonsqueezy.com/checkout/buy/4c8591f9-a016-4222-a838-7cf935c84ed2";
const CHECKOUT_PRO_MAX =
  "https://propia.lemonsqueezy.com/checkout/buy/999a3318-b1c8-40d1-a379-2039fe777b1d";

export default async function CheckoutRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { userId } = await auth();
  const { plan } = await searchParams;

  if (!userId) {
    const self = `/checkout-redirect${plan ? `?plan=${plan}` : ""}`;
    redirect(`/sign-in?redirect_url=${encodeURIComponent(self)}`);
  }

  const isProMax = plan === "pro_max";
  const base = isProMax ? CHECKOUT_PRO_MAX : CHECKOUT_PRO;
  const planParam = isProMax ? "pro_max" : "pro";

  const url = `${base}?checkout[custom][plan]=${planParam}&checkout[custom][user_id]=${userId}`;
  redirect(url);
}
