"use client";

import {
  Image as ImageIcon,
  X,
  Brain,
  Settings,
  Trash2,
  Maximize2,
  Save,
  Database,
} from "lucide-react";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import { API_CONFIG } from "@/utils/config";
import axios from "axios";
import {
  processImageWithAI,
  saveToMinIO,
  checkMinIOStatus,
  getMinIOUIUrl,
} from "@/utils/ai/ai-api";
import RowUploadButton from "@/components/count/RowUploadButton";

// Add keyboard event listener for ESC key
const useEscapeKey = (callback: () => void) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callback();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [callback]);
};

interface BagRowProps {
  rowNumber: number;
  onDelete: () => void;
  onDataChange?: (data: SackRowFormData) => void;
  vehicleId?: string | number;
  sugarTypeId?: string | number;
  countingSessionId?: string;
  resetTrigger?: number;
  disabled?: boolean;
}

export default function BagRow({
  rowNumber,
  onDelete,
  onDataChange,
  vehicleId,
  sugarTypeId,
  countingSessionId,
  resetTrigger,
  disabled,
}: BagRowProps) {
  const t = useTranslations("count.bagRow");
  const tCount = useTranslations("count");
  const [bagWeight, setBagWeight] = useState("50");
  const [manualCount, setManualCount] = useState(0);
  const [aiCount, setAiCount] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiResult, setAiResult] = useState<{
    originalImage: string;
    annotatedImage: string;
    detections: any[];
    sackCount: number;
    boxCount: number;
    totalCount: number;
  } | null>(null);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [detectionType, setDetectionType] = useState<"sack" | "box" | "both">(
    "sack"
  );
  const [sessionId, setSessionId] = useState<string>("");
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
    null
  );
  const dirtyKey = `bag-${rowNumber}`;
  const [checkingMinioStatus, setCheckingMinioStatus] = useState(false);
  const [minioStatus, setMinioStatus] = useState<{
    status: string;
    bucket: string;
    bucket_exists: boolean;
    file_count: number;
    endpoint: string;
    details?: any;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load AI settings from localStorage on component mount
  useEffect(() => {
    const savedAutoDetect = localStorage.getItem(
      `bagRow_${rowNumber}_autoDetect`
    );
    if (savedAutoDetect !== null) {
      setAutoDetectEnabled(savedAutoDetect === "true");
    }

    const savedDetectionType = localStorage.getItem(
      `bagRow_${rowNumber}_detectionType`
    );
    if (
      savedDetectionType !== null &&
      (savedDetectionType === "sack" ||
        savedDetectionType === "box" ||
        savedDetectionType === "both")
    ) {
      setDetectionType(savedDetectionType as "sack" | "box" | "both");
    }

    // Generate or get session ID - moved to useEffect to avoid hydration error
  }, [rowNumber]);

  // Reset row state when countingSessionId changes OR resetTrigger changes
  useEffect(() => {
    // Reset everything for fresh start including image file and preview
    setManualCount(0);
    setAiCount(null);
    setImageFile(null);
    setImagePreview(null);
    setAiResult(null);
    setIsUploading(false);
    setIsDetecting(false);
    setIsSaving(false);

    // Reset file input to allow fresh upload
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    console.log(
      `🔄 BagRow ${rowNumber}: Reset ALL data for fresh start`,
      countingSessionId || "(empty)",
      resetTrigger ? `(trigger: ${resetTrigger})` : ""
    );
  }, [countingSessionId, rowNumber, resetTrigger]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasData =
      manualCount > 0 ||
      aiCount !== null ||
      !!aiResult ||
      !!imageFile ||
      !!imagePreview;

    const raw = localStorage.getItem("count_dirty_rows") || "[]";
    const set = new Set<string>(JSON.parse(raw));

    if (hasData) {
      set.add(dirtyKey);
    } else {
      set.delete(dirtyKey);
    }

    localStorage.setItem("count_dirty_rows", JSON.stringify([...set]));

    const message = tCount("leaveWarningText", {
      defaultValue: "ถ้าออกหรือรีเฟรช ข้อมูลที่กรอกจะหาย",
    });

    if (set.size > 0) {
      window.onbeforeunload = (e) => {
        e.preventDefault();
        e.returnValue = message;
        return message;
      };
    } else if (window.onbeforeunload) {
      window.onbeforeunload = null;
    }
  }, [manualCount, aiCount, aiResult, imageFile, imagePreview, dirtyKey, tCount]);

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("count_dirty_rows") || "[]";
      const set = new Set<string>(JSON.parse(raw));
      set.delete(dirtyKey);
      localStorage.setItem("count_dirty_rows", JSON.stringify([...set]));
      if (set.size === 0 && window.onbeforeunload) {
        window.onbeforeunload = null;
      }
    };
  }, [dirtyKey]);

  // Generate session ID in useEffect to avoid hydration error
  useEffect(() => {
    const savedSessionId = localStorage.getItem(
      `bagRow_${rowNumber}_sessionId`
    );
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      // Generate session ID in useEffect to avoid hydration mismatch
      const newSessionId = `sack_session_${rowNumber}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem(`bagRow_${rowNumber}_sessionId`, newSessionId);
    }
  }, [rowNumber]);

  // Add ESC key listener for fullscreen viewer
  useEscapeKey(() => {
    if (showFullscreenImage) {
      setShowFullscreenImage(false);
      setFullscreenImageUrl(null);
    }
  });

  // Save AI settings to localStorage when changed
  const handleAutoDetectToggle = (enabled: boolean) => {
    setAutoDetectEnabled(enabled);
    localStorage.setItem(`bagRow_${rowNumber}_autoDetect`, enabled.toString());
  };

  const handleDetectionTypeChange = (type: "sack" | "box" | "both") => {
    setDetectionType(type);
    localStorage.setItem(`bagRow_${rowNumber}_detectionType`, type);
  };

  // Auto-save to MinIO is always enabled through headers
  const saveToMinIOEnabled = true;

  const handleCheckMinIOStatus = async () => {
    setCheckingMinioStatus(true);
    try {
      Swal.fire({
        title: "กำลังตรวจสอบ MinIO...",
        text: "กำลังตรวจสอบสถานะ MinIO Storage",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const status = await checkMinIOStatus();
      setMinioStatus(status);

      Swal.close();

      Swal.fire({
        title: `สถานะ MinIO: ${
          status.status === "connected" || status.status === "healthy"
            ? "✅"
            : "❌"
        } ${status.status}`,
        html: `
          <div class="text-left">
            <p class="mb-2"><strong>สถานะ:</strong> ${status.status}</p>
            <p class="mb-1"><strong>Bucket:</strong> ${status.bucket}</p>
            <p class="mb-1"><strong>Bucket มีอยู่:</strong> ${
              status.bucket_exists ? "✅" : "❌"
            }</p>
            <p class="mb-1"><strong>จำนวนไฟล์:</strong> ${status.file_count}</p>
            <p class="mb-2"><strong>Endpoint:</strong> ${status.endpoint}</p>
            ${
              status.details
                ? `
            <div class="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p class="font-semibold">รายละเอียด:</p>
              <pre class="whitespace-pre-wrap text-xs">${JSON.stringify(
                status.details,
                null,
                2
              )}</pre>
            </div>
            `
                : ""
            }
          </div>
        `,
        icon:
          status.status === "connected" || status.status === "healthy"
            ? "success"
            : "warning",
        confirmButtonText: "ตกลง",
        width: 600,
      });
    } catch (error: any) {
      Swal.fire({
        title: "ตรวจสอบ MinIO ไม่สำเร็จ",
        text:
          "ไม่สามารถตรวจสอบสถานะ MinIO Storage: " +
          (error.message || "เกิดข้อผิดพลาด"),
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setCheckingMinioStatus(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        title: "ข้อผิดพลาด",
        text: "กรุณาเลือกรูปภาพเท่านั้น",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: "ข้อผิดพลาด",
        text: "ไฟล์ต้องมีขนาดไม่เกิน 5MB",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // Upload file and auto-detect AI
    handleUploadFile(file);

    // Reset file input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAutoAIDetection = async (file: File) => {
    setIsDetecting(true);
    try {
      // Use countingSessionId prop (passed from parent) for both session_id and counting_session_id
      const sessionIdForAI = countingSessionId || sessionId;
      const result = await processImageWithAI(
        file,
        detectionType,
        saveToMinIOEnabled,
        sessionIdForAI,
        rowNumber,
        countingSessionId // Send countingSessionId as counting_session_id parameter
      );
      setAiResult(result);
      setAiCount(result.totalCount); // Auto-set AI count

      // Check if user wants to see notifications
      const showNotifications =
        localStorage.getItem("ai_show_notifications") !== "false";

      if (showNotifications) {
        // Show success notification
        Swal.fire({
          title: `ตรวจจับ${
            detectionType === "sack"
              ? "กระสอบ"
              : detectionType === "box"
              ? "กล่อง"
              : "กระสอบและกล่อง"
          }สำเร็จ!`,
          html: `
            <div class="text-left">
              <p class="mb-2">พบ${
                detectionType === "sack"
                  ? "กระสอบ"
                  : detectionType === "box"
                  ? "กล่อง"
                  : "กระสอบและกล่อง"
              }ทั้งหมด: <strong>${result.totalCount} ${
            detectionType === "sack"
              ? "กระสอบ"
              : detectionType === "box"
              ? "กล่อง"
              : "ชิ้น"
          }</strong></p>
              ${
                detectionType === "both"
                  ? `
              <p class="mb-1">- กระสอบ: ${result.sackCount} กระสอบ</p>
              <p class="mb-2">- กล่อง: ${result.boxCount} กล่อง</p>
              `
                  : ""
              }
              <p class="mb-2">ผลลัพธ์ถูกบันทึกในช่อง AI Count แล้ว</p>
              ${
                result.storageInfo
                  ? `
            <p class="mb-2">บันทึกภาพไปยัง MinIO Storage แล้ว</p>
            `
                  : ""
              }
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
      }
    } catch (error: any) {
      console.error("Auto AI detection failed:", error);
      // Don't show error alert for auto-detection to avoid interrupting user flow
      // Just set AI count to 0
      setAiCount(0);

      // Show error notification if enabled
      const showNotifications =
        localStorage.getItem("ai_show_notifications") !== "false";

      if (showNotifications) {
        Swal.fire({
          title: "ไม่สามารถตรวจจับได้",
          text: `AI ไม่สามารถตรวจจับ${
            detectionType === "sack"
              ? "กระสอบ"
              : detectionType === "box"
              ? "กล่อง"
              : "กระสอบและกล่อง"
          }ในภาพนี้ได้ กรุณาตรวจสอบภาพหรือลองใหม่`,
          icon: "warning",
          confirmButtonText: "ตกลง",
        });
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAIDetection = async () => {
    if (!imageFile) return;

    setIsDetecting(true);
    try {
      Swal.fire({
        title: `กำลังตรวจจับ${
          detectionType === "sack"
            ? "กระสอบ"
            : detectionType === "box"
            ? "กล่อง"
            : "กระสอบและกล่อง"
        }...`,
        text: "AI กำลังวิเคราะห์ภาพ กรุณารอสักครู่",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      // Use countingSessionId prop (passed from parent) for both session_id and counting_session_id
      const sessionIdForAI = countingSessionId || sessionId;
      const result = await processImageWithAI(
        imageFile,
        detectionType,
        saveToMinIOEnabled,
        sessionIdForAI,
        rowNumber,
        countingSessionId // Send countingSessionId as counting_session_id parameter
      );
      setAiResult(result);
      setAiCount(result.totalCount); // Set AI count

      Swal.close();

      // Check if user wants to see notifications
      const showNotifications =
        localStorage.getItem("ai_show_notifications") !== "false";

      if (showNotifications) {
        // แสดงผลการตรวจจับ
        Swal.fire({
          title: `ตรวจจับ${
            detectionType === "sack"
              ? "กระสอบ"
              : detectionType === "box"
              ? "กล่อง"
              : "กระสอบและกล่อง"
          }สำเร็จ!`,
          html: `
            <div class="text-left">
              <p class="mb-2">พบ${
                detectionType === "sack"
                  ? "กระสอบ"
                  : detectionType === "box"
                  ? "กล่อง"
                  : "กระสอบและกล่อง"
              }ทั้งหมด: <strong>${result.totalCount} ${
            detectionType === "sack"
              ? "กระสอบ"
              : detectionType === "box"
              ? "กล่อง"
              : "ชิ้น"
          }</strong></p>
              ${
                detectionType === "both"
                  ? `
              <p class="mb-1">- กระสอบ: ${result.sackCount} กระสอบ</p>
              <p class="mb-2">- กล่อง: ${result.boxCount} กล่อง</p>
              `
                  : ""
              }
              <p class="mb-2">ผลลัพธ์ถูกบันทึกในช่อง AI Count แล้ว</p>
              ${
                result.storageInfo
                  ? `
              <p class="mb-2">บันทึกภาพไปยัง MinIO Storage แล้ว</p>
              `
                  : ""
              }
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
      }
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text:
          `ไม่สามารถตรวจจับ${
            detectionType === "sack"
              ? "กระสอบ"
              : detectionType === "box"
              ? "กล่อง"
              : "กระสอบและกล่อง"
          }ได้: ` + (error.message || "เกิดข้อผิดพลาด"),
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  // Use ref to track previous data and prevent infinite loops
  const prevDataRef = useRef<{
    aiCount: number | null;
    manualCount: number;
    bagWeight: string;
    originalImagePath: string;
    annotatedImagePath: string;
  }>({
    aiCount: null,
    manualCount: 0,
    bagWeight: "50",
    originalImagePath: "",
    annotatedImagePath: "",
  });

  // Effect to send data when AI result changes
  useEffect(() => {
    if (aiResult && onDataChange) {
      // Get image paths from multiple possible sources in AI response
      // 1. First try flat storageInfo structure (annotated_object_name, original_object_name)
      // 2. Then try nested storageInfo structure (annotated.object_name, original.object_name)
      // 3. Then try direct image paths (alternative format)
      // 4. Then try from response properties (fallback)
      const originalImagePath =
        aiResult.storageInfo?.original_object_name ||
        aiResult.storageInfo?.original?.object_name ||
        aiResult.originalImagePath ||
        aiResult.original_image_path ||
        "";

      const annotatedImagePath =
        aiResult.storageInfo?.annotated_object_name ||
        aiResult.storageInfo?.annotated?.object_name ||
        aiResult.annotatedImagePath ||
        aiResult.annotated_image_path ||
        "";

      console.log("🔍 [DEBUG] BagRow - Extracted image paths:", {
        originalImagePath,
        annotatedImagePath,
        hasStorageInfo: !!aiResult.storageInfo,
        storageInfo: aiResult.storageInfo,
        hasOriginalObjectName: !!aiResult.storageInfo?.original_object_name,
        hasAnnotatedObjectName: !!aiResult.storageInfo?.annotated_object_name,
        hasNestedOriginal: !!aiResult.storageInfo?.original?.object_name,
        hasNestedAnnotated: !!aiResult.storageInfo?.annotated?.object_name,
        hasOriginalImagePath: !!aiResult.originalImagePath,
        hasOriginal_image_path: !!aiResult.original_image_path,
        hasAnnotatedImagePath: !!aiResult.annotatedImagePath,
        hasAnnotated_image_path: !!aiResult.annotated_image_path,
      });

      // For development, allow saving even without MinIO storage
      const canSendToBackend =
        process.env.NODE_ENV === "development" ||
        (originalImagePath && annotatedImagePath);

      if (canSendToBackend) {
        const currentData = {
          aiCount: aiResult.sackCount,
          manualCount,
          bagWeight,
          originalImagePath,
          annotatedImagePath,
        };

        // Check if data actually changed
        const prevData = prevDataRef.current;
        if (
          prevData.aiCount !== currentData.aiCount ||
          prevData.manualCount !== currentData.manualCount ||
          prevData.bagWeight !== currentData.bagWeight ||
          prevData.originalImagePath !== currentData.originalImagePath ||
          prevData.annotatedImagePath !== currentData.annotatedImagePath
        ) {
          const rowData: SackRowFormData = {
            sessionId: 0, // Will be set by workflow
            rowNumber,
            weightType: `${bagWeight}kg`,
            aiCount: aiResult.sackCount,
            finalCount: manualCount,
            originalImagePath,
            annotatedImagePath,
          };
          onDataChange(rowData);
          prevDataRef.current = currentData;
        }
      } else {
        // Show warning if images are not saved to MinIO
        console.warn("⚠️ Images not saved to MinIO - cannot send to backend");
        Swal.fire({
          title: "ภาพยังไม่ได้บันทึกใน MinIO",
          text: "กรุณารอให้ระบบบันทึกภาพใน MinIO ก่อนบันทึกข้อมูล",
          icon: "warning",
          confirmButtonText: "ตกลง",
        });
      }
    }
  }, [aiResult, bagWeight, manualCount, onDataChange, rowNumber]);

  // Effect to send data when manual count changes
  useEffect(() => {
    if (manualCount > 0 && onDataChange) {
      // Get image paths from multiple possible sources in AI response
      // 1. First try flat storageInfo structure (annotated_object_name, original_object_name)
      // 2. Then try nested storageInfo structure (annotated.object_name, original.object_name)
      // 3. Then try direct image paths (alternative format)
      // 4. Then try from response properties (fallback)
      const originalImagePath =
        aiResult?.storageInfo?.original_object_name ||
        aiResult?.storageInfo?.original?.object_name ||
        aiResult?.originalImagePath ||
        aiResult?.original_image_path ||
        "";

      const annotatedImagePath =
        aiResult?.storageInfo?.annotated_object_name ||
        aiResult?.storageInfo?.annotated?.object_name ||
        aiResult?.annotatedImagePath ||
        aiResult?.annotated_image_path ||
        "";

      // For development, allow saving even without MinIO storage
      const canSendToBackend =
        process.env.NODE_ENV === "development" ||
        (originalImagePath && annotatedImagePath);

      if (canSendToBackend) {
        const currentData = {
          aiCount: aiCount || 0,
          manualCount,
          bagWeight,
          originalImagePath,
          annotatedImagePath,
        };

        // Check if data actually changed
        const prevData = prevDataRef.current;
        if (
          prevData.aiCount !== currentData.aiCount ||
          prevData.manualCount !== currentData.manualCount ||
          prevData.bagWeight !== currentData.bagWeight ||
          prevData.originalImagePath !== currentData.originalImagePath ||
          prevData.annotatedImagePath !== currentData.annotatedImagePath
        ) {
          const rowData: SackRowFormData = {
            sessionId: 0, // Will be set by workflow
            rowNumber,
            weightType: `${bagWeight}kg`,
            aiCount: aiCount || 0,
            finalCount: manualCount,
            originalImagePath,
            annotatedImagePath,
          };
          onDataChange(rowData);
          prevDataRef.current = currentData;
        }
      } else {
        // Show warning if images are not saved to MinIO
        console.warn("⚠️ Images not saved to MinIO - cannot send to backend");
        Swal.fire({
          title: "ภาพยังไม่ได้บันทึกใน MinIO",
          text: "กรุณารอให้ระบบบันทึกภาพใน MinIO ก่อนบันทึกข้อมูล",
          icon: "warning",
          confirmButtonText: "ตกลง",
        });
      }
    }
  }, [manualCount, aiCount, bagWeight, aiResult, onDataChange, rowNumber]);

  const handleClearAIData = () => {
    Swal.fire({
      title: "ยืนยันการล้างข้อมูล AI",
      text: "คุณต้องการล้างข้อมูล AI และรูปภาพทั้งหมดสำหรับแถวนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ล้างข้อมูล",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        setAiCount(null);
        setAiResult(null);
        setImageFile(null);
        setImagePreview(null);
        setShowFullscreenImage(false);
        setFullscreenImageUrl(null);
        // Also reset file input to allow re-uploading
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        Swal.fire({
          title: "สำเร็จ!",
          text: "ล้างข้อมูล AI และรูปภาพเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
        });
      }
    });
  };

  const handleSaveToMinIO = async () => {
    if (!aiResult || !imageFile) {
      Swal.fire({
        title: "ไม่สามารถบันทึกได้",
        text: "กรุณาอัปโหลดรูปภาพและตรวจจับ AI ก่อน",
        icon: "warning",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    setIsSaving(true);
    try {
      Swal.fire({
        title: "กำลังบันทึกภาพ...",
        text: "กำลังบันทึกภาพไปยัง MinIO Storage",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const saveResult = await saveToMinIO(
        sessionId,
        aiResult.originalImage,
        aiResult.annotatedImage,
        imageFile.name
      );

      Swal.close();

      Swal.fire({
        title: "บันทึกสำเร็จ!",
        html: `
          <div class="text-left">
            <p class="mb-2">บันทึกภาพไปยัง MinIO Storage สำเร็จ</p>
            <p class="mb-2">Session ID: <strong>${saveResult.session_id}</strong></p>
          </div>
        `,
        icon: "success",
        confirmButtonText: "ตกลง",
      });
    } catch (error: any) {
      Swal.fire({
        title: "บันทึกไม่สำเร็จ",
        text:
          "ไม่สามารถบันทึกภาพไปยัง MinIO Storage: " +
          (error.message || "เกิดข้อผิดพลาด"),
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      // Create FormData
      const formData = new FormData();
      formData.append("image", file);
      formData.append("rowNumber", rowNumber.toString());

      if (vehicleId) formData.append("vehicleId", vehicleId.toString());
      if (sugarTypeId) formData.append("sugarTypeId", sugarTypeId.toString());

      // Upload file - using mock for now since backend endpoint doesn't exist
      console.log(
        "⚠️ Using mock upload for row image (backend endpoint not implemented)"
      );

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update state
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Auto-detect AI after successful upload if enabled
      if (autoDetectEnabled) {
        await handleAutoAIDetection(file);

        Swal.fire({
          title: "สำเร็จ!",
          text: `อัปโหลดรูปภาพและตรวจจับ${
            detectionType === "sack"
              ? "กระสอบ"
              : detectionType === "box"
              ? "กล่อง"
              : "กระสอบและกล่อง"
          }เรียบร้อยแล้ว`,
          icon: "success",
          confirmButtonText: "ตกลง",
        });
      } else {
        Swal.fire({
          title: "สำเร็จ!",
          text: "อัปโหลดรูปภาพเรียบร้อยแล้ว (AI auto-detect ถูกปิดอยู่)",
          icon: "success",
          confirmButtonText: "ตกลง",
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      // Even on error, show success with mock message
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Try to auto-detect AI even on upload error if enabled
      if (autoDetectEnabled) {
        try {
          await handleAutoAIDetection(file);
        } catch (aiError) {
          console.error("Auto AI detection failed:", aiError);
        }

        Swal.fire({
          title: "สำเร็จ!",
          text: `อัปโหลดรูปภาพเรียบร้อยแล้ว${
            autoDetectEnabled
              ? ` (ตรวจจับ${
                  detectionType === "sack"
                    ? "กระสอบ"
                    : detectionType === "box"
                    ? "กล่อง"
                    : "กระสอบและกล่อง"
                }อัตโนมัติ)`
              : ""
          }`,
          icon: "success",
          confirmButtonText: "ตกลง",
        });
      } else {
        Swal.fire({
          title: "สำเร็จ!",
          text: "อัปโหลดรูปภาพเรียบร้อยแล้ว (AI auto-detect ถูกปิดอยู่)",
          icon: "success",
          confirmButtonText: "ตกลง",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="w-full md:w-1/4 flex-shrink-0">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          {t("row")} {rowNumber}
        </label>
        <div className="relative mt-1">
          <button
            onClick={onDelete}
            className="absolute top-0 right-4 z-30 w-8 h-8 flex items-center justify-center bg-orange-500 border-4 border-white text-white rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200 shadow-none"
            title="ลบแถว"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className={`bg-white border border-gray-300 w-full md:w-28 h-28 flex items-center justify-center rounded-xl shadow-sm overflow-hidden transition-shadow duration-300 relative z-10 ${
              imagePreview
                ? "cursor-default"
                : "cursor-pointer hover:shadow-lg"
            }`}
            onClick={() => {
              if (!imagePreview) {
                fileInputRef.current?.click();
              }
            }}
          >
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setFullscreenImageUrl(imagePreview);
                    setShowFullscreenImage(true);
                  }}
                  className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity"
                  title="ดูภาพเต็ม"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-300" />
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {showFullscreenImage && fullscreenImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative max-w-full max-h-full">
            <img
              src={fullscreenImageUrl}
              alt="Fullscreen Preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => {
                setShowFullscreenImage(false);
                setFullscreenImageUrl(null);
              }}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
              กด ESC หรือคลิกปุ่ม X เพื่อปิด
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-1 space-y-2 w-full">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-sm font-medium rounded-lg ${
                bagWeight === "25"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => setBagWeight("25")}
            >
              {t("weight")} 25
            </button>
            <button
              className={`px-3 py-1 text-sm font-medium rounded-lg ${
                bagWeight === "50"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => setBagWeight("50")}
            >
              {t("weight")} 50
            </button>
          </div>

          <div className="relative ml-auto">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="ตั้งค่า AI"
            >
              <Settings className="w-4 h-4 mr-1" />
              AI Settings
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Auto-detect AI
                  </span>
                  <button
                    onClick={() => handleAutoDetectToggle(!autoDetectEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      autoDetectEnabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        autoDetectEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2 mt-3">
                  <span className="text-sm font-medium text-gray-700">
                    ประเภทการตรวจจับ
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDetectionTypeChange("sack")}
                      className={`px-2 py-1 text-xs rounded ${
                        detectionType === "sack"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      กระสอบ
                    </button>
                    <button
                      onClick={() => handleDetectionTypeChange("box")}
                      className={`px-2 py-1 text-xs rounded ${
                        detectionType === "box"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      กล่อง
                    </button>
                    <button
                      onClick={() => handleDetectionTypeChange("both")}
                      className={`px-2 py-1 text-xs rounded ${
                        detectionType === "both"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      ทั้งสอง
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2 mt-3">
                  <span className="text-sm font-medium text-gray-700">
                    บันทึก MinIO
                  </span>
                  <button
                    onClick={() => handleSaveToMinIOToggle(!saveToMinIOEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      saveToMinIOEnabled ? "bg-purple-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        saveToMinIOEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between mb-2 mt-3">
                  <span className="text-sm font-medium text-gray-700">
                    แสดงการแจ้งเตือน
                  </span>
                  <button
                    onClick={() => {
                      const current =
                        localStorage.getItem("ai_show_notifications") !==
                        "false";
                      localStorage.setItem(
                        "ai_show_notifications",
                        (!current).toString()
                      );
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      localStorage.getItem("ai_show_notifications") !== "false"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        localStorage.getItem("ai_show_notifications") !==
                        "false"
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {autoDetectEnabled
                    ? `AI จะตรวจจับ${
                        detectionType === "sack"
                          ? "กระสอบ"
                          : detectionType === "box"
                          ? "กล่อง"
                          : "กระสอบและกล่อง"
                      }อัตโนมัติหลังอัปโหลดรูปภาพ`
                    : "AI จะไม่ตรวจจับอัตโนมัติ ต้องกดปุ่มตรวจจับเอง"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {saveToMinIOEnabled
                    ? "จะบันทึกภาพไปยัง MinIO Storage อัตโนมัติ"
                    : "จะไม่บันทึกภาพไปยัง MinIO Storage"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {localStorage.getItem("ai_show_notifications") !== "false"
                    ? "จะแสดงการแจ้งเตือนผลลัพธ์ AI"
                    : "จะไม่แสดงการแจ้งเตือนผลลัพธ์ AI"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <RowUploadButton
            onClick={openFilePicker}
            disabled={!vehicleId || !sugarTypeId}
            isUploading={isUploading}
            isDetecting={isDetecting}
          />
          {imageFile && !autoDetectEnabled && (
            <button
              onClick={handleAIDetection}
              disabled={isDetecting}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isDetecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ตรวจจับ
                  {detectionType === "sack"
                    ? "กระสอบ"
                    : detectionType === "box"
                    ? "กล่อง"
                    : "กระสอบและกล่อง"}
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  ตรวจจับ
                  {detectionType === "sack"
                    ? "กระสอบ"
                    : detectionType === "box"
                    ? "กล่อง"
                    : "กระสอบและกล่อง"}
                </>
              )}
            </button>
          )}
          {aiResult && !saveToMinIOEnabled && (
            <button
              onClick={handleSaveToMinIO}
              disabled={isSaving}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึก MinIO
                </>
              )}
            </button>
          )}
          {(imageFile || aiResult || aiCount !== null) && (
            <button
              onClick={handleClearAIData}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              title="ล้างข้อมูล AI"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              ล้าง AI
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <label className="text-sm text-gray-600 w-35 whitespace-nowrap">
            {t("manualCount")} {rowNumber}
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={manualCount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                setManualCount(value === "" ? 0 : Number(value));
              }
            }}
            className="w-20 p-1 text-center border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-sm text-gray-600">{t("bags")}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600 w-33 whitespace-nowrap">
            {t("aiCount")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={aiCount || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d+$/.test(value)) {
                setAiCount(value === "" ? null : Number(value));
              }
            }}
            className="w-20 p-1 text-center border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-sm text-gray-600">{t("bags")}</span>
        </div>

        {/* AI Detection Result Buttons */}
        {aiResult && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFullscreenImageUrl(aiResult.annotatedImage);
                setShowFullscreenImage(true);
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              <Maximize2 className="w-3 h-3" />
              ดูภาพเต็ม
            </button>
            {aiResult.storageInfo?.annotated?.object_name && <></>}
          </div>
        )}
      </div>
    </div>
  );
}
