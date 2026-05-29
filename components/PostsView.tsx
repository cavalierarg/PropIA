"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { PostResult, RecomendacionesResult } from "@/lib/actions/posts.actions";

const COLORES_RED: Record<string, string> = {
  Instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  Facebook: "bg-blue-600 text-white",
  LinkedIn: "bg-sky-700 text-white",
};

const BADGE_CONFIG = {
  mayor_engagement: {
    emoji: "⭐",
    label: "Recomendado para más engagement",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  mayor_consultas: {
    emoji: "🎯",
    label: "Recomendado para más consultas",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  inversores: {
    emoji: "💼",
    label: "Recomendado para inversores",
    className: "bg-[#0f3460]/5 text-[#0f3460] border-[#0f3460]/20",
  },
} as const;

interface PostsViewProps {
  posts: PostResult[];
  recomendaciones: RecomendacionesResult | null;
}

export default function PostsView({ posts, recomendaciones }: PostsViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleDownload = () => {
    const content = posts
      .map((post, i) => `=== ${post.red} — Post ${i + 1} ===\n\n${post.contenido}`)
      .join("\n\n---\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "posts-inmobiliarios.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Posts descargados");
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copiado al portapapeles");
  };

  type BadgeItem = { emoji: string; label: string; razon: string; className: string };
  const recsBadges: Record<number, BadgeItem[]> = {};
  if (recomendaciones) {
    for (const key of ["mayor_engagement", "mayor_consultas", "inversores"] as const) {
      const rec = recomendaciones[key];
      if (rec && rec.indice >= 0 && rec.indice < posts.length) {
        if (!recsBadges[rec.indice]) recsBadges[rec.indice] = [];
        recsBadges[rec.indice].push({ ...BADGE_CONFIG[key], razon: rec.razon });
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-9 px-4 text-sm gap-2"
          onClick={handleDownload}
        >
          <DownloadIcon className="w-4 h-4" />
          Descargar todos (.txt)
        </Button>
      </div>
      {posts.map((post, index) => (
        <div
          key={index}
          className="border border-[#0f3460]/10 rounded-xl overflow-hidden shadow-sm"
        >
          <div className={`px-4 py-2.5 text-sm font-semibold ${COLORES_RED[post.red]}`}>
            {post.red}
          </div>
          <div className="p-4 flex flex-col gap-4 bg-card">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground break-words">
              {post.contenido}
            </p>
            <Button
              type="button"
              variant="outline"
              className="self-end h-11 px-5 text-sm"
              onClick={() => handleCopy(post.contenido, index)}
            >
              {copiedIndex === index ? (
                <span className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-600" />
                  Copiado
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CopyIcon className="w-4 h-4" />
                  Copiar
                </span>
              )}
            </Button>
          </div>
          {recsBadges[index] && (
            <div className="border-t border-[#0f3460]/10 px-4 py-3 bg-card flex flex-col gap-2">
              {recsBadges[index].map((badge, i) => (
                <div
                  key={i}
                  className={`rounded-lg border px-3 py-2.5 flex flex-col gap-1 ${badge.className}`}
                >
                  <span className="text-xs font-semibold leading-tight">
                    {badge.emoji} {badge.label}
                  </span>
                  <span className="text-xs opacity-75 leading-snug">{badge.razon}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

