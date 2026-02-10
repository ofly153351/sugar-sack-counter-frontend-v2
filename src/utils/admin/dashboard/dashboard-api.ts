import { api } from "@/utils/api-client";

export type DashboardSummaryPoint = {
  date: string;
  total: number;
};

export type DashboardSummary = {
  sacks: {
    today: number;
    last7Days: DashboardSummaryPoint[];
  };
  boxes: {
    today: number;
    last7Days: DashboardSummaryPoint[];
  };
  totalUsers: number;
  totalVehicles: number;
  range: {
    startDate: string;
    endDate: string;
  };
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    const response = await api.get<DashboardSummary>(
      "/admin/dashboard/summary"
    );
    return response.data;
  } catch (error: any) {
    let errorMessage = "Failed to load dashboard summary";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};
