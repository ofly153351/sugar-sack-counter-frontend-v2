"use client";

import Table from "@/components/table/table";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Vehicle {
  no: number;
  vehicleCode: string;
  licensePlate: string;
  vehicleType: string;
  driverName: string;
  status: "active" | "inactive";
}

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  isLoading?: boolean;
}

const vehicleTypes = ["ทั้งหมด", "รถบรรทุก", "รถกระบะ"];

export function VehiclesTable({
  vehicles,
  onEdit,
  onDelete,
  isLoading = false,
}: VehiclesTableProps) {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ทั้งหมด");
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");

  const handleSearch = () => {
    setActiveFilter(filterType);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    // Apply type filter
    const typeMatch =
      activeFilter === "ทั้งหมด" || vehicle.vehicleType === activeFilter;

    // Apply search filter
    const searchTerm = search.toLowerCase();
    const searchMatch =
      !search ||
      vehicle.vehicleCode.toLowerCase().includes(searchTerm) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm) ||
      vehicle.driverName.toLowerCase().includes(searchTerm) ||
      vehicle.vehicleType.toLowerCase().includes(searchTerm);

    return typeMatch && searchMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {t("vehicle.loading", { defaultValue: "Loading..." })}
          </p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0 && !search) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 text-lg">
          {t("vehicle.noVehicles", { defaultValue: "No vehicles found" })}
        </p>
        <p className="text-gray-400 mt-2">
          {t("vehicle.noVehiclesInSystem", {
            defaultValue: "No vehicles in the system",
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
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
                {vehicleTypes.map((type) => (
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

          {/* Search Filter */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {t("vehicle.filter.search", { defaultValue: "ค้นหา" })}
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder={t("vehicle.searchPlaceholder", {
                  defaultValue: "ค้นหาด้วยรหัสรถ, ทะเบียน, คนขับ...",
                })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 text-lg">
            {t("vehicle.noVehiclesFound", {
              defaultValue: "No vehicles found",
            })}
          </p>
          {(search || activeFilter !== "ทั้งหมด") && (
            <p className="text-gray-400 mt-2">
              {t("vehicle.tryDifferentSearch", {
                defaultValue: "Try a different search term or",
              })}{" "}
              <button
                onClick={() => {
                  setSearch("");
                  setFilterType("ทั้งหมด");
                  setActiveFilter("ทั้งหมด");
                }}
                className="text-blue-600 hover:underline"
              >
                {t("vehicle.clearFilters", { defaultValue: "clear filters" })}
              </button>
            </p>
          )}
        </div>
      ) : (
        <Table
          type="vehicle"
          data={filteredVehicles}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
