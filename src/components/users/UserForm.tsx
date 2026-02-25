"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { type User } from "@/utils/admin/users/user-api";
import { useTranslations } from "next-intl";

interface UserFormProps {
  initialData?: User | null;
  onCancel: () => void;
  onSave: (user: User) => void;
}

export function UserForm({ initialData, onCancel, onSave }: UserFormProps) {
  const t = useTranslations("users");
  const isEditMode = !!initialData;
  const [username, setUsername] = useState(initialData?.username || "");
  const [empCode, setEmpCode] = useState(initialData?.empCode || "");
  const [firstname, setFirstname] = useState(initialData?.firstname || "");
  const [lastname, setLastname] = useState(initialData?.lastname || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [title, setTitle] = useState(initialData?.title || "Mr.");

  const readOnlyInputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed";
  const editableInputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2";

  const handleSubmit = () => {
    if (!username.trim()) {
      Swal.fire(t("form.requiredFields"), "", "warning");
      return;
    }

    if (
      !isEditMode &&
      (!empCode.trim() ||
        !firstname.trim() ||
        !lastname.trim() ||
        !phone.trim() ||
        !email.trim())
    ) {
      Swal.fire(t("form.requiredFields"), "", "warning");
      return;
    }

    if (!isEditMode && (!password || !confirmPassword)) {
      Swal.fire(t("form.passwordRequired"), "", "warning");
      return;
    }

    if (password && password !== confirmPassword) {
      Swal.fire(t("form.passwordMismatch"), "", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!isEditMode && !emailRegex.test(email)) {
      Swal.fire(t("form.invalidEmail"), "", "error");
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


      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          {isEditMode ? "ข้อมูลที่แก้ไขได้" : "ข้อมูลผู้ใช้"}
        </p>
        <div>
          <label className="block mb-1 font-medium">{t("form.username")} <span className="text-red-500">*</span></label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={editableInputClass}
            placeholder={t("form.username")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 font-medium">{t("form.password")} {!isEditMode && <span className="text-red-500">*</span>}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={editableInputClass}
              placeholder={t("form.password")}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">{t("form.confirmPassword")} {!isEditMode && <span className="text-red-500">*</span>}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={editableInputClass}
              placeholder={t("form.confirmPassword")}
            />
          </div>
        </div>
        {isEditMode && (
          <p className="text-xs text-red-500">
            {t("form.passwordOptional", {
              defaultValue: "เว้นรหัสผ่านว่างไว้ได้ หากไม่ต้องการเปลี่ยนรหัสผ่าน",
            })}
          </p>
        )}
      </div>

      {isEditMode && (
        <div className="rounded-lg border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">
            {t("form.readOnlySectionTitle", {
              defaultValue: "ข้อมูลอ่านอย่างเดียว",
            })}
          </p>

          <div>
            <label className="block mb-1 font-medium">{t("form.employeeCode")}</label>
            <input value={empCode} className={readOnlyInputClass} disabled />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">{t("form.firstName")}</label>
              <input value={firstname} className={readOnlyInputClass} disabled />
            </div>
            <div>
              <label className="block mb-1 font-medium">{t("form.lastName")}</label>
              <input value={lastname} className={readOnlyInputClass} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">{t("form.phone")}</label>
              <input value={phone} className={readOnlyInputClass} disabled />
            </div>
            <div>
              <label className="block mb-1 font-medium">{t("form.email")}</label>
              <input value={email} className={readOnlyInputClass} disabled />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">{t("form.title")}</label>
            <input value={title} className={readOnlyInputClass} disabled />
          </div>
        </div>
      )}

      {!isEditMode && (
        <div>
          <label className="block mb-1 font-medium">{t("form.title")}</label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={editableInputClass}
          >
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Ms.">Ms.</option>
            <option value="Dr.">Dr.</option>
          </select>
        </div>
      )}

      {!isEditMode && (
        <>
          <div>
            <label className="block mb-1 font-medium">
              {t("form.employeeCode")} <span className="text-red-500">*</span>
            </label>
            <input
              value={empCode}
              onChange={(e) => setEmpCode(e.target.value)}
              className={editableInputClass}
              placeholder={t("form.employeeCode")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">
                {t("form.firstName")} <span className="text-red-500">*</span>
              </label>
              <input
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className={editableInputClass}
                placeholder={t("form.firstName")}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                {t("form.lastName")} <span className="text-red-500">*</span>
              </label>
              <input
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className={editableInputClass}
                placeholder={t("form.lastName")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">
                {t("form.phone")} <span className="text-red-500">*</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={editableInputClass}
                placeholder={t("form.phone")}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                {t("form.email")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={editableInputClass}
                placeholder={t("form.email")}
              />
            </div>
          </div>
        </>
      )}



      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t("form.cancel")}
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t("form.save")}
        </button>
      </div>
    </div>
  );
}
