"use client";

import { Camera, CloudDownload, Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface BagRowProps {
  rowNumber: number;
  onDelete: () => void;
}

export default function BagRow({ rowNumber, onDelete }: BagRowProps) {
  const t = useTranslations("count.bagRow");
  const [bagWeight, setBagWeight] = useState("25");
  const [manualCount, setManualCount] = useState(20);
  const aiCount = 20;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="w-full md:w-1/4 flex-shrink-0">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          {t("row")} {rowNumber}
        </label>
        <div className="relative mt-1">
          <button
            onClick={onDelete}
            className="absolute top-0 right-4 z-30 w-8 h-8 flex items-center justify-center bg-orange-500 border-4 border-white text-white rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 shadow-none"
            title="ลบแถว"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="bg-white border border-gray-300 w-full md:w-28 h-28 flex items-center justify-center rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 relative z-10">
            <ImageIcon className="w-12 h-12 text-gray-300" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-1 space-y-2 w-full">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 text-sm font-medium rounded-lg ${bagWeight === "25" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
            onClick={() => setBagWeight("25")}
          >
            {t("weight")} 25
          </button>
          <button
            className={`px-3 py-1 text-sm font-medium rounded-lg ${bagWeight === "50" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
            onClick={() => setBagWeight("50")}
          >
            {t("weight")} 50
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Camera className="w-4 h-4 mr-2" />
            {t("takePhoto")}
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
            <CloudDownload className="w-4 h-4 mr-2" />
            {t("upload")}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <label className="text-sm text-gray-600 w-35 whitespace-nowrap">
            {t("manualCount")} {rowNumber}
          </label>
          <input
            type="number"
            value={manualCount}
            onChange={(e) => setManualCount(Number(e.target.value))}
            className="w-20 p-1 text-center border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-sm text-gray-600">{t("bags")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600 w-33 whitespace-nowrap">
            {t("aiCount")}
          </label>
          <div className="w-20 p-1 text-center border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed">
            {aiCount}
          </div>
          <span className="text-sm text-gray-600">{t("bags")}</span>
        </div>
      </div>
    </div>
  );
}
