"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface VehicleTypeFormProps {
  onCancel: () => void;
  onSave: (vehicleTypeData: { name: string }) => void;
  isLoading?: boolean;
}

export function VehicleTypeForm({
  onCancel,
  onSave,
  isLoading = false,
}: VehicleTypeFormProps) {
  const t = useTranslations("vehicle.form");
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      Swal.fire(t("requiredFields") || "กรุณากรอกชื่อประเภทรถ", "", "warning");
      return;
    }

    onSave({ name: name.trim() });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">
          {t("vehicleTypeName")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("vehicleTypeNamePlaceholder")}
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500 mt-1">{t("vehicleTypeNameHint")}</p>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {t("cancel") || "ยกเลิก"}
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("creatingVehicleType")}
            </span>
          ) : (
            t("createVehicleTypeButton")
          )}
        </button>
      </div>
    </div>
  );
}
