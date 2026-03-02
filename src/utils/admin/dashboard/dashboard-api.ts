import { api } from "@/utils/api-client";

export type DashboardSummaryPoint = {
  month: string;
  total: number;
};

export type DashboardSummary = {
  sacks: {
    thisMonth: number;
    last12Months: DashboardSummaryPoint[];
  };
  boxes: {
    thisMonth: number;
    last12Months: DashboardSummaryPoint[];
  };
  totalUsers: number;
  totalVehicles: number;
  range: {
    startMonth: string;
    endMonth: string;
  };
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const response = await api.get<DashboardSummary>(
      "/admin/dashboard/summary"
    );
    return response.data;
  } catch (error: unknown) {
    let errorMessage = "Failed to load dashboard summary";
    if (typeof error === "object" && error !== null) {
      const e = error as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      if (e.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }
    }
    throw new Error(errorMessage);
  }
};
