"use client";

import { Dictionary } from "@/i18n/dictionaries";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";

interface DashboardClientProps {
  dict: Dictionary;
}

export default function DashboardClient({ dict }: DashboardClientProps) {
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
  } = useDashboardSummary();

  const renderLargeGraph = (
    points: { date: string; total: number }[],
    colorClass: string
  ) => {
    const max = Math.max(1, ...points.map((p) => p.total));
    return (
      <div className="flex items-end gap-3 h-48 md:h-56">
        {points.map((p) => {
          const height = Math.max(12, Math.round((p.total / max) * 200));
          return (
            <div key={p.date} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-md ${colorClass} transition-all duration-700 ease-out`}
                style={{ height }}
                title={`${p.date}: ${p.total}`}
              />
              <div className="mt-2 text-[11px] text-gray-500">
                {p.date.slice(5)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">{dict.dashboard.title}</h1>

      {isLoading && (
        <div className="mb-6 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            {dict.dashboard.loading || "Loading..."}
          </div>
        </div>
      )}

      {isError && (
        <div className="mb-6 p-6 rounded-2xl border border-red-200 bg-red-50 text-red-700">
          <p className="font-semibold">{dict.dashboard.error || "Error"}</p>
          <p className="text-sm mt-1">{(error as Error)?.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            {dict.dashboard.retry || "Retry"}
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              {dict.dashboard.metrics.sacksToday}
            </h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">SACK</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-blue-700 mb-3">
            {summary?.sacks?.today ?? 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">
              {dict.dashboard.metrics.boxesToday}
            </h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">BOX</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-green-700 mb-3">
            {summary?.boxes?.today ?? 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-800">
              {dict.dashboard.metrics.totalUsers}
            </h3>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-sm">USER</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-orange-700 mb-2">
            {summary?.totalUsers ?? 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-800">
              {dict.dashboard.metrics.totalVehicles}
            </h3>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">VEH</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-purple-700 mb-2">
            {summary?.totalVehicles ?? 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800">
              {dict.dashboard.metrics.sacksToday}
            </h3>
            <span className="text-sm text-blue-600">
              {dict.dashboard.last7Days}
            </span>
          </div>
          {summary?.sacks?.last7Days?.length
            ? renderLargeGraph(
                summary.sacks.last7Days,
                "bg-gradient-to-t from-blue-700 to-blue-400"
              )
            : null}
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-emerald-800">
              {dict.dashboard.metrics.boxesToday}
            </h3>
            <span className="text-sm text-emerald-600">
              {dict.dashboard.last7Days}
            </span>
          </div>
          {summary?.boxes?.last7Days?.length
            ? renderLargeGraph(
                summary.boxes.last7Days,
                "bg-gradient-to-t from-emerald-700 to-emerald-400"
              )
            : null}
        </div>
      </div>
    </main>
  );
}
