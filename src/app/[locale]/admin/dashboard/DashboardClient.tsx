"use client";

import { Dictionary } from "@/i18n/dictionaries";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

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

  const formatMonthLabel = (monthNumber: string) => {
    const month = Number(monthNumber);
    if (month < 1 || month > 12) return monthNumber;
    return new Date(Date.UTC(2026, month - 1, 1)).toLocaleDateString(undefined, {
      month: "short",
      timeZone: "UTC",
    });
  };

  // Always render month axis as 1..12
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: String(i + 1),
    sacks: 0,
    boxes: 0,
  }));

  (summary?.sacks?.last12Months || []).forEach((item) => {
    const monthNumber = Number(item.month.split("-")[1]);
    if (monthNumber >= 1 && monthNumber <= 12) {
      chartData[monthNumber - 1].sacks = item.total;
    }
  });

  (summary?.boxes?.last12Months || []).forEach((item) => {
    const monthNumber = Number(item.month.split("-")[1]);
    if (monthNumber >= 1 && monthNumber <= 12) {
      chartData[monthNumber - 1].boxes = item.total;
    }
  });

  const chartConfig = {
    sacks: {
      label: "กระสอบต่อเดือน",
      color: "#2563eb",
    },
    boxes: {
      label: "กล่องต่อเดือน",
      color: "#16a34a",
    },
  } satisfies ChartConfig;

  const latest = chartData[chartData.length - 1];
  const previous = chartData[chartData.length - 2];
  const latestTotal = (latest?.sacks || 0) + (latest?.boxes || 0);
  const previousTotal = (previous?.sacks || 0) + (previous?.boxes || 0);
  const trendPercent =
    previousTotal > 0 ? ((latestTotal - previousTotal) / previousTotal) * 100 : 0;

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
              กระสอบต่อเดือน
            </h3>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">SACK</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-blue-700 mb-3">
            {summary?.sacks?.thisMonth ?? 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">
              กล่องต่อเดือน
            </h3>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">BOX</span>
            </div>
          </div>
          <p className="text-4xl font-bold text-green-700 mb-3">
            {summary?.boxes?.thisMonth ?? 0}
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

      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary - 12 Months</CardTitle>
          <CardDescription>
            {summary?.range?.startMonth} - {summary?.range?.endMonth}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  minTickGap={0}
                  tickFormatter={(value) => formatMonthLabel(String(value))}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="boxes"
                  fill="var(--color-boxes)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="sacks"
                  fill="var(--color-sacks)"
                  radius={[4, 4, 0, 0]}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="py-10 text-center text-sm text-slate-500">
              {dict.table.noData}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium text-slate-700">
                {trendPercent >= 0 ? "Trending up" : "Trending down"} by{" "}
                {Math.abs(trendPercent).toFixed(1)}% this month{" "}
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-slate-500 flex items-center gap-2 leading-none">
                {summary?.range?.startMonth} - {summary?.range?.endMonth}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
