"use client";

import { Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/meta-pixel";

interface UpgradeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function UpgradeLink({ href, children, className }: UpgradeLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvent("InitiateCheckout")}
    >
      {children}
    </a>
  );
}

export function UpgradeButton({ href, className }: { href: string; className?: string }) {
  return (
    <UpgradeLink
      href={href}
      className={`inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors ${className ?? ""}`}
    >
      <Sparkles className="w-3.5 h-3.5" />
      Alcanzaste el límite · Upgrade a PRO
    </UpgradeLink>
  );
}
