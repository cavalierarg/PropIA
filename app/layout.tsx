import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Toaster } from "sonner";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { getUsage } from "@/lib/actions/usage.actions";
import { getAgentProfile } from "@/lib/actions/agent-profile.actions";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "PropIA — Generador de Posts Inmobiliarios",
  description: "Genera posts para Instagram, Facebook y LinkedIn en segundos con inteligencia artificial.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  let sidebarProps = null;
  if (userId) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "/";
    const skipProfileCheck = ["/perfil", "/api/", "/sign-in", "/sign-up"].some((p) =>
      pathname.startsWith(p)
    );

    const [user, plan, usage, agentProfile] = await Promise.all([
      currentUser(),
      getUserPlan(),
      getUsage(),
      skipProfileCheck ? Promise.resolve({ perfil_completado: true }) : getAgentProfile(),
    ]);

    if (!skipProfileCheck && !agentProfile.perfil_completado) {
      redirect("/perfil");
    }

    const checkoutUrl = `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? ""}?checkout[custom][user_id]=${userId}`;

    sidebarProps = {
      plan,
      firstName: user?.firstName ?? "Usuario",
      usageCount: usage.count,
      usageLimit: usage.limit,
      isPro: usage.isPro,
      checkoutUrl,
    };
  }

  return (
    <ClerkProvider>
      <html lang="es">
        <body className={`${inter.variable} antialiased`}>
          {userId && sidebarProps ? (
            <div className="flex min-h-screen bg-[#f8fafc]">
              <Sidebar {...sidebarProps} />
              <div className="flex-1 flex flex-col lg:pl-60 min-w-0">
                <MobileNav plan={sidebarProps.plan} checkoutUrl={sidebarProps.checkoutUrl} />
                <div className="flex-1">
                  {children}
                </div>
              </div>
            </div>
          ) : (
            <>
              <Navbar />
              {children}
            </>
          )}
          <Toaster richColors position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
