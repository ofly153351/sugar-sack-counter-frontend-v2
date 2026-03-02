"use client";

import * as React from "react";
import {
  Legend as RechartsLegend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type TooltipProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

const ChartConfigContext = React.createContext<ChartConfig | null>(null);

function useChartConfig() {
  return React.useContext(ChartConfigContext);
}

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: React.ReactElement;
}) {
  const styleVars = Object.entries(config).reduce(
    (acc, [key, item]) => {
      acc[`--color-${key}`] = item.color;
      return acc;
    },
    {} as Record<string, string>
  );

  return (
    <ChartConfigContext.Provider value={config}>
      <div className={className} style={styleVars as React.CSSProperties}>
        <ResponsiveContainer width="100%" height={320}>
          {children}
        </ResponsiveContainer>
      </div>
    </ChartConfigContext.Provider>
  );
}

export const ChartTooltip = RechartsTooltip;
export const ChartLegend = RechartsLegend;

export function ChartTooltipContent({
  active,
  payload,
}: TooltipProps<ValueType, NameType> & { indicator?: "line" | "dot" }) {
  const config = useChartConfig();
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-md">
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? "");
          const label = config?.[key]?.label || key;
          const color = entry.color || config?.[key]?.color || "#64748b";
          return (
            <div key={key} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </div>
              <span className="font-semibold text-slate-900">
                {Number(entry.value ?? 0).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChartLegendContent() {
  const config = useChartConfig();
  if (!config) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-2">
      {Object.entries(config).map(([key, item]) => (
        <div key={key} className="flex items-center gap-2 text-xs text-slate-600">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
