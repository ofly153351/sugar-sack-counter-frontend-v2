"use client";

import Table from "@/components/table/table";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/settings";
import { useEffect, useState } from "react";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

const mockBagsData = [
  {
    no: 1,
    vehicleCode: "V001",
    datetime: "2025-12-08 09:35",
    createdBy: "สมชาย พนักงานคลัง",
    sugarType: "น้ำตาลทรายขาว",
    amount: "200 กระสอบ",
  },
  {
    no: 2,
    vehicleCode: "V014",
    datetime: "2025-12-08 10:12",
    createdBy: "อรทัย บัญชี",
    sugarType: "น้ำตาลทรายดิบ",
    amount: "150 กระสอบ",
  },
  {
    no: 3,
    vehicleCode: "V009",
    datetime: "2025-12-08 11:02",
    createdBy: "ภิญโญ คลังสินค้า",
    sugarType: "น้ำตาลทรายแดง",
    amount: "180 กระสอบ",
  },
  {
    no: 4,
    vehicleCode: "V021",
    datetime: "2025-12-08 13:20",
    createdBy: "สุรีย์ แผนกผลิต",
    sugarType: "น้ำตาลทรายขาว",
    amount: "220 กระสอบ",
  },
  {
    no: 5,
    vehicleCode: "V007",
    datetime: "2025-12-08 14:55",
    createdBy: "ศรายุทธ พนักงานคลัง",
    sugarType: "น้ำตาลทรายดิบ",
    amount: "160 กระสอบ",
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

  const filteredData = mockBagsData.filter((item) =>
    item.vehicleCode.toLowerCase().includes(searchCode.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {dict.dashboard.sidebar.SugarBagsInfo}
      </h1>

      {/* 🔍 ตัวกรองรหัสรถ */}
      <div className="mb-6 p-4 bg-white border border-gray-100 rounded-xl shadow-sm max-w-3xl">


        <label className="block text-gray-700 font-semibold mb-2">
          ค้นหารหัสรถ
        </label>
        <input
          type="text"
          placeholder="เช่น V001, V021..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none 
                     focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        />
      </div>

      {/* ตาราง */}
      <Table dict={dict} type="bags" data={filteredData} />
    </div>
  );
}
