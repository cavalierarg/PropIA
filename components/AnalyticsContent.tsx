"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
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
} from "lucide-react";
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
      ? `${postsDelta}% vs mes anterior`
      : "Igual que el mes anterior";

  const maxFeatureCount = Math.max(...featureUsage.map((f) => f.count), 1);
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Features más usadas */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-[#00c9c9]" />
            <h2 className="text-sm font-semibold text-[#0f3460]">Features más usadas</h2>
          </div>
          {featureUsage.every((f) => f.count === 0) ? (
            <div className="h-52 flex items-center justify-center text-sm text-slate-400">
              Todavía no hay actividad registrada
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={featureUsage} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} domain={[0, maxFeatureCount]} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={130}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(value) => [value, "usos"]}
                />
                <Bar dataKey="count" fill="#00c9c9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Actividad últimos 7 días */}
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#0f3460]" />
            <h2 className="text-sm font-semibold text-[#0f3460]">Actividad — últimos 7 días</h2>
          </div>
          {activityLast7Days.every((d) => d.count === 0) ? (
            <div className="h-52 flex items-center justify-center text-sm text-slate-400">
              Sin actividad en los últimos 7 días
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={activityLast7Days} margin={{ left: 0, right: 16, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(value) => [value, "acciones"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0f3460"
                  strokeWidth={2}
                  dot={{ fill: "#00c9c9", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#0f3460" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
