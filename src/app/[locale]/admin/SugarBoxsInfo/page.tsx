"use client";

import Table from "@/components/table/table";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/settings";
import { useEffect, useState } from "react";

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
      <h1 className="text-2xl font-bold mb-6">
        {dict.dashboard.sidebar.SugarBoxsInfo}
      </h1>

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
    </div>
  );
}
