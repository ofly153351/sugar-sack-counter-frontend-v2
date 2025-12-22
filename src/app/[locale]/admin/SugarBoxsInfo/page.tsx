"use client";

import Table from "@/components/table/table";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/settings";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { SugarTypeModal } from "@/components/sugar-types/SugarTypeModal";
import { createSugarType } from "@/utils/count/count-api";
import Swal from "sweetalert2";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

const mockBoxData = [
  {
    no: 1,
    vehicleCode: "BX001",
    datetime: "2025-12-08 08:45",
    createdBy: "สุรีย์ แผนกผลิต",
    sugarType: "น้ำตาลทรายขาว",
    amount: "350 กล่อง",
  },
  {
    no: 2,
    vehicleCode: "BX014",
    datetime: "2025-12-08 09:25",
    createdBy: "อรอุมา คลังสินค้า",
    sugarType: "น้ำตาลทรายดิบ",
    amount: "280 กล่อง",
  },
  {
    no: 3,
    vehicleCode: "BX009",
    datetime: "2025-12-08 10:10",
    createdBy: "พิชัย คลังสินค้า",
    sugarType: "น้ำตาลทรายแดง",
    amount: "300 กล่อง",
  },
  {
    no: 4,
    vehicleCode: "BX021",
    datetime: "2025-12-08 11:40",
    createdBy: "ศิริพร แผนกผลิต",
    sugarType: "น้ำตาลทรายขาว",
    amount: "410 กล่อง",
  },
  {
    no: 5,
    vehicleCode: "BX007",
    datetime: "2025-12-08 13:30",
    createdBy: "ประเสริฐ โกดังสินค้า",
    sugarType: "น้ำตาลทรายดิบ",
    amount: "290 กล่อง",
  },
];

export default function Page({ params }: PageProps) {
  const [dict, setDict] = useState<any>(null);
  const [searchCode, setSearchCode] = useState("");
  const [isSugarTypeModalOpen, setIsSugarTypeModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function load() {
      const { locale } = await params;
      const d = await getDictionary(locale);
      setDict(d);
    }
    load();
  }, [params]);

  if (!dict) return <div className="p-6">กำลังโหลด...</div>;

  // 🔍 Filter vehicleCode
  const filteredData = mockBoxData.filter((item) =>
    item.vehicleCode.toLowerCase().includes(searchCode.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {dict.dashboard.sidebar.SugarBoxsInfo}
        </h1>
        <button
          onClick={() => setIsSugarTypeModalOpen(true)}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {dict.count.addSugarType || "กำลังเพิ่ม..."}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {dict.count.addSugarType || "เพิ่มชนิดน้ำตาล"}
            </>
          )}
        </button>
      </div>

      {/* 🔍 ตัวกรองรหัสรถ */}
      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm max-w-2xl">
        <label className="block text-gray-700 font-semibold mb-2">
          ค้นหารหัสรถ
        </label>
        <input
          type="text"
          placeholder="เช่น BX001, BX021..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     focus:border-blue-400 transition"
        />
      </div>

      {/* ตาราง */}
      <Table dict={dict} type="box" data={filteredData} />

      {/* Sugar Type Modal */}
      <SugarTypeModal
        isOpen={isSugarTypeModalOpen}
        onClose={() => setIsSugarTypeModalOpen(false)}
        onSave={async (sugarType) => {
          setIsCreating(true);
          try {
            await createSugarType({
              name: sugarType.name,
              description: sugarType.description,
            });

            // Show success message
            Swal.fire({
              title: dict?.sugarTypeManagement?.successTitle || "สำเร็จ!",
              text:
                dict?.sugarTypeManagement?.addSuccess ||
                "เพิ่มชนิดน้ำตาลเรียบร้อยแล้ว",
              icon: "success",
              confirmButtonText: dict?.sugarTypeManagement?.ok || "ตกลง",
              confirmButtonColor: "#3085d6",
            });
          } catch (error: any) {
            console.error("❌ Error creating sugar type:", error);
            Swal.fire({
              title: dict?.sugarTypeManagement?.errorTitle || "เกิดข้อผิดพลาด",
              text:
                error.message ||
                dict?.sugarTypeManagement?.createErrorMessage ||
                "ไม่สามารถเพิ่มชนิดน้ำตาลได้",
              icon: "error",
              confirmButtonText: dict?.sugarTypeManagement?.ok || "ตกลง",
              confirmButtonColor: "#3085d6",
            });
          } finally {
            setIsCreating(false);
          }
        }}
      />
    </div>
  );
}
