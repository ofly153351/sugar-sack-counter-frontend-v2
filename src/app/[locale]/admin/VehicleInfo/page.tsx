"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import {
  VehiclesHeader,
  VehiclesTable,
  VehicleModal,
  VehicleTypeModal,
} from "@/components/vehicles";
import {
  useVehiclesManager,
  useVehicleTypesManager,
} from "@/hooks/useVehicles";
import { useUsers } from "@/hooks/useUsers";
import type {
  Vehicle,
  VehicleFormData,
} from "@/utils/admin/vehicles/vehicle-api";

export default function VehicleInfoPage() {
  const t = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);
  const [vehicleTypeModalOpen, setVehicleTypeModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  // Use React Query hooks
  const vehiclesManager = useVehiclesManager();
  const vehicleTypesManager = useVehicleTypesManager();
  const usersQuery = useUsers();

  const handleEdit = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setModalOpen(true);
  };

  const handleAddVehicleType = () => {
    setVehicleTypeModalOpen(true);
  };

  const handleSaveVehicleType = async (vehicleTypeData: { name: string }) => {
    try {
      await vehicleTypesManager.createVehicleType(vehicleTypeData);
      setVehicleTypeModalOpen(false);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "ไม่สามารถสร้างประเภทรถได้";
      console.error("❌ Error creating vehicle type:", err);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    }
  };

  const handleSave = async (vehicle: Vehicle) => {
    try {
      const vehicleData: VehicleFormData = {
        vehicleCode: vehicle.vehicleCode,
        licensePlate: vehicle.licensePlate,
        vehicleTypeId: vehicle.vehicleTypeId,
        driverUserId: vehicle.driverUserId || "",
        status: vehicle.status,
      };

      if (editVehicle && editVehicle.id) {
        // Update existing vehicle
        await vehiclesManager.updateVehicleAsync({
          id: editVehicle.id,
          data: vehicleData,
        });
      } else {
        // Create new vehicle
        await vehiclesManager.createVehicleAsync(vehicleData);
      }

      // Close modal
      setModalOpen(false);
      setEditVehicle(null);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : undefined;
      console.error("❌ Error saving vehicle:", err);
      Swal.fire(
        t("vehicle.save.error", { defaultValue: "เกิดข้อผิดพลาด" }),
        errorMessage ||
          t("vehicle.save.errorMessage", {
            defaultValue: "ไม่สามารถบันทึกรถได้",
          }),
        "error"
      );
    }
  };

  const handleAddVehicle = () => {
    setEditVehicle(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditVehicle(null);
  };

  // Transform API data to match component expectations
  const transformedVehicles = vehiclesManager.vehicles.map(
    (vehicle, index) => ({
      no: index + 1,
      id: vehicle.id,
      vehicleCode: vehicle.vehicleCode,
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType?.name || "Unknown",
      vehicleTypeId: vehicle.vehicleTypeId,
      driverUserId: vehicle.driverUserId,
      driverName:
        vehicle.driverName ||
        [
          vehicle.driver?.firstName || vehicle.driver?.firstname || "",
          vehicle.driver?.lastName || vehicle.driver?.lastname || "",
        ]
          .join(" ")
          .trim() ||
        vehicle.driver?.username ||
        "-",
      status: vehicle.status,
    })
  );
  const driverUsers = (usersQuery.data || []).map((user) => {
    const fullName = `${user.firstname || user.firstName || ""} ${
      user.lastname || user.lastName || ""
    }`.trim();
    return {
      value: user.id,
      label: fullName || user.username || "-",
    };
  });
  const vehicleTypeNames = vehicleTypesManager.vehicleTypes.map((type) => type.name);

  if (vehiclesManager.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {t("vehicle.loading", { defaultValue: "กำลังโหลด..." })}
          </p>
        </div>
      </div>
    );
  }

  if (vehiclesManager.isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">
            {t("vehicle.errors.loadError", {
              defaultValue: "ไม่สามารถโหลดข้อมูลรถได้",
            })}
          </p>
          <p>{vehiclesManager.error?.message || "Unknown error occurred"}</p>
          <button
            onClick={() => vehiclesManager.refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t("buttons.retry", { defaultValue: "ลองใหม่" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <VehiclesHeader
        onAddVehicle={handleAddVehicle}
        onAddVehicleType={handleAddVehicleType}
      />

      <VehiclesTable
        vehicles={transformedVehicles}
        onEdit={handleEdit}
        onDelete={vehiclesManager.deleteVehicle}
        isLoading={vehiclesManager.isLoading}
        vehicleTypes={vehicleTypeNames}
      />

      <VehicleModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        initialData={editVehicle}
        onSave={handleSave}
        vehicleTypes={vehicleTypesManager.vehicleTypes}
        driverUsers={driverUsers}
      />

      <VehicleTypeModal
        isOpen={vehicleTypeModalOpen}
        onClose={() => setVehicleTypeModalOpen(false)}
        onSave={handleSaveVehicleType}
        isLoading={vehicleTypesManager.isCreating}
      />
    </div>
  );
}
