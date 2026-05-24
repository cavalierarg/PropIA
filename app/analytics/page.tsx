import { Suspense } from "react";
import { getAnalyticsData } from "@/lib/actions/analytics.actions";
import AnalyticsContent from "@/components/AnalyticsContent";

async function AnalyticsData() {
  const data = await getAnalyticsData();
  return <AnalyticsContent data={data} />;
}

export default function AnalyticsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f3460]">Estadísticas</h1>
        <p className="text-sm text-slate-500 mt-1">Tu actividad y uso de PropIA</p>
      </div>
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsData />
      </Suspense>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-slate-100 rounded-xl" />
        <div className="h-72 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
