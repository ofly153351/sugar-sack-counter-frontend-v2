"use client";

import { User, AlertCircle, CheckCircle, X } from "lucide-react";
import { DetectionResult } from "@/utils/ai/ai-api";

interface AIDetectionResultProps {
  originalImage: string;
  annotatedImage: string;
  detections: DetectionResult[];
  personCount: number;
  onClose?: () => void;
  showOriginal?: boolean;
}

export function AIDetectionResult({
  originalImage,
  annotatedImage,
  detections,
  personCount,
  onClose,
  showOriginal = false,
}: AIDetectionResultProps) {
  const hasDetections = personCount > 0;
  const confidenceThreshold = 0.5;

  // Filter high confidence detections
  const highConfidenceDetections = detections.filter(
    (d) => d.confidence >= confidenceThreshold
  );

  // Calculate average confidence
  const averageConfidence =
    detections.length > 0
      ? detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length
      : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              ผลการตรวจจับบุคคล
            </h3>
            <p className="text-sm text-gray-500">
              AI Detection Results
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Detection Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {hasDetections ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-semibold text-gray-900">
                    พบบุคคล {personCount} คน
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-semibold text-gray-900">
                    ไม่พบบุคคล
                  </span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">
              ความเชื่อมั่นเฉลี่ย: {(averageConfidence * 100).toFixed(1)}%
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {personCount}
              </div>
              <div className="text-xs text-blue-500">จำนวนบุคคลทั้งหมด</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {highConfidenceDetections.length}
              </div>
              <div className="text-xs text-green-500">
                ความเชื่อมั่นสูง (&gt;50%)
              </div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {detections.length}
              </div>
              <div className="text-xs text-purple-500">การตรวจจับทั้งหมด</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {detections.length > 0 ? detections.length : "-"}
              </div>
              <div className="text-xs text-orange-500">กล่อง/แถว</div>
            </div>
          </div>
        </div>

        {/* Image Comparison */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">ภาพที่ตรวจจับได้</h4>
            {showOriginal && (
              <div className="text-sm text-gray-500">
                ภาพซ้าย: ต้นฉบับ | ภาพขวา: หลังตรวจจับ
              </div>
            )}
          </div>

          <div className={`grid ${showOriginal ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
            {showOriginal && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600 text-center">
                  ภาพต้นฉบับ
                </div>
                <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-64 object-contain bg-gray-100"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Original
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-600 text-center">
                ภาพหลังตรวจจับ {hasDetections && `(พบ ${personCount} คน)`}
              </div>
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={annotatedImage}
                  alt="Annotated with detections"
                  className="w-full h-64 object-contain bg-gray-100"
                />
                <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  AI Detected
                </div>
                {hasDetections && (
                  <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    {personCount} persons
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detection Details */}
        {hasDetections && (
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-700 mb-3">รายละเอียดการตรวจจับ</h4>
            <div className="space-y-3">
              {detections.map((detection, index) => {
                const confidencePercent = detection.confidence * 100;
                const isHighConfidence = detection.confidence >= confidenceThreshold;

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      isHighConfidence
                        ? "border-green-200 bg-green-50"
                        : "border-yellow-200 bg-yellow-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isHighConfidence
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            บุคคล #{index + 1}
                          </div>
                          <div className="text-sm text-gray-500">
                            Class: {detection.class}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${
                            isHighConfidence ? "text-green-600" : "text-yellow-600"
                          }`}
                        >
                          {confidencePercent.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          ความเชื่อมั่น
                        </div>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>ความเชื่อมั่น</span>
                        <span>{confidencePercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            isHighConfidence ? "bg-green-500" : "bg-yellow-500"
                          }`}
                          style={{ width: `${confidencePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Bounding Box Info */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-2 rounded border">
                        <div className="text-gray-500">ตำแหน่ง X</div>
                        <div className="font-medium">
                          {detection.bbox[0].toFixed(0)} - {detection.bbox[2].toFixed(0)}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <div className="text-gray-500">ตำแหน่ง Y</div>
                        <div className="font-medium">
                          {detection.bbox[1].toFixed(0)} - {detection.bbox[3].toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Detections Message */}
        {!hasDetections && (
          <div className="text-center py-8 border-t">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              ไม่พบบุคคลในภาพ
            </h4>
            <p className="text-gray-600 max-w-md mx-auto">
              AI ไม่สามารถตรวจจับบุคคลได้ในภาพนี้ อาจเป็นเพราะ:
            </p>
            <ul className="text-gray-500 text-sm mt-3 space-y-1 max-w-md mx-auto">
              <li>• ภาพมีแสงน้อยหรือมืดเกินไป</li>
              <li>• บุคคลอยู่ในมุมที่ตรวจจับยาก</li>
              <li>• ภาพเบลอหรือไม่ชัด</li>
              <li>• ไม่มีบุคคลอยู่ในภาพจริงๆ</li>
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            ระบบตรวจจับบุคคลด้วย YOLOv8 AI Model
          </div>
          <div className="text-xs text-gray-400">
            Confidence threshold: {confidenceThreshold * 100}%
          </div>
        </div>
      </div>
    </div>
  );
}
