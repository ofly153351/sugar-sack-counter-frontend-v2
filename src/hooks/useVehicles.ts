// src/hooks/useVehicles.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchVehicles,
  fetchActiveVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicleByCode,
  getVehicleByLicensePlate,
  checkVehicleCodeAvailability,
  checkLicensePlateAvailability,
  type Vehicle,
  type VehicleFormData,
  type ApiVehicle,
} from "@/utils/admin/vehicles/vehicle-api";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

// ========== Vehicle Queries ==========

/**
 * Hook สำหรับดึงข้อมูลรถทั้งหมด
 */
export const useVehicles = () => {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
    staleTime: 5 * 60 * 1000, // 5 นาที
    gcTime: 10 * 60 * 1000, // 10 นาที
  });
};

/**
 * Hook สำหรับดึงข้อมูลรถที่ active เท่านั้น
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
 * Hook สำหรับดึงข้อมูลรถโดย ID
 */
export const useVehicleById = (vehicleId: string | number) => {
  return useQuery({
    queryKey: ["vehicles", vehicleId],
    queryFn: () => getVehicleById(vehicleId),
    enabled: !!vehicleId, // เรียกใช้เฉพาะเมื่อมี vehicleId
    staleTime: 5 * 60 * 1000, // 5 นาที
  });
};

/**
 * Hook สำหรับดึงข้อมูลรถโดยรหัสรถ
 */
export const useVehicleByCode = (vehicleCode: string) => {
  return useQuery({
    queryKey: ["vehicles", "code", vehicleCode],
    queryFn: () => getVehicleByCode(vehicleCode),
    enabled: !!vehicleCode, // เรียกใช้เฉพาะเมื่อมี vehicleCode
    staleTime: 5 * 60 * 1000, // 5 นาที
  });
};

/**
 * Hook สำหรับดึงข้อมูลรถโดยทะเบียนรถ
 */
export const useVehicleByLicensePlate = (licensePlate: string) => {
  return useQuery({
    queryKey: ["vehicles", "license", licensePlate],
    queryFn: () => getVehicleByLicensePlate(licensePlate),
    enabled: !!licensePlate, // เรียกใช้เฉพาะเมื่อมี licensePlate
    staleTime: 5 * 60 * 1000, // 5 นาที
  });
};

/**
 * Hook สำหรับตรวจสอบว่ารหัสรถใช้งานได้หรือไม่
 */
export const useCheckVehicleCodeAvailability = (vehicleCode: string) => {
  return useQuery({
    queryKey: ["vehicles", "availability", "code", vehicleCode],
    queryFn: () => checkVehicleCodeAvailability(vehicleCode),
    enabled: !!vehicleCode, // เรียกใช้เฉพาะเมื่อมี vehicleCode
    staleTime: 0, // ไม่ต้องการ cache สำหรับการตรวจสอบ availability
  });
};

/**
 * Hook สำหรับตรวจสอบว่าทะเบียนรถใช้งานได้หรือไม่
 */
export const useCheckLicensePlateAvailability = (licensePlate: string) => {
  return useQuery({
    queryKey: ["vehicles", "availability", "license", licensePlate],
    queryFn: () => checkLicensePlateAvailability(licensePlate),
    enabled: !!licensePlate, // เรียกใช้เฉพาะเมื่อมี licensePlate
    staleTime: 0, // ไม่ต้องการ cache สำหรับการตรวจสอบ availability
  });
};

// ========== Vehicle Mutations ==========

