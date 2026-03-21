"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";

interface VehicleType {
  id: string | number;
  name: string;
}

interface Vehicle {
  no?: number;
  id?: string | number;
  vehicleCode: string;
  licensePlate: string;
  vehicleType: string;
  vehicleTypeId: string | number;
  maxLoadWeightTon: number;
  driverUserId?: string | number;
  driverName: string;
  sugarType?: string;
  totalSacks?: number;
  sackRows?: number[];
  status: "active" | "inactive" | "maintenance";
}

interface DriverUserOption {
  value: string | number;
  label: string;
}

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onCancel: () => void;
  onSave: (vehicle: Vehicle) => void;
  vehicleTypes?: VehicleType[];
  driverUsers?: DriverUserOption[];
  sugarTypes?: string[];
}

const statusOptions = ["active", "inactive", "maintenance"] as const;

export function VehicleForm({
  initialData,
  onCancel,
  onSave,
  vehicleTypes = [],
  driverUsers = [],
  sugarTypes = [],
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
  const [driverUserId, setDriverUserId] = useState<string | number>(
    initialData?.driverUserId || ""
  );
  const [status, setStatus] = useState<"active" | "inactive" | "maintenance">(
    initialData?.status || "active"
  );
  const [sugarType, setSugarType] = useState(initialData?.sugarType || "");
  const [sackRows, setSackRows] = useState<number[]>(
    initialData?.sackRows && initialData.sackRows.length > 0
      ? initialData.sackRows
      : [0]
  );
  const [sackRowsError, setSackRowsError] = useState<string>("");
  const totalSacks = sackRows.reduce((sum, count) => sum + (count || 0), 0);
  const [maxLoadWeightTon, setMaxLoadWeightTon] = useState<number>(
    initialData?.maxLoadWeightTon !== undefined &&
      initialData?.maxLoadWeightTon !== null
      ? Number(initialData.maxLoadWeightTon)
      : 0
  );
  const selectedVehicleTypeId = (() => {
    if (vehicleTypeId) return vehicleTypeId;
    if (vehicleTypes.length === 0) return "";

    if (initialData?.vehicleType) {
      const foundType = vehicleTypes.find((t) => t.name === initialData.vehicleType);
      if (foundType) return foundType.id;
    }

    return vehicleTypes[0]?.id || "";
  })();
  const selectedDriverUserId = (() => {
    if (driverUserId) return driverUserId;
    if (driverUsers.length === 0) return "";

    if (initialData?.driverUserId) {
      return initialData.driverUserId;
    }

    return driverUsers[0]?.value || "";
  })();
  const selectedDriverLabel =
    driverUsers.find(
      (driver) => String(driver.value) === String(selectedDriverUserId)
    )?.label ||
    "";

  const handleSubmit = () => {
    if (
      !vehicleCode ||
      !licensePlate ||
      !selectedVehicleTypeId ||
      !selectedDriverUserId
    ) {
      Swal.fire(t("requiredFields") || "กรุณากรอกข้อมูลให้ครบ", "", "warning");
      return;
    }

    const hasAtLeastOneValidRow = sackRows.some(
      (count) => Number.isFinite(count) && Number(count) > 0
    );
    if (!hasAtLeastOneValidRow) {
      setSackRowsError("กรุณากรอกกระสอบอย่างน้อย 1 แถว และจำนวนต้องมากกว่า 0");
      return;
    }
    setSackRowsError("");

    const vehicle: Vehicle = {
      no: initialData?.no || 0, // Will be assigned by parent component
      id: initialData?.id,
      vehicleCode,
      licensePlate,
      vehicleType:
        vehicleTypes.find(
          (t) => String(t.id) === String(selectedVehicleTypeId)
        )?.name || "",
      vehicleTypeId: selectedVehicleTypeId,
      maxLoadWeightTon,
      driverUserId: selectedDriverUserId,
      driverName: selectedDriverLabel,
      sugarType: sugarType || "",
      sackRows,
      totalSacks,
      status,
    };
    onSave(vehicle);
  };

  const handleSackRowChange = (index: number, value: string) => {
    const parsed = Number(value);
    const safe = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    setSackRows((prev) => {
      const next = [...prev];
      next[index] = safe;
      return next;
    });
    setSackRowsError("");
  };

  const addSackRow = () => {
    setSackRows((prev) => [...prev, 0]);
    setSackRowsError("");
  };

  const removeSackRow = (index: number) => {
    setSackRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
    setSackRowsError("");
  };

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
          value={String(selectedVehicleTypeId)}
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
            <option key={type.id} value={String(type.id)}>
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
        <select
          value={String(selectedDriverUserId)}
          onChange={(e) => setDriverUserId(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          disabled={driverUsers.length === 0}
        >
          <option value="">
            {driverUsers.length === 0 ? t("loadingDrivers") : t("selectDriver")}
          </option>
          {driverUsers.map((driver) => (
            <option key={driver.value} value={String(driver.value)}>
              {driver.label}
            </option>
          ))}
        </select>
        {driverUsers.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">{t("loadingDrivers")}</p>
        )}
      </div>
      <div>
        <label className="block font-semibold mb-1">{t("status")}</label>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "active" | "inactive" | "maintenance")
          }
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1">
          {t("sugarType", { defaultValue: "ชนิดน้ำตาล" })}
        </label>
        <select
          value={sugarType}
          onChange={(e) => setSugarType(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">
            {t("selectSugarType", { defaultValue: "เลือกชนิดน้ำตาล" })}
          </option>
          {sugarTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-2">
          {t("sackRowsEditor", { defaultValue: "กรอกกระสอบแต่ละแถว" })}
        </label>
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          {sackRows.map((count, index) => (
            <div key={`sack-row-${index}`} className="flex items-center gap-2">
              <span className="w-14 text-sm text-slate-600">
                {t("rowLabel", { defaultValue: "แถว" })} {index + 1}
              </span>
              <input
                type="number"
                min={0}
                value={count}
                onChange={(e) => handleSackRowChange(index, e.target.value)}
                className="w-28 border border-gray-300 rounded px-3 py-2"
              />
              {sackRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSackRow(index)}
                  className="px-3 py-2 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 text-sm"
                >
                  {t("removeRow", { defaultValue: "ลบแถว" })}
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSackRow}
            className="w-full px-3 py-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
          >
            + {t("addRow", { defaultValue: "เพิ่มแถว" })}
          </button>
        </div>
        {sackRowsError && (
          <p className="mt-2 text-sm text-red-600">{sackRowsError}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold mb-1">
            {t("totalSacks", { defaultValue: "จำนวนรวมกระสอบ" })}
          </label>
          <input
            type="number"
            value={totalSacks}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">
            {t("maxLoadWeightTon", { defaultValue: "น้ำหนักบรรทุกสูงสุด (ตัน)" })}
          </label>
          <input
            type="number"
            step="0.01"
            min={0}
            value={maxLoadWeightTon}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              setMaxLoadWeightTon(
                Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
              );
            }}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
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
