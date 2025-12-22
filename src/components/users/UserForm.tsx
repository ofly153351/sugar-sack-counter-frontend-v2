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
  const [username, setUsername] = useState(initialData?.username || "");
  const [empCode, setEmpCode] = useState(initialData?.empCode || "");
  const [firstname, setFirstname] = useState(initialData?.firstname || "");
  const [lastname, setLastname] = useState(initialData?.lastname || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [title, setTitle] = useState("Mr.");

  const handleSubmit = () => {
    // For edit mode, password is optional
    const isEditMode = !!initialData;

    if (!username || !empCode || !firstname || !lastname || !phone || !email) {
      Swal.fire(t("form.requiredFields"), "", "warning");
      return;
    }

    // For new users, password is required
    if (!isEditMode && (!password || !confirmPassword)) {
      Swal.fire(t("form.passwordRequired"), "", "warning");
      return;
    }

    // Check password match only if password is provided
    if (password && password !== confirmPassword) {
      Swal.fire(t("form.passwordMismatch"), "", "error");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
      {/* Username */}
      <div>
        <label className="block mb-1 font-medium">
          {t("form.username")} <span className="text-red-500">*</span>
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder={t("form.username")}
        />
      </div>

      {/* Employee Code */}
      <div>
        <label className="block mb-1 font-medium">
          {t("form.employeeCode")} <span className="text-red-500">*</span>
        </label>
        <input
          value={empCode}
          onChange={(e) => setEmpCode(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder={t("form.employeeCode")}
        />
      </div>

      {/* First Name + Last Name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 font-medium">
            {t("form.firstName")} <span className="text-red-500">*</span>
          </label>
          <input
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder={t("form.lastName")}
          />
        </div>
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 font-medium">
            {t("form.phone")} <span className="text-red-500">*</span>
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder={t("form.email")}
          />
        </div>
      </div>

      {/* Password fields (only for new users or when changing password) */}
      {!initialData && (
        <>
          <div>
            <label className="block mb-1 font-medium">
              {t("form.password")} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder={t("form.password")}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              {t("form.confirmPassword")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder={t("form.confirmPassword")}
            />
          </div>
        </>
      )}

      {/* Title */}
      <div>
        <label className="block mb-1 font-medium">{t("form.title")}</label>
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="Mr.">Mr.</option>
          <option value="Mrs.">Mrs.</option>
          <option value="Ms.">Ms.</option>
          <option value="Dr.">Dr.</option>
        </select>
      </div>

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
