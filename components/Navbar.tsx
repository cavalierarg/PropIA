"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { SparklesIcon, MenuIcon, XIcon } from "lucide-react";

const NAV_LINKS = [
  { href: "/posts", label: "Generador" },
  { href: "/calendario", label: "Calendario" },
  { href: "/descripcion", label: "Descripción" },
  { href: "/reels", label: "Reels" },
  { href: "/tendencias", label: "Tendencias" },
  { href: "/ads-generator", label: "Ads Generator" },
  { href: "/mis-propiedades", label: "Mis propiedades" },
];

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const [plan, setPlan] = useState<"free" | "pro" | "pro_max">("free");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      getUserPlan().then(setPlan);
    }
  }, [isSignedIn]);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  return (
    <header className="w-full sticky top-0 z-50 bg-[#0f3460] shadow-md border-b border-[#00c9c9]/20">
      <div className="flex justify-between items-center px-4 sm:px-6 gap-3 h-14 sm:h-16 max-w-7xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 min-w-0 shrink-0" onClick={() => setMenuOpen(false)}>
          <Image
            src="/logo.png"
            alt="PropIA logo"
            width={32}
            height={32}
            className="rounded-full shrink-0 sm:w-[38px] sm:h-[38px]"
            priority
          />
          <span className="text-lg font-bold text-white tracking-tight sm:text-xl">
            Prop<span className="text-[#00c9c9]">IA</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden sm:flex items-center gap-1 shrink-0">
          <Link
            href="/pricing"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/8"
          >
            Precios
          </Link>

          {isSignedIn && (
            <>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/8"
                >
                  {link.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* ── Desktop right side ── */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {isSignedIn ? (
            <>
              {plan === "pro_max" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/35 rounded-full px-3 py-1">
                  <SparklesIcon className="w-3 h-3" />
                  PRO MAX
                </span>
              ) : plan === "pro" ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#00c9c9]/15 text-[#00c9c9] border border-[#00c9c9]/35 rounded-full px-3 py-1">
                  <SparklesIcon className="w-3 h-3" />
                  PRO
                </span>
              ) : (
                <>
                  <span className="text-xs font-medium text-white/45 border border-white/15 rounded-full px-2.5 py-1">
                    Plan Free
                  </span>
                  <Button
                    asChild
                    size="sm"
                    className="bg-[#00c9c9] text-[#0f3460] font-semibold hover:bg-[#00b3b3] border-0 shadow-sm h-8 px-3 text-xs"
                  >
                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Upgrade a PRO
                    </a>
                  </Button>
                </>
              )}
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/pricing"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors px-2 hidden sm:block"
              >
                Precios
              </Link>
              <SignInButton>
                <Button className="bg-[#00c9c9] text-[#0f3460] font-semibold hover:bg-[#00b3b3] border-0 shadow-sm h-9 px-4 text-sm">
                  Iniciar sesión
                </Button>
              </SignInButton>
            </>
          )}
        </div>

        {/* ── Mobile right side ── */}
        <div className="flex sm:hidden items-center gap-2">
          {isSignedIn && <UserButton />}
          {!isSignedIn && (
            <SignInButton>
              <Button className="bg-[#00c9c9] text-[#0f3460] font-semibold hover:bg-[#00b3b3] border-0 shadow-sm h-9 px-3 text-sm">
                Iniciar sesión
              </Button>
            </SignInButton>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {menuOpen && (
        <div className="sm:hidden bg-[#0f3460] border-t border-[#00c9c9]/15 px-4 py-3 flex flex-col gap-0.5">
          <Link
            href="/pricing"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-medium text-white/75 hover:text-white py-2.5 border-b border-white/8 transition-colors"
          >
            Precios
          </Link>

          {isSignedIn && (
            <>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-white/75 hover:text-white py-2.5 border-b border-white/8 transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {/* Plan badge en mobile */}
              <div className="pt-3 pb-1">
                {plan === "pro_max" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/35 rounded-full px-3 py-1.5">
                    <SparklesIcon className="w-3 h-3" />
                    Plan PRO MAX activo
                  </span>
                ) : plan === "pro" ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#00c9c9]/15 text-[#00c9c9] border border-[#00c9c9]/35 rounded-full px-3 py-1.5">
                    <SparklesIcon className="w-3 h-3" />
                    Plan PRO activo
                  </span>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-white/40">
                      Estás en el Plan Free
                    </span>
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 bg-[#00c9c9] text-[#0f3460] font-bold rounded-xl py-2.5 text-sm hover:bg-[#00b3b3] transition-colors"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      Upgrade a PRO
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
