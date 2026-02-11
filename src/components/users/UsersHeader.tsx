"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface UsersHeaderProps {
  onAddUser: () => void;
}

export function UsersHeader({ onAddUser }: UsersHeaderProps) {
  const t = useTranslations("users");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4">
      <h1 className="text-xl sm:text-2xl font-bold">{t("title")}</h1>
      <button
        onClick={onAddUser}
        className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm sm:text-base rounded-lg shadow transition-colors w-full sm:w-auto"
        aria-label={t("addUser")}
      >
        <PlusCircle size={20} />
        {t("addUser")}
      </button>
    </div>
  );
}
