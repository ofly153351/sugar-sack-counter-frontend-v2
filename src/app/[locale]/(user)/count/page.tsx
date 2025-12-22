"use client";

import BagRow from "@/components/count/BagRow";
import BoxRow from "@/components/count/BoxRow";
import CustomDropdown from "@/components/count/CustomDropdown";
import Tabs from "@/components/count/Tabs";
import { Plus, Loader2, Bug } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef } from "react";
import { useCountManager } from "@/hooks/useCount";
import Swal from "sweetalert2";
import type {
  SackRowFormData,
  BoxRowFormData,
  CountingSessionFormData,
} from "@/utils/types";

// CountPage
export default function CountPage() {
  const t = useTranslations("count");
  const [currentTab, setCurrentTab] = useState<"bags" | "boxes">("bags");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedSugarTypeId, setSelectedSugarTypeId] = useState<string>("");
  const [rows, setRows] = useState<number[]>([1]);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const vehicleInitializedRef = useRef(false);
  const sugarTypeInitializedRef = useRef(false);

  // Use count manager hook
  const countManager = useCountManager();

  // Set mounted and isClient state on client only
  useEffect(() => {
    setMounted(true);
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

  const addRow = () =>
    setRows((prev) => [...prev, (prev[prev.length - 1] || 0) + 1]);
  const deleteRow = (rowNumber: number) =>
    setRows((prev) => prev.filter((r) => r !== rowNumber));

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

    setIsSaving(true);

    try {
      const sessionData: CountingSessionFormData = {
        sessionType: currentTab === "bags" ? "sack" : "box",
        userId: countManager.currentUser.id,
        vehicleId: selectedVehicleId,
        sugarTypeId: selectedSugarTypeId,
        countingDate: new Date().toISOString(),
        status: "in_progress",
        totalCount: 0,
      };

      // Collect row data from components (this would need to be implemented)
      // For now, we'll use mock data
      if (currentTab === "bags") {
        const sackRows: SackRowFormData[] = rows.map((rowNumber) => ({
          sessionId: 0, // Will be set by workflow
          rowNumber,
          weightType: "50kg",
          aiCount: 20,
          finalCount: 20,
          imagePath: "",
        }));

        await countManager.completeSackCountingAsync({
          sessionData,
          sackRows,
        });
      } else {
        const boxRows: BoxRowFormData[] = rows.map((rowNumber) => ({
          sessionId: 0, // Will be set by workflow
          rowNumber,
          aiCount: 5,
          finalCount: 5,
          imagePath: "",
        }));

        await countManager.completeBoxCountingAsync({
          sessionData,
          boxRows,
        });
      }

      // Reset form after successful save
      setRows([1]);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
          {t("title")}
        </h1>

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
                vehicleId={selectedVehicleId}
                sugarTypeId={selectedSugarTypeId}
                disabled={!selectedVehicleId || !selectedSugarTypeId}
              />
            ) : (
              <BoxRow
                key={rowNumber}
                rowNumber={rowNumber}
                onDelete={() => deleteRow(rowNumber)}
                vehicleId={selectedVehicleId}
                sugarTypeId={selectedSugarTypeId}
                disabled={!selectedVehicleId || !selectedSugarTypeId}
              />
            )
          )}

          <button
            onClick={addRow}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedVehicleId || !selectedSugarTypeId}
          >
            <Plus className="w-4 h-4" />
            {t("addRow")}
          </button>
        </div>

        {/* ปุ่มบันทึก */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleSave}
            disabled={
              isSaving ||
              !selectedVehicleId ||
              !selectedSugarTypeId ||
              rows.length === 0
            }
            className="w-full sm:w-56 py-3 text-lg font-medium text-white bg-indigo-700 rounded-xl hover:bg-indigo-800 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* Debug button - hidden in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={testMinimalSession}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <Bug className="w-4 h-4" />
              Test Minimal Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Debug function for testing minimal session creation
async function testMinimalSession() {
  try {
    console.log("🔍 [DEBUG] Testing minimal session creation...");

    // Get current user ID from localStorage or mock
    const userId =
      localStorage.getItem("userId") || "011fc9ce-43b1-473a-8f57-8920a5936be8";

    const testData = {
      sessionType: "sack",
      userId: userId,
      vehicleId: "cb137af7-19cf-4ee9-9e47-9357ed8e41c8",
      sugarTypeId: "18833fd3-2151-4763-bec8-17e10833be33",
      countingDate: new Date().toISOString(),
      status: "in_progress",
      totalCount: 0,
    };

    console.log("🔍 [DEBUG] Test payload:", testData);

    const response = await fetch(
      "http://localhost:3001/api/counting-sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
        credentials: "include",
      }
    );

    const result = await response.json();
    console.log("🔍 [DEBUG] Response:", {
      status: response.status,
      statusText: response.statusText,
      data: result,
    });

    if (response.ok) {
      Swal.fire({
        title: "Test Successful",
        text: `Session created with ID: ${result.id}`,
        icon: "success",
      });
    } else {
      Swal.fire({
        title: "Test Failed",
        text: `Error ${response.status}: ${JSON.stringify(result)}`,
        icon: "error",
      });
    }
  } catch (error) {
    console.error("❌ [DEBUG] Test error:", error);
    Swal.fire({
      title: "Test Error",
      text: error instanceof Error ? error.message : String(error),
      icon: "error",
    });
  }
}
