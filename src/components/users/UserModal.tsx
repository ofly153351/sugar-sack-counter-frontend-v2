"use client";

import { X } from "lucide-react";
import { UserForm, type User } from "./UserForm";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

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

  const modalTitle = initialData ? t("editUser") : t("addUser");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
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

            <UserForm initialData={initialData} onCancel={onClose} onSave={onSave} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
