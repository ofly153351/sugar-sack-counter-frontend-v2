"use client";

import Table from "@/components/table/table"; // import Table Component
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

interface Vehicle {
  no: number;
  vehicleCode: string;
  licensePlate: string;
  vehicleType: string;
  driver: string;
  status: "Active" | "Inactive";
}

const vehicleDataDefault: Vehicle[] = [
  { no: 1, vehicleCode: "V001", licensePlate: "กข 1234", vehicleType: "รถบรรทุก", driver: "สมชาย", status: "Active" },
  { no: 2, vehicleCode: "V002", licensePlate: "ขท 5678", vehicleType: "รถกระบะ", driver: "สมนึก", status: "Inactive" },
  { no: 3, vehicleCode: "V003", licensePlate: "จฉ 9012", vehicleType: "รถบรรทุก", driver: "มานี", status: "Active" },
];

const vehicleTypes = ["ทั้งหมด", "รถบรรทุก", "รถกระบะ"];
const statusOptions = ["Active", "Inactive"];

export default function VehicleInfoPage() {
  const [vehicleData, setVehicleData] = useState(vehicleDataDefault);
  const [filterType, setFilterType] = useState("ทั้งหมด");
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Vehicle | null>(null);

  const handleSearch = () => {
    setActiveFilter(filterType);
  };

  const filteredData =
    activeFilter === "ทั้งหมด"
      ? vehicleData
      : vehicleData.filter((v) => v.vehicleType === activeFilter);

  const handleDelete = (vehicle: Vehicle) => {
    Swal.fire({
      title: "ต้องการลบข้อมูลนี้?",
      text: `ทะเบียน: ${vehicle.licensePlate}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        setVehicleData((prev) => prev.filter((i) => i.no !== vehicle.no));
        Swal.fire("ลบแล้ว!", "ข้อมูลถูกลบเรียบร้อย", "success");
      }
    });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditItem(vehicle);
    setModalOpen(true);
  };

  const handleSave = (vehicle: Vehicle) => {
    if (editItem) {
      // แก้ไข
      setVehicleData((prev) => prev.map((v) => (v.no === vehicle.no ? vehicle : v)));
    } else {
      // เพิ่ม
      setVehicleData((prev) => [...prev, { ...vehicle, no: prev.length + 1 }]);
    }
    setModalOpen(false);
    setEditItem(null);
  };

  return (
    <div className="p-6">
      {/* หัวตาราง + ปุ่มเพิ่ม */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">จัดการรถขนส่ง</h1>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition active:scale-95"
        >
          <PlusCircle size={20} /> เพิ่มรถขนส่ง
        </button>
      </div>

      {/* ตัวกรอง */}
    <div className="mb-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-white w-3/4">
  <label className="block text-gray-700 font-semibold mb-2">ประเภทรถ</label>
  <div className="flex items-center gap-2">
    <select
      value={filterType}
      onChange={(e) => setFilterType(e.target.value)}
      className="flex-1 border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm appearance-none bg-white focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none pr-10"
    >
      {vehicleTypes.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
    <button
      onClick={handleSearch}
      className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2.5 rounded-lg shadow transition active:scale-95 min-w-[100px] justify-center"
    >
      ค้นหา
    </button>
  </div>
</div>

      {/* Table */}
      <Table
        type="vehicle"
        data={filteredData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold mb-4">{editItem ? "แก้ไขรถขนส่ง" : "เพิ่มรถขนส่ง"}</h2>

            <VehicleForm
              initialData={editItem}
              onCancel={() => { setModalOpen(false); setEditItem(null); }}
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- VehicleForm Component ----------
interface VehicleFormProps {
  initialData?: Vehicle | null;
  onCancel: () => void;
  onSave: (vehicle: Vehicle) => void;
}

function VehicleForm({ initialData, onCancel, onSave }: VehicleFormProps) {
  const [vehicleCode, setVehicleCode] = useState(initialData?.vehicleCode || "");
  const [licensePlate, setLicensePlate] = useState(initialData?.licensePlate || "");
  const [vehicleType, setVehicleType] = useState(initialData?.vehicleType || "รถบรรทุก");
  const [driver, setDriver] = useState(initialData?.driver || "");
  const [status, setStatus] = useState<"Active" | "Inactive">(initialData?.status || "Active");

  const handleSubmit = () => {
    if (!vehicleCode || !licensePlate || !vehicleType || !driver) {
      Swal.fire("กรุณากรอกข้อมูลให้ครบ", "", "warning");
      return;
    }
    const vehicle: Vehicle = {
      no: initialData?.no || Date.now(), // ใช้ timestamp แทน no ชั่วคราว
      vehicleCode,
      licensePlate,
      vehicleType,
      driver,
      status,
    };
    onSave(vehicle);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">รหัสรถ</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={vehicleCode}
          onChange={(e) => setVehicleCode(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">ทะเบียนรถ</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">ประเภทรถ</label>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          {vehicleTypes.filter((v) => v !== "ทั้งหมด").map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">คนขับ</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={driver}
          onChange={(e) => setDriver(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">สถานะ</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
        >
          ยกเลิก
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          {initialData ? "บันทึกการแก้ไข" : "เพิ่มรถ"}
        </button>
      </div>
    </div>
  );
}
