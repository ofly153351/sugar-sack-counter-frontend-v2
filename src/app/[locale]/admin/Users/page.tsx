"use client";

import Table from "@/components/table/table";
import { PlusCircle, Search, X } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

interface User {
  no: number;
  empCode: string;
  firstname: string;
  lastname: string;
  role: string;
  phone?: string;
  email?: string;
  username?: string;
  password?: string;
}

const usersDefault: User[] = [
  { no: 1, empCode: "EP001", firstname: "สมชาย", lastname: "จิตดี", role: "พนักงาน" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(usersDefault);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  const handleDelete = (user: User) => {
    Swal.fire({
      title: "ต้องการลบผู้ใช้งานนี้หรือไม่?",
      text: `${user.firstname} ${user.lastname}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        setUsers((prev) => prev.filter((u) => u.no !== user.no));
        Swal.fire("ลบแล้ว!", "ข้อมูลถูกลบเรียบร้อย", "success");
      }
    });
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setModalOpen(true);
  };

  const handleSave = (user: User) => {
    if (editUser) {
      setUsers((prev) => prev.map((u) => (u.no === user.no ? user : u)));
    } else {
      setUsers((prev) => [...prev, { ...user, no: prev.length + 1 }]);
    }
    setModalOpen(false);
    setEditUser(null);
  };

  const filteredUsers = users.filter((u) => {
    const keyword = search.toLowerCase();
    return (
      u.empCode.toLowerCase().includes(keyword) ||
      u.username?.toLowerCase().includes(keyword) ||
      u.firstname.toLowerCase().includes(keyword) ||
      u.lastname.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">จัดการผู้ใช้งาน</h1>
        <button
          onClick={() => {
            setEditUser(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <PlusCircle size={20} /> เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="ค้นหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        type="users"
        data={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        dict={{}}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">

            {/* Header Modal */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editUser ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"}
              </h2>
              <button
                className="text-gray-600 hover:text-black"
                onClick={() => {
                  setModalOpen(false);
                  setEditUser(null);
                }}
              >
                <X size={22} />
              </button>
            </div>

            <UserForm
              initialData={editUser}
              onCancel={() => {
                setModalOpen(false);
                setEditUser(null);
              }}
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface UserFormProps {
  initialData?: User | null;
  onCancel: () => void;
  onSave: (user: User) => void;
}

function UserForm({ initialData, onCancel, onSave }: UserFormProps) {
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
    if (!username || !empCode || !firstname || !lastname || !role || !phone || !email || !password || !confirmPassword) {
      Swal.fire("กรุณากรอกข้อมูลให้ครบ", "", "warning");
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire("รหัสผ่านไม่ตรงกัน", "", "error");
      return;
    }

    onSave({
      no: initialData?.no || Date.now(),
      username,
      empCode,
      firstname,
      lastname,
      role,
      phone,
      email,
      password,
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
      />
    </div>
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
    />
  </div>

  {/* Email */}
  <div>
    <label className="block mb-1 font-medium">
      Email <span className="text-red-500">*</span>
    </label>
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2"
    />
  </div>

  {/* Password */}
  <div>
    <label className="block mb-1 font-medium">
      Password <span className="text-red-500">*</span>
    </label>
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2"
    />
  </div>

  {/* Confirm Password */}
  <div>
    <label className="block mb-1 font-medium">
      Confirm Password <span className="text-red-500">*</span>
    </label>
    <input
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2"
    />
  </div>

  {/* Footer Buttons */}
  <div className="flex justify-end gap-3 pt-3">
    <button
      onClick={onCancel}
      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
    >
      ยกเลิก
    </button>

    <button
      onClick={handleSubmit}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      บันทึก
    </button>
  </div>
</div>

  );
}
