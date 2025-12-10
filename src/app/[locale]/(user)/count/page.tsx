"use client";

import BagRow from "@/components/count/BagRow";
import BoxRow from "@/components/count/BoxRow";
import CustomDropdown from "@/components/count/CustomDropdown";
import Tabs from "@/components/count/Tabs";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
  <div className="min-h-screen flex justify-center p-4 bg-gray-100">
    <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl">

      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
        {t("title")}
      </h1>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>

      {/* รถขนส่ง + ประเภทน้ำตาล */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("transportation")}
          </label>
          <CustomDropdown
            options={[
              t("transportationOptions.0"),
              t("transportationOptions.1"),
              t("transportationOptions.2")
            ]}
            selected={transportation}
            setSelected={setTransportation}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("sugarType")}
          </label>
          <CustomDropdown
            options={[
              t("sugarTypeOptions.0"),
              t("sugarTypeOptions.1"),
              t("sugarTypeOptions.2")
            ]}
            selected={sugarType}
            setSelected={setSugarType}
          />
        </div>
      </div>

      {/* รายการแถว */}
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
          )
        )}

        <button
          onClick={addRow}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow"
        >
          <Plus className="w-4 h-4" />
          {t("addRow")}
        </button>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={handleSave}
          className="w-full sm:w-56 py-3 text-lg font-medium text-white bg-indigo-700 rounded-xl hover:bg-indigo-800 transition shadow-md"
        >
          {t("save")}
        </button>
      </div>

    </div>
  </div>
);

}
