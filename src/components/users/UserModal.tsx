"use client";

import { UserForm, type User } from "./UserForm";
import { useTranslations } from "next-intl";
import { AppModal } from "@/components/modal/AppModal";

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
    <AppModal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <UserForm initialData={initialData} onCancel={onClose} onSave={onSave} />
    </AppModal>
  );
}
