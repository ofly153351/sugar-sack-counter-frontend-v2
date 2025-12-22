"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface VehicleType {
  id: string | number;
  name: string;
  description?: string;
}

interface Vehicle {
  no?: number;
  id?: string | number;
  vehicleCode: string;
  licensePlate: string;
  vehicleType: string;
  vehicleTypeId: string | number;
  driverName: string;
  status: "active" | "inactive";
}

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onCancel: () => void;
  onSave: (vehicle: Vehicle) => void;
  vehicleTypes?: VehicleType[];
}

const statusOptions = ["active", "inactive"];

export function VehicleForm({
  initialData,
  onCancel,
  onSave,
  vehicleTypes = [],
}: VehicleFormProps) {
  const t = useTranslations("vehicle.form");
  const [vehicleCode, setVehicleCode] = useState(
    initialData?.vehicleCode || ""
  );
  const [licensePlate, setLicensePlate] = useState(
    initialData?.licensePlate || ""
  );
  const [vehicleTypeId, setVehicleTypeId] = useState<string | number>(
    initialData?.vehicleTypeId || ""
  );
  const [driverName, setDriverName] = useState(initialData?.driverName || "");
  const [status, setStatus] = useState<"active" | "inactive">(
    initialData?.status || "active"
  );

  const handleSubmit = () => {
    if (!vehicleCode || !licensePlate || !vehicleTypeId || !driverName) {
      Swal.fire(t("requiredFields") || "กรุณากรอกข้อมูลให้ครบ", "", "warning");
      return;
    }
    const vehicle: Vehicle = {
      no: initialData?.no || 0, // Will be assigned by parent component
      id: initialData?.id,
      vehicleCode,
      licensePlate,
      vehicleType: vehicleTypes.find((t) => t.id === vehicleTypeId)?.name || "",
      vehicleTypeId,
      driverName,
      status,
    };
    onSave(vehicle);
  };

  // Set initial vehicle type ID when vehicleTypes are loaded
  useEffect(() => {
    if (vehicleTypes.length > 0 && !vehicleTypeId && initialData?.vehicleType) {
      const foundType = vehicleTypes.find(
        (t) => t.name === initialData.vehicleType
      );
      if (foundType) {
        setVehicleTypeId(foundType.id);
      } else if (vehicleTypes[0]) {
        setVehicleTypeId(vehicleTypes[0].id);
      }
    } else if (vehicleTypes.length > 0 && !vehicleTypeId) {
      // Set default to first vehicle type if available
      setVehicleTypeId(vehicleTypes[0].id);
    }
  }, [vehicleTypes, initialData, vehicleTypeId]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">{t("vehicleCode")}</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={vehicleCode}
          onChange={(e) => setVehicleCode(e.target.value)}
          placeholder={t("vehicleCode")}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">{t("licensePlate")}</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          placeholder={t("licensePlate")}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">{t("vehicleType")}</label>
        <select
          value={vehicleTypeId}
          onChange={(e) => setVehicleTypeId(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          disabled={vehicleTypes.length === 0}
        >
          <option value="">
            {vehicleTypes.length === 0
              ? t("loadingVehicleTypes")
              : t("selectVehicleType")}
          </option>
          {vehicleTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {vehicleTypes.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {t("loadingVehicleTypes")}
          </p>
        )}
      </div>
      <div>
        <label className="block font-semibold mb-1">{t("driver")}</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          placeholder={t("driverNamePlaceholder") || t("driver")}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">{t("status")}</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
        >
          {t("cancel") || "ยกเลิก"}
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          {initialData
            ? t("saveEdit") || "บันทึกการแก้ไข"
            : t("addVehicle") || "เพิ่มรถ"}
        </button>
      </div>
    </div>
  );
}
