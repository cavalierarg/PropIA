"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import {
  FileText,
  CalendarDays,
  Home,
  Video,
  TrendingUp,
  Layers,
  LayoutDashboard,
  Building2,
  Sparkles,
  MenuIcon,
  XIcon,
} from "lucide-react";

type Plan = "free" | "pro" | "pro_max";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/posts", label: "Generar Posts", icon: FileText },
  { href: "/mis-propiedades", label: "Mis Propiedades", icon: Building2 },
  { href: "/calendario", label: "Calendario", icon: CalendarDays, requiredPlan: "pro" as Plan },
  { href: "/descripcion", label: "Portal Inmobiliario", icon: Home, requiredPlan: "pro" as Plan },
  { href: "/reels", label: "Guiones Reels", icon: Video, requiredPlan: "pro" as Plan },
  { href: "/tendencias", label: "Tendencias", icon: TrendingUp, requiredPlan: "pro" as Plan },
  { href: "/ads-generator", label: "Generador de Ads", icon: Layers, requiredPlan: "pro_max" as Plan },
];

interface MobileNavProps {
  plan: Plan;
  checkoutUrl: string;
}

export default function MobileNav({ plan, checkoutUrl }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top bar — only visible on mobile/tablet */}
      <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 bg-white border-b border-[#e2e8f0] shrink-0">
        <button
          onClick={() => setOpen(true)}
          className="text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="PropIA" width={28} height={28} className="rounded-full" />
          <span className="text-base font-bold text-[#0f3460] tracking-tight">
            Prop<span className="text-[#00c9c9]">IA</span>
          </span>
        </Link>

        <UserButton />
      </header>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#e2e8f0] shrink-0">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Image src="/logo.png" alt="PropIA" width={28} height={28} className="rounded-full" />
            <span className="text-base font-bold text-[#0f3460] tracking-tight">
              Prop<span className="text-[#00c9c9]">IA</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-500 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const isLockedPro = item.requiredPlan === "pro" && plan === "free";
            const isLockedProMax = item.requiredPlan === "pro_max" && plan !== "pro_max";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#00c9c9]/10 text-[#0f3460] font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? "text-[#00c9c9]" : "text-slate-400"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {isLockedProMax && (
                  <span className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded">
                    MAX
                  </span>
                )}
                {isLockedPro && (
                  <span className="text-[10px] font-bold text-[#00c9c9] bg-[#00c9c9]/10 px-1.5 py-0.5 rounded">
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom plan action */}
        <div className="px-4 py-4 border-t border-[#e2e8f0] shrink-0">
          {plan === "free" ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-bold text-sm py-3 rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade a PRO
            </a>
          ) : plan === "pro" ? (
            <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#00c9c9]">
              <Sparkles className="w-4 h-4" /> Plan PRO activo
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#f59e0b]">
              <Sparkles className="w-4 h-4" /> Plan PRO MAX activo
            </div>
          )}
        </div>
      </div>
    </>
  );
}
