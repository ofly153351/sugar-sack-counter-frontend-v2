// src/hooks/useCount.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  // Counting Session
  createCountingSession,
  fetchCountingSessions,
  fetchCountingSessionsByType,
  fetchCountingSessionsByUser,
  fetchCountingSessionsByVehicle,
  getCountingSessionById,
  updateCountingSession,
  deleteCountingSession,

  // Sack Counting
  createSackCountingSession,

  // Box Counting
  createBoxCountingSession,

  // Rows
  createSackRow,
  createBoxRow,
  fetchSackRowsBySession,
  fetchBoxRowsBySession,

  // Related Data
  fetchActiveVehicles,
  fetchVehicles,
  fetchTypes,
  createType,
  getCurrentUser,

  // Utility Functions
  calculateSackTotalWeight,
  calculateTotalCount,
  validateCountingSessionData,
  validateSackRowData,
  validateBoxRowData,
  completeSackCountingWorkflow,
  completeBoxCountingWorkflow,
} from "@/utils/count/count-api";
import {
  // Count Types
  type CountingSession,
  type CountingSessionFormData,
  type SessionType,
  type SessionStatus,
  type SackCountingSession,
  type SackCountingSessionFormData,
  type BoxCountingSession,
  type BoxCountingSessionFormData,
  type SackRow,
  type SackRowFormData,
  type BoxRow,
  type BoxRowFormData,
  type Vehicle,
  type Type,
  type User,
} from "@/utils/types";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

// ========== Counting Session Queries ==========

/**
 * Hook สำหรับดึงข้อมูล counting sessions ทั้งหมด
 */
export const useCountingSessions = () => {
  return useQuery({
    queryKey: ["countingSessions"],
    queryFn: fetchCountingSessions,
    staleTime: 2 * 60 * 1000, // 2 นาที
    gcTime: 5 * 60 * 1000, // 5 นาที
  });
};

/**
 * Hook สำหรับดึงข้อมูล counting sessions ตามประเภท
 */
