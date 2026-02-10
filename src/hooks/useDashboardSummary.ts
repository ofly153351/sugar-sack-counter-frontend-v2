"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardSummary,
  type DashboardSummary,
} from "@/utils/admin/dashboard/dashboard-api";

export const dashboardSummaryKey = ["dashboard", "summary"] as const;

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: dashboardSummaryKey,
    queryFn: fetchDashboardSummary,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
