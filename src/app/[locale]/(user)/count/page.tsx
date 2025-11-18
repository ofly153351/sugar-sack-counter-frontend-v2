"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import BagRow from "@/components/count/BagRow";
import BoxRow from "@/components/count/BoxRow";
import CustomDropdown from "@/components/count/CustomDropdown";
import Tabs from "@/components/count/Tabs";

// CountPage
export default function CountPage() {
  const t = useTranslations("count");
  const [currentTab, setCurrentTab] = useState("bags");
  const [transportation, setTransportation] = useState(
    t("transportationOptions.2"),
  );
  const [sugarType, setSugarType] = useState(t("sugarTypeOptions.2"));
  const [rows, setRows] = useState<number[]>([1]);

  const addRow = () =>
    setRows((prev) => [...prev, (prev[prev.length - 1] || 0) + 1]);
  const deleteRow = (rowNumber: number) =>
    setRows((prev) => prev.filter((r) => r !== rowNumber));
  const handleSave = () => alert("บันทึกข้อมูลเรียบร้อย!");

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {t("title")}
        </h1>

        {/* Tabs */}
        <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* รถขนส่ง */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 items-center">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-black mb-1">
              {t("transportation")}
            </label>
            <CustomDropdown
              options={[
                t("transportationOptions.0"),
                t("transportationOptions.1"),
                t("transportationOptions.2"),
              ]}
              selected={transportation}
              setSelected={setTransportation}
            />
          </div>
        </div>

        {/* ชนิดน้ำตาล */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-black mb-1">
            {t("sugarType")}
          </label>
          <CustomDropdown
            options={[
              t("sugarTypeOptions.0"),
              t("sugarTypeOptions.1"),
              t("sugarTypeOptions.2"),
            ]}
            selected={sugarType}
            setSelected={setSugarType}
          />
        </div>

        {/* แถว */}
        <div className="space-y-4">
          {rows.map((rowNumber) =>
            currentTab === "bags" ? (
              <BagRow
                key={rowNumber}
                rowNumber={rowNumber}
                onDelete={() => deleteRow(rowNumber)}
              />
            ) : (
              <BoxRow
                key={rowNumber}
                rowNumber={rowNumber}
                onDelete={() => deleteRow(rowNumber)}
              />
            ),
          )}

          <button
            onClick={addRow}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("addRow")}
          </button>
        </div>

        {/* ปุ่มบันทึก */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            className="w-full sm:w-48 flex items-center justify-center px-4 py-3 text-lg font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors shadow-lg"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
