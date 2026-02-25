"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { type User } from "@/utils/admin/users/user-api";
import { useTranslations } from "next-intl";
import { UserAccountCredentialsFields } from "./UserAccountCredentialsFields";

interface UserFormProps {
  initialData?: User | null;
  onCancel: () => void;
  onSave: (user: User) => void;
}

export function UserForm({ initialData, onCancel, onSave }: UserFormProps) {
  const t = useTranslations("users");
  const isEditMode = !!initialData;
  const [username, setUsername] = useState(initialData?.username || "");
  const [empCode] = useState(initialData?.empCode || "");
  const [firstname] = useState(initialData?.firstname || "");
  const [lastname] = useState(initialData?.lastname || "");
  const [phone] = useState(initialData?.phone || "");
  const [email] = useState(initialData?.email || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [title] = useState(initialData?.title || "Mr.");

  const readOnlyInputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed";
  const editableInputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200";

  const handleSubmit = () => {
    if (!username.trim()) {
      Swal.fire(t("form.requiredFields"), "", "warning");
      return;
    }

    if (!isEditMode && (!password || !confirmPassword)) {
      Swal.fire(t("form.passwordRequired"), "", "warning");
      return;
    }

    if (!isEditMode && password.trim().length < 6) {
      Swal.fire(t("form.passwordMin"), "", "warning");
      return;
    }

    if (password && password !== confirmPassword) {
      Swal.fire(t("form.passwordMismatch"), "", "error");
      return;
    }

    onSave({
      no: initialData?.no || 0, // Will be assigned by parent component or backend
      username: username || "",
      empCode,
      firstname,
      lastname,
      phone: phone || "",
      email: email || "",
      password: password || initialData?.password || "", // Keep existing password if not changed
      title: title || "Mr.",
      ...(initialData && { id: initialData.id }), // Preserve backend ID for updates
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          {isEditMode
            ? t("form.editableSectionTitle", { defaultValue: "ข้อมูลบัญชีผู้ใช้" })
            : t("form.accountSectionTitle", { defaultValue: "ข้อมูลบัญชีผู้ใช้" })}
        </p>
        <UserAccountCredentialsFields
          idPrefix="users-form"
          username={username}
          password={password}
          confirmPassword={confirmPassword}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          usernameLabel={t("form.username")}
          passwordLabel={t("form.password")}
          confirmPasswordLabel={t("form.confirmPassword")}
          usernameRequired
          passwordRequired={!isEditMode}
          confirmPasswordRequired={!isEditMode}
          inputClassName={editableInputClass}
          labelClassName="mb-1 block text-sm font-medium text-slate-700"
          layoutClassName="grid grid-cols-1 gap-3 sm:grid-cols-2"
        />
        {isEditMode && (
          <p className="text-xs text-slate-500">
            {t("form.passwordOptional", {
              defaultValue: "เว้นรหัสผ่านว่างไว้ได้ หากไม่ต้องการเปลี่ยนรหัสผ่าน",
            })}
          </p>
        )}
      </div>



      {/* Buttons */}
      <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4 -mx-5 -mb-5">
        <button
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white transition"
        >
          {t("form.cancel")}
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-sky-700 hover:to-blue-700 transition"
        >
          {t("form.save")}
        </button>
      </div>
    </div>
  );
}
