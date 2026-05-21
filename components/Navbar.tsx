"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserPlan } from "@/lib/actions/subscription.actions";
import { SparklesIcon, MenuIcon, XIcon } from "lucide-react";

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const [isPro, setIsPro] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      getUserPlan().then((plan) => setIsPro(plan === "pro"));
    }
  }, [isSignedIn]);

  const checkoutUrl = user
    ? `${process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
    : (process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "#");

  return (
    <header className="w-full sticky top-0 z-50 bg-[#0f3460] shadow-md border-b border-[#00d4d4]/20">
      <div className="flex justify-between items-center px-4 sm:px-6 gap-3 h-14 sm:h-16 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 min-w-0" onClick={() => setMenuOpen(false)}>
          <Image
            src="/logo.png.png"
            alt="PropIA logo"
            width={32}
            height={32}
            className="rounded-full shrink-0 sm:w-[38px] sm:h-[38px]"
            priority
          />
          <span className="text-lg font-bold text-white tracking-tight sm:text-xl">
            Prop<span className="text-[#00d4d4]">IA</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link href="/pricing" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors px-2">
            Precios
          </Link>
          {isSignedIn ? (
            <>
              <Link href="/mis-propiedades" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors px-2">
                Mis propiedades
              </Link>
              <Link href="/calendario" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors px-2">
                Calendario
              </Link>
              <Link href="/descripcion" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors px-2">
                Descripción
              </Link>
              <Link href="/reels" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors px-2">
                Reels
              </Link>
              <Link href="/tendencias" className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors px-2">
                Tendencias
              </Link>
              {isPro ? (
                <span className="text-xs font-semibold bg-[#00d4d4]/20 text-[#00d4d4] border border-[#00d4d4]/40 rounded-full px-2.5 py-1 inline-flex items-center gap-1">
                  <SparklesIcon className="w-3 h-3" />
                  PRO
                </span>
              ) : (
                <Button asChild size="sm" className="bg-[#00d4d4] text-[#0f3460] font-semibold hover:bg-[#00bfbf] border-0 shadow-sm h-9 px-3 text-sm flex items-center gap-1.5">
                  <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Upgrade a PRO
                  </a>
                </Button>
              )}
              <UserButton />
            </>
          ) : (
            <SignInButton>
              <Button className="bg-[#00d4d4] text-[#0f3460] font-semibold hover:bg-[#00bfbf] border-0 shadow-sm h-10 px-4 text-sm">
                Iniciar sesión
              </Button>
            </SignInButton>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex sm:hidden items-center gap-2">
          {isSignedIn && <UserButton />}
          {!isSignedIn && (
            <SignInButton>
              <Button className="bg-[#00d4d4] text-[#0f3460] font-semibold hover:bg-[#00bfbf] border-0 shadow-sm h-9 px-3 text-sm">
                Iniciar sesión
              </Button>
            </SignInButton>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Menú"
          >
            {menuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden bg-[#0f3460] border-t border-[#00d4d4]/20 px-4 py-3 flex flex-col gap-1">
          <Link href="/pricing" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/80 hover:text-white py-2.5 border-b border-white/10 transition-colors">
            Precios
          </Link>
          {isSignedIn && (
            <>
              <Link href="/posts" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/80 hover:text-white py-2.5 border-b border-white/10 transition-colors">
                Generador de Posts
              </Link>
              <Link href="/mis-propiedades" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/80 hover:text-white py-2.5 border-b border-white/10 transition-colors">
                Mis propiedades
              </Link>
              <Link href="/calendario" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/80 hover:text-white py-2.5 border-b border-white/10 transition-colors">
                Calendario de Contenido
              </Link>
              <Link href="/descripcion" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/80 hover:text-white py-2.5 border-b border-white/10 transition-colors">
                Descripción para Portal
              </Link>
              <Link href="/reels" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/80 hover:text-white py-2.5 border-b border-white/10 transition-colors">
                Guion para Reels
              </Link>
              <Link href="/tendencias" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-white/80 hover:text-white py-2.5 border-b border-white/10 transition-colors">
                Tendencias del Mercado
              </Link>
              {!isPro && (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 flex items-center justify-center gap-1.5 bg-[#00d4d4] text-[#0f3460] font-semibold rounded-md py-2.5 text-sm hover:bg-[#00bfbf] transition-colors"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Upgrade a PRO
                </a>
              )}
              {isPro && (
                <span className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold bg-[#00d4d4]/20 text-[#00d4d4] border border-[#00d4d4]/40 rounded-full px-2.5 py-2">
                  <SparklesIcon className="w-3 h-3" />
                  Plan PRO activo
                </span>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
