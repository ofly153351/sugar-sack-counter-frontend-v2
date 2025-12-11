"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { type User } from "@/utils/admin/users/user-api";

interface UserFormProps {
  initialData?: User | null;
  onCancel: () => void;
  onSave: (user: User) => void;
}

export function UserForm({ initialData, onCancel, onSave }: UserFormProps) {
  const [username, setUsername] = useState(initialData?.username || "");
  const [empCode, setEmpCode] = useState(initialData?.empCode || "");
  const [firstname, setFirstname] = useState(initialData?.firstname || "");
  const [lastname, setLastname] = useState(initialData?.lastname || "");
  const [role, setRole] = useState(initialData?.role || "พนักงาน");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    // For edit mode, password is optional
    const isEditMode = !!initialData;

    if (
      !username ||
      !empCode ||
      !firstname ||
      !lastname ||
      !role ||
      !phone ||
      !email
    ) {
      Swal.fire("กรุณากรอกข้อมูลให้ครบ", "", "warning");
      return;
    }

    // For new users, password is required
    if (!isEditMode && (!password || !confirmPassword)) {
      Swal.fire("กรุณากรอกรหัสผ่าน", "", "warning");
      return;
    }

    // Check password match only if password is provided
    if (password && password !== confirmPassword) {
      Swal.fire("รหัสผ่านไม่ตรงกัน", "", "error");
      return;
    }

    onSave({
      no: initialData?.no || Date.now(),
      username: username || "",
      empCode,
      firstname,
      lastname,
      role,
      phone: phone || "",
      email: email || "",
      password: password || initialData?.password || "", // Keep existing password if not changed
      ...(initialData && { id: initialData.id }), // Preserve backend ID for updates
    });
  };

  return (
    <div className="space-y-4">
      {/* Username */}
      <div>
        <label className="block mb-1 font-medium">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter username"
        />
      </div>

      {/* รหัสพนักงาน */}
      <div>
        <label className="block mb-1 font-medium">
          รหัสพนักงาน <span className="text-red-500">*</span>
        </label>
        <input
          value={empCode}
          onChange={(e) => setEmpCode(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter employee code"
        />
      </div>

      {/* ชื่อ + นามสกุล */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 font-medium">
            ชื่อ <span className="text-red-500">*</span>
          </label>
          <input
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Enter last name"
          />
        </div>
      </div>

      {/* Role */}
      <div>
        <label className="block mb-1 font-medium">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="พนักงาน">พนักงาน</option>
          <option value="ผู้จัดการ">ผู้จัดการ</option>
          <option value="แอดมิน">แอดมิน</option>
        </select>
      </div>

      {/* เบอร์โทร */}
      <div>
        <label className="block mb-1 font-medium">
          เบอร์โทร <span className="text-red-500">*</span>
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter phone number"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block mb-1 font-medium">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter email address"
        />
      </div>

      {/* Password - Only required for new users */}
      <div>
        <label className="block mb-1 font-medium">
          Password {!initialData && <span className="text-red-500">*</span>}
          {initialData && (
            <span className="text-gray-500 text-sm ml-2">
              (Leave blank to keep current password)
            </span>
          )}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            initialData
              ? "Leave blank to keep current password"
              : "Enter password"
          }
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      {/* Confirm Password - Only required if password is entered */}
      {password && (
        <div>
          <label className="block mb-1 font-medium">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
          type="button"
        >
          ยกเลิก
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          type="button"
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}
