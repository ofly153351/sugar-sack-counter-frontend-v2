"use client";

import { PencilLine, Trash2, Upload } from "lucide-react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { ImageUploadModal } from "../image-upload/ImageUploadModal";
import { uploadCountingSessionImage } from "@/utils/count/count-api";
import { processImageWithAI } from "@/utils/ai/ai-api";

interface TableProps {
  type: "vehicle" | "bags" | "box" | "users";
  data?: Record<string, any>[];
  onEdit?: (item: Record<string, any>) => void;
  onDelete?: (item: Record<string, any>) => void;
  onUploadImage?: (item: Record<string, any>) => void;
}

export default function Table({
  type,
  data = [],
  onEdit,
  onDelete,
  onUploadImage,
}: TableProps) {
  const t = useTranslations();
  const [isClient, setIsClient] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

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
            key: "amount",
            label: t("bags.table.amount", { defaultValue: "Amount" }),
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
            key: "amount",
            label: t("box.table.amount", { defaultValue: "Amount" }),
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
      default:
        return [];
    }
  };

  const headers = getTableHeaders();

  const handleOpenUploadModal = (item: Record<string, any>) => {
    setSelectedItem(item);
    setIsUploadModalOpen(true);
  };

  const handleUploadImage = async (file: File, description?: string) => {
    if (!selectedItem) return;

    setIsUploading(true);
    try {
      // เรียกใช้ฟังก์ชันจาก parent หรือใช้ฟังก์ชัน API โดยตรง
      if (onUploadImage) {
        await onUploadImage({ ...selectedItem, file, description });
      } else {
        // ถ้าไม่มี onUploadImage prop, ใช้ฟังก์ชัน API โดยตรง
        // ต้องมี sessionId ใน selectedItem
        if (selectedItem.id || selectedItem.sessionId) {
          const sessionId = selectedItem.id || selectedItem.sessionId;
          await uploadCountingSessionImage(sessionId, file, description);
        }
      }

      // แสดงข้อความสำเร็จ
      Swal.fire({
        title: "สำเร็จ!",
        text: "อัปโหลดรูปภาพเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      });
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถอัปโหลดรูปภาพได้",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAIDetection = async (file: File) => {
    try {
      Swal.fire({
        title: "กำลังตรวจจับบุคคล...",
        text: "AI กำลังวิเคราะห์ภาพ กรุณารอสักครู่",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const result = await processImageWithAI(file);

      Swal.close();

      // แสดงผลการตรวจจับใน modal ใหม่
      Swal.fire({
        title: `ตรวจจับบุคคลสำเร็จ!`,
        html: `
          <div class="text-left">
            <p class="mb-2">พบบุคคลทั้งหมด: <strong>${
              result.personCount
            } คน</strong></p>
            <p class="mb-4">ความเชื่อมั่นเฉลี่ย: <strong>${
              result.detections.length > 0
                ? (
                    (result.detections.reduce(
                      (sum, d) => sum + d.confidence,
                      0
                    ) /
                      result.detections.length) *
                    100
                  ).toFixed(1)
                : 0
            }%</strong></p>
            <div class="mt-4">
              <img src="${
                result.annotatedImage
              }" alt="Annotated Image" class="w-full h-auto rounded-lg border" />
            </div>
          </div>
        `,
        icon: "success",
        confirmButtonText: "ตกลง",
        width: 600,
      });
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text:
          "ไม่สามารถตรวจจับบุคคลได้: " + (error.message || "เกิดข้อผิดพลาด"),
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    }
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

  // Render loading state on server to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-blue-500/10">
            <tr>
              {Array.from({ length: 6 }).map((_, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-sm font-semibold text-blue-700 tracking-wide"
                >
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              ))}
              <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 tracking-wide">
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
                    className="px-6 py-4 whitespace-nowrap text-sm"
                  >
                    <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
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

    return (
      <>
        <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-blue-500/10">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h.key}
                    className="px-6 py-4 text-left text-sm font-semibold text-blue-700 tracking-wide"
                  >
                    {h.label}
                  </th>
                ))}

                <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 tracking-wide">
                  {t("table.actions", { defaultValue: "Actions" })}
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {data.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-blue-50/40 transition-colors duration-150"
                >
                  {headers.map((h) => (
                    <td
                      key={h.key}
                      className="px-6 py-4 whitespace-nowrap text-[15px] text-slate-700"
                    >
                      {type === "vehicle" && h.key === "status" ? (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            row.status === "active"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          {row.status === "active" ? "Active" : "Inactive"}
                        </span>
                      ) : (
                        row[h.key]
                      )}
                    </td>
                  ))}

                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => onEdit?.(row)}
                      className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition shadow-sm"
                    >
                      <PencilLine className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenUploadModal(row)}
                      className="p-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition shadow-sm"
                      title="อัปโหลดรูปภาพ"
                    >
                      <Upload className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(row)}
                      className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

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

        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedItem(null);
          }}
          onUpload={handleUploadImage}
          title={`อัปโหลดรูปภาพสำหรับ ${selectedItem?.vehicleCode || "รายการ"}`}
          description="เลือกรูปภาพที่ต้องการอัปโหลดสำหรับรายการนี้"
          enableAIDetection={true}
        />
      </>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-blue-500/10">
            <tr>
              {headers.map((h) => (
                <th
                  key={h.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-blue-700 tracking-wide"
                >
                  {h.label}
                </th>
              ))}

              <th className="px-6 py-4 text-left text-sm font-semibold text-blue-700 tracking-wide">
                {t("table.actions", { defaultValue: "Actions" })}
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-slate-100">
            {data.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-blue-50/40 transition-colors duration-150"
              >
                {headers.map((h) => (
                  <td
                    key={h.key}
                    className="px-6 py-4 whitespace-nowrap text-[15px] text-slate-700"
                  >
                    {type === "vehicle" && h.key === "status" ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          row.status === "active"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {row.status === "active" ? "Active" : "Inactive"}
                      </span>
                    ) : (
                      row[h.key]
                    )}
                  </td>
                ))}

                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => onEdit?.(row)}
                    className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition shadow-sm"
                  >
                    <PencilLine className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenUploadModal(row)}
                    className="p-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition shadow-sm"
                    title="อัปโหลดรูปภาพ"
                  >
                    <Upload className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(row)}
                    className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

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

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedItem(null);
        }}
        onUpload={handleUploadImage}
        title={`อัปโหลดรูปภาพสำหรับ ${selectedItem?.vehicleCode || "รายการ"}`}
        description="เลือกรูปภาพที่ต้องการอัปโหลดสำหรับรายการนี้"
        enableAIDetection={true}
      />
    </>
  );
}