/**
 * Hook สำหรับสร้างรถใหม่
 */
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("vehicle");

  return useMutation({
    mutationFn: createVehicle,
    onSuccess: (data: ApiVehicle) => {
      // อัปเดต cache สำหรับ vehicles ทั้งหมด
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });

      // อัปเดต cache สำหรับ active vehicles
      queryClient.invalidateQueries({ queryKey: ["vehicles", "active"] });

      // เพิ่มรถใหม่เข้าไปใน cache
      queryClient.setQueryData(["vehicles", data.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("save.createSuccessTitle", { defaultValue: "เพิ่มสำเร็จ!" }),
        text: t("save.createSuccessMessage", { defaultValue: "รถถูกเพิ่มเรียบร้อย" }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error creating vehicle:", error);
      Swal.fire({
        title: t("save.error", { defaultValue: "เกิดข้อผิดพลาด" }),
        text: error.message || t("save.errorMessage", { defaultValue: "ไม่สามารถเพิ่มรถได้" }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

/**
 * Hook สำหรับอัปเดตข้อมูลรถ
 */
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("vehicle");

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<VehicleFormData> }) =>
      updateVehicle(id, data),
    onSuccess: (data: ApiVehicle, variables) => {
      // อัปเดต cache สำหรับ vehicles ทั้งหมด
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });

      // อัปเดต cache สำหรับ active vehicles
      queryClient.invalidateQueries({ queryKey: ["vehicles", "active"] });

      // อัปเดต cache สำหรับรถที่แก้ไข
      queryClient.setQueryData(["vehicles", variables.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("save.updateSuccessTitle", { defaultValue: "อัปเดตสำเร็จ!" }),
        text: t("save.updateSuccessMessage", { defaultValue: "ข้อมูลรถถูกอัปเดตเรียบร้อย" }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error updating vehicle:", error);
      Swal.fire({
        title: t("save.error", { defaultValue: "เกิดข้อผิดพลาด" }),
        text: error.message || t("save.errorMessage", { defaultValue: "ไม่สามารถอัปเดตข้อมูลรถได้" }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

/**
 * Hook สำหรับลบรถ
 */
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("vehicle");

  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: (_, vehicleId) => {
      // อัปเดต cache สำหรับ vehicles ทั้งหมด
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });

      // อัปเดต cache สำหรับ active vehicles
      queryClient.invalidateQueries({ queryKey: ["vehicles", "active"] });

      // ลบรถออกจาก cache
      queryClient.removeQueries({ queryKey: ["vehicles", vehicleId] });

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: t("delete.successTitle", { defaultValue: "ลบแล้ว!" }),
        text: t("delete.successMessage", { defaultValue: "ข้อมูลถูกลบเรียบร้อย" }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error deleting vehicle:", error);
      Swal.fire({
        title: t("delete.error", { defaultValue: "เกิดข้อผิดพลาด" }),
        text: error.message || t("delete.errorMessage", { defaultValue: "ไม่สามารถลบรถได้" }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

/**
 * Hook สำหรับยืนยันการลบรถ (รวม SweetAlert2 confirmation)
 */
export const useConfirmDeleteVehicle = () => {
  const deleteMutation = useDeleteVehicle();
  const t = useTranslations("vehicle");

  const confirmDelete = (vehicle: Vehicle) => {
    Swal.fire({
      title: t("delete.confirmTitle", { defaultValue: "ต้องการลบข้อมูลนี้?" }),
      text: t("delete.confirmMessage", {
        defaultValue: `ทะเบียน: ${vehicle.licensePlate}`,
        licensePlate: vehicle.licensePlate
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: t("delete.confirmButton", { defaultValue: "ลบ" }),
      cancelButtonText: t("delete.cancelButton", { defaultValue: "ยกเลิก" }),
      backdrop: `rgba(0,0,0,0.4)`,
    }).then((result) => {
      if (result.isConfirmed && vehicle.id) {
        deleteMutation.mutate(vehicle.id);
      }
    });
  };

  return confirmDelete;
};

// ========== Vehicle Manager Hook ==========

/**
 * Hook สำหรับจัดการ vehicles ทั้งหมด (รวม queries และ mutations)
 */
export const useVehiclesManager = () => {
  const vehiclesQuery = useVehicles();
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const confirmDelete = useConfirmDeleteVehicle();

  return {
    // Queries
    vehicles: vehiclesQuery.data || [],
    isLoading: vehiclesQuery.isLoading,
    isError: vehiclesQuery.isError,
    error: vehiclesQuery.error,
    refetch: vehiclesQuery.refetch,

    // Mutations
    createVehicle: createMutation.mutate,
    createVehicleAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateVehicle: updateMutation.mutate,
    updateVehicleAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteVehicle: confirmDelete,

    // Combined status
    isPending: vehiclesQuery.isLoading || createMutation.isPending || updateMutation.isPending,
  };
};

// ========== Vehicle Type Hooks ==========

import {
  fetchVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType,
  getVehicleTypeByName,
  type VehicleType,
  type VehicleTypeFormData,
} from "@/utils/admin/vehicles/vehicle-api";

/**
 * Hook สำหรับดึงข้อมูลประเภทรถทั้งหมด
 */
export const useVehicleTypes = () => {
  return useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: fetchVehicleTypes,
    staleTime: 10 * 60 * 1000, // 10 นาที (ไม่ค่อยเปลี่ยนบ่อย)
    gcTime: 30 * 60 * 1000, // 30 นาที
  });
};

/**
 * Hook สำหรับดึงข้อมูลประเภทรถโดยชื่อ
 */
export const useVehicleTypeByName = (name: string) => {
  return useQuery({
    queryKey: ["vehicleTypes", "name", name],
    queryFn: () => getVehicleTypeByName(name),
    enabled: !!name, // เรียกใช้เฉพาะเมื่อมี name
    staleTime: 10 * 60 * 1000, // 10 นาที
  });
};

/**
 * Hook สำหรับสร้างประเภทรถใหม่
 */
export const useCreateVehicleType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVehicleType,
    onSuccess: (data: VehicleType) => {
      // อัปเดต cache สำหรับ vehicle types ทั้งหมด
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });

      // เพิ่ม vehicle type ใหม่เข้าไปใน cache
      queryClient.setQueryData(["vehicleTypes", data.id], data);

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: "สร้างสำเร็จ!",
        text: `ประเภทรถ "${data.name}" ถูกสร้างเรียบร้อย`,
        icon: "success",
        confirmButtonText: "ตกลง",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error creating vehicle type:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถสร้างประเภทรถได้",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    },
  });
};

/**
 * Hook สำหรับแก้ไขประเภทรถ
 */
export const useUpdateVehicleType = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("vehicle.form");

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: VehicleTypeFormData }) =>
      updateVehicleType(id, data),
    onSuccess: (data: VehicleType, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });
      queryClient.setQueryData(["vehicleTypes", variables.id], data);

      Swal.fire({
        title: t("updateVehicleTypeSuccessTitle", { defaultValue: "แก้ไขสำเร็จ!" }),
        text: t("updateVehicleTypeSuccessMessage", {
          name: data.name,
          defaultValue: `อัปเดตประเภทรถเป็น "${data.name}" เรียบร้อย`,
        }),
        icon: "success",
        confirmButtonText: t("ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error updating vehicle type:", error);
      Swal.fire({
        title: t("errorTitle", { defaultValue: "เกิดข้อผิดพลาด" }),
        text: error.message || t("updateVehicleTypeErrorMessage", { defaultValue: "ไม่สามารถแก้ไขประเภทรถได้" }),
        icon: "error",
        confirmButtonText: t("ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

/**
 * Hook สำหรับลบประเภทรถ
 */
export const useDeleteVehicleType = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("vehicle.form");

  return useMutation({
    mutationFn: deleteVehicleType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleTypes"] });

      Swal.fire({
        title: t("deleteVehicleTypeSuccessTitle", { defaultValue: "ลบสำเร็จ!" }),
        text: t("deleteVehicleTypeSuccessMessage", { defaultValue: "ลบประเภทรถเรียบร้อยแล้ว" }),
        icon: "success",
        confirmButtonText: t("ok", { defaultValue: "ตกลง" }),
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error deleting vehicle type:", error);
      Swal.fire({
        title: t("errorTitle", { defaultValue: "เกิดข้อผิดพลาด" }),
        text: error.message || t("deleteVehicleTypeErrorMessage", { defaultValue: "ไม่สามารถลบประเภทรถได้" }),
        icon: "error",
        confirmButtonText: t("ok", { defaultValue: "ตกลง" }),
      });
    },
  });
};

/**
 * Hook สำหรับจัดการ vehicle types ทั้งหมด
 */
export const useVehicleTypesManager = () => {
  const vehicleTypesQuery = useVehicleTypes();
  const createMutation = useCreateVehicleType();
  const updateMutation = useUpdateVehicleType();
  const deleteMutation = useDeleteVehicleType();

  return {
    // Queries
    vehicleTypes: vehicleTypesQuery.data || [],
    isLoading: vehicleTypesQuery.isLoading,
    isError: vehicleTypesQuery.isError,
    error: vehicleTypesQuery.error,
    refetch: vehicleTypesQuery.refetch,

    // Mutations
    createVehicleType: createMutation.mutate,
    createVehicleTypeAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateVehicleType: updateMutation.mutate,
    updateVehicleTypeAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteVehicleType: deleteMutation.mutate,
    deleteVehicleTypeAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Combined status
    isPending:
      vehicleTypesQuery.isLoading ||
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
};
