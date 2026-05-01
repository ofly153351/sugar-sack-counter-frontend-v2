"use client";

import { useTranslations } from "next-intl";

interface TabsProps {
  currentTab: "bags" | "boxes";
  setCurrentTab: (tab: "bags" | "boxes") => void;
  disableBoxes?: boolean;
}

export default function Tabs({
  currentTab,
  setCurrentTab,
  disableBoxes = false,
}: TabsProps) {
  const t = useTranslations("count.tabs");
  return (
    <div className="flex justify-center mb-6 border-b border-gray-200 overflow-x-auto">
      <button
        onClick={() => setCurrentTab("bags")}
        className={`px-6 py-2 text-lg font-semibold transition-colors ${
          currentTab === "bags"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {t("bags")}
      </button>
      {!disableBoxes && (
        <button
          onClick={() => setCurrentTab("boxes")}
          className={`px-6 py-2 text-lg font-semibold transition-colors ${
            currentTab === "boxes"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {t("boxes")}
        </button>
      )}
    </div>
  );
}
