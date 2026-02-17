"use client";

import Table from "@/components/table/table";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/settings";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCountingSessionsByType } from "@/hooks/useCount";
import { API_CONFIG } from "@/utils/config";
import { deleteCountingSession } from "@/utils/count/count-api";
import Swal from "sweetalert2";

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
  const router = useRouter();
  const [dict, setDict] = useState<Awaited<
    ReturnType<typeof getDictionary>
  > | null>(null);
  const [currentLocale, setCurrentLocale] = useState<Locale>("th");
  const [searchCode, setSearchCode] = useState("");

  // Fetch counting sessions for boxes
  const {
    data: countingSessions,
    isLoading,
    error,
    refetch,
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
      setCurrentLocale(locale);
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

      const boxRows = session.boxSession?.boxRows || [];
      const manualTotal =
        boxRows.length > 0
          ? boxRows.reduce((sum, row) => sum + (row?.finalCount ?? 0), 0)
          : session.totalCount || 0;
      const aiTotal =
        boxRows.length > 0
          ? boxRows.reduce((sum, row) => sum + (row?.aiCount ?? 0), 0)
          : 0;

      return {
        no: index + 1,
        vehicleCode: session.vehicle?.vehicleCode || "ไม่ทราบรหัส",
        datetime: formatDate(session.countingDate),
        createdBy: getUserDisplayName(session.user),
        sugarType: session.sugarType?.name || "ไม่ทราบชนิดน้ำตาล",
        manualTotal: `${manualTotal} กล่อง`,
        aiTotal: `${aiTotal} กล่อง`,
        id: session.id, // Add session ID for image upload
        rawSession: session,
        boxSession: session.boxSession,
        sessionType: session.sessionType || "box",
      };
    }) || [];

  // 🔍 Filter vehicleCode
  const filteredData = tableData.filter((item) =>
    item.vehicleCode.toLowerCase().includes(searchCode.toLowerCase())
  );

  const handleDeleteSession = async (item: { id?: string | number }) => {
    if (!item.id) return;

    try {
      await deleteCountingSession(item.id);
      await refetch();
      Swal.fire({
        title: "ลบสำเร็จ",
        text: "ลบข้อมูลการนับเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      });
    } catch (deleteError: unknown) {
      Swal.fire({
        title: "ลบไม่สำเร็จ",
        text:
          deleteError instanceof Error
            ? deleteError.message
            : "ไม่สามารถลบข้อมูลการนับได้",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    }
  };

  console.log("🔍 [DEBUG] SugarBoxsInfo - Final Data:", {
    tableDataCount: tableData.length,
    filteredDataCount: filteredData.length,
    searchCode,
    isLoading,
    error: error ? error.message : null,
  });

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          {dict.dashboard.sidebar.SugarBoxsInfo}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => router.push(`/${currentLocale}/count?tab=boxes`)}
            className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            เริ่มนับกล่อง
          </button>
        </div>
      </div>

      {/* 🔍 ตัวกรองรหัสรถ */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white border border-gray-200 rounded-xl shadow-sm w-full sm:max-w-2xl">
        <label className="block text-gray-700 font-semibold mb-2">
          ค้นหารหัสรถ
        </label>
        <input
          type="text"
          placeholder="เช่น BX001, BX021..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg
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
            <Table type="box" data={filteredData} onDelete={handleDeleteSession} />
          )}
        </>
      )}

    </div>
  );
}
