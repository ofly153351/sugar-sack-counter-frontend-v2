"use client";

import { X } from "lucide-react";
import { UserForm, type User } from "./UserForm";
import { useTranslations } from "next-intl";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User | null;
  onSave: (user: User) => void;
}

export function UserModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: UserModalProps) {
  const t = useTranslations("users");

  if (!isOpen) return null;

  const modalTitle = initialData ? t("editUser") : t("addUser");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        {/* Header Modal */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{modalTitle}</h2>
          <button
            className="text-gray-600 hover:text-black transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        <UserForm
          initialData={initialData}
          onCancel={onClose}
          onSave={(user) => {
            onSave(user);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
