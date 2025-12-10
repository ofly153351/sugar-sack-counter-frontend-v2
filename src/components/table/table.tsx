"use client";

import { PencilLine, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

interface TableProps {
  type: "vehicle" | "bags" | "box" | "users";
  data?: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

const tableConfig = {
  vehicle: [
    { key: "no", label: "NO." },
    { key: "vehicleCode", label: "รหัสรถ" },
    { key: "licensePlate", label: "ทะเบียนรถ" },
    { key: "vehicleType", label: "ประเภทรถ" },
    { key: "driver", label: "คนขับ" },
    { key: "status", label: "สถานะ" },
  ],
  bags: [
    { key: "no", label: "NO." },
    { key: "vehicleCode", label: "รหัสรถ" },
    { key: "datetime", label: "วันที่เวลา" },
    { key: "createdBy", label: "ผู้บันทึก" },
    { key: "sugarType", label: "ชนิดน้ำตาล" },
    { key: "amount", label: "จำนวน" },
  ],
  box: [
    { key: "no", label: "NO." },
    { key: "vehicleCode", label: "รหัสรถ" },
    { key: "datetime", label: "วันที่เวลา" },
    { key: "createdBy", label: "ผู้บันทึก" },
    { key: "sugarType", label: "ชนิดน้ำตาล" },
    { key: "amount", label: "จำนวน" },
  ],
  users: [
    { key: "no", label: "NO." },
    { key: "empCode", label: "รหัสพนักงาน" },
    { key: "firstname", label: "ชื่อ" },
    { key: "lastname", label: "นามสกุล" },
    { key: "role", label: "ตำแหน่ง" },
  ],
};

export default function Table({ type, data = [], onEdit, onDelete }: TableProps) {
  const headers = tableConfig[type];

  const handleDelete = (item: any) => {
    Swal.fire({
      title: "ยืนยันการลบข้อมูล",
      text: "คุณต้องการลบข้อมูลนี้ใช่ไหม?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "ลบข้อมูล",
      cancelButtonText: "ยกเลิก",
      backdrop: `rgba(0,0,0,0.4)`,
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete?.(item);
        Swal.fire("สำเร็จ", "ข้อมูลถูกลบเรียบร้อยแล้ว", "success");
      }
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        
        {/* HEADER */}
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
              จัดการ
            </th>
          </tr>
        </thead>

        {/* BODY */}
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
                        row.status === "Active"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {row.status}
                    </span>
                  ) : (
                    row[h.key]
                  )}
                </td>
              ))}

              {/* ACTION BUTTONS */}
              <td className="px-6 py-4 flex gap-2">
                {/* EDIT */}
                <button
                  onClick={() => onEdit?.(row)}
                  className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition shadow-sm"
                >
                  <PencilLine className="w-4 h-4" />
                </button>

                {/* DELETE */}
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
                — ไม่พบข้อมูล —
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
