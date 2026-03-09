"use client";

import {
  X,
  Upload,
  Image as ImageIcon,
  Brain,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";
import Swal from "sweetalert2";
import { processImageWithAI, DetectionResult } from "@/utils/ai/ai-api";
import { AIDetectionResult } from "./AIDetectionResult";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, description?: string) => Promise<void>;
  title?: string;
  description?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  enableAIDetection?: boolean;
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onUpload,
  title = "อัปโหลดรูปภาพ",
  description = "เลือกรูปภาพที่ต้องการอัปโหลด",
  allowedFileTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  enableAIDetection = true,
}: ImageUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIDetection, setShowAIDetection] = useState(false);
  const [aiDetectionResult, setAiDetectionResult] = useState<{
    originalImage: string;
    annotatedImage: string;
    detections: DetectionResult[];
    personCount: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      setError(`ไฟล์ต้องเป็นประเภท: ${allowedFileTypes.join(", ")}`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`ไฟล์ต้องมีขนาดไม่เกิน ${maxFileSize / (1024 * 1024)}MB`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setShowAIDetection(false);
    setAiDetectionResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAIDetection = async () => {
    if (!selectedFile) return;

    setIsDetecting(true);
    setError(null);

    try {
      Swal.fire({
        title: "กำลังตรวจจับบุคคล...",
        text: "AI กำลังวิเคราะห์ภาพ กรุณารอสักครู่",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const result = await processImageWithAI(selectedFile);
      setAiDetectionResult(result);
      setShowAIDetection(true);

      Swal.close();
    } catch (error: any) {
      console.error("AI detection error:", error);
      setError(
        "ไม่สามารถตรวจจับบุคคลได้: " + (error.message || "เกิดข้อผิดพลาด")
      );
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถตรวจจับบุคคลได้",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("กรุณาเลือกรูปภาพก่อนอัปโหลด");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(selectedFile, uploadDescription);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadDescription("");
    setError(null);
    setShowAIDetection(false);
    setAiDetectionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleAIDetection = () => {
    if (showAIDetection) {
      setShowAIDetection(false);
    } else if (selectedFile && enableAIDetection) {
      handleAIDetection();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* AI Detection Result */}
          {showAIDetection && aiDetectionResult && (
            <div className="mb-6">
              <AIDetectionResult
                originalImage={aiDetectionResult.originalImage}
                annotatedImage={aiDetectionResult.annotatedImage}
                detections={aiDetectionResult.detections}
                personCount={aiDetectionResult.personCount}
                showOriginal={false}
                onClose={() => setShowAIDetection(false)}
              />
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              selectedFile
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={allowedFileTypes.join(",")}
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative mx-auto w-48 h-48">
                  <img
                    src={aiDetectionResult?.annotatedImage || previewUrl}
                    alt={
                      aiDetectionResult?.annotatedImage
                        ? "AI Annotated Preview"
                        : "Preview"
                    }
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {enableAIDetection && !showAIDetection && (
                    <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAIDetection();
                        }}
                        disabled={isDetecting}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isDetecting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            กำลังตรวจจับ...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            ตรวจจับบุคคล
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {selectedFile?.name} ({(selectedFile?.size || 0) / 1024} KB)
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    คลิกเพื่อเลือกรูปภาพ
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    หรือลากและวางไฟล์ที่นี่
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  รองรับ: {allowedFileTypes.join(", ")}
                  <br />
                  ขนาดสูงสุด: {maxFileSize / (1024 * 1024)}MB
                  {enableAIDetection && (
                    <>
                      <br />
                      <span className="text-green-600">
                        ✓ พร้อมตรวจจับบุคคลด้วย AI
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* AI Detection Toggle */}
          {enableAIDetection && selectedFile && !showAIDetection && (
            <div className="mt-6">
              <button
                onClick={toggleAIDetection}
                disabled={isDetecting}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  isDetecting
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                }`}
              >
                {isDetecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    กำลังตรวจจับบุคคลด้วย AI...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    ตรวจจับบุคคลในภาพด้วย AI
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                ใช้ YOLOv8 AI model สำหรับตรวจจับบุคคลในภาพ
              </p>
            </div>
          )}

          {/* Description Input */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบาย (ไม่จำเป็น)
            </label>
            <textarea
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="เพิ่มคำอธิบายเกี่ยวกับรูปภาพ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-xl sticky bottom-0">
          <div className="text-sm text-gray-500">
            {enableAIDetection && selectedFile && (
              <button
                onClick={toggleAIDetection}
                disabled={isDetecting}
                className="flex items-center gap-2 text-green-600 hover:text-green-700"
              >
                {showAIDetection ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    ซ่อนผลตรวจจับ
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    แสดงผลตรวจจับ
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isUploading || isDetecting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || isDetecting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  กำลังอัปโหลด...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  อัปโหลด
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
