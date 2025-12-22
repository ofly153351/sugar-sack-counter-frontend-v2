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
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">
        {t("vehicle.manage", { defaultValue: "Manage Vehicles" })}
      </h1>
      <div className="flex items-center gap-3">
        {onAddVehicleType && (
          <button
            onClick={onAddVehicleType}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition active:scale-95"
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
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition active:scale-95"
        >
          <PlusCircle size={20} />{" "}
          {t("vehicle.add", { defaultValue: "Add Vehicle" })}
        </button>
      </div>
    </div>
  );
}
