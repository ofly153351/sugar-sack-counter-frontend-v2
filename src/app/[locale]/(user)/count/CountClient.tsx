"use client";

import BagRow from "@/components/count/BagRow";
import BoxRow from "@/components/count/BoxRow";
import CustomDropdown from "@/components/count/CustomDropdown";
import Tabs from "@/components/count/Tabs";
import { Plus, Loader2, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCountManager } from "@/hooks/useCount";
import Swal from "sweetalert2";
import type {
  SackRowFormData,
  BoxRowFormData,
  CountingSessionFormData,
} from "@/utils/types";
import { deleteCountingSession } from "@/utils/count/count-api";
import { API_CONFIG } from "@/utils/config";
import * as XLSX from "xlsx";

interface CountPageProps {
  initialTab?: "bags" | "boxes";
}

// CountPage
export default function CountPage({ initialTab = "bags" }: CountPageProps) {
  const t = useTranslations("count");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "th";
  const [currentTab, setCurrentTab] = useState<"bags" | "boxes">(
    initialTab === "boxes" ? "boxes" : "bags"
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedSugarTypeId, setSelectedSugarTypeId] = useState<string>("");
  const [rows, setRows] = useState<number[]>([1]);
  const [isSaving, setIsSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(true);
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
  const [vehicleExtrasMap, setVehicleExtrasMap] = useState<
    Record<
      string,
      {
        sugarType: string;
        weightTons: number;
        totalSacks: number;
        sackRows: number[];
      }
    >
  >({});
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

  // Load vehicle extras from VehicleInfo page storage
  useEffect(() => {
    if (!isClient) return;
    try {
      const raw = localStorage.getItem("vehicle_extras_map_v1");
      if (!raw) {
        setVehicleExtrasMap({});
        return;
      }
      const parsed = JSON.parse(raw);
      setVehicleExtrasMap(parsed || {});
    } catch (error) {
      console.error("Failed to parse vehicle extras map:", error);
      setVehicleExtrasMap({});
    }
  }, [isClient]);

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

  // Sync sugar type from selected vehicle extras (VehicleInfo)
  useEffect(() => {
    if (!isClient || !selectedVehicleId || countManager.sugarTypes.length === 0) {
      return;
    }
    const extras = vehicleExtrasMap[selectedVehicleId];
    if (!extras?.sugarType) return;

    const matched = countManager.sugarTypes.find(
      (type) => type.name.trim() === extras.sugarType.trim()
    );
    if (matched?.id !== undefined) {
      setSelectedSugarTypeId(matched.id.toString());
    }
  }, [
    isClient,
    selectedVehicleId,
    vehicleExtrasMap,
    countManager.sugarTypes,
  ]);

  // Reset countingSessionId when tab changes (only if session already started)
  useEffect(() => {
    if (!isClient) return;
    if (prevTabRef.current !== currentTab) {
      // Keep tab UI consistent regardless of entry URL (?tab=bags / ?tab=boxes)
      // by resetting row/form state whenever the counting type changes.
      setRows([1]);
      setSackRowsData({});
      setBoxRowsData({});
      setResetTrigger((prev) => prev + 1);

      if (isSessionStarted && countingSessionIdRef.current) {
        console.log("๐” [DEBUG] Tab changed, resetting counting session ID");
        setCountingSessionId("");
        setTempSessionId("");
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
          console.log("๐” [DEBUG] Creating counting session with:", {
            vehicleId: selectedVehicleId,
            sugarTypeId: selectedSugarTypeId,
            userId: countManager.currentUser.id,
            sessionType: currentTab === "bags" ? "sack" : "box",
          });

          // Debug: Check all values
          console.log("๐” [DEBUG] Value types and content:", {
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
          console.log("๐” [DEBUG] Full session data to send:", sessionData);
          console.log(
            "๐” [DEBUG] JSON stringified:",
            JSON.stringify(sessionData)
          );

          // Import the createCountingSession function
          const { createCountingSession } = await import(
            "@/utils/count/count-api"
          );
          const createdSession = await createCountingSession(sessionData);

          console.log("โ… [DEBUG] Counting session created:", createdSession);
          setCountingSessionId(createdSession.id?.toString() || "");
        } catch (error) {
          console.error("โ [DEBUG] Failed to create counting session:", error);
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

  const resolveImageUrl = (pathOrUrl?: string): string => {
    if (!pathOrUrl) return "";
    if (
      pathOrUrl.startsWith("http://") ||
      pathOrUrl.startsWith("https://") ||
      pathOrUrl.startsWith("data:")
    ) {
      return pathOrUrl;
    }
    const imageBaseUrl = API_CONFIG.BASE_URL.replace(/\/api\/?$/, "");
    return `${imageBaseUrl}/images/${pathOrUrl.replace(/^\/+/, "")}`;
  };

  const fetchImageBlob = async (
    url: string
  ): Promise<{ blob: Blob; sourceUrl: string } | null> => {
    if (!url) return null;

    if (url.startsWith("data:")) {
      const response = await fetch(url);
      if (!response.ok) return null;
      return { blob: await response.blob(), sourceUrl: url };
    }

    let res = await fetch(url, { credentials: "include" });
    let usedUrl = url;

    if (!res.ok) {
      const fallbackUrl = url.includes("/api/images/")
        ? url.replace("/api/images/", "/images/")
        : url.includes("/images/")
        ? url.replace("/images/", "/api/images/")
        : "";

      if (fallbackUrl) {
        res = await fetch(fallbackUrl, { credentials: "include" });
        usedUrl = fallbackUrl;
      }
    }

    if (!res.ok) return null;
    return { blob: await res.blob(), sourceUrl: usedUrl };
  };

  const getImageExt = (sourceUrl: string, blob: Blob): string => {
    const mime = blob.type.toLowerCase();
    if (mime.includes("png")) return "png";
    if (mime.includes("webp")) return "webp";
    if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";

    const match = sourceUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    if (match?.[1]) return match[1].toLowerCase();
    return "jpg";
  };

  const handleDownloadImages = async () => {
    const rowDataMap = currentTab === "bags" ? sackRowsData : boxRowsData;
    const rowItems = rows
      .map((rowNumber) => ({ rowNumber, row: rowDataMap[rowNumber] }))
      .filter((item) => !!item.row);

    const targets = rowItems.flatMap(({ rowNumber, row }) => {
      if (!row) return [];
      const annotatedUrl = resolveImageUrl(
        row.annotatedImageDataUrl || row.annotatedImagePath
      );
      const originalUrl = resolveImageUrl(
        row.originalImageDataUrl || row.originalImagePath
      );
      const prefix = currentTab === "bags" ? "bag" : "box";
      const candidates = [
        annotatedUrl && {
          url: annotatedUrl,
          rowNumber,
          imageType: "annotated" as const,
          prefix,
        },
        originalUrl && {
          url: originalUrl,
          rowNumber,
          imageType: "original" as const,
          prefix,
        },
      ].filter(
        (
          item
        ): item is {
          url: string;
          rowNumber: number;
          imageType: "annotated" | "original";
          prefix: string;
        } => !!item
      );

      return candidates;
    });

    if (targets.length === 0) {
      Swal.fire({
        title: "ยังไม่มีรูปสำหรับดาวน์โหลด",
        text: "กรุณาอัปโหลดรูปอย่างน้อย 1 แถวก่อนดาวน์โหลด",
        icon: "warning",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    let addedToZip = 0;

    for (const item of targets) {
      try {
        const imageData = await fetchImageBlob(item.url);
        if (!imageData) {
          console.error("Failed to download image:", item.url);
          continue;
        }
        const ext = getImageExt(imageData.sourceUrl, imageData.blob);
        zip.file(
          `${item.prefix}-row-${item.rowNumber}-${item.imageType}.${ext}`,
          imageData.blob
        );
        addedToZip += 1;
      } catch (error) {
        console.error("Failed to download image:", item.url, error);
      }
    }

    if (addedToZip === 0) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดาวน์โหลดรูปได้",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const plateRaw = selectedVehicle?.licensePlate || "unknown";
    const plate = plateRaw.trim().replace(/[\\/:*?"<>|]/g, "-");
    const dateLabel = new Date().toISOString().slice(0, 10);
    const typeLabel = currentTab === "bags" ? "sack" : "box";
    const zipName = `${plate},${dateLabel},${typeLabel}.zip`;

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipUrl = window.URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(zipUrl);
  };

  const handleExportXlsx = () => {
    const exportRows = buildExportRows();

    if (exportRows.length === 0) {
      Swal.fire({
        title: "ยังไม่มีข้อมูลสำหรับ Export",
        text: "กรุณาเพิ่มข้อมูลในแถวอย่างน้อย 1 แถวก่อน",
        icon: "warning",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      currentTab === "bags" ? "SugarBags" : "SugarBoxes"
    );
    XLSX.writeFile(
      workbook,
      `${
        selectedVehicle?.licensePlate || (currentTab === "bags" ? "sugar-bags" : "sugar-boxes")
      }-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const buildExportRows = (): Array<Record<string, string | number>> => {
    const currentRowsMap = currentTab === "bags" ? sackRowsData : boxRowsData;
    const selectedSugarType = countManager.sugarTypes.find(
      (sugarType) => sugarType.id?.toString() === selectedSugarTypeId
    );
    const currentUser = countManager.currentUser as
      | {
          profile?: { firstName?: string; lastName?: string };
          firstName?: string;
          lastName?: string;
          username?: string;
        }
      | undefined;

    const userDisplayName =
      (currentUser?.profile?.firstName && currentUser?.profile?.lastName
        ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
        : "") ||
      (currentUser?.firstName && currentUser?.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : "") ||
      currentUser?.username ||
      "-";
    const rowPrefix = currentTab === "bags" ? "bag" : "box";
    const detectExt = (pathOrDataUrl?: string): string => {
      if (!pathOrDataUrl) return "jpg";
      if (pathOrDataUrl.startsWith("data:")) {
        if (pathOrDataUrl.startsWith("data:image/png")) return "png";
        if (pathOrDataUrl.startsWith("data:image/webp")) return "webp";
        return "jpg";
      }
      const cleaned = pathOrDataUrl.split("?")[0];
      const parts = cleaned.split(".");
      const ext = parts[parts.length - 1]?.toLowerCase();
      return ext || "jpg";
    };

    const exportRows = rows
      .map((rowNumber) => {
        const row = currentRowsMap[rowNumber];
        if (!row) return null;

        const annotatedSource = row.annotatedImagePath || row.annotatedImageDataUrl;
        const originalSource = row.originalImagePath || row.originalImageDataUrl;
        const annotatedFilename = annotatedSource
          ? `${rowPrefix}-row-${rowNumber}-annotated.${detectExt(annotatedSource)}`
          : "-";
        const originalFilename = originalSource
          ? `${rowPrefix}-row-${rowNumber}-original.${detectExt(originalSource)}`
          : "-";

        return {
          "แถวที่": rowNumber,
          "ทะเบียนรถ": selectedVehicle?.licensePlate || "-",
          "วันเวลา": new Date().toLocaleString("th-TH"),
          "ผู้บันทึก": userDisplayName,
          "ชนิดน้ำตาล": selectedSugarType?.name || selectedVehicleExtras?.sugarType || "-",
          "จำนวนที่นับได้": Number(row.finalCount ?? row.aiCount ?? 0),
          "ชื่อไฟล์รูป annotate": annotatedFilename,
          "ชื่อไฟล์รูป original": originalFilename,
        };
      })
      .filter((row): row is Record<string, string | number> => row !== null);
    return exportRows;
  };

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
          defaultValue: "เธเนเธญเธกเธนเธฅเธเธฐเธซเธฒเธข",
        }),
        text: t("leaveWarningText", {
          defaultValue: "เธ–เนเธฒเธญเธญเธเธซเธฃเธทเธญเธฃเธตเน€เธเธฃเธ เธเนเธญเธกเธนเธฅเธ—เธตเนเธเธฃเธญเธเธเธฐเธซเธฒเธข",
        }),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("leaveWarningConfirm", {
          defaultValue: "เธญเธญเธ",
        }),
        cancelButtonText: t("leaveWarningCancel", {
          defaultValue: "เธขเธเน€เธฅเธดเธ",
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

    setIsSessionStarted(true);
    setRows([1]);
    setSackRowsData({});
    setBoxRowsData({});
    setCountingSessionId("");
    setTempSessionId("");
    setResetTrigger((prev) => prev + 1);
    setHasSaved(false);
    router.push(`/${locale}/home`);
  };

  const handleSave = async () => {
    if (
      !selectedVehicleId ||
      !selectedSugarTypeId ||
      !countManager.currentUser
    ) {
      Swal.fire({
        title: t("validation.requiredFields", {
          defaultValue: "เธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธเธ–เนเธงเธ",
        }),
        text: t("validation.selectVehicleAndSugarType", {
          defaultValue: "เธเธฃเธธเธ“เธฒเน€เธฅเธทเธญเธเธฃเธ–เธเธเธชเนเธเนเธฅเธฐเธเธฃเธฐเน€เธ เธ—เธเนเธณเธ•เธฒเธฅ",
        }),
        icon: "warning",
        confirmButtonText: t("buttons.ok", { defaultValue: "เธ•เธเธฅเธ" }),
      });
      return;
    }

    // Check if all rows have data
    if (currentTab === "bags") {
      const missingRows = rows.filter((rowNumber) => !sackRowsData[rowNumber]);
      if (missingRows.length > 0) {
        Swal.fire({
          title: t("validation.missingData", {
            defaultValue: "เธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธเธ–เนเธงเธ",
          }),
          text: t("validation.missingData", {
            defaultValue: "เธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธเธ–เนเธงเธ",
          }),
          icon: "warning",
          confirmButtonText: t("buttons.ok", { defaultValue: "เธ•เธเธฅเธ" }),
        });
        return;
      }

      const invalidRows = rows.filter((rowNumber) => {
        const rowData = sackRowsData[rowNumber];
        return !rowData || (rowData.aiCount ?? 0) <= 0 || rowData.finalCount <= 0;
      });
      if (invalidRows.length > 0) {
        Swal.fire({
          title: t("validation.missingData", {
            defaultValue: "เธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธเธ–เนเธงเธ",
          }),
          text: t("validation.missingData", {
            defaultValue: "เธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธเธ–เนเธงเธ",
          }),
          icon: "warning",
          confirmButtonText: t("buttons.ok", { defaultValue: "เธ•เธเธฅเธ" }),
        });
        return;
      }
    } else {
      const missingRows = rows.filter((rowNumber) => !boxRowsData[rowNumber]);
      if (missingRows.length > 0) {
        Swal.fire({
          title: t("validation.missingData", {
            defaultValue: "เธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธเธ–เนเธงเธ",
          }),
          text: t("validation.missingData", {
            defaultValue: "เธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธเธ–เนเธงเธ",
          }),
          icon: "warning",
          confirmButtonText: t("buttons.ok", { defaultValue: "เธ•เธเธฅเธ" }),
        });
        return;
      }

      const invalidRows = rows.filter((rowNumber) => {
        const rowData = boxRowsData[rowNumber];
        return !rowData || (rowData.aiCount ?? 0) <= 0 || rowData.finalCount <= 0;
      });
      if (invalidRows.length > 0) {
        Swal.fire({
          title: t("validation.missingData", {
            defaultValue: "เธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธเธ–เนเธงเธ",
          }),
          text: t("validation.missingData", {
            defaultValue: "เธเนเธญเธกเธนเธฅเนเธกเนเธเธฃเธเธ–เนเธงเธ",
          }),
          icon: "warning",
          confirmButtonText: t("buttons.ok", { defaultValue: "เธ•เธเธฅเธ" }),
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
        console.log("๐งน Cleared localStorage for all rows");
        localStorage.removeItem("count_dirty_rows");
        if (window.onbeforeunload) {
          window.onbeforeunload = null;
        }
      }

      // Show success message
      Swal.fire({
        title: t("saveMessages.success", { defaultValue: "เธเธฑเธเธ—เธถเธเธชเธณเน€เธฃเนเธ" }),
        text: t("saveMessages.successMessage", {
          defaultValue: "เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเธเธฒเธฃเธเธฑเธเธชเธณเน€เธฃเนเธเนเธฅเนเธง",
        }),
        icon: "success",
        confirmButtonText: t("buttons.ok", { defaultValue: "เธ•เธเธฅเธ" }),
      });
    } catch (error: unknown) {
      console.error("โ Error saving counting session:", error);
      Swal.fire({
        title: t("saveMessages.error", { defaultValue: "เน€เธเธดเธ”เธเนเธญเธเธดเธ”เธเธฅเธฒเธ”" }),
        text:
          (error instanceof Error ? error.message : String(error)) ||
          t("saveMessages.errorMessage", {
            defaultValue: "เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅเนเธ”เน",
          }),
        icon: "error",
        confirmButtonText: t("buttons.ok", { defaultValue: "เธ•เธเธฅเธ" }),
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
          existingData.annotatedImagePath === data.annotatedImagePath &&
          existingData.originalImageDataUrl === data.originalImageDataUrl &&
          existingData.annotatedImageDataUrl === data.annotatedImageDataUrl
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
          existingData.annotatedImagePath === data.annotatedImagePath &&
          existingData.originalImageDataUrl === data.originalImageDataUrl &&
          existingData.annotatedImageDataUrl === data.annotatedImageDataUrl
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

  const missingRows =
    currentTab === "bags"
      ? rows.filter((rowNumber) => !sackRowsData[rowNumber])
      : rows.filter((rowNumber) => !boxRowsData[rowNumber]);
  const hasMissingRowData = missingRows.length > 0;
  const invalidCountRows =
    currentTab === "bags"
      ? rows.filter((rowNumber) => {
          const rowData = sackRowsData[rowNumber];
          return !!rowData && ((rowData.aiCount ?? 0) <= 0 || rowData.finalCount <= 0);
        })
      : rows.filter((rowNumber) => {
          const rowData = boxRowsData[rowNumber];
          return !!rowData && ((rowData.aiCount ?? 0) <= 0 || rowData.finalCount <= 0);
        });
  const hasInvalidRowCounts = invalidCountRows.length > 0;

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
              {t("loading", { defaultValue: "เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅ..." })}
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
              {t("loading", { defaultValue: "เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธเนเธญเธกเธนเธฅ..." })}
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
                defaultValue: "เนเธกเนเธชเธฒเธกเธฒเธฃเธ–เนเธซเธฅเธ”เธเนเธญเธกเธนเธฅเนเธ”เน",
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
              {t("buttons.retry", { defaultValue: "เธฅเธญเธเนเธซเธกเน" })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedVehicle = countManager.vehicles.find(
    (v) => v.id?.toString() === selectedVehicleId
  );
  const selectedVehicleExtras = selectedVehicleId
    ? vehicleExtrasMap[selectedVehicleId]
    : undefined;
  type RawRowItem = Record<string, unknown>;
  const getObjectArray = (value: unknown): RawRowItem[] =>
    Array.isArray(value)
      ? value.filter((item): item is RawRowItem => typeof item === "object" && item !== null)
      : [];
  const selectedVehicleSackRowsMap: Record<number, number> = (() => {
    const map: Record<number, number> = {};
    const selectedVehicleRecord = selectedVehicle as unknown as RawRowItem | undefined;
    const rawSackRows = selectedVehicleRecord?.sackRows;
    const rawBagRows = selectedVehicleRecord?.bagRows;

    if (Array.isArray(rawSackRows) && rawSackRows.length > 0) {
      if (typeof rawSackRows[0] === "number") {
        rawSackRows.forEach((count: number, index: number) => {
          map[index + 1] = Number(count || 0);
        });
        return map;
      }

      getObjectArray(rawSackRows).forEach((row) => {
        const rowNumber = Number(row.rowNumber || 0);
        const sackCount = Number(row.sackCount || 0);
        if (rowNumber > 0) {
          map[rowNumber] = sackCount;
        }
      });
      return map;
    }

    if (Array.isArray(rawBagRows) && rawBagRows.length > 0) {
      getObjectArray(rawBagRows).forEach((row) => {
        const rowNumber = Number(row.rowNumber || 0);
        const bagCount = Number(row.bagCount || 0);
        if (rowNumber > 0) {
          map[rowNumber] = bagCount;
        }
      });
      return map;
    }

    const fallbackRows = selectedVehicleExtras?.sackRows;
    if (Array.isArray(fallbackRows)) {
      fallbackRows.forEach((count: number, index: number) => {
        map[index + 1] = Number(count || 0);
      });
    }

    return map;
  })();
  const selectedVehicleSummary =
    selectedVehicle && selectedVehicleId
      ? `${selectedVehicle.licensePlate || "-"} ${
          selectedVehicle.vehicleType?.name || "-"
        } ${selectedVehicle.driverName || "-"} ${
          selectedVehicleExtras?.sugarType || "-"
        } ${Number(selectedVehicleExtras?.weightTons || 0).toFixed(2)} ตัน`
      : t("summary.notSelected", { defaultValue: "เนเธกเนเนเธ”เนเน€เธฅเธทเธญเธ" });
  const exportPreviewRows = buildExportRows();
  const exportPreviewColumns =
    exportPreviewRows.length > 0 ? Object.keys(exportPreviewRows[0]) : [];

  return (
    <div className="min-h-screen flex justify-center p-4 bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
            {t("title")}
          </h1>
          <p className="text-center text-sm text-gray-500 mt-2">
            ตั้งค่าการนับ โดยเลือกประเภทการนับ รถขนส่ง และน้ำตาลก่อนเริ่ม
          </p>
        </div>

        <>
            <div className="mb-4 flex justify-start">
              <button
                onClick={handleBackToStart}
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t("backToStart", { defaultValue: "เธขเนเธญเธเธเธฅเธฑเธ" })}
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <Tabs currentTab={currentTab} setCurrentTab={setCurrentTab} />
            </div>

            {/* เธฃเธ–เธเธเธชเนเธ + เธเธฃเธฐเน€เธ เธ—เธเนเธณเธ•เธฒเธฅ */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("transportation")}
                </label>
                <CustomDropdown
                  options={countManager.vehicles.map((vehicle) => ({
                    value: vehicle.id?.toString() || "",
                    label: `${vehicle.licensePlate || "-"} ${
                      vehicle.vehicleType?.name || "-"
                    } ${vehicle.driverName || "-"} ${
                      vehicleExtrasMap[vehicle.id?.toString() || ""]?.sugarType || "-"
                    } ${Number(
                      vehicleExtrasMap[vehicle.id?.toString() || ""]?.weightTons || 0
                    ).toFixed(2)} ตัน`,
                  }))}
                  selected={selectedVehicleId}
                  setSelected={setSelectedVehicleId}
                  placeholder={t("selectVehicle", {
                    defaultValue: "เน€เธฅเธทเธญเธเธฃเธ–เธเธเธชเนเธ",
                  })}
                  disabled={countManager.isLoadingVehicles || !isClient}
                  suppressHydrationWarning={true}
                />
                {countManager.vehicles.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t("noVehiclesAvailable", {
                      defaultValue: "เนเธกเนเธกเธตเธฃเธ–เธเธเธชเนเธเธ—เธตเนเนเธเนเธเธฒเธเนเธ”เน",
                    })}
                  </p>
                )}
              </div>

            </div>

            {/* Summary Information */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {t("summary.title", { defaultValue: "เธชเธฃเธธเธเธเนเธญเธกเธนเธฅ" })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {t("summary.vehicle", { defaultValue: "เธฃเธ–เธเธเธชเนเธ" })}:
                  </p>
                  <p className="font-medium">{selectedVehicleSummary}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("summary.rowCount", { defaultValue: "เธเธณเธเธงเธเนเธ–เธง" })}:
                  </p>
                  <p className="font-medium">
                    {rows.length} {t("summary.rows", { defaultValue: "เนเธ–เธง" })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("summary.sessionType", { defaultValue: "เธเธฃเธฐเน€เธ เธ—เธเธฒเธฃเธเธฑเธ" })}:
                  </p>
                  <p className="font-medium">
                    {currentTab === "bags"
                      ? t("summary.bags", { defaultValue: "เธเธฑเธเธเธฃเธฐเธชเธญเธ" })
                      : t("summary.boxes", { defaultValue: "เธเธฑเธเธเธฅเนเธญเธ" })}
                  </p>
                </div>
              </div>
            </div>

            {/* เธฃเธฒเธขเธเธฒเธฃเนเธ–เธง */}
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
                    expectedSackCount={selectedVehicleSackRowsMap[rowNumber]}
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

              <div className="flex flex-wrap justify-end gap-2">
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
                <button
                  onClick={handleDownloadImages}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลดรูปทั้งหมด
                </button>
                <button
                  onClick={handleExportXlsx}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 transition shadow"
                >
                  Export
                </button>
              </div>
            </div>

            {/* เธเธธเนเธกเธเธฑเธเธ—เธถเธ */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  !selectedVehicleId ||
                  !selectedSugarTypeId ||
                  !countingSessionId ||
                  rows.length === 0 ||
                  hasMissingRowData ||
                  hasInvalidRowCounts
                }
                className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("saveMessages.saving", { defaultValue: "เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธ..." })}
                  </>
                ) : (
                  t("saveButton")
                )}
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-3">
                Preview Excel
              </h4>
              {exportPreviewRows.length === 0 ? (
                <p className="text-sm text-slate-500">
                  ยังไม่มีข้อมูลแถวสำหรับแสดงตัวอย่าง
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-slate-200 bg-white">
                    <thead>
                      <tr className="bg-slate-100">
                        {exportPreviewColumns.map((column) => (
                          <th
                            key={column}
                            className="border border-slate-200 px-3 py-2 text-left font-semibold whitespace-nowrap"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {exportPreviewRows.map((row, index) => (
                        <tr key={`export-preview-${index}`} className="odd:bg-white even:bg-slate-50">
                          {exportPreviewColumns.map((column) => (
                            <td
                              key={`${index}-${column}`}
                              className="border border-slate-200 px-3 py-2 whitespace-nowrap"
                            >
                              {String(row[column] ?? "-")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        </>
      </div>
    </div>
  );
}
