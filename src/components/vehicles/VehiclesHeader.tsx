"use client";

import { PlusCircle, Tag } from "lucide-react";
import { useTranslations } from "next-intl";

interface VehiclesHeaderProps {
  onAddVehicle: () => void;
  onAddVehicleType?: () => void;
}

export function VehiclesHeader({
  onAddVehicle,
  onAddVehicleType,
}: VehiclesHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold">
        {t("vehicle.manage", { defaultValue: "Manage Vehicles" })}
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {onAddVehicleType && (
          <button
            onClick={onAddVehicleType}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm sm:text-base rounded-lg shadow transition active:scale-95 w-full sm:w-auto"
            title={t("vehicle.form.createVehicleType", {
              defaultValue: "สร้างประเภทรถใหม่",
            })}
          >
            <Tag size={18} />
            <span className="hidden sm:inline">
              {t("vehicle.form.createVehicleType", {
                defaultValue: "สร้างประเภทรถ",
              })}
            </span>
          </button>
        )}
        <button
          onClick={onAddVehicle}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm sm:text-base rounded-lg shadow transition active:scale-95 w-full sm:w-auto"
        >
          <PlusCircle size={20} />{" "}
          {t("vehicle.add", { defaultValue: "Add Vehicle" })}
        </button>
      </div>
    </div>
  );
}
