"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  MenuIcon,
  XIcon,
  Tag,
  UserCircle2,
  BarChart2,
  ChevronDown,
  Zap,
  CalendarDays,
  FileText,
  Video,
  TrendingUp,
  Megaphone,
  Images,
} from "lucide-react";

type Plan = "free" | "pro" | "pro_max";

const TOOL_ITEMS = [
  { href: "/posts",         label: "Generar Posts",    icon: Zap,          badge: null      },
  { href: "/calendario",    label: "Calendario",       icon: CalendarDays, badge: "pro"     },
  { href: "/descripcion",   label: "Portal",           icon: FileText,     badge: "pro"     },
  { href: "/reels",         label: "Guiones Reels",    icon: Video,        badge: "pro"     },
  { href: "/tendencias",    label: "Tendencias",       icon: TrendingUp,   badge: "pro"     },
  { href: "/ads-generator", label: "Generador de Ads", icon: Megaphone,    badge: "pro"     },
  { href: "/carousels",     label: "Carruseles IG",    icon: Images,       badge: "pro_max" },
] as const;

const TOOL_PATHS = TOOL_ITEMS.map((t) => t.href);

const TOP_NAV = [
  { href: "/",    label: "Dashboard",       icon: LayoutDashboard },
  { href: "/pricing",   label: "Precios y planes", icon: Tag         },
  { href: "/analytics", label: "Estadísticas",     icon: BarChart2   },
  { href: "/perfil",    label: "Mi Perfil",        icon: UserCircle2 },
];

interface MobileNavProps {
  plan: Plan;
  checkoutUrl: string;
}

export default function MobileNav({ plan, checkoutUrl }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isOnToolPage = TOOL_PATHS.some((p) =>
    pathname === p || pathname.startsWith(p + "/")
  ) || pathname === "/mis-propiedades" || pathname.startsWith("/mis-propiedades/");

  const [isToolsOpen, setIsToolsOpen] = useState(isOnToolPage);

  useEffect(() => {
    if (isOnToolPage) setIsToolsOpen(true);
  }, [isOnToolPage]);

  function toolBadge(badge: "pro" | "pro_max" | null) {
    if (!badge) return null;
    if (badge === "pro_max")
      return (
        <span className="text-[9px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 rounded px-1 py-0.5 leading-none shrink-0">
          MAX
        </span>
      );
    return (
      <span className="text-[9px] font-bold text-[#00c9c9] bg-[#00c9c9]/10 rounded px-1 py-0.5 leading-none shrink-0">
        PRO
      </span>
    );
  }

  return (
    <>
      {/* Top bar */}
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
        {/* Header */}
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

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">

          {/* Dashboard */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
              pathname === "/"
                ? "bg-[#00c9c9]/10 text-[#0f3460] font-semibold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 shrink-0 ${pathname === "/" ? "text-[#00c9c9]" : "text-slate-400"}`} />
            <span className="flex-1">Dashboard</span>
          </Link>

          {/* Mis Propiedades — colapsable */}
          <div>
            <div
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === "/mis-propiedades" || pathname.startsWith("/mis-propiedades/")
                  ? "bg-[#00c9c9]/10 text-[#0f3460] font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Link
                href="/mis-propiedades"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <Building2
                  className={`w-5 h-5 shrink-0 ${
                    pathname === "/mis-propiedades" || pathname.startsWith("/mis-propiedades/")
                      ? "text-[#00c9c9]"
                      : "text-slate-400"
                  }`}
                />
                <span className="flex-1">Mis Propiedades</span>
              </Link>
              <button
                onClick={() => setIsToolsOpen((v) => !v)}
                aria-label="Expandir herramientas"
                className="shrink-0 p-0.5 rounded hover:bg-slate-100 transition-colors"
              >
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isToolsOpen ? "rotate-0" : "-rotate-90"}`}
                />
              </button>
            </div>

            {isToolsOpen && (
              <div className="mt-0.5 ml-4 pl-3 border-l border-[#e2e8f0] space-y-0.5">
                {TOOL_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#00c9c9]/10 text-[#0f3460] font-semibold"
                          : "text-slate-500 hover:bg-slate-50 hover:text-[#0f3460]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#00c9c9]" : "text-slate-400"}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {toolBadge(item.badge)}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resto del nav */}
          {TOP_NAV.slice(1).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            const Icon = item.icon;
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
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#00c9c9]" : "text-slate-400"}`} />
                <span className="flex-1">{item.label}</span>
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
