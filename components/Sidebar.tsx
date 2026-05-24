"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
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
  Tag,
  UserCircle2,
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
  { href: "/ads-generator", label: "Generador de Ads", icon: Layers, requiredPlan: "pro" as Plan },
  { href: "/pricing", label: "Precios y planes", icon: Tag },
  { href: "/perfil", label: "Mi Perfil", icon: UserCircle2 },
];

interface SidebarProps {
  plan: Plan;
  firstName: string;
  usageCount: number;
  usageLimit: number;
  isPro: boolean;
  checkoutUrl: string;
}

export default function Sidebar({ plan, firstName, usageCount, usageLimit, isPro, checkoutUrl }: SidebarProps) {
  const pathname = usePathname();
  const hasUnlimitedGenerations = plan === "pro" || plan === "pro_max";
  const progressPercent = hasUnlimitedGenerations
    ? 100
    : usageLimit > 0 ? Math.min(100, Math.round((usageCount / usageLimit) * 100)) : 0;

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
      <div className="px-4 py-3.5 border-b border-[#e2e8f0] flex items-center gap-3 shrink-0">
        <UserButton />
        <div className="min-w-0 flex flex-col gap-1">
          <p className="text-sm font-semibold text-[#0f3460] truncate leading-none">{firstName}</p>
          {planBadge}
        </div>
      </div>

      {/* Navigation */}
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#00c9c9]/10 text-[#0f3460] font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#0f3460]"
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive ? "text-[#00c9c9]" : "text-slate-400"
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {isLockedProMax && (
                <span className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded shrink-0">
                  MAX
                </span>
              )}
              {isLockedPro && (
                <span className="text-[10px] font-bold text-[#00c9c9] bg-[#00c9c9]/10 px-1.5 py-0.5 rounded shrink-0">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Usage + Upgrade */}
      <div className="px-4 py-4 border-t border-[#e2e8f0] shrink-0">
        {!hasUnlimitedGenerations ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-slate-500 font-medium">Generaciones este mes</span>
              <span className="text-xs font-bold text-[#0f3460]">
                {usageCount}/{usageLimit}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background:
                    progressPercent >= 80
                      ? "#ef4444"
                      : "linear-gradient(90deg, #0f3460, #00c9c9)",
                }}
              />
            </div>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
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
    </aside>
  );
}
