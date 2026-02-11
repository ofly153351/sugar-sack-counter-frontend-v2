"use client";

import { Camera } from "lucide-react";

interface RowUploadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isUploading?: boolean;
  isDetecting?: boolean;
  label?: string;
}

export default function RowUploadButton({
  onClick,
  disabled = false,
  isUploading = false,
  isDetecting = false,
  label = "ถ่ายภาพ / อัปโหลด",
}: RowUploadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isUploading || isDetecting}
      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {isUploading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          กำลังอัปโหลด...
        </>
      ) : isDetecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          กำลังตรวจจับ...
        </>
      ) : (
        <>
          <Camera className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </button>
  );
}
