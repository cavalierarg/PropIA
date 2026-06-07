"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
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
import { trackEvent } from "@/lib/meta-pixel";
import TutorialButton from "@/components/TutorialButton";
import { useUsage } from "@/lib/context/usage-context";
import UsageBar from "@/components/UsageBar";

type Plan = "free" | "pro" | "pro_max";

const TOOL_ITEMS = [
  { href: "/posts",         label: "Generar Posts",    icon: Zap,          badge: null       },
  { href: "/calendario",    label: "Calendario",       icon: CalendarDays, badge: "pro"      },
  { href: "/descripcion",   label: "Portal",           icon: FileText,     badge: "pro"      },
  { href: "/reels",         label: "Guiones Reels",    icon: Video,        badge: "pro"      },
  { href: "/tendencias",    label: "Tendencias",       icon: TrendingUp,   badge: "pro"      },
  { href: "/ads-generator", label: "Generador de Ads", icon: Megaphone,    badge: "pro"      },
  { href: "/carousels",     label: "Carruseles IG",    icon: Images,       badge: "pro_max"  },
] as const;

const TOOL_PATHS = TOOL_ITEMS.map((t) => t.href);

const TOP_NAV = [
  { href: "/",                label: "Dashboard",       icon: LayoutDashboard },
  { href: "/mis-propiedades", label: "Mis Propiedades", icon: Building2       },
];
const BOTTOM_NAV = [
  { href: "/pricing",    label: "Precios y planes", icon: Tag        },
  { href: "/analytics",  label: "Estadísticas",     icon: BarChart2  },
  { href: "/perfil",     label: "Mi Perfil",        icon: UserCircle2},
];

interface SidebarProps {
  plan: Plan;
  firstName: string;
  checkoutUrl: string;
}

export default function Sidebar({ plan, firstName, checkoutUrl }: SidebarProps) {
  const pathname = usePathname();

  const isOnToolPage = TOOL_PATHS.some((p) =>
    pathname === p || pathname.startsWith(p + "/")
  ) || pathname === "/mis-propiedades" || pathname.startsWith("/mis-propiedades/");

  const [isToolsOpen, setIsToolsOpen] = useState(isOnToolPage);

  useEffect(() => {
    if (isOnToolPage) setIsToolsOpen(true);
  }, [isOnToolPage]);

  const hasUnlimitedGenerations = plan === "pro" || plan === "pro_max";

  const planBadge =
    plan === "pro_max" ? (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 rounded-full px-2 py-0.5">
        <Sparkles className="w-2.5 h-2.5" /> PRO MAX
      </span>
    ) : plan === "pro" ? (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#00c9c9]/15 text-[#00c9c9] border border-[#00c9c9]/30 rounded-full px-2 py-0.5">
        <Sparkles className="w-2.5 h-2.5" /> PRO
      </span>
    ) : (
      <span className="text-[10px] font-medium text-slate-400 border border-[#e2e8f0] rounded-full px-2 py-0.5">
        Free
      </span>
    );

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
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen bg-white border-r border-[#e2e8f0] fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 h-16 flex items-center border-b border-[#e2e8f0] shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="PropIA" width={32} height={32} className="rounded-full" priority />
          <span className="text-lg font-bold text-[#0f3460] tracking-tight">
            Prop<span className="text-[#00c9c9]">IA</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div id="sidebar-plan-badge" className="px-4 py-3.5 border-b border-[#e2e8f0] flex items-center gap-3 shrink-0">
        <UserButton />
        <div className="min-w-0 flex flex-col gap-1">
          <p className="text-sm font-semibold text-[#0f3460] truncate leading-none">{firstName}</p>
          {planBadge}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">

        {/* Dashboard */}
        {TOP_NAV.slice(0, 1).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#00c9c9]/10 text-[#0f3460] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0f3460]"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-[#00c9c9]" : "text-slate-400"}`} />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Mis Propiedades — colapsable */}
        <div>
          <div
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              pathname === "/mis-propiedades" || pathname.startsWith("/mis-propiedades/")
                ? "bg-[#00c9c9]/10 text-[#0f3460] font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-[#0f3460]"
            }`}
          >
            <Link
              href="/mis-propiedades"
              id="nav-mis-propiedades"
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <Building2
                className={`w-[18px] h-[18px] shrink-0 ${
                  pathname === "/mis-propiedades" || pathname.startsWith("/mis-propiedades/")
                    ? "text-[#00c9c9]"
                    : "text-slate-400"
                }`}
              />
              <span className="flex-1 truncate">Mis Propiedades</span>
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

          {/* Sub-items */}
          {isToolsOpen && (
            <div className="mt-0.5 ml-4 pl-3 border-l border-[#e2e8f0] space-y-0.5">
              {TOOL_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
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

        {/* Bottom nav items */}
        {BOTTOM_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              id={item.href === "/perfil" ? "nav-perfil" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#00c9c9]/10 text-[#0f3460] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0f3460]"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-[#00c9c9]" : "text-slate-400"}`} />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}

      </nav>

      {/* Usage + Upgrade */}
      <div className="px-4 py-4 border-t border-[#e2e8f0] shrink-0">
        {!hasUnlimitedGenerations ? (
          <>
            <UsageBar className="mb-3" />
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("InitiateCheckout")}
              className="flex items-center justify-center gap-1.5 w-full bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-bold text-xs py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade a PRO
            </a>
          </>
        ) : (
          <p className="text-xs text-center text-slate-400">
            {plan === "pro_max" ? "Plan PRO MAX — todo incluido" : "Generaciones ilimitadas"}
          </p>
        )}
      </div>

      {/* Tutorial button */}
      <div className="px-4 py-3 border-t border-[#e2e8f0] flex justify-center shrink-0">
        <TutorialButton />
      </div>
    </aside>
  );
}
