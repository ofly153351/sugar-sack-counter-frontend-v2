"use client";

import { VehicleTypeForm } from "./VehicleTypeForm";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface VehicleTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleTypeData: { name: string; description?: string }) => void;
  isLoading?: boolean;
}

export function VehicleTypeModal({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: VehicleTypeModalProps) {
  const t = useTranslations("vehicle.form");

  if (!isOpen) return null;

  const handleSave = (vehicleTypeData: {
    name: string;
    description?: string;
  }) => {
    onSave(vehicleTypeData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {t("createVehicleType", { defaultValue: "สร้างประเภทรถใหม่" })}
        </h2>

        <p className="text-gray-600 mb-6">
          เพิ่มประเภทรถใหม่สำหรับใช้ในการบันทึกข้อมูลรถขนส่ง
        </p>

        <VehicleTypeForm
          onCancel={onClose}
          onSave={handleSave}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
