"use client";

import { PlusCircle } from "lucide-react";

interface UsersHeaderProps {
  title?: string;
  onAddUser: () => void;
  addButtonText?: string;
}

export function UsersHeader({
  title = "จัดการผู้ใช้งาน",
  onAddUser,
  addButtonText = "เพิ่มผู้ใช้งาน",
}: UsersHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button
        onClick={onAddUser}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
        aria-label={addButtonText}
      >
        <PlusCircle size={20} />
        {addButtonText}
      </button>
    </div>
  );
}
