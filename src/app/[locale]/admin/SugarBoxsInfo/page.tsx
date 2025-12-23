"use client";

import Table from "@/components/table/table";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/settings";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { SugarTypeModal } from "@/components/sugar-types/SugarTypeModal";
import { createSugarType } from "@/utils/count/count-api";
import Swal from "sweetalert2";
import { useCountingSessionsByType } from "@/hooks/useCount";
import { API_CONFIG } from "@/utils/config";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to get user display name
const getUserDisplayName = (user?: {
  profile?: { firstName?: string; lastName?: string };
  username?: string;
}) => {
  if (!user) return "ไม่ทราบผู้ใช้";
  if (user.profile?.firstName && user.profile?.lastName) {
    return `${user.profile.firstName} ${user.profile.lastName}`;
  }
  return user.username || "ไม่ทราบผู้ใช้";
};

export default function Page({ params }: PageProps) {
  const [dict, setDict] = useState<Awaited<
    ReturnType<typeof getDictionary>
  > | null>(null);
  const [searchCode, setSearchCode] = useState("");
  const [isSugarTypeModalOpen, setIsSugarTypeModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch counting sessions for boxes
  const {
    data: countingSessions,
    isLoading,
    error,
  } = useCountingSessionsByType("box");

  // Debug logging
  useEffect(() => {
    console.log("🔍 [DEBUG] SugarBoxsInfo - API Status:", {
      isLoading,
      error: error ? error.message : null,
      dataCount: countingSessions?.length || 0,
      data: countingSessions,
      baseURL: API_CONFIG.BASE_URL,
      endpoint: `/counting-sessions/type/box`,
      fullURL: `${API_CONFIG.BASE_URL}/counting-sessions/type/box`,
    });
  }, [isLoading, error, countingSessions]);

  useEffect(() => {
    async function load() {
      const { locale } = await params;
      const d = await getDictionary(locale);
      setDict(d);
    }
    load();
  }, [params]);

  if (!dict) return <div className="p-6">กำลังโหลด...</div>;

  // Transform API data to table format
  const tableData =
    countingSessions?.map((session, index) => {
      console.log(`🔍 [DEBUG] Session ${index}:`, {
        id: session.id,
        vehicle: session.vehicle,
        countingDate: session.countingDate,
        user: session.user,
        sugarType: session.sugarType,
        totalCount: session.totalCount,
      });

      return {
        no: index + 1,
        vehicleCode: session.vehicle?.vehicleCode || "ไม่ทราบรหัส",
        datetime: formatDate(session.countingDate),
        createdBy: getUserDisplayName(session.user),
        sugarType: session.sugarType?.name || "ไม่ทราบชนิดน้ำตาล",
        amount: `${session.totalCount || 0} กล่อง`,
      };
    }) || [];

  // 🔍 Filter vehicleCode
  const filteredData = tableData.filter((item) =>
    item.vehicleCode.toLowerCase().includes(searchCode.toLowerCase())
  );

  console.log("🔍 [DEBUG] SugarBoxsInfo - Final Data:", {
    tableDataCount: tableData.length,
    filteredDataCount: filteredData.length,
    searchCode,
    isLoading,
    error: error ? error.message : null,
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {dict.dashboard.sidebar.SugarBoxsInfo}
        </h1>
        <button
          onClick={() => setIsSugarTypeModalOpen(true)}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {dict.count.addSugarType || "กำลังเพิ่ม..."}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {dict.count.addSugarType || "เพิ่มชนิดน้ำตาล"}
            </>
          )}
        </button>
      </div>

      {/* 🔍 ตัวกรองรหัสรถ */}
      <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm max-w-2xl">
        <label className="block text-gray-700 font-semibold mb-2">
          ค้นหารหัสรถ
        </label>
        <input
          type="text"
          placeholder="เช่น BX001, BX021..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-400
                     focus:border-blue-400 transition"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
          <div className="flex items-center text-red-700">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              เกิดข้อผิดพลาดในการโหลดข้อมูล: {(error as Error).message}
            </span>
          </div>
        </div>
      )}

      {/* ตาราง */}
      {!isLoading && !error && (
        <>
          {filteredData.length === 0 ? (
            <div className="mb-6 p-8 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
              <p className="text-gray-500">ไม่พบข้อมูลการนับกล่อง</p>
            </div>
          ) : (
            <Table type="box" data={filteredData} />
          )}
        </>
      )}

      {/* Sugar Type Modal */}
      <SugarTypeModal
        isOpen={isSugarTypeModalOpen}
        onClose={() => setIsSugarTypeModalOpen(false)}
        onSave={async (sugarType: { name: string; description?: string }) => {
          setIsCreating(true);
          try {
            await createSugarType({
              name: sugarType.name,
              description: sugarType.description,
            });

            // Show success message
            Swal.fire({
              title: dict?.sugarTypeManagement?.successTitle || "สำเร็จ!",
              text:
                dict?.sugarTypeManagement?.addSuccess ||
                "เพิ่มชนิดน้ำตาลเรียบร้อยแล้ว",
              icon: "success",
              confirmButtonText: dict?.sugarTypeManagement?.ok || "ตกลง",
              confirmButtonColor: "#3085d6",
            });
          } catch (error: unknown) {
            console.error("❌ Error creating sugar type:", error);
            Swal.fire({
              title: dict?.sugarTypeManagement?.errorTitle || "เกิดข้อผิดพลาด",
              text:
                (error instanceof Error ? error.message : String(error)) ||
                dict?.sugarTypeManagement?.createErrorMessage ||
                "ไม่สามารถเพิ่มชนิดน้ำตาลได้",
              icon: "error",
              confirmButtonText: dict?.sugarTypeManagement?.ok || "ตกลง",
              confirmButtonColor: "#3085d6",
            });
          } finally {
            setIsCreating(false);
          }
        }}
      />
    </div>
  );
}
