"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import { ChevronDown, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import { useUsersManager } from "@/hooks/useUsers";
import {
  deleteUser as deleteUserApi,
  type UserFormData,
} from "@/utils/admin/users/user-api";

type EmployeeStatus = "active" | "inactive";

interface EmployeeRow {
  id: string | number;
  employeeCode: string;
  title: string;
  firstName: string;
  lastName: string;
  department: string;
  status: EmployeeStatus;
  phone: string;
  email: string;
  username: string;
}

interface UserExtras {
  department?: string;
  position?: string;
  status?: string;
  employeeCode?: string;
}

interface EmployeeFormData {
  employeeCode: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
}

const DEFAULT_FORM: EmployeeFormData = {
  employeeCode: "",
  title: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  username: "",
  password: "",
};

export default function EmployeeInfoPage() {
  const t = useTranslations("employeeInfo");
  const usersManager = useUsersManager();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [employeeCodeSortOrder, setEmployeeCodeSortOrder] = useState<"asc" | "desc">("asc");
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRow | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(DEFAULT_FORM);

  const employees = useMemo<EmployeeRow[]>(() => {
    return usersManager.users.map((user, index) => {
      const userExtra = user as typeof user & UserExtras;
      const role = String(user.role || "user").toLowerCase();
      const statusRaw = String(userExtra.status || "").toLowerCase();
      const status: EmployeeStatus =
        statusRaw === "inactive" || role === "viewer" ? "inactive" : "active";

      return {
        id: user.id || user.no || index + 1,
        employeeCode: user.empCode || userExtra.employeeCode || "-",
        title: user.title || "-",
        firstName: user.firstname || user.firstName || "",
        lastName: user.lastname || user.lastName || "",
        department: userExtra.department || userExtra.position || user.role || "-",
        status,
        phone: user.phone || "",
        email: user.email || "",
        username: user.username || "",
      };
    });
  }, [usersManager.users]);

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = employees.filter((emp) => {
      if (!keyword) return true;
      return (
        emp.employeeCode.toLowerCase().includes(keyword) ||
        emp.title.toLowerCase().includes(keyword) ||
        emp.firstName.toLowerCase().includes(keyword) ||
        emp.lastName.toLowerCase().includes(keyword) ||
        emp.department.toLowerCase().includes(keyword) ||
        emp.phone.toLowerCase().includes(keyword) ||
        emp.email.toLowerCase().includes(keyword) ||
        emp.username.toLowerCase().includes(keyword)
      );
    });

    return filtered.sort((a, b) => {
      const compared = (a.employeeCode ?? "").localeCompare(
        b.employeeCode ?? "",
        undefined,
        { numeric: true, sensitivity: "base" }
      );
      return employeeCodeSortOrder === "asc" ? compared : -compared;
    });
  }, [employees, search, employeeCodeSortOrder]);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData(DEFAULT_FORM);
    setFormOpen(true);
  };

  const openEditModal = (employee: EmployeeRow) => {
    setEditingEmployee(employee);
    setFormData({
      employeeCode: employee.employeeCode,
      title: employee.title === "-" ? "" : employee.title,
      firstName: employee.firstName,
      lastName: employee.lastName,
      phone: employee.phone,
      email: employee.email,
      username: employee.username,
      password: "",
    });
    setFormOpen(true);
  };

  const openDetailModal = (employee: EmployeeRow) => {
    setSelectedEmployee(employee);
    setDetailOpen(true);
  };

  const handleDelete = async (employee: EmployeeRow) => {
    const result = await Swal.fire({
      title: t("delete.confirmTitle"),
      text: t("delete.confirmText", {
        name: `${employee.firstName} ${employee.lastName}`,
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("buttons.delete"),
      cancelButtonText: t("buttons.cancel"),
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUserApi(employee.id);
      usersManager.refetch();
      if (selectedEmployee?.id === employee.id) {
        setSelectedEmployee(null);
        setDetailOpen(false);
      }
      await Swal.fire({
        title: t("delete.successTitle"),
        text: t("delete.successText"),
        icon: "success",
        confirmButtonText: t("buttons.ok"),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : t("delete.errorText");
      await Swal.fire({
        title: t("delete.errorTitle"),
        text: errorMessage,
        icon: "error",
        confirmButtonText: t("buttons.ok"),
      });
    }
  };

  const handleFormChange =
    (field: keyof EmployeeFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSave = () => {
    const requiredForAll: Array<keyof EmployeeFormData> = [
      "email",
      "username",
      "firstName",
      "lastName",
    ];

    const hasMissingRequired = requiredForAll.some(
      (field) => !String(formData[field]).trim()
    );

    if (hasMissingRequired) {
      Swal.fire({
        title: t("validation.title"),
        text: t("validation.requiredFields"),
        icon: "warning",
        confirmButtonText: t("buttons.ok"),
      });
      return;
    }

    if (!editingEmployee && formData.password.trim().length < 6) {
      Swal.fire({
        title: t("validation.title"),
        text: t("validation.passwordMin"),
        icon: "warning",
        confirmButtonText: t("buttons.ok"),
      });
      return;
    }

    const payload: UserFormData = {
      email: formData.email.trim(),
      username: formData.username.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      employeeCode: formData.employeeCode.trim(),
      phone: formData.phone.trim(),
      title: formData.title.trim(),
      ...(formData.password.trim()
        ? { password: formData.password.trim() }
        : {}),
    };

    if (editingEmployee) {
      usersManager.updateUser(
        { id: editingEmployee.id, data: payload },
        {
          onSuccess: async () => {
            setFormOpen(false);
            setEditingEmployee(null);
            setFormData(DEFAULT_FORM);
            await Swal.fire({
              title: t("save.updateSuccessTitle"),
              text: t("save.updateSuccessText"),
              icon: "success",
              confirmButtonText: t("buttons.ok"),
            });
          },
          onError: async (error: Error) => {
            await Swal.fire({
              title: t("save.errorTitle"),
              text: error.message || t("save.errorText"),
              icon: "error",
              confirmButtonText: t("buttons.ok"),
            });
          },
        }
      );
      return;
    }

    usersManager.createUser(payload, {
      onSuccess: async () => {
        setFormOpen(false);
        setFormData(DEFAULT_FORM);
        await Swal.fire({
          title: t("save.createSuccessTitle"),
          text: t("save.createSuccessText"),
          icon: "success",
          confirmButtonText: t("buttons.ok"),
        });
      },
      onError: async (error: Error) => {
        await Swal.fire({
          title: t("save.errorTitle"),
          text: error.message || t("save.errorText"),
          icon: "error",
          confirmButtonText: t("buttons.ok"),
        });
      },
    });
  };

  const statusBadgeClass = (status: EmployeeStatus) =>
    status === "active"
      ? "bg-green-100 text-green-700 border border-green-200"
      : "bg-red-100 text-red-700 border border-red-200";

  const modalBackdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalPanel = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 12, scale: 0.98 },
  };

  if (usersManager.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[320px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (usersManager.isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">{t("errors.loadError")}</p>
          <p>{usersManager.error?.message || t("errors.unknown")}</p>
          <button
            onClick={() => usersManager.refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t("buttons.retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
          {t("title")}
        </h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          {t("addEmployee")}
        </button>
      </div>

      <div className="max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="w-full max-w-full overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white">
        <table className="min-w-[980px] w-full divide-y divide-slate-200">
          <thead className="bg-blue-500/10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700">
                <button
                  type="button"
                  onClick={() =>
                    setEmployeeCodeSortOrder((prev) =>
                      prev === "asc" ? "desc" : "asc"
                    )
                  }
                  className="inline-flex items-center gap-1.5 hover:text-blue-900 transition-colors"
                  title={
                    employeeCodeSortOrder === "asc"
                      ? t("sort.desc")
                      : t("sort.asc")
                  }
                  aria-label={t("sort.label")}
                >
                  <span>{t("table.employeeCode")}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      employeeCodeSortOrder === "asc" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700">{t("table.titlePrefix")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700">{t("table.firstName")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700">{t("table.lastName")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700">{t("table.department")}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700">{t("table.status")}</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-blue-700">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                  {t("noData")}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">{employee.employeeCode}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{employee.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{employee.firstName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{employee.lastName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{employee.department}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(employee.status)}`}>
                      {employee.status === "active"
                        ? t("status.active")
                        : t("status.inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openDetailModal(employee)}
                        className="rounded-md bg-sky-100 p-2 text-sky-700 hover:bg-sky-200 transition"
                        title={t("buttons.view")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(employee)}
                        className="rounded-md bg-amber-100 p-2 text-amber-700 hover:bg-amber-200 transition"
                        title={t("buttons.edit")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee)}
                        className="rounded-md bg-red-100 p-2 text-red-700 hover:bg-red-200 transition"
                        title={t("buttons.delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4"
            onClick={() => setFormOpen(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.24, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingEmployee ? t("editEmployee") : t("addEmployee")}
                </h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="rounded-full p-1.5 text-slate-500 hover:bg-white/80 hover:text-slate-700 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:gap-4">
                <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    {t("form.employeeSectionTitle")}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="employeeCode" className="mb-1 block text-sm font-medium text-slate-700">
                        {t("form.employeeCode")}
                      </label>
                      <input
                        id="employeeCode"
                        value={formData.employeeCode}
                        onChange={handleFormChange("employeeCode")}
                        placeholder={t("form.employeeCode")}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="titlePrefix" className="mb-1 block text-sm font-medium text-slate-700">
                        {t("form.titlePrefix")}
                      </label>
                      <input
                        id="titlePrefix"
                        value={formData.title}
                        onChange={handleFormChange("title")}
                        placeholder={t("form.titlePrefix")}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
                        {t("form.firstName")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleFormChange("firstName")}
                        placeholder={t("form.firstName")}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">
                        {t("form.lastName")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleFormChange("lastName")}
                        placeholder={t("form.lastName")}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                        {t("form.phone")}
                      </label>
                      <input
                        id="phone"
                        value={formData.phone}
                        onChange={handleFormChange("phone")}
                        placeholder={t("form.phone")}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                        {t("form.email")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        value={formData.email}
                        onChange={handleFormChange("email")}
                        placeholder={t("form.email")}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-700">
                    {t("form.accountSectionTitle")}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
                        {t("form.username")} <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="username"
                        value={formData.username}
                        onChange={handleFormChange("username")}
                        placeholder={t("form.username")}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                        {editingEmployee ? t("form.passwordOptional") : t("form.password")}
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={handleFormChange("password")}
                        placeholder={editingEmployee ? t("form.passwordOptional") : t("form.password")}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4">
                <button
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white transition"
                >
                  {t("buttons.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={usersManager.isProcessing}
                  className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-sky-700 hover:to-blue-700 transition disabled:opacity-60"
                >
                  {t("buttons.save")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailOpen && selectedEmployee && (
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4"
            onClick={() => setDetailOpen(false)}
          >
            <motion.div
              variants={modalPanel}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.24, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  {t("detail.title")}
                </h2>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="rounded-full p-1.5 text-slate-500 hover:bg-white/80 hover:text-slate-700 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 px-5 py-4 text-sm text-slate-700">
                <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.employeeCode")}:</strong> {selectedEmployee.employeeCode}</div>
                <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.titlePrefix")}:</strong> {selectedEmployee.title}</div>
                <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.firstName")}:</strong> {selectedEmployee.firstName}</div>
                <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.lastName")}:</strong> {selectedEmployee.lastName}</div>
                <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.department")}:</strong> {selectedEmployee.department}</div>
                <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.status")}:</strong> {selectedEmployee.status === "active" ? t("status.active") : t("status.inactive")}</div>
                <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.phone")}:</strong> {selectedEmployee.phone || "-"}</div>
                <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.email")}:</strong> {selectedEmployee.email || "-"}</div>
              </div>

              <div className="flex justify-end border-t border-slate-200 bg-slate-50/70 px-5 py-4">
                <button
                  onClick={() => setDetailOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-sky-700 hover:to-blue-700 transition"
                >
                  {t("buttons.close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
