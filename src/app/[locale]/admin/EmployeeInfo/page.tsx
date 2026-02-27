"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import { ChevronDown, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import { useUsersManager } from "@/hooks/useUsers";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { AppModal } from "@/components/modal/AppModal";
import { UserAccountCredentialsFields } from "@/components/users/UserAccountCredentialsFields";
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
  confirmPassword: string;
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
  confirmPassword: "",
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
      confirmPassword: "",
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
    if (editingEmployee && !formData.username.trim()) {
      Swal.fire({
        title: t("validation.title"),
        text: t("validation.requiredFields"),
        icon: "warning",
        confirmButtonText: t("buttons.ok"),
      });
      return;
    }

    if (!editingEmployee) {
      const requiredForCreate: Array<keyof EmployeeFormData> = [
        "employeeCode",
        "title",
        "firstName",
        "lastName",
        "phone",
        "email",
        "username",
        "password",
        "confirmPassword",
      ];

      const hasMissingRequired = requiredForCreate.some(
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

    if (
      !editingEmployee &&
      formData.password.trim() !== formData.confirmPassword.trim()
    ) {
      Swal.fire({
        title: t("validation.title"),
        text: t("validation.passwordMismatch"),
        icon: "warning",
        confirmButtonText: t("buttons.ok"),
      });
      return;
    }

    if (editingEmployee) {
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

    const payload: UserFormData = {
      email: formData.email.trim(),
      username: formData.username.trim(),
      password: formData.password.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      employeeCode: formData.employeeCode.trim(),
      phone: formData.phone.trim(),
      title: formData.title.trim(),
    };

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

      <AdminSearchInput
        value={search}
        onValueChange={setSearch}
        placeholder={t("searchPlaceholder")}
      />

      <div className="space-y-3 lg:hidden">
        {filteredEmployees.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 italic shadow-sm">
            {t("noData")}
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-medium text-slate-500">
                    {t("table.employeeCode")}
                  </span>
                  <span className="text-slate-700 break-words">
                    {employee.employeeCode}
                  </span>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-medium text-slate-500">
                    {t("table.titlePrefix")}
                  </span>
                  <span className="text-slate-700 break-words">
                    {employee.title}
                  </span>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-medium text-slate-500">
                    {t("table.firstName")}
                  </span>
                  <span className="text-slate-700 break-words">
                    {employee.firstName}
                  </span>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-medium text-slate-500">
                    {t("table.lastName")}
                  </span>
                  <span className="text-slate-700 break-words">
                    {employee.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-2">
                  <span className="font-medium text-slate-500">
                    {t("table.status")}
                  </span>
                  <span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(employee.status)}`}
                    >
                      {employee.status === "active"
                        ? t("status.active")
                        : t("status.inactive")}
                    </span>
                  </span>
                </div>
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-end gap-2">
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
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden lg:block w-full max-w-full overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white">
        <table className="min-w-[980px] w-full divide-y divide-slate-200">
          <thead className="bg-blue-500/10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700 whitespace-nowrap">
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700 whitespace-nowrap">
                {t("table.titlePrefix")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700 whitespace-nowrap">
                {t("table.firstName")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700 whitespace-nowrap">
                {t("table.lastName")}
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700 whitespace-nowrap">
                {t("table.status")}
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-blue-700 whitespace-nowrap">
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500 italic"
                >
                  {t("noData")}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                    {employee.employeeCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                    {employee.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                    {employee.firstName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                    {employee.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(employee.status)}`}
                    >
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

      <AppModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingEmployee ? t("editEmployee") : t("addEmployee")}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {editingEmployee ? (
            <>
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
                    <select
                      id="titlePrefix"
                      value={formData.title}
                      onChange={handleFormChange("title")}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">{t("form.selectTitle")}</option>
                      <option value="นาย">{t("form.titleOptions.mr")}</option>
                      <option value="นาง">{t("form.titleOptions.mrs")}</option>
                      <option value="นางสาว">{t("form.titleOptions.ms")}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
                      {t("form.firstName")}
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
                      {t("form.lastName")}
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
                      {t("form.email")}
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
                      {t("form.passwordOptional")}
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleFormChange("password")}
                      placeholder={t("form.passwordOptional")}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  {t("form.employeeSectionTitle")}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="employeeCode" className="mb-1 block text-sm font-medium text-slate-700">
                      {t("form.employeeCode")} <span className="text-red-500">*</span>
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
                      {t("form.titlePrefix")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="titlePrefix"
                      value={formData.title}
                      onChange={handleFormChange("title")}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">{t("form.selectTitle")}</option>
                      <option value="นาย">{t("form.titleOptions.mr")}</option>
                      <option value="นาง">{t("form.titleOptions.mrs")}</option>
                      <option value="นางสาว">{t("form.titleOptions.ms")}</option>
                    </select>
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
                      {t("form.phone")} <span className="text-red-500">*</span>
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
                <UserAccountCredentialsFields
                  idPrefix="employee-create"
                  username={formData.username}
                  password={formData.password}
                  confirmPassword={formData.confirmPassword}
                  onUsernameChange={(value) =>
                    setFormData((prev) => ({ ...prev, username: value }))
                  }
                  onPasswordChange={(value) =>
                    setFormData((prev) => ({ ...prev, password: value }))
                  }
                  onConfirmPasswordChange={(value) =>
                    setFormData((prev) => ({ ...prev, confirmPassword: value }))
                  }
                  usernameLabel={t("form.username")}
                  passwordLabel={t("form.password")}
                  confirmPasswordLabel={t("form.confirmPassword")}
                  usernameRequired
                  passwordRequired
                  confirmPasswordRequired
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4 -mx-5 -mb-5">
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
      </AppModal>

      <AppModal
        isOpen={detailOpen && !!selectedEmployee}
        onClose={() => setDetailOpen(false)}
        title={t("detail.title")}
        maxWidthClassName="max-w-lg"
        headerClassName="border-b border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-sky-50"
      >
        {selectedEmployee && (
          <>
            <div className="grid grid-cols-1 gap-2.5 text-sm text-slate-700">
              <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.employeeCode")}:</strong> {selectedEmployee.employeeCode}</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.titlePrefix")}:</strong> {selectedEmployee.title}</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.firstName")}:</strong> {selectedEmployee.firstName}</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.lastName")}:</strong> {selectedEmployee.lastName}</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.department")}:</strong> {selectedEmployee.department}</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.status")}:</strong> {selectedEmployee.status === "active" ? t("status.active") : t("status.inactive")}</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.phone")}:</strong> {selectedEmployee.phone || "-"}</div>
              <div className="rounded-lg bg-slate-50 px-3 py-2"><strong>{t("detail.email")}:</strong> {selectedEmployee.email || "-"}</div>
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-200 bg-slate-50/70 px-5 py-4 -mx-5 -mb-5">
              <button
                onClick={() => setDetailOpen(false)}
                className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-sky-700 hover:to-blue-700 transition"
              >
                {t("buttons.close")}
              </button>
            </div>
          </>
        )}
      </AppModal>
    </div>
  );
}
