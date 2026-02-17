"use client";

import BagRow from "@/components/count/BagRow";
import BoxRow from "@/components/count/BoxRow";
import CustomDropdown from "@/components/count/CustomDropdown";
import Tabs from "@/components/count/Tabs";
import { Plus, Loader2, Bug } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef, useCallback } from "react";
import { useCountManager } from "@/hooks/useCount";
import Swal from "sweetalert2";
import type {
  SackRowFormData,
  BoxRowFormData,
  CountingSessionFormData,
} from "@/utils/types";
import { deleteCountingSession } from "@/utils/count/count-api";
import { API_CONFIG } from "@/utils/config";

interface CountPageProps {
  initialTab?: "bags" | "boxes";
}

// CountPage
export default function CountPage({ initialTab = "bags" }: CountPageProps) {
  const t = useTranslations("count");
  const [currentTab, setCurrentTab] = useState<"bags" | "boxes">(initialTab);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedSugarTypeId, setSelectedSugarTypeId] = useState<string>("");
  const [rows, setRows] = useState<number[]>([1]);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [sackRowsData, setSackRowsData] = useState<{
    [key: number]: SackRowFormData;
  }>({});
  const [boxRowsData, setBoxRowsData] = useState<{
    [key: number]: BoxRowFormData;
  }>({});
  const [countingSessionId, setCountingSessionId] = useState<string>("");
  const [tempSessionId, setTempSessionId] = useState<string>("");
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [hasSaved, setHasSaved] = useState(false);
  const vehicleInitializedRef = useRef(false);
  const sugarTypeInitializedRef = useRef(false);
  const prevTabRef = useRef(currentTab);
  const countingSessionIdRef = useRef("");

  // Use count manager hook
  const countManager = useCountManager();

  // Set isClient state on client only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize selected values only once when data is loaded
  useEffect(() => {
    if (
      isClient &&
      countManager.vehicles.length > 0 &&
      !vehicleInitializedRef.current
    ) {
      const vehicleId = countManager.vehicles[0]?.id;
      if (vehicleId !== undefined) {
        setSelectedVehicleId(vehicleId.toString());
        vehicleInitializedRef.current = true;
      }
    }
  }, [isClient, countManager.vehicles.length]);

  useEffect(() => {
    if (
      isClient &&
      countManager.sugarTypes.length > 0 &&
      !sugarTypeInitializedRef.current
    ) {
      const sugarTypeId = countManager.sugarTypes[0]?.id;
      if (sugarTypeId !== undefined) {
        setSelectedSugarTypeId(sugarTypeId.toString());
        sugarTypeInitializedRef.current = true;
      }
    }
  }, [isClient, countManager.sugarTypes.length]);

  // Reset countingSessionId when tab changes (only if session already started)
  useEffect(() => {
    if (!isClient) return;
    if (prevTabRef.current !== currentTab) {
      if (isSessionStarted && countingSessionIdRef.current) {
        console.log("🔄 [DEBUG] Tab changed, resetting counting session ID");
        setCountingSessionId("");
        setTempSessionId("");
        setIsSessionStarted(false);
      }
      prevTabRef.current = currentTab;
    }
  }, [isClient, currentTab, isSessionStarted]);

  useEffect(() => {
    countingSessionIdRef.current = countingSessionId;
  }, [countingSessionId]);

  useEffect(() => {
    if (countingSessionId) {
      setHasSaved(false);
    }
  }, [countingSessionId]);

  // Create counting session when vehicle and sugar type are selected
  useEffect(() => {
    const createCountingSessionIfReady = async () => {
      if (
        isClient &&
        isSessionStarted &&
        selectedVehicleId &&
        selectedSugarTypeId &&
        countManager.currentUser &&
        !countingSessionId
      ) {
        try {
          console.log("🔍 [DEBUG] Creating counting session with:", {
            vehicleId: selectedVehicleId,
            sugarTypeId: selectedSugarTypeId,
            userId: countManager.currentUser.id,
            sessionType: currentTab === "bags" ? "sack" : "box",
          });

          // Debug: Check all values
          console.log("🔍 [DEBUG] Value types and content:", {
            selectedVehicleId: {
              value: selectedVehicleId,
              type: typeof selectedVehicleId,
              isEmpty: !selectedVehicleId,
            },
            selectedSugarTypeId: {
              value: selectedSugarTypeId,
              type: typeof selectedSugarTypeId,
              isEmpty: !selectedSugarTypeId,
            },
            userId: {
              value: countManager.currentUser.id,
              type: typeof countManager.currentUser.id,
              isEmpty: !countManager.currentUser.id,
            },
            sessionType: {
              value: currentTab === "bags" ? "sack" : "box",
              type: typeof (currentTab === "bags" ? "sack" : "box"),
            },
          });

          const sessionData = {
            sessionType: currentTab === "bags" ? "sack" : "box",
            userId: countManager.currentUser.id,
            vehicleId: selectedVehicleId,
            sugarTypeId: selectedSugarTypeId,
            countingDate: new Date().toISOString(),
            status: "in_progress" as const,
          };

          // Debug: Log full session data
          console.log("🔍 [DEBUG] Full session data to send:", sessionData);
          console.log(
            "🔍 [DEBUG] JSON stringified:",
            JSON.stringify(sessionData)
          );

          // Import the createCountingSession function
          const { createCountingSession } = await import(
            "@/utils/count/count-api"
          );
          const createdSession = await createCountingSession(sessionData);

          console.log("✅ [DEBUG] Counting session created:", createdSession);
          setCountingSessionId(createdSession.id?.toString() || "");
        } catch (error) {
          console.error("❌ [DEBUG] Failed to create counting session:", error);
          // Don't set countingSessionId if backend creation fails
          // We'll use tempSessionId for AI calls but keep trying to get real ID
        }
      }
    };

    createCountingSessionIfReady();
  }, [
    isClient,
    isSessionStarted,
    selectedVehicleId,
    selectedSugarTypeId,
    countManager.currentUser,
    currentTab,
    countingSessionId,
  ]);

  // Generate temporary session ID for AI calls (always generate if not exists)
  useEffect(() => {
    if (isClient && !tempSessionId) {
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setTempSessionId(tempId);
    }
  }, [isClient, tempSessionId]);

  const addRow = () =>
    setRows((prev) => [...prev, (prev[prev.length - 1] || 0) + 1]);
  const deleteRow = (rowNumber: number) => {
    setRows((prev) => prev.filter((r) => r !== rowNumber));
    // Remove data for deleted row
    if (currentTab === "bags") {
      setSackRowsData((prev) => {
        const newData = { ...prev };
        delete newData[rowNumber];
        return newData;
      });
    } else {
      setBoxRowsData((prev) => {
        const newData = { ...prev };
        delete newData[rowNumber];
        return newData;
      });
    }
  };

  // Get session ID for AI calls (use real countingSessionId if available, otherwise temp)
  const getSessionIdForAI = () => {
    return countingSessionId || tempSessionId;
  };

  const handleBackToStart = async () => {
    let dirty = false;
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("count_dirty_rows") || "[]";
      dirty = JSON.parse(raw).length > 0;
    }

    if (dirty) {
      const result = await Swal.fire({
        title: t("leaveWarningTitle", {
          defaultValue: "ข้อมูลจะหาย",
        }),
        text: t("leaveWarningText", {
          defaultValue: "ถ้าออกหรือรีเฟรช ข้อมูลที่กรอกจะหาย",
        }),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("leaveWarningConfirm", {
          defaultValue: "ออก",
        }),
        cancelButtonText: t("leaveWarningCancel", {
          defaultValue: "ยกเลิก",
        }),
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("count_dirty_rows");
      if (window.onbeforeunload) {
        window.onbeforeunload = null;
      }
    }

    if (countingSessionIdRef.current && !hasSaved) {
      try {
        await deleteCountingSession(countingSessionIdRef.current);
      } catch (error) {
        console.error("Failed to delete counting session:", error);
      }
    }

    setIsSessionStarted(false);
    setRows([1]);
    setSackRowsData({});
    setBoxRowsData({});
    setCountingSessionId("");
    setTempSessionId("");
    setResetTrigger((prev) => prev + 1);
    setHasSaved(false);
  };

  const handleSave = async () => {
    if (
      !selectedVehicleId ||
      !selectedSugarTypeId ||
      !countManager.currentUser
    ) {
      Swal.fire({
        title: t("validation.requiredFields", {
          defaultValue: "ข้อมูลไม่ครบถ้วน",
        }),
        text: t("validation.selectVehicleAndSugarType", {
          defaultValue: "กรุณาเลือกรถขนส่งและประเภทน้ำตาล",
        }),
        icon: "warning",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
      return;
    }

    // Check if all rows have data
    if (currentTab === "bags") {
      const missingRows = rows.filter((rowNumber) => !sackRowsData[rowNumber]);
      if (missingRows.length > 0) {
        Swal.fire({
          title: t("validation.missingData", {
            defaultValue: "ข้อมูลไม่ครบถ้วน",
          }),
          text: t("validation.missingRowData", {
            defaultValue: `กรุณากรอกข้อมูลสำหรับแถวที่ ${missingRows.join(
              ", "
            )}`,
          }),
          icon: "warning",
          confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
        });
        return;
      }
    } else {
      const missingRows = rows.filter((rowNumber) => !boxRowsData[rowNumber]);
      if (missingRows.length > 0) {
        Swal.fire({
          title: t("validation.missingData", {
            defaultValue: "ข้อมูลไม่ครบถ้วน",
          }),
          text: t("validation.missingRowData", {
            defaultValue: `กรุณากรอกข้อมูลสำหรับแถวที่ ${missingRows.join(
              ", "
            )}`,
          }),
          icon: "warning",
          confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
        });
        return;
      }
    }

    setIsSaving(true);

    try {
      const sessionData: CountingSessionFormData = {
        sessionType: currentTab === "bags" ? "sack" : "box",
        userId: countManager.currentUser.id,
        vehicleId: selectedVehicleId,
        sugarTypeId: selectedSugarTypeId,
        countingDate: new Date().toISOString(),
        status: "in_progress",
      };

      // Use real data from components
      if (currentTab === "bags") {
        const sackRows: SackRowFormData[] = rows.map((rowNumber) => {
          const rowData = sackRowsData[rowNumber];
          return {
            ...rowData,
            sessionId: 0, // Will be set by workflow
          };
        });

        await countManager.completeSackCountingAsync({
          sessionData,
          sackRows,
          existingCountingSessionId: countingSessionId,
        });
      } else {
        const boxRows: BoxRowFormData[] = rows.map((rowNumber) => {
          const rowData = boxRowsData[rowNumber];
          return {
            ...rowData,
            sessionId: 0, // Will be set by workflow
          };
        });

        await countManager.completeBoxCountingAsync({
          sessionData,
          boxRows,
          existingCountingSessionId: countingSessionId,
        });
      }

      // Reset form after successful save and create new counting session
      setRows([1]);
      setSackRowsData({});
      setBoxRowsData({});
      setCountingSessionId(""); // Reset to create new counting session
      setTempSessionId(""); // Reset temp session ID too
      setResetTrigger((prev) => prev + 1); // Trigger reset in BagRow/BoxRow
      setHasSaved(true);

      // Clear localStorage for all rows to reset BagRow/BoxRow state
      if (typeof window !== "undefined") {
        // Clear bag rows localStorage
        for (let i = 1; i <= 20; i++) {
          localStorage.removeItem(`bagRow_${i}_sessionId`);
          localStorage.removeItem(`bagRow_${i}_autoDetect`);
          localStorage.removeItem(`bagRow_${i}_detectionType`);
        }
        // Clear box rows localStorage
        for (let i = 1; i <= 20; i++) {
          localStorage.removeItem(`boxRow_${i}_sessionId`);
          localStorage.removeItem(`boxRow_${i}_autoDetect`);
          localStorage.removeItem(`boxRow_${i}_detectionType`);
        }
        console.log("🧹 Cleared localStorage for all rows");
        localStorage.removeItem("count_dirty_rows");
        if (window.onbeforeunload) {
          window.onbeforeunload = null;
        }
      }

      // Show success message
      Swal.fire({
        title: t("saveMessages.success", { defaultValue: "บันทึกสำเร็จ" }),
        text: t("saveMessages.successMessage", {
          defaultValue: "บันทึกข้อมูลการนับสำเร็จแล้ว",
        }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    } catch (error: unknown) {
      console.error("❌ Error saving counting session:", error);
      Swal.fire({
        title: t("saveMessages.error", { defaultValue: "เกิดข้อผิดพลาด" }),
        text:
          (error instanceof Error ? error.message : String(error)) ||
          t("saveMessages.errorMessage", {
            defaultValue: "ไม่สามารถบันทึกข้อมูลได้",
          }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "ตกลง" }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!countingSessionIdRef.current || hasSaved) return;

    const handlePageHide = () => {
      const sessionId = countingSessionIdRef.current;
      if (!sessionId || hasSaved) return;
      const url = API_CONFIG.buildUrl(`/counting-sessions/${sessionId}`);
      fetch(url, {
        method: "DELETE",
        credentials: "include",
        keepalive: true,
      }).catch(() => {});
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [hasSaved]);

  // Handler for updating sack row data
  const handleSackRowDataChange = useCallback(
    (rowNumber: number, data: SackRowFormData) => {
      setSackRowsData((prev) => {
        // Check if data actually changed to prevent unnecessary updates
        const existingData = prev[rowNumber];
        if (
          existingData &&
          existingData.aiCount === data.aiCount &&
          existingData.finalCount === data.finalCount &&
          existingData.weightType === data.weightType &&
          existingData.originalImagePath === data.originalImagePath &&
          existingData.annotatedImagePath === data.annotatedImagePath
        ) {
          return prev; // No change, return same object
        }
        return {
          ...prev,
          [rowNumber]: data,
        };
      });
    },
    []
  );

  // Handler for updating box row data
  const handleBoxRowDataChange = useCallback(
    (rowNumber: number, data: BoxRowFormData) => {
      setBoxRowsData((prev) => {
        // Check if data actually changed to prevent unnecessary updates
        const existingData = prev[rowNumber];
        if (
          existingData &&
          existingData.aiCount === data.aiCount &&
          existingData.finalCount === data.finalCount &&
          existingData.originalImagePath === data.originalImagePath &&
          existingData.annotatedImagePath === data.annotatedImagePath
        ) {
          return prev; // No change, return same object
        }
        return {
          ...prev,
          [rowNumber]: data,
        };
      });
    },
    []
  );

  // Show loading while fetching essential data or waiting for client
  if (!isClient) {
    return (
      <div className="min-h-screen flex justify-center p-4 bg-gray-100">
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
            {t("title")}
          </h1>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">
              {t("loading", { defaultValue: "กำลังโหลดข้อมูล..." })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while fetching essential data (client only)
  if (
    !isClient ||
    countManager.isLoadingVehicles ||
    countManager.isLoadingSugarTypes ||
    countManager.isLoadingCurrentUser
  ) {
    return (
      <div className="min-h-screen flex justify-center p-4 bg-gray-100">
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
            {t("title")}
          </h1>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">
              {t("loading", { defaultValue: "กำลังโหลดข้อมูล..." })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if failed to load data
  if (countManager.isError) {
    return (
      <div className="min-h-screen flex justify-center p-4 bg-gray-100">
        <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
            {t("title")}
          </h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-bold">
              {t("errors.loadError", {
                defaultValue: "ไม่สามารถโหลดข้อมูลได้",
              })}
            </p>
            <p>
              {countManager.vehiclesError?.message ||
                countManager.sugarTypesError?.message ||
                "Unknown error"}
            </p>
            <button
              onClick={() => {
                countManager.refetchVehicles();
                countManager.refetchSugarTypes();
              }}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t("buttons.retry", { defaultValue: "ลองใหม่" })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center p-4 bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
            {t("title")}
          </h1>
          <p className="text-center text-sm text-gray-500 mt-2">
            {t("startHeader", { defaultValue: "ตั้งค่าการนับ" })} •{" "}
            {t("startDescription", {
              defaultValue: "เลือกข้อมูลให้ครบก่อนเริ่มนับ",
            })}
          </p>
        </div>

        {!isSessionStarted && (
          <div className="mb-6 flex flex-col items-center text-center gap-4 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div>
              <h2 className="text-lg font-semibold text-blue-900">
                {t("startCounting", { defaultValue: "เริ่มการนับ" })}
              </h2>
              <p className="text-sm text-blue-700 mt-1">
                {t("startCountingHint", {
                  defaultValue: "เลือกประเภทการนับเพื่อเริ่มสร้างเซสชัน",
                })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setCurrentTab("bags");
                  setIsSessionStarted(true);
                }}
                title={t("startCountingTooltip", {
                  defaultValue: "สร้างเซสชันและปลดล็อกแบบฟอร์ม",
                })}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("startButtons.bags", { defaultValue: "นับกระสอบ" })}
              </button>
              <button
                onClick={() => {
                  setCurrentTab("boxes");
                  setIsSessionStarted(true);
                }}
                title={t("startCountingTooltip", {
                  defaultValue: "สร้างเซสชันและปลดล็อกแบบฟอร์ม",
                })}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {t("startButtons.boxes", { defaultValue: "นับกล่องหหห" })}
              </button>
            </div>
          </div>
        )}

        {isSessionStarted && (
          <>
            <div className="mb-4 flex justify-start">
              <button
                onClick={handleBackToStart}
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t("backToStart", { defaultValue: "ย้อนกลับ" })}
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
            </div>

            {/* รถขนส่ง + ประเภทน้ำตาล */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("transportation")}
                </label>
                <CustomDropdown
                  options={countManager.vehicles.map((vehicle) => ({
                    value: vehicle.id?.toString() || "",
                    label: `${vehicle.vehicleCode || ""} - ${
                      vehicle.licensePlate || ""
                    } (${vehicle.driverName || ""})`,
                  }))}
                  selected={selectedVehicleId}
                  setSelected={setSelectedVehicleId}
                  placeholder={t("selectVehicle", {
                    defaultValue: "เลือกรถขนส่ง",
                  })}
                  disabled={countManager.isLoadingVehicles || !isClient}
                  suppressHydrationWarning={true}
                />
                {countManager.vehicles.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t("noVehiclesAvailable", {
                      defaultValue: "ไม่มีรถขนส่งที่ใช้งานได้",
                    })}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("sugarType")}
                </label>
                <CustomDropdown
                  options={countManager.sugarTypes.map((sugarType) => ({
                    value: sugarType.id?.toString() || "",
                    label: sugarType.name || "",
                  }))}
                  selected={selectedSugarTypeId}
                  setSelected={setSelectedSugarTypeId}
                  placeholder={t("selectSugarType", {
                    defaultValue: "เลือกประเภทน้ำตาล",
                  })}
                  disabled={countManager.sugarTypes.length === 0 || !isClient}
                  suppressHydrationWarning={true}
                />
                {countManager.sugarTypes.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    ⚠️{" "}
                    {t("noSugarTypesAvailable", {
                      defaultValue: "ไม่มีประเภทน้ำตาล",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Summary Information */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {t("summary.title", { defaultValue: "สรุปข้อมูล" })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("summary.vehicle", { defaultValue: "รถขนส่ง" })}:
                  </p>
                  <p className="font-medium">
                    {selectedVehicleId && countManager.vehicles.length > 0
                      ? countManager.vehicles.find(
                          (v) => v.id?.toString() === selectedVehicleId
                        )?.vehicleCode ||
                        t("summary.notSelected", { defaultValue: "ไม่ได้เลือก" })
                      : t("summary.notSelected", { defaultValue: "ไม่ได้เลือก" })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("summary.sugarType", { defaultValue: "ประเภทน้ำตาล" })}:
                  </p>
                  <p className="font-medium">
                    {selectedSugarTypeId && countManager.sugarTypes.length > 0
                      ? (() => {
                          const sugarType = countManager.sugarTypes.find(
                            (s) => s.id?.toString() === selectedSugarTypeId
                          );
                          if (sugarType) {
                            return sugarType.name || "";
                          }
                          return t("summary.notSelected", {
                            defaultValue: "ไม่ได้เลือก",
                          });
                        })()
                      : t("summary.notSelected", { defaultValue: "ไม่ได้เลือก" })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("summary.rowCount", { defaultValue: "จำนวนแถว" })}:
                  </p>
                  <p className="font-medium">
                    {rows.length} {t("summary.rows", { defaultValue: "แถว" })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("summary.sessionType", { defaultValue: "ประเภทการนับ" })}:
                  </p>
                  <p className="font-medium">
                    {currentTab === "bags"
                      ? t("summary.bags", { defaultValue: "นับกระสอบ" })
                      : t("summary.boxes", { defaultValue: "นับกล่อง" })}
                  </p>
                </div>
              </div>
            </div>

            {/* รายการแถว */}
            <div className="space-y-4">
              {rows.map((rowNumber) =>
                currentTab === "bags" ? (
                  <BagRow
                    key={rowNumber}
                    rowNumber={rowNumber}
                    onDelete={() => deleteRow(rowNumber)}
                    onDataChange={(data) =>
                      handleSackRowDataChange(rowNumber, data)
                    }
                    vehicleId={selectedVehicleId}
                    sugarTypeId={selectedSugarTypeId}
                    countingSessionId={getSessionIdForAI()}
                    resetTrigger={resetTrigger}
                    disabled={!selectedVehicleId || !selectedSugarTypeId}
                  />
                ) : (
                  <BoxRow
                    key={rowNumber}
                    rowNumber={rowNumber}
                    onDelete={() => deleteRow(rowNumber)}
                    onDataChange={(data) =>
                      handleBoxRowDataChange(rowNumber, data)
                    }
                    vehicleId={selectedVehicleId}
                    sugarTypeId={selectedSugarTypeId}
                    countingSessionId={getSessionIdForAI()}
                    resetTrigger={resetTrigger}
                    disabled={!selectedVehicleId || !selectedSugarTypeId}
                  />
                )
              )}

              <button
                onClick={addRow}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !selectedVehicleId ||
                  !selectedSugarTypeId ||
                  !getSessionIdForAI()
                }
              >
                <Plus className="w-4 h-4" />
                {t("addRow", { defaultValue: "เพิ่มแถว" })}
              </button>
            </div>

            {/* ปุ่มบันทึก */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  !selectedVehicleId ||
                  !selectedSugarTypeId ||
                  !countingSessionId ||
                  rows.length === 0
                }
                className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("saveMessages.saving", { defaultValue: "กำลังบันทึก..." })}
                  </>
                ) : (
                  t("saveButton")
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
