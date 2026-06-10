"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  FileText,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  Sparkles,
  BarChart2,
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { AnalyticsData } from "@/lib/actions/analytics.actions";

interface Props {
  data: AnalyticsData;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  pro_max: "Pro Max",
};

export default function AnalyticsContent({ data }: Props) {
  const {
    postsThisMonth,
    postsDelta,
    totalProperties,
    featureUsage,
    generationsRemaining,
    generationsLimit,
    planStartDate,
    plan,
    activityLast7Days,
  } = data;

  const deltaIcon =
    postsDelta === null ? null : postsDelta > 0 ? (
      <TrendingUp className="w-4 h-4 text-emerald-500" />
    ) : postsDelta < 0 ? (
      <TrendingDown className="w-4 h-4 text-red-400" />
    ) : (
      <Minus className="w-4 h-4 text-slate-400" />
    );

  const deltaText =
    postsDelta === null
      ? "Sin datos del mes anterior"
      : postsDelta > 0
      ? `+${postsDelta}% vs mes anterior`
      : postsDelta < 0
      ? `Menos actividad que el mes pasado (${postsDelta}%)`
      : "Igual que el mes anterior";

  const maxFeatureCount = Math.max(...featureUsage.map((f) => f.count), 1);
  const hasNoActivity =
    featureUsage.every((f) => f.count === 0) &&
    activityLast7Days.every((d) => d.count === 0);
  const progressPercent =
    generationsLimit && generationsLimit > 0
      ? Math.min(100, Math.round(((generationsLimit - (generationsRemaining ?? 0)) / generationsLimit) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Posts este mes */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Posts este mes</span>
            <span className="p-1.5 bg-[#00c9c9]/10 rounded-lg">
              <FileText className="w-4 h-4 text-[#00c9c9]" />
            </span>
          </div>
          <p className="text-3xl font-bold text-[#0f3460]">{postsThisMonth}</p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            {deltaIcon}
            <span>{deltaText}</span>
          </div>
        </div>

        {/* Propiedades */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Propiedades guardadas</span>
            <span className="p-1.5 bg-[#0f3460]/10 rounded-lg">
              <Building2 className="w-4 h-4 text-[#0f3460]" />
            </span>
          </div>
          <p className="text-3xl font-bold text-[#0f3460]">{totalProperties}</p>
          <p className="text-xs text-slate-500">Total acumulado</p>
        </div>

        {/* Plan */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Plan actual</span>
            <span className="p-1.5 bg-[#f59e0b]/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0f3460]">
            {PLAN_LABELS[plan] ?? plan}
          </p>
          <p className="text-xs text-slate-500">
            {planStartDate ? `Desde ${planStartDate}` : "Plan gratuito"}
          </p>
        </div>

        {/* Generaciones restantes (Free) / Ilimitadas (Pro) */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Generaciones</span>
            <span className="p-1.5 bg-[#00c9c9]/10 rounded-lg">
              <CalendarDays className="w-4 h-4 text-[#00c9c9]" />
            </span>
          </div>
          {generationsRemaining !== null && generationsLimit !== null ? (
            <>
              <p className="text-3xl font-bold text-[#0f3460]">{generationsRemaining}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Restantes este mes</span>
                  <span>{generationsLimit - (generationsRemaining ?? 0)}/{generationsLimit}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${progressPercent}%`,
                      background: progressPercent >= 80 ? "#ef4444" : "linear-gradient(90deg, #0f3460, #00c9c9)",
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-[#00c9c9]">Ilimitadas</p>
              <p className="text-xs text-slate-500">Sin límite mensual</p>
            </>
          )}
        </div>
      </div>

      {/* Charts row or empty state */}
      {hasNoActivity ? (
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-10 flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-[#00c9c9]/10 rounded-2xl">
            <Zap className="w-8 h-8 text-[#00c9c9]" />
          </div>
          <div>
            <p className="font-semibold text-[#0f3460] text-base">
              Generá tu primer post para ver tu actividad aquí
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Tus estadísticas aparecerán después de usar PropIA por primera vez.
            </p>
          </div>
          <Link
            href="/mis-propiedades"
            className="inline-flex items-center gap-2 bg-[#00c9c9] hover:bg-[#00b3b3] text-[#0f3460] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Zap className="w-4 h-4" />
            Crear mi primer post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Features más usadas */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-[#00c9c9]" />
              <h2 className="text-sm font-semibold text-[#0f3460]">Features más usadas</h2>
            </div>
            <div className="space-y-3.5">
              {featureUsage.map((f) => (
                <div key={f.feature} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-36 shrink-0 truncate">{f.feature}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round((f.count / maxFeatureCount) * 100)}%`,
                        background: "linear-gradient(90deg, #0f3460, #00c9c9)",
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#0f3460] w-6 text-right tabular-nums">
                    {f.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad últimos 7 días */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#0f3460]" />
              <h2 className="text-sm font-semibold text-[#0f3460]">Actividad — últimos 7 días</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityLast7Days} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(value) => [value, "generaciones"]}
                />
                <Bar dataKey="count" fill="#00c9c9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
