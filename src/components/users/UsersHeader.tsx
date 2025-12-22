"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface UsersHeaderProps {
  onAddUser: () => void;
}

export function UsersHeader({ onAddUser }: UsersHeaderProps) {
  const t = useTranslations("users");

  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <button
        onClick={onAddUser}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
        aria-label={t("addUser")}
      >
        <PlusCircle size={20} />
        {t("addUser")}
      </button>
    </div>
  );
}