export const useCountingSessionsByType = (sessionType: SessionType) => {
  return useQuery({
    queryKey: ["countingSessions", "type", sessionType],
    queryFn: () => fetchCountingSessionsByType(sessionType),
    enabled: !!sessionType,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook สำหรับดึงข้อมูล counting sessions ตามผู้ใช้
 */
export const useCountingSessionsByUser = (userId: string | number) => {
  return useQuery({
    queryKey: ["countingSessions", "user", userId],
    queryFn: () => fetchCountingSessionsByUser(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook สำหรับดึงข้อมูล counting sessions ตามรถ
 */
export const useCountingSessionsByVehicle = (vehicleId: string | number) => {
  return useQuery({
    queryKey: ["countingSessions", "vehicle", vehicleId],
    queryFn: () => fetchCountingSessionsByVehicle(vehicleId),
    enabled: !!vehicleId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook สำหรับดึงข้อมูล counting session โดย ID
 */
export const useCountingSessionById = (sessionId: string | number) => {
  return useQuery({
    queryKey: ["countingSessions", sessionId],
    queryFn: () => getCountingSessionById(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// ========== Related Data Queries ==========

/**
 * Hook สำหรับดึงข้อมูลรถที่ active
 */
export const useActiveVehicles = () => {
  return useQuery({
    queryKey: ["vehicles", "active"],
    queryFn: fetchActiveVehicles,
    staleTime: 5 * 60 * 1000, // 5 นาที
    gcTime: 10 * 60 * 1000, // 10 นาที
  });
};

/**
 * Hook สำหรับดึงข้อมูลรถทั้งหมด
 */
export const useVehicles = () => {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook สำหรับดึงข้อมูลประเภท
 */
export const useTypes = () => {
  return useQuery({
    queryKey: ["Types"],
    queryFn: fetchTypes,
    staleTime: 10 * 60 * 1000, // 10 นาที (ไม่ค่อยเปลี่ยนบ่อย)
    gcTime: 30 * 60 * 1000, // 30 นาที
  });
};

/**
 * Hook สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// ==========  Type Mutations ==========

/**
 * Hook สำหรับสร้าง  type ใหม่
 */
export const useCreateType = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("count");

  return useMutation({
    mutationFn: createType,
    onSuccess: (data: Type) => {
      // อัปเดต cache สำหรับ  types
      queryClient.invalidateQueries({ queryKey: ["Types"] });

      // เพิ่ม  type ใหม่เข้าไปใน cache
      queryClient.setQueryData(["Types", data.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("TypeManagement.successTitle", {
          defaultValue: "สำเร็จ!",
        }),
        text: t("TypeManagement.addSuccess", {
          defaultValue: "เพิ่มชนิดเรียบร้อยแล้ว",
        }),
        icon: "success",
        confirmButtonText: t("TypeManagement.ok", {
          defaultValue: "ตกลง",
        }),
        confirmButtonColor: "#3085d6",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error creating  type:", error);
      Swal.fire({
        title: t("TypeManagement.errorTitle", {
          defaultValue: "เกิดข้อผิดพลาด",
        }),
        text:
          error.message ||
          t("TypeManagement.createErrorMessage", {
            defaultValue: "ไม่สามารถเพิ่มชนิดได้",
          }),
        icon: "error",
        confirmButtonText: t("TypeManagement.ok", {
          defaultValue: "ตกลง",
        }),
        confirmButtonColor: "#3085d6",
      });
    },
  });
};

// ========== Row Queries ==========

/**
 * Hook สำหรับดึงข้อมูล sack rows ตาม session
 */
export const useSackRowsBySession = (sessionId: string | number) => {
  return useQuery({
    queryKey: ["sackRows", "session", sessionId],
    queryFn: () => fetchSackRowsBySession(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Hook สำหรับดึงข้อมูล box rows ตาม session
 */
export const useBoxRowsBySession = (sessionId: string | number) => {
  return useQuery({
    queryKey: ["boxRows", "session", sessionId],
    queryFn: () => fetchBoxRowsBySession(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// ========== Counting Session Mutations ==========

/**
 * Hook สำหรับสร้าง counting session ใหม่
 */
export const useCreateCountingSession = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("count");

  return useMutation({
    mutationFn: createCountingSession,
    onSuccess: (data: CountingSession) => {
      // อัปเดต cache สำหรับ counting sessions ทั้งหมด
      queryClient.invalidateQueries({ queryKey: ["countingSessions"] });

      // อัปเดต cache สำหรับ counting sessions ตามประเภท
      queryClient.invalidateQueries({
        queryKey: ["countingSessions", "type", data.sessionType],
      });

      // อัปเดต cache สำหรับ counting sessions ตามผู้ใช้
      queryClient.invalidateQueries({
        queryKey: ["countingSessions", "user", data.userId],
      });

      // อัปเดต cache สำหรับ counting sessions ตามรถ
      queryClient.invalidateQueries({
        queryKey: ["countingSessions", "vehicle", data.vehicleId],
      });

      // เพิ่ม session ใหม่เข้าไปใน cache
      queryClient.setQueryData(["countingSessions", data.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("session.createSuccessTitle", {
          defaultValue: "สร้างเซสชันสำเร็จ!",
        }),
        text: t("session.createSuccessMessage", {
          defaultValue: "เซสชันการนับถูกสร้างเรียบร้อย",
        }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error creating counting session:", error);
      Swal.fire({
        title: t("session.createErrorTitle", {
          defaultValue: "เกิดข้อผิดพลาด",
        }),
        text:
          error.message ||
          t("session.createErrorMessage", {
            defaultValue: "ไม่สามารถสร้างเซสชันได้",
          }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

/**
 * Hook สำหรับอัปเดต counting session
 */
export const useUpdateCountingSession = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("count");

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<CountingSessionFormData>;
    }) => updateCountingSession(id, data),
    onSuccess: (data: CountingSession, variables) => {
      // อัปเดต cache สำหรับ counting sessions ทั้งหมด
      queryClient.invalidateQueries({ queryKey: ["countingSessions"] });

      // อัปเดต cache สำหรับ counting sessions ตามประเภท
      queryClient.invalidateQueries({
        queryKey: ["countingSessions", "type", data.sessionType],
      });

      // อัปเดต cache สำหรับ session ที่แก้ไข
      queryClient.setQueryData(["countingSessions", variables.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("session.updateSuccessTitle", {
          defaultValue: "อัปเดตสำเร็จ!",
        }),
        text: t("session.updateSuccessMessage", {
          defaultValue: "เซสชันการนับถูกอัปเดตเรียบร้อย",
        }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error updating counting session:", error);
      Swal.fire({
        title: t("session.updateErrorTitle", {
          defaultValue: "เกิดข้อผิดพลาด",
        }),
        text:
          error.message ||
          t("session.updateErrorMessage", {
            defaultValue: "ไม่สามารถอัปเดตเซสชันได้",
          }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

/**
 * Hook สำหรับลบ counting session
 */
export const useDeleteCountingSession = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("count");

  return useMutation({
    mutationFn: deleteCountingSession,
    onSuccess: (_, sessionId) => {
      // อัปเดต cache สำหรับ counting sessions ทั้งหมด
      queryClient.invalidateQueries({ queryKey: ["countingSessions"] });

      // ลบ session ออกจาก cache
      queryClient.removeQueries({ queryKey: ["countingSessions", sessionId] });

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("session.deleteSuccessTitle", { defaultValue: "ลบสำเร็จ!" }),
        text: t("session.deleteSuccessMessage", {
          defaultValue: "เซสชันการนับถูกลบเรียบร้อย",
        }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error deleting counting session:", error);
      Swal.fire({
        title: t("session.deleteErrorTitle", {
          defaultValue: "เกิดข้อผิดพลาด",
        }),
        text:
          error.message ||
          t("session.deleteErrorMessage", {
            defaultValue: "ไม่สามารถลบเซสชันได้",
          }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

// ========== Row Mutations ==========

/**
 * Hook สำหรับสร้าง sack row
 */
export const useCreateSackRow = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("count");

  return useMutation({
    mutationFn: createSackRow,
    onSuccess: (data: SackRow, variables) => {
      // อัปเดต cache สำหรับ sack rows ของ session นี้
      queryClient.invalidateQueries({
        queryKey: ["sackRows", "session", variables.sessionId],
      });

      // เพิ่ม row ใหม่เข้าไปใน cache
      queryClient.setQueryData(["sackRows", data.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("row.createSuccessTitle", { defaultValue: "เพิ่มแถวสำเร็จ!" }),
        text: t("row.createSuccessMessage", {
          defaultValue: "แถวกระสอบถูกเพิ่มเรียบร้อย",
        }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error creating sack row:", error);
      Swal.fire({
        title: t("row.createErrorTitle", { defaultValue: "เกิดข้อผิดพลาด" }),
        text:
          error.message ||
          t("row.createErrorMessage", {
            defaultValue: "ไม่สามารถเพิ่มแถวกระสอบได้",
          }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

/**
 * Hook สำหรับสร้าง box row
 */
export const useCreateBoxRow = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("count");

  return useMutation({
    mutationFn: createBoxRow,
    onSuccess: (data: BoxRow, variables) => {
      // อัปเดต cache สำหรับ box rows ของ session นี้
      queryClient.invalidateQueries({
        queryKey: ["boxRows", "session", variables.sessionId],
      });

      // เพิ่ม row ใหม่เข้าไปใน cache
      queryClient.setQueryData(["boxRows", data.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("row.createSuccessTitle", { defaultValue: "เพิ่มแถวสำเร็จ!" }),
        text: t("row.createSuccessMessage", {
          defaultValue: "แถวกล่องถูกเพิ่มเรียบร้อย",
        }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error creating box row:", error);
      Swal.fire({
        title: t("row.createErrorTitle", { defaultValue: "เกิดข้อผิดพลาด" }),
        text:
          error.message ||
          t("row.createErrorMessage", {
            defaultValue: "ไม่สามารถเพิ่มแถวกล่องได้",
          }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

// ========== Workflow Mutations ==========

/**
 * Hook สำหรับ complete sack counting workflow
 */
export const useCompleteSackCountingWorkflow = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("count");

  return useMutation({
    mutationFn: ({
      sessionData,
      sackRows,
      existingCountingSessionId,
    }: {
      sessionData: CountingSessionFormData;
      sackRows: SackRowFormData[];
      existingCountingSessionId?: string | number;
    }) =>
      completeSackCountingWorkflow(
        sessionData,
        sackRows,
        existingCountingSessionId
      ),
    onSuccess: (data: CountingSession, variables) => {
      // อัปเดต cache สำหรับ counting sessions ทั้งหมด
      queryClient.invalidateQueries({ queryKey: ["countingSessions"] });

      // อัปเดต cache สำหรับ counting sessions ตามประเภท
      queryClient.invalidateQueries({
        queryKey: ["countingSessions", "type", "sack"],
      });

      // อัปเดต cache สำหรับ counting sessions ตามผู้ใช้
      queryClient.invalidateQueries({
        queryKey: ["countingSessions", "user", variables.sessionData.userId],
      });

      // อัปเดต cache สำหรับ counting sessions ตามรถ
      queryClient.invalidateQueries({
        queryKey: [
          "countingSessions",
          "vehicle",
          variables.sessionData.vehicleId,
        ],
      });

      // อัปเดต cache สำหรับ session ที่สร้าง
      queryClient.setQueryData(["countingSessions", data.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("workflow.sackCompleteSuccessTitle", {
          defaultValue: "นับกระสอบสำเร็จ!",
        }),
        text: t("workflow.sackCompleteSuccessMessage", {
          defaultValue: `นับกระสอบสำเร็จทั้งหมด ${data.totalCount} กระสอบ น้ำหนักรวม ${data.totalWeight} กิโลกรัม`,
          totalCount: data.totalCount ?? 0,
          totalWeight: data.totalWeight ?? 0,
        }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error in sack counting workflow:", error);
      Swal.fire({
        title: t("workflow.sackCompleteErrorTitle", {
          defaultValue: "เกิดข้อผิดพลาด",
        }),
        text:
          error.message ||
          t("workflow.sackCompleteErrorMessage", {
            defaultValue: "ไม่สามารถนับกระสอบได้",
          }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

/**
 * Hook สำหรับ complete box counting workflow
 */
export const useCompleteBoxCountingWorkflow = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("count");

  return useMutation({
    mutationFn: ({
      sessionData,
      boxRows,
      existingCountingSessionId,
    }: {
      sessionData: CountingSessionFormData;
      boxRows: BoxRowFormData[];
      existingCountingSessionId?: string | number;
    }) =>
      completeBoxCountingWorkflow(
        sessionData,
        boxRows,
        existingCountingSessionId
      ),
    onSuccess: (data: CountingSession, variables) => {
      // อัปเดต cache สำหรับ counting sessions ทั้งหมด
      queryClient.invalidateQueries({ queryKey: ["countingSessions"] });

      // อัปเดต cache สำหรับ counting sessions ตามประเภท
      queryClient.invalidateQueries({
        queryKey: ["countingSessions", "type", "box"],
      });

      // อัปเดต cache สำหรับ counting sessions ตามผู้ใช้
      queryClient.invalidateQueries({
        queryKey: ["countingSessions", "user", variables.sessionData.userId],
      });

      // อัปเดต cache สำหรับ counting sessions ตามรถ
      queryClient.invalidateQueries({
        queryKey: [
          "countingSessions",
          "vehicle",
          variables.sessionData.vehicleId,
        ],
      });

      // อัปเดต cache สำหรับ session ที่สร้าง
      queryClient.setQueryData(["countingSessions", data.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("workflow.boxCompleteSuccessTitle", {
          defaultValue: "นับกล่องสำเร็จ!",
        }),
        text: t("workflow.boxCompleteSuccessMessage", {
          defaultValue: `นับกล่องสำเร็จทั้งหมด ${data.totalCount} กล่อง`,
          totalCount: data.totalCount ?? 0,
        }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error in box counting workflow:", error);
      Swal.fire({
        title: t("workflow.boxCompleteErrorTitle", {
          defaultValue: "เกิดข้อผิดพลาด",
        }),
        text:
          error.message ||
          t("workflow.boxCompleteErrorMessage", {
            defaultValue: "ไม่สามารถนับกล่องได้",
          }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

// ========== Manager Hooks ==========

/**
 * Hook สำหรับจัดการ counting ทั้งหมด (รวม queries และ mutations)
 */
export const useCountManager = () => {
  // Queries
  const vehiclesQuery = useActiveVehicles();
  const TypesQuery = useTypes();
  const currentUserQuery = useCurrentUser();

  // Mutations
  const completeSackWorkflowMutation = useCompleteSackCountingWorkflow();
  const completeBoxWorkflowMutation = useCompleteBoxCountingWorkflow();
  const createTypeMutation = useCreateType();

  return {
    // Queries
    vehicles: vehiclesQuery.data || [],
    Types: TypesQuery.data || [],
    currentUser: currentUserQuery.data,

    // Query statuses
    isLoadingVehicles: vehiclesQuery.isLoading,
    isLoadingTypes: TypesQuery.isLoading,
    isLoadingCurrentUser: currentUserQuery.isLoading,
    isLoading:
      vehiclesQuery.isLoading ||
      TypesQuery.isLoading ||
      currentUserQuery.isLoading,

    // Query errors
    vehiclesError: vehiclesQuery.error,
    TypesError: TypesQuery.error,
    currentUserError: currentUserQuery.error,
    isError:
      vehiclesQuery.isError ||
      TypesQuery.isError ||
      currentUserQuery.isError,

    // Query refetch functions
    refetchVehicles: vehiclesQuery.refetch,
    refetchTypes: TypesQuery.refetch,
    refetchCurrentUser: currentUserQuery.refetch,

    // Workflow mutations
    completeSackCounting: completeSackWorkflowMutation.mutate,
    completeSackCountingAsync: completeSackWorkflowMutation.mutateAsync,
    isCompletingSackCounting: completeSackWorkflowMutation.isPending,

    completeBoxCounting: completeBoxWorkflowMutation.mutate,
    completeBoxCountingAsync: completeBoxWorkflowMutation.mutateAsync,
    isCompletingBoxCounting: completeBoxWorkflowMutation.isPending,

    //  type mutations
    createType: createTypeMutation.mutate,
    createTypeAsync: createTypeMutation.mutateAsync,
    isCreatingType: createTypeMutation.isPending,

    // Combined status
    isPending:
      vehiclesQuery.isLoading ||
      TypesQuery.isLoading ||
      currentUserQuery.isLoading ||
      completeSackWorkflowMutation.isPending ||
      completeBoxWorkflowMutation.isPending ||
      createTypeMutation.isPending,
  };
};

/**
 * Hook สำหรับจัดการ counting sessions
 */
export const useCountingSessionsManager = () => {
  const sessionsQuery = useCountingSessions();
  const createMutation = useCreateCountingSession();
  const updateMutation = useUpdateCountingSession();
  const deleteMutation = useDeleteCountingSession();

  return {
    // Queries
    sessions: sessionsQuery.data || [],
    isLoading: sessionsQuery.isLoading,
    isError: sessionsQuery.isError,
    error: sessionsQuery.error,
    refetch: sessionsQuery.refetch,

    // Mutations
    createSession: createMutation.mutate,
    createSessionAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateSession: updateMutation.mutate,
    updateSessionAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteSession: deleteMutation.mutate,
    deleteSessionAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Combined status
    isPending:
      sessionsQuery.isLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};

// ========== Utility Hooks ==========

/**
 * Hook สำหรับคำนวณ totals
 */
export const useCalculateTotals = () => {
  const calculateSackTotals = (sackRows: SackRow[]) => {
    const totalCount = calculateTotalCount(sackRows);
    const totalWeight = calculateSackTotalWeight(totalCount);
    return { totalCount, totalWeight };
  };

  const calculateBoxTotals = (boxRows: BoxRow[]) => {
    const totalCount = calculateTotalCount(boxRows);
    return { totalCount };
  };

  return {
    calculateSackTotals,
    calculateBoxTotals,
    calculateTotalCount,
    calculateSackTotalWeight,
  };
};

/**
 * Hook สำหรับ validation
 */
export const useCountValidation = () => {
  return {
    validateCountingSessionData,
    validateSackRowData,
    validateBoxRowData,
  };
};

// ========== Custom Hooks สำหรับ Count Page ==========

/**
 * Hook สำหรับจัดการ state ของ Count page
 */
export const useCountPageState = () => {
  const [currentTab, setCurrentTab] = useState<"sack" | "box">("sack");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | number>(
    ""
  );
  const [selectedTypeId, setSelectedTypeId] = useState<
    string | number
  >("");
  const [rows, setRows] = useState<number[]>([1]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous state update in effect
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const addRow = () =>
    setRows((prev) => [...prev, (prev[prev.length - 1] || 0) + 1]);
  const deleteRow = (rowNumber: number) =>
    setRows((prev) => prev.filter((r) => r !== rowNumber));

  return {
    currentTab,
    setCurrentTab,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedTypeId,
    setSelectedTypeId,
    rows,
    setRows,
    isClient,
    addRow,
    deleteRow,
  };
};

import { useState, useEffect } from "react";
