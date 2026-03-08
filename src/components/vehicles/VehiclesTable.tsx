"use client";

import Table from "@/components/table/table";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { motion } from "framer-motion";

interface Vehicle {
  no: number;
  id?: string | number;
  vehicleCode: string;
  licensePlate: string;
  vehicleType: string;
  driverName: string;
  sugarType?: string;
  weightTons?: number;
  totalSacks?: number;
  sackRows?: number[];
  status: "active" | "inactive" | "maintenance";
}

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  isLoading?: boolean;
  vehicleTypes?: string[];
}

export function VehiclesTable({
  vehicles,
  onEdit,
  onDelete,
  isLoading = false,
  vehicleTypes = [],
}: VehiclesTableProps) {
  const t = useTranslations();
  const allTypesLabel = t("vehicle.filter.allTypes", { defaultValue: "ทั้งหมด" });
  const filterOptions = [allTypesLabel, ...vehicleTypes];
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState(allTypesLabel);
  const [activeFilter, setActiveFilter] = useState(allTypesLabel);

  const handleSearch = () => {
    setActiveFilter(filterType);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const typeMatch =
      activeFilter === allTypesLabel || vehicle.vehicleType === activeFilter;

    const searchTerm = search.toLowerCase();
    const searchMatch =
      !search ||
      vehicle.vehicleCode.toLowerCase().includes(searchTerm) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm) ||
      vehicle.driverName.toLowerCase().includes(searchTerm) ||
      vehicle.vehicleType.toLowerCase().includes(searchTerm) ||
      (vehicle.sugarType || "").toLowerCase().includes(searchTerm);

    return typeMatch && searchMatch;
  });

  const tableRows = filteredVehicles.map((vehicle) => ({
    ...vehicle,
    rawVehicle: vehicle,
    sugarType: vehicle.sugarType || "-",
    weightTons:
      vehicle.weightTons !== undefined && vehicle.weightTons !== null
        ? vehicle.weightTons.toFixed(2)
        : "-",
    totalSacks:
      vehicle.totalSacks !== undefined && vehicle.totalSacks !== null
        ? vehicle.totalSacks
        : "-",
    sackRowsEditor:
      vehicle.sackRows && vehicle.sackRows.length > 0
        ? vehicle.sackRows
            .map((count, index) => `${t("vehicle.table.rowLabel", { defaultValue: "แถว" })} ${index + 1}: ${count}`)
            .join(", ")
        : "-",
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {t("vehicle.loading", { defaultValue: "กำลังโหลด..." })}
          </p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0 && !search) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 text-lg">
          {t("vehicle.noVehicles", { defaultValue: "ไม่พบข้อมูลรถ" })}
        </p>
        <p className="text-gray-400 mt-2">
          {t("vehicle.noVehiclesInSystem", {
            defaultValue: "ยังไม่มีข้อมูลรถในระบบ",
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("vehicle.filter.type", { defaultValue: "ประเภทรถ" })}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm appearance-none bg-white focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none pr-10"
              >
                {filterOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-lg shadow transition active:scale-95 min-w-[100px] justify-center"
              >
                {t("vehicle.filter.search", { defaultValue: "ค้นหา" })}
              </button>
            </div>
          </div>

          <div>
            <AdminSearchInput
              label={t("vehicle.filter.search", { defaultValue: "ค้นหา" })}
              value={search}
              onValueChange={setSearch}
              placeholder={t("vehicle.searchPlaceholder", {
                defaultValue: "ค้นหาด้วยรหัสรถ, ทะเบียน, คนขับ...",
              })}
              className="max-w-none"
            />
          </div>
        </div>
      </motion.div>

      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 text-lg">
            {t("vehicle.noVehiclesFound", {
              defaultValue: "ไม่พบข้อมูลรถ",
            })}
          </p>
          {(search || activeFilter !== allTypesLabel) && (
            <p className="text-gray-400 mt-2">
              {t("vehicle.tryDifferentSearch", {
                defaultValue: "ลองค้นหาด้วยคำอื่น หรือ",
              })}{" "}
              <button
                onClick={() => {
                  setSearch("");
                  setFilterType(allTypesLabel);
                  setActiveFilter(allTypesLabel);
                }}
                className="text-blue-600 hover:underline"
              >
                {t("vehicle.clearFilters", { defaultValue: "ล้างตัวกรอง" })}
              </button>
            </p>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Table
            type="vehicle"
            data={tableRows}
            onEdit={(item) => onEdit((item.rawVehicle as Vehicle) || (item as Vehicle))}
            onDelete={(item) =>
              onDelete((item.rawVehicle as Vehicle) || (item as Vehicle))
            }
          />
        </motion.div>
      )}
    </div>
  );
}
