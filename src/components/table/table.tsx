"use client";

import React from "react";
import {
  Trash2,
  Pencil,
  Image as ImageIcon,
  Eye,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

import { API_CONFIG } from "@/utils/config";

interface TableProps {
  type: "vehicle" | "bags" | "box" | "users" | "products";
  data?: Record<string, any>[];
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (value: "asc" | "desc") => void;
  onEdit?: (item: Record<string, any>) => void;
  onDelete?: (item: Record<string, any>) => void;
  onRoleChange?: (
    item: Record<string, any>,
    role: "admin" | "user" | "operator" | "viewer"
  ) => void;
  isRoleSelectable?: (item: Record<string, any>) => boolean;
  isRoleUpdating?: boolean;
}

export default function Table({
  type,
  data = [],
  sortOrder,
  onSortOrderChange,
  onEdit,
  onDelete,
  onRoleChange,
  isRoleSelectable,
  isRoleUpdating = false,
}: TableProps) {
  const t = useTranslations();
  const [isClient, setIsClient] = useState(false);
  const roleOptions: Array<"admin" | "user" | "operator" | "viewer"> = [
    "admin",
    "user",
    "operator",
    "viewer",
  ];

  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Record<
    string,
    any
  > | null>(null);
  const [selectedRowImage, setSelectedRowImage] = useState<Record<
    string,
    any
  > | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());


  // Helper function to get image URLs with fallbacks
  const getImageUrl = (pathOrUrl?: string): string => {
    if (!pathOrUrl) return "";
    if (pathOrUrl.startsWith("http")) return pathOrUrl;
    return `${API_CONFIG.BASE_URL}/images/${pathOrUrl}`;
  };

  const getOriginalImageUrl = (row: any): string => {
    // Check for MinIO URL first, then path fields
    return getImageUrl(
      row.originalImageUrl || row.originalImagePath || row.imagePath
    );
  };

  const getAnnotatedImageUrl = (row: any): string => {
    // Check for MinIO URL first, then path fields
    return getImageUrl(
      row.annotatedImageUrl || row.annotatedImagePath || row.imagePath
    );
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getTableHeaders = () => {
    // On server, return empty headers to avoid hydration mismatch
    if (!isClient) {
      return [];
    }

    switch (type) {
      case "vehicle":
        return [
          { key: "no", label: t("vehicle.table.no", { defaultValue: "NO." }) },
          {
            key: "vehicleCode",
            label: t("vehicle.table.vehicleCode", {
              defaultValue: "Vehicle Code",
            }),
          },
          {
            key: "licensePlate",
            label: t("vehicle.table.licensePlate", {
              defaultValue: "License Plate",
            }),
          },
          {
            key: "vehicleType",
            label: t("vehicle.table.vehicleType", {
              defaultValue: "Vehicle Type",
            }),
          },
          {
            key: "driverName",
            label: t("vehicle.table.driver", { defaultValue: "Driver" }),
          },
          {
            key: "status",
            label: t("vehicle.table.status", { defaultValue: "Status" }),
          },
        ];
      case "bags":
        return [
          { key: "no", label: t("bags.table.no", { defaultValue: "NO." }) },
          {
            key: "vehicleCode",
            label: t("bags.table.vehicleCode", {
              defaultValue: "Vehicle Code",
            }),
          },
          {
            key: "datetime",
            label: t("bags.table.datetime", { defaultValue: "Date & Time" }),
          },
          {
            key: "createdBy",
            label: t("bags.table.createdBy", { defaultValue: "Created By" }),
          },
          {
            key: "sugarType",
            label: t("bags.table.sugarType", { defaultValue: "Sugar Type" }),
          },
          {
            key: "manualTotal",
            label: t("bags.table.manualTotal", {
              defaultValue: "Manual Total",
            }),
          },
          {
            key: "aiTotal",
            label: t("bags.table.aiTotal", { defaultValue: "AI Total" }),
          },
        ];
      case "box":
        return [
          { key: "no", label: t("box.table.no", { defaultValue: "NO." }) },
          {
            key: "vehicleCode",
            label: t("box.table.vehicleCode", { defaultValue: "Vehicle Code" }),
          },
          {
            key: "datetime",
            label: t("box.table.datetime", { defaultValue: "Date & Time" }),
          },
          {
            key: "createdBy",
            label: t("box.table.createdBy", { defaultValue: "Created By" }),
          },
          {
            key: "sugarType",
            label: t("box.table.sugarType", { defaultValue: "Sugar Type" }),
          },
          {
            key: "manualTotal",
            label: t("box.table.manualTotal", {
              defaultValue: "Manual Total",
            }),
          },
          {
            key: "aiTotal",
            label: t("box.table.aiTotal", { defaultValue: "AI Total" }),
          },
        ];
      case "users":
        return [
          { key: "no", label: t("users.table.no", { defaultValue: "NO." }) },
          {
            key: "empCode",
            label: t("users.table.empCode", { defaultValue: "Employee Code" }),
          },
          {
            key: "username",
            label: t("users.table.username", { defaultValue: "Username" }),
          },
          {
            key: "firstname",
            label: t("users.table.firstname", { defaultValue: "First Name" }),
          },
          {
            key: "lastname",
            label: t("users.table.lastname", { defaultValue: "Last Name" }),
          },
          {
            key: "role",
            label: t("users.table.role", { defaultValue: "Role" }),
          },
        ];
      case "products":
        return [
          { key: "no", label: t("products.table.no", { defaultValue: "NO." }) },
          {
            key: "productCode",
            label: t("products.table.productCode", {
              defaultValue: "Product Code",
            }),
          },
          {
            key: "productName",
            label: t("products.table.productName", {
              defaultValue: "Product Name",
            }),
          },
        ];
      default:
        return [];
    }
  };

  const headers = getTableHeaders();

  const handleOpenImagesModal = (
    session: Record<string, any>,
    rowImage?: Record<string, any>
  ) => {
    setSelectedRowImage(rowImage || null);
    setSelectedSession(session);
    setIsImagesModalOpen(true);
  };

  const handleDelete = (item: Record<string, any>) => {
    console.log("🔄 Table: Delete button clicked for item:", item);
    console.log("🔍 Table: onDelete function exists:", !!onDelete);
    console.log("🔍 Table: Item details:", {
      id: item.id,
      no: item.no,
      vehicleCode: item.vehicleCode,
      empCode: item.empCode,
      firstname: item.firstname,
      lastname: item.lastname,
    });

    Swal.fire({
      title: t("table.delete.confirmTitle", {
        defaultValue: "ยืนยันการลบข้อมูล",
      }),
      text: t("table.delete.confirmMessage", {
        defaultValue: "คุณต้องการลบข้อมูลนี้ใช่ไหม?",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
      backdrop: `rgba(0,0,0,0.4)`,
    }).then((result) => {
      console.log("🔄 Table: SweetAlert result:", result.isConfirmed);
      if (result.isConfirmed) {
        console.log("✅ Table: Calling onDelete with item:", item);
        onDelete?.(item);
        // Success dialog is handled by the parent component's useConfirmDeleteUser hook
      } else {
        console.log("❌ Table: Delete cancelled by user");
      }
    });
  };

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(rowId)) {
        newExpanded.delete(rowId);
      } else {
        newExpanded.add(rowId);
      }
      return newExpanded;
    });
  };

  // Render loading state on server to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="w-full max-w-full overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white overscroll-x-contain">
        <table className="min-w-0 w-full table-fixed divide-y divide-slate-200">
          <thead className="bg-blue-500/10">
            <tr>
              {Array.from({ length: 6 }).map((_, index) => (
                <th
                  key={index}
                  className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-semibold text-blue-700 tracking-wide break-words"
                >
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              ))}
              <th className="px-2 sm:px-6 py-2 sm:py-4 text-center text-xs sm:text-sm font-semibold text-blue-700 tracking-wide break-words">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-2 sm:px-6 py-2 sm:py-4 whitespace-normal text-xs sm:text-sm break-words"
                  >
                    <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                ))}
                <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-normal text-xs sm:text-sm break-words">
                  <div className="flex justify-center space-x-2">
                    <div className="h-8 w-8 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-full overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white overscroll-x-contain">
        <table className="min-w-0 w-full table-fixed divide-y divide-slate-200">
          <thead className="bg-blue-500/10">
            <tr>
              {headers.map((h) => (
                <th
                  key={h.key}
                  className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-semibold text-blue-700 tracking-wide break-words"
                >
                  {type === "users" &&
                  h.key === "empCode" &&
                  sortOrder &&
                  onSortOrderChange ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="inline-flex items-center gap-1.5 hover:text-blue-900 transition-colors"
                      title={
                        sortOrder === "asc"
                          ? t("users.sort.desc", {
                              defaultValue: "Employee code: descending",
                            })
                          : t("users.sort.asc", {
                              defaultValue: "Employee code: ascending",
                            })
                      }
                      aria-label={t("users.sort.label", {
                        defaultValue: "Sort by employee code",
                      })}
                    >
                      <span>{h.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    h.label
                  )}
                </th>
              ))}

              <th className="px-2 sm:px-6 py-2 sm:py-4 text-center  text-xs sm:text-sm font-semibold text-blue-700 tracking-wide break-words">
                {t("table.actions", { defaultValue: "Actions" })}
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-100">
            {data.map((row, i) => {
              const rowId = String(row.id ?? row.rawSession?.id ?? row.no ?? i);
              const isExpanded = expandedRows.has(rowId);
              const sackRows = row.sackSession?.sackRows ?? [];
              const boxRows = row.boxSession?.boxRows ?? [];
              const sessionType =
                row.sessionType ?? row.rawSession?.sessionType;
              const isSackSession = sessionType === "sack";
              const isBoxSession = sessionType === "box";
              const childRows = isSackSession ? sackRows : boxRows;
              const hasChildRows = childRows.length > 0;
              const showExpandButton =
                (isSackSession || isBoxSession) && hasChildRows;

              return (
                <React.Fragment key={rowId}>
                  <tr
                    className={`hover:bg-blue-50/40 transition-colors duration-150 ${
                      showExpandButton ? "cursor-pointer" : ""
                    }`}
                    onClick={() => {
                      if (showExpandButton) {
                        toggleRowExpansion(rowId);
                      }
                    }}
                  >
                    {headers.map((h) => (
                      <td
                        key={h.key}
                        className="px-2 sm:px-6 py-2 sm:py-4 whitespace-normal text-xs sm:text-[15px] text-slate-700 break-words"
                      >
                        {type === "vehicle" && h.key === "status" ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              row.status === "active"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : row.status === "maintenance"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-red-100 text-red-700 border border-red-200"
                            }`}
                          >
                            {row.status === "active"
                              ? "Active"
                              : row.status === "maintenance"
                                ? "Maintenance"
                                : "Inactive"}
                          </span>
                        ) : type === "users" && h.key === "role" ? (
                          <select
                            value={(row.role || "user") as string}
                            onChange={(e) =>
                              onRoleChange?.(
                                row,
                                e.target.value as
                                  | "admin"
                                  | "user"
                                  | "operator"
                                  | "viewer"
                              )
                            }
                            disabled={
                              !onRoleChange ||
                              isRoleUpdating ||
                              (isRoleSelectable ? !isRoleSelectable(row) : false)
                            }
                            className="min-w-[140px] rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                          >
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {t(`users.roles.${role}`, {
                                  defaultValue: role,
                                })}
                              </option>
                            ))}
                          </select>
                        ) : (type === "bags" || type === "box") &&
                          h.key === "no" &&
                          showExpandButton ? (
                          <div className="inline-flex items-center gap-2">
                            <ChevronRight
                              title={isExpanded ? "ย่อรายละเอียด" : "ดูรายละเอียด"}
                              className={`h-3.5 w-3.5 transition-all duration-300 ${
                                isExpanded
                                  ? "rotate-90 text-blue-700"
                                  : "rotate-0 text-slate-500"
                              }`}
                            />
                            <span
                              className={`transition-colors ${
                                isExpanded ? "text-blue-700" : "text-slate-700"
                              }`}
                            >
                              {row[h.key]}
                            </span>
                          </div>
                        ) : (
                          row[h.key]
                        )}
                      </td>
                    ))}

                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            className="p-1.5 sm:p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition shadow-sm"
                            title={t("table.edit", { defaultValue: "แก้ไข" })}
                          >
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row);
                          }}
                          className="flex items-center justify-center p-1.5 sm:p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {showExpandButton && (
                    <tr>
                      <td colSpan={headers.length + 1} className="px-0 py-0">
                        <div
                          className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                            isExpanded
                              ? "max-h-[1200px] opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="bg-blue-50 border-l-4 border-blue-400">
                            <div className="p-4">
                              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <ChevronDown className="w-4 h-4" />
                              {isSackSession
                                ? "รายละเอียดการนับกระสอบ"
                                : "รายละเอียดการนับกล่อง"}
                            </h4>
                              {hasChildRows ? (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-blue-200">
                                    <thead className="bg-blue-100">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-blue-700">
                                          แถวที่
                                        </th>
                                        {isSackSession && (
                                          <th className="px-4 py-2 text-left text-xs font-medium text-blue-700">
                                            น้ำหนัก
                                          </th>
                                        )}
                                        <th className="px-4 py-2 text-left text-xs font-medium text-blue-700">
                                          {t(
                                            isSackSession
                                              ? "bags.table.manualCount"
                                              : "box.table.manualCount",
                                            { defaultValue: "Manual Count" }
                                          )}
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-blue-700">
                                          {t(
                                            isSackSession
                                              ? "bags.table.aiCount"
                                              : "box.table.aiCount",
                                            { defaultValue: "AI Count" }
                                          )}
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-blue-700">
                                          รูปภาพ
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-blue-100">
                                    {childRows.map(
                                      (childRow: any, index: number) => (
                                        <tr
                                          key={childRow.id || index}
                                          className="hover:bg-blue-50"
                                        >
                                          <td className="px-4 py-2 text-sm text-gray-700">
                                            {childRow.rowNumber || index + 1}
                                          </td>
                                          {isSackSession && (
                                            <td className="px-4 py-2 text-sm text-gray-700">
                                              {childRow.weightType || "ไม่ระบุ"}
                                            </td>
                                          )}
                                          <td className="px-4 py-2 text-sm text-gray-700">
                                            {childRow.finalCount || 0}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-700">
                                            {childRow.aiCount || 0}
                                          </td>
                                          <td className="px-4 py-2 text-sm">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenImagesModal(
                                                  row,
                                                  childRow
                                                );
                                              }}
                                              className="p-1.5 sm:p-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition shadow-sm"
                                              title="ดูรูปภาพ"
                                            >
                                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </button>
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                                <p className="text-sm text-gray-600 mt-3">
                                  รวม {childRows.length} แถว
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <p className="text-gray-500 italic">
                                  No rows data
                                </p>
                              </div>
                            )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="text-center py-8 text-slate-500 italic"
                >
                  {t("table.noData", { defaultValue: "— No data found —" })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Images Modal for viewing original and annotated images */}
        {isImagesModalOpen && selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  รูปภาพการนับ
                </h2>
                <p className="text-gray-600 mt-1">
                  รถหมายเลข: {selectedSession?.vehicleCode || "ไม่ทราบ"} •
                  วันที่: {selectedSession?.datetime || "ไม่ทราบ"}
                </p>
              </div>
              <button
                  onClick={() => {
                    setIsImagesModalOpen(false);
                    setSelectedSession(null);
                    setSelectedRowImage(null);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {selectedRowImage ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original Images Section */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      รูปภาพต้นฉบับ
                    </h3>
                    <div className="space-y-4">
                      {[selectedRowImage].map((row: any, index: number) => (
                        <div
                          key={row.id || index}
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-gray-800">
                                แถวที่ {row.rowNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                {type === "bags" &&
                                  `น้ำหนัก: ${
                                    row.weightType || "ไม่ระบุ"
                                  } • `}
                                จำนวน: {row.finalCount || 0}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              ต้นฉบับ
                            </span>
                          </div>
                          {getOriginalImageUrl(row) ? (
                            <div className="relative rounded-lg overflow-hidden border border-gray-300">
                              <img
                                src={getOriginalImageUrl(row)}
                                alt={`Original image row ${row.rowNumber}`}
                                className="w-full h-48 object-contain bg-gray-100"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-gray-300">
                              <div className="text-center">
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">
                                  ไม่มีรูปภาพต้นฉบับ
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Annotated Images Section */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-green-600" />
                      รูปภาพที่วิเคราะห์แล้ว
                    </h3>
                    <div className="space-y-4">
                      {[selectedRowImage].map((row: any, index: number) => (
                        <div
                          key={row.id || index}
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-gray-800">
                                แถวที่ {row.rowNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                {type === "bags" &&
                                  `น้ำหนัก: ${
                                    row.weightType || "ไม่ระบุ"
                                  } • `}
                                จำนวน: {row.finalCount || 0}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              วิเคราะห์แล้ว
                            </span>
                          </div>
                          {getAnnotatedImageUrl(row) ? (
                            <div className="relative rounded-lg overflow-hidden border border-gray-300">
                              <img
                                src={getAnnotatedImageUrl(row)}
                                alt={`Annotated image row ${row.rowNumber}`}
                                className="w-full h-48 object-contain bg-gray-100"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border border-gray-300">
                              <div className="text-center">
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">
                                  ไม่มีรูปภาพที่วิเคราะห์แล้ว
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    ไม่มีข้อมูลรูปภาพสำหรับแถวนี้
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsImagesModalOpen(false);
                    setSelectedSession(null);
                    setSelectedRowImage(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
