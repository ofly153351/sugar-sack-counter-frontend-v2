// src/utils/ai/ai-api.ts
// AI Service API Client for sack/box detection with MinIO storage
// Service runs on http://localhost:8082
// MinIO runs on http://localhost:9000 (API) and http://localhost:9001 (UI)
// Note: For production, consider using a proxy through the main backend

import axios from "axios";
import { AI_CONFIG } from "@/utils/config";

export interface DetectionResult {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface AIDetectionResponse {
  status: "success" | "error";
  sack_count: number;
  box_count: number;
  total_count: number;
  annotated_image: string; // base64 encoded image
  detections: DetectionResult[];
  message?: string;
  session_id?: string;
  save_to_minio?: boolean;
  storage?: {
    original_stored?: boolean;
    annotated_stored?: boolean;
    original_object_name?: string;
    annotated_object_name?: string;
    original_url?: string;
    annotated_url?: string;
    session_id?: string;
  };
}

export interface AIHealthResponse {
  status: "healthy" | "unhealthy";
  model_loaded: boolean;
  model_classes?: {
    "0": string;
    "1": string;
  };
  model_path?: string;
  minio_available?: boolean;
  minio_initialized?: boolean;
}

export interface MinIOSaveResponse {
  status: "success" | "error";
  message: string;
  session_id: string;
  storage: {
    original?: {
      object_name: string;
      url: string;
      stored: boolean;
    };
    annotated?: {
      object_name: string;
      url: string;
      stored: boolean;
    };
  };
}

const isHeicFile = (file: File) => {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
};

const toJpegFile = async (file: File): Promise<File> => {
  if (!isHeicFile(file)) return file;

  let heic2any: any;
  try {
    ({ default: heic2any } = await import("heic2any"));
  } catch (error) {
    throw new Error("HEIC conversion library not installed. Please add heic2any.");
  }

  const converted = (await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  })) as Blob;

  return new File([converted], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
    type: "image/jpeg",
  });
};

/**
 * Detect sacks and boxes in an image using AI service
 * @param file The image file to analyze
 * @param detectionType Type of detection: "sack", "box", or "both"
 * @param saveToMinIO Whether to save images to MinIO storage
 * @param sessionId Session ID for grouping images in MinIO
 * @param rowNumber Row number for organizing images in MinIO
 * @returns Detection results with annotated image
 */
export const detectSacksAndBoxes = async (
  file: File,
  detectionType: "sack" | "box" | "both" = "both",
  saveToMinIO: boolean = false,
  sessionId?: string,
  rowNumber?: number,
  countingSessionId?: string
): Promise<AIDetectionResponse> => {
  try {
    console.log(`🤖 AI detection for ${detectionType}...`);

    const formData = new FormData();
    formData.append("file", file);

    if (saveToMinIO) {
      formData.append("save_to_minio", "true");
    }

    if (sessionId) {
      formData.append("session_id", sessionId);
    }

    if (countingSessionId) {
      formData.append("counting_session_id", countingSessionId);
    }

    // Choose endpoint based on detection type
    let endpoint = "";
    if (detectionType === "sack") {
      endpoint = `${AI_CONFIG.BASE_URL}${AI_CONFIG.ENDPOINTS.DETECT_SACKS}`;
    } else if (detectionType === "box") {
      endpoint = `${AI_CONFIG.BASE_URL}${AI_CONFIG.ENDPOINTS.DETECT_BOXES}`;
    } else {
      endpoint = `${AI_CONFIG.BASE_URL}${AI_CONFIG.ENDPOINTS.DETECT}`;
    }

    // Try multiple endpoints in order of preference
    const endpoints = [
      // Primary endpoint based on detection type
      endpoint,
      // Alternative endpoints
      detectionType === "sack"
        ? `${AI_CONFIG.BASE_URL}${AI_CONFIG.ENDPOINTS.DETECT}`
        : endpoint,
      detectionType === "box"
        ? `${AI_CONFIG.BASE_URL}${AI_CONFIG.ENDPOINTS.DETECT}`
        : endpoint,
      ...AI_CONFIG.FALLBACK_ENDPOINTS.map(
        (baseUrl) => `${baseUrl}${AI_CONFIG.ENDPOINTS.DETECT}`
      ),
    ];

    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.post<AIDetectionResponse>(
          endpoint,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-Auto-Save": saveToMinIO ? "true" : "false",
              ...(sessionId && { "X-Session-Id": sessionId }),
              ...(rowNumber && { "X-Row-Number": rowNumber.toString() }),
              ...(detectionType && { "X-Detection-Type": detectionType }),
            },
            timeout: 30000, // 30 seconds timeout for AI processing
            withCredentials: false, // Disable credentials for CORS
          }
        );

        return response.data;
      } catch (error: any) {
        lastError = error;

        // If it's a CORS error, try next endpoint
        if (error.message.includes("CORS") || error.code === "ERR_NETWORK") {
          continue;
        }

        // If it's a 404, try next endpoint
        if (error.response?.status === 404) {
          continue;
        }

        // For other errors, break and use the error
        break;
      }
    }

    // If all endpoints failed, throw the last error
    throw lastError;
    return response.data;
  } catch (error: any) {
    // Check for specific error types
    if (error.code === "ERR_NETWORK") {
      throw new Error(
        "Cannot connect to AI service. Please make sure the AI service is running on port 8082."
      );
    }

    if (error.response?.status === 431) {
      throw new Error(
        "Image file is too large. Please use a smaller image (max 5MB)."
      );
    }

    if (error.response?.status === 404) {
      throw new Error(
        "AI service endpoint not found. Please check if AI service is running correctly."
      );
    }

    if (error.response?.status === 413) {
      throw new Error(
        "Image file is too large for processing. Please use a smaller image."
      );
    }

    // Provide mock response for development if AI service is not available
    if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
      return getMockDetectionResponse(file);
    }

    // Provide helpful error message
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to process image with AI service";

    throw new Error(`AI ${detectionType} detection failed: ${errorMessage}`);
  }
};

/**
 * Check if AI service is healthy
 */
export const checkAIHealth = async (): Promise<AIHealthResponse> => {
  const endpoints = [
    `${AI_CONFIG.BASE_URL}${AI_CONFIG.ENDPOINTS.HEALTH}`,
    ...AI_CONFIG.FALLBACK_ENDPOINTS.map(
      (baseUrl) => `${baseUrl}${AI_CONFIG.ENDPOINTS.HEALTH}`
    ),
  ];

  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get<AIHealthResponse>(endpoint, {
        timeout: 5000,
        withCredentials: false,
      });

      return response.data;
    } catch (error: any) {
      lastError = error;

      // If it's a CORS or network error, try next endpoint
      if (error.message.includes("CORS") || error.code === "ERR_NETWORK") {
        continue;
      }

      // If it's a 404, try next endpoint
      if (error.response?.status === 404) {
        continue;
      }
    }
  }

  // If all endpoints failed, return unhealthy
  if (lastError?.code === "ERR_NETWORK") {
    // Network error occurred
  }

  return {
    status: "unhealthy",
    model_loaded: false,
  };
};

/**
 * Generate mock detection response for development
 */
const getMockDetectionResponse = (file: File): Promise<AIDetectionResponse> => {
  return new Promise<AIDetectionResponse>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      // Extract just the base64 part (remove data URL prefix)
      const base64Only = base64Image.split(",")[1] || base64Image;

      const mockDetections: DetectionResult[] = [
        {
          class: "sack",
          confidence: 0.85,
          bbox: [100, 150, 200, 300],
        },
        {
          class: "sack",
          confidence: 0.78,
          bbox: [250, 180, 350, 320],
        },
        {
          class: "box",
          confidence: 0.92,
          bbox: [400, 200, 500, 350],
        },
        {
          class: "sack",
          confidence: 0.75,
          bbox: [150, 400, 250, 550],
        },
      ];

      const sackCount = mockDetections.filter((d) => d.class === "sack").length;
      const boxCount = mockDetections.filter((d) => d.class === "box").length;

      resolve({
        status: "success",
        sack_count: sackCount,
        box_count: boxCount,
        total_count: sackCount + boxCount,
        annotated_image: base64Only, // Return raw base64 without data URL prefix
        detections: mockDetections,
        message: "Mock detection result (AI service not available)",
      });
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Process image with AI and return both original and annotated images
 */
export const processImageWithAI = async (
  file: File,
  detectionType: "sack" | "box" | "both" = "both",
  saveToMinIO: boolean = false,
  sessionId?: string,
  rowNumber?: number,
  countingSessionId?: string
): Promise<{
  originalImage: string;
  annotatedImage: string;
  detections: DetectionResult[];
  sackCount: number;
  boxCount: number;
  totalCount: number;
  storageInfo?: {
    original?: {
      object_name: string;
      url: string;
      stored: boolean;
    };
    annotated?: {
      object_name: string;
      url: string;
      stored: boolean;
    };
  };
}> => {
  try {
    const safeFile = await toJpegFile(file);

    // Validate file size before processing (max 5MB)
    if (safeFile.size > 5 * 1024 * 1024) {
      throw new Error("Image file is too large. Maximum size is 5MB.");
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(safeFile.type)) {
      throw new Error(
        `Invalid file type. Supported types: ${validTypes.join(", ")}`
      );
    }

    // Get original image as base64 for display
    const originalImage = await fileToBase64(safeFile);

    // Get AI detection results
    const aiResult = await detectSacksAndBoxes(
      safeFile,
      detectionType,
      saveToMinIO,
      sessionId,
      rowNumber,
      countingSessionId
    );

    // Debug logging for AI service response
    console.log("🔍 [DEBUG] AI Service Response:", {
      hasAiResult: !!aiResult,
      detectionType,
      saveToMinIO,
      sessionId,
      rowNumber,
      responseKeys: aiResult ? Object.keys(aiResult) : [],
      hasStorageInfo: !!aiResult?.storage,
      storageInfo: aiResult?.storage,
      hasOriginalImagePath: !!aiResult?.original_image_path,
      hasAnnotatedImagePath: !!aiResult?.annotated_image_path,
      sacks: aiResult?.sacks,
      boxes: aiResult?.boxes,
      sack_count: aiResult?.sack_count,
      box_count: aiResult?.box_count,
    });

    // Filter detections based on detectionType
    let filteredDetections = aiResult.detections;
    let sackCount = aiResult.sack_count || aiResult.sacks || 0;
    let boxCount = aiResult.box_count || aiResult.boxes || 0;
    let totalCount = aiResult.total_count || 0;

    // For sack-only detection, use sack_count from response
    if (detectionType === "sack") {
      filteredDetections =
        aiResult.detections?.filter((d) => d.class === "sack") || [];
      sackCount =
        aiResult.sack_count || aiResult.sacks || filteredDetections.length;
      boxCount = 0;
      totalCount = sackCount;
    } else if (detectionType === "box") {
      // For box detection, we need to filter boxes from the response
      filteredDetections =
        aiResult.detections?.filter((d) => d.class === "box") || [];
      boxCount =
        aiResult.box_count || aiResult.boxes || filteredDetections.length;
      sackCount = 0;
      totalCount = boxCount;
    }

    // Handle new AI service response format
    // New format returns image paths instead of base64
    let annotatedImage = aiResult.annotated_image;

    // Check if we have annotated image in base64 format
    if (annotatedImage && !annotatedImage.startsWith("data:")) {
      // If it's base64 without data URL prefix
      if (annotatedImage.includes("base64,")) {
        // Already has base64 prefix
        annotatedImage = annotatedImage;
      } else if (annotatedImage.length > 100) {
        // Likely raw base64
        annotatedImage = `data:image/jpeg;base64,${annotatedImage}`;
      } else {
        // Probably an image path, use original image for display
        annotatedImage = originalImage;
      }
    } else if (!annotatedImage) {
      // No annotated image, use original
      annotatedImage = originalImage;
    }

    // Extract storage info from new response format
    let storageInfo = aiResult.storage;

    // Debug logging for storage info extraction
    console.log("🔍 [DEBUG] Storage Info Extraction:", {
      hasStorageInResponse: !!aiResult.storage,
      storageKeys: aiResult.storage ? Object.keys(aiResult.storage) : [],
      hasOriginalImagePath: !!aiResult.original_image_path,
      hasAnnotatedImagePath: !!aiResult.annotated_image_path,
      originalImagePath: aiResult.original_image_path,
      annotatedImagePath: aiResult.annotated_image_path,
    });

    // Handle flat storageInfo structure (annotated_object_name, original_object_name)
    if (
      storageInfo &&
      (storageInfo.annotated_object_name || storageInfo.original_object_name)
    ) {
      console.log("🔍 [DEBUG] Converting flat storageInfo to nested structure");
      // Convert flat structure to nested structure for consistency
      storageInfo = {
        original: storageInfo.original_object_name
          ? {
              object_name: storageInfo.original_object_name,
              url:
                storageInfo.original_url ||
                `http://localhost:9000/${storageInfo.original_object_name}`,
              stored: storageInfo.original_stored || true,
            }
          : undefined,
        annotated: storageInfo.annotated_object_name
          ? {
              object_name: storageInfo.annotated_object_name,
              url:
                storageInfo.annotated_url ||
                `http://localhost:9000/${storageInfo.annotated_object_name}`,
              stored: storageInfo.annotated_stored || true,
            }
          : undefined,
        session_id: storageInfo.session_id,
      };
    }
    // If we have image paths in the response but no storageInfo, create storage info
    else if (
      !storageInfo &&
      (aiResult.original_image_path || aiResult.annotated_image_path)
    ) {
      console.log("🔍 [DEBUG] Creating storage info from image paths");
      storageInfo = {
        original: aiResult.original_image_path
          ? {
              object_name: aiResult.original_image_path,
              url: `http://localhost:9000/${aiResult.original_image_path}`,
              stored: true,
            }
          : undefined,
        annotated: aiResult.annotated_image_path
          ? {
              object_name: aiResult.annotated_image_path,
              url: `http://localhost:9000/${aiResult.annotated_image_path}`,
              stored: true,
            }
          : undefined,
      };
    }

    // Final debug logging
    console.log("🔍 [DEBUG] Final Storage Info:", {
      hasStorageInfo: !!storageInfo,
      storageInfo,
      hasOriginalObjectName: !!storageInfo?.original?.object_name,
      hasAnnotatedObjectName: !!storageInfo?.annotated?.object_name,
      hasFlatOriginalObjectName: storageInfo?.original_object_name,
      hasFlatAnnotatedObjectName: storageInfo?.annotated_object_name,
    });

    return {
      originalImage,
      annotatedImage: annotatedImage || originalImage,
      detections: filteredDetections || [],
      sackCount,
      boxCount,
      totalCount,
      storageInfo,
    };
  } catch (error: any) {
    // Fallback to just showing original image with error message
    const originalImage = await fileToBase64(file);

    return {
      originalImage,
      annotatedImage: originalImage,
      detections: [],
      sackCount: 0,
      boxCount: 0,
      totalCount: 0,
    };
  }
};

/**
 * Convert File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Draw bounding boxes on image (client-side alternative)
 */
export const drawBoundingBoxes = (
  imageUrl: string,
  detections: DetectionResult[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Draw bounding boxes with different colors for sacks and boxes
      detections.forEach((detection) => {
        const [x1, y1, x2, y2] = detection.bbox;
        const width = x2 - x1;
        const height = y2 - y1;

        // Draw rectangle with different colors
        if (detection.class === "sack") {
          ctx.strokeStyle = "#00ff00"; // Green for sacks
          ctx.fillStyle = "#00ff00";
        } else if (detection.class === "box") {
          ctx.strokeStyle = "#ff9900"; // Orange for boxes
          ctx.fillStyle = "#ff9900";
        } else {
          ctx.strokeStyle = "#00ff00"; // Default green
          ctx.fillStyle = "#00ff00";
        }

        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, width, height);

        // Draw label background
        const label = `${detection.class} ${(
          detection.confidence * 100
        ).toFixed(1)}%`;
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(x1, y1 - 20, textWidth + 10, 20);

        // Draw label text
        ctx.fillStyle = "#000000";
        ctx.font = "14px Arial";
        ctx.fillText(label, x1 + 5, y1 - 5);
      });

      resolve(canvas.toDataURL("image/jpeg"));
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
};

/**
 * Get the best available endpoint for AI service
 * Useful for debugging and configuration
 */
export const getAvailableAIEndpoint = async (): Promise<string | null> => {
  const endpoints = [AI_CONFIG.BASE_URL, ...AI_CONFIG.FALLBACK_ENDPOINTS];

  for (const baseUrl of endpoints) {
    try {
      const healthUrl = `${baseUrl}${AI_CONFIG.ENDPOINTS.HEALTH}`;

      const response = await axios.get(healthUrl, {
        timeout: 3000,
        withCredentials: false,
      });

      if (response.data?.status === "healthy") {
        return baseUrl;
      }
    } catch (error) {
      // Continue to next endpoint - endpoint not available
    }
  }

  return null;
};

/**
 * Configure axios instance for AI service with proper CORS handling
 */
export const createAIAxiosInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
    withCredentials: false,
  });
};

/**
 * Detect only sacks in an image
 * @param file The image file to analyze
 * @param saveToMinIO Whether to save images to MinIO storage
 * @param sessionId Session ID for grouping images in MinIO
 * @returns Detection results with annotated image
 */
export const detectSacks = async (
  file: File,
  saveToMinIO: boolean = false,
  sessionId?: string,
  countingSessionId?: string
): Promise<AIDetectionResponse> => {
  return detectSacksAndBoxes(
    file,
    "sack",
    saveToMinIO,
    sessionId,
    undefined,
    countingSessionId
  );
};

/**
 * Detect only boxes in an image
 * @param file The image file to analyze
 * @param saveToMinIO Whether to save images to MinIO storage
 * @param sessionId Session ID for grouping images in MinIO
 * @returns Detection results with annotated image
 */
export const detectBoxes = async (
  file: File,
  saveToMinIO: boolean = false,
  sessionId?: string,
  countingSessionId?: string
): Promise<AIDetectionResponse> => {
  return detectSacksAndBoxes(
    file,
    "box",
    saveToMinIO,
    sessionId,
    undefined,
    countingSessionId
  );
};

/**
 * Save images to MinIO storage manually
 * @param sessionId Session ID for grouping
 * @param originalImageBase64 Base64 encoded original image (optional)
 * @param annotatedImageBase64 Base64 encoded annotated image (optional)
 * @param originalFilename Original filename
 * @returns MinIO save response
 */
export const saveToMinIO = async (
  sessionId: string,
  originalImageBase64?: string,
  annotatedImageBase64?: string,
  originalFilename?: string
): Promise<MinIOSaveResponse> => {
  try {
    // Minimal logging for MinIO save

    const formData = new FormData();
    formData.append("session_id", sessionId);

    // Extract pure base64 from data URLs if present
    let pureOriginalBase64 = originalImageBase64;
    let pureAnnotatedBase64 = annotatedImageBase64;

    if (originalImageBase64 && originalImageBase64.includes("data:")) {
      pureOriginalBase64 =
        originalImageBase64.split(",")[1] || originalImageBase64;
    }

    if (annotatedImageBase64 && annotatedImageBase64.includes("data:")) {
      pureAnnotatedBase64 =
        annotatedImageBase64.split(",")[1] || annotatedImageBase64;
    }

    if (pureOriginalBase64) {
      formData.append("original_image_base64", pureOriginalBase64);
    }

    if (pureAnnotatedBase64) {
      formData.append("annotated_image_base64", pureAnnotatedBase64);
    }

    if (originalFilename) {
      formData.append("original_filename", originalFilename);
    }

    if (sessionId) {
      formData.append("session_id", sessionId);
    }

    if (rowNumber) {
      formData.append("row_number", rowNumber.toString());
    }

    if (detectionType) {
      formData.append("detection_type", detectionType);
    }

    const endpoints = [
      `${AI_CONFIG.BASE_URL}${AI_CONFIG.ENDPOINTS.SAVE_TO_MINIO}`,
      ...AI_CONFIG.FALLBACK_ENDPOINTS.map(
        (baseUrl) => `${baseUrl}${AI_CONFIG.ENDPOINTS.SAVE_TO_MINIO}`
      ),
    ];

    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        const response = await axios.post<AIDetectionResponse>(
          endpoint,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-Auto-Save": "true",
              "X-Session-Id": sessionId || "",
              "X-Row-Number": rowNumber?.toString() || "",
              "X-Detection-Type": detectionType || "",
            },
            timeout: AI_CONFIG.TIMEOUT,
            withCredentials: false,
          }
        );

        // Log only important information
        if (response.data.storage) {
          if (
            !response.data.storage.original?.stored &&
            !response.data.storage.annotated?.stored
          ) {
            // Add warning to response message
            response.data.message = `${response.data.message} (แต่ไฟล์อาจไม่ได้บันทึกจริงใน MinIO - storage info ว่างเปล่า)`;
          }
        } else {
          // Add warning to response message
          response.data.message = `${response.data.message} (แต่ไม่มีข้อมูล storage ใน response - ไฟล์อาจไม่ได้บันทึกใน MinIO)`;
          response.data.storage = {
            original: { stored: false, object_name: "unknown", url: "unknown" },
            annotated: {
              stored: false,
              object_name: "unknown",
              url: "unknown",
            },
          };
        }

        return response.data;
      } catch (error: any) {
        lastError = error;

        if (error.message.includes("CORS") || error.code === "ERR_NETWORK") {
          continue;
        }

        if (error.response?.status === 404) {
          continue;
        }

        break;
      }
    }

    throw lastError || new Error("All MinIO save endpoints failed");
  } catch (error: any) {
    // Provide mock response for development if AI service is not available
    if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
      const mockObjectName = `annotated/sack/${sessionId}/${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}_annotated.jpg`;
      return {
        status: "success",
        message: "Mock MinIO save (MinIO service not available)",
        session_id: sessionId,
        storage: {
          original: originalImageBase64
            ? {
                object_name: `original/sack/${sessionId}/${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}.jpg`,
                url: `http://localhost:9000/sugar-sack-images/original/sack/${sessionId}/${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}.jpg`,
                stored: true,
              }
            : undefined,
          annotated: annotatedImageBase64
            ? {
                object_name: mockObjectName,
                url: `http://localhost:9000/sugar-sack-images/${mockObjectName}`,
                stored: true,
              }
            : undefined,
        },
      };
    }

    // If we get here, all endpoints failed but we got a response with empty storage
    // This means AI service responded but didn't actually save files
    if (
      lastError?.response?.data?.status === "success" &&
      (!lastError.response.data.storage ||
        Object.keys(lastError.response.data.storage).length === 0)
    ) {
      return {
        status: "warning",
        message:
          "AI service responded but files may not have been saved to MinIO (storage info empty)",
        session_id: sessionId,
        storage: {
          original: originalImageBase64
            ? { stored: false, object_name: "unknown", url: "unknown" }
            : undefined,
          annotated: annotatedImageBase64
            ? { stored: false, object_name: "unknown", url: "unknown" }
            : undefined,
        },
      };
    }

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to save images to MinIO";

    // Provide more helpful error message based on common issues
    let helpfulMessage = errorMessage;
    if (errorMessage.includes("CORS") || error.code === "ERR_NETWORK") {
      helpfulMessage =
        "ไม่สามารถเชื่อมต่อกับ AI service ได้ กรุณาตรวจสอบว่า AI service กำลังทำงานอยู่ที่พอร์ต 8082";
    } else if (error.response?.status === 404) {
      helpfulMessage =
        "AI service ไม่มี endpoint /save-to-minio กรุณาตรวจสอบเวอร์ชันของ AI service";
    } else if (error.response?.status === 500) {
      helpfulMessage =
        "AI service มีข้อผิดพลาดภายใน (500 error) กรุณาตรวจสอบ logs ของ AI service";
    }

    throw new Error(`MinIO save failed: ${helpfulMessage}`);
  }
};

/**
 * Check MinIO status with detailed debugging
 * @returns MinIO status information
 */
export const checkMinIOStatusDetailed = async (): Promise<{
  status: "connected" | "error";
  message: string;
  details: {
    minioApi: boolean;
    minioUi: boolean;
    aiService: boolean;
    bucketExists: boolean;
    fileCount: number;
    endpoints: {
      minioApi: string;
      minioUi: string;
      aiService: string;
      aiMinioStatus: string;
    };
  };
}> => {
  try {
    console.log("🔍 Running comprehensive MinIO diagnostic check...");

    const results = {
      minioApi: false,
      minioUi: false,
      aiService: false,
      bucketExists: false,
      fileCount: 0,
    };

    // Check MinIO API
    try {
      const minioApiResponse = await fetch(
        "http://localhost:9000/minio/health/live",
        {
          method: "GET",
          mode: "no-cors",
        }
      );
      results.minioApi = true;
      console.log("✅ MinIO API (port 9000) is accessible");
    } catch (error) {
      console.log("❌ MinIO API (port 9000) is not accessible:", error);
    }

    // Check MinIO UI
    try {
      const minioUiResponse = await fetch("http://localhost:9001", {
        method: "GET",
        mode: "no-cors",
      });
      results.minioUi = true;
      console.log("✅ MinIO UI (port 9001) is accessible");
    } catch (error) {
      console.log("❌ MinIO UI (port 9001) is not accessible:", error);
    }

    // Check AI Service
    try {
      const aiHealthResponse = await fetch("http://localhost:8082/health");
      if (aiHealthResponse.ok) {
        const data = await aiHealthResponse.json();
        results.aiService = true;
        console.log("✅ AI Service (port 8082) is healthy:", data);
      } else {
        console.log(
          "❌ AI Service (port 8082) returned error:",
          aiHealthResponse.status
        );
      }
    } catch (error) {
      console.log("❌ AI Service (port 8082) is not accessible:", error);
    }

    // Check MinIO status from AI service
    let minioStatus = null;
    try {
      const minioStatusResponse = await fetch(
        "http://localhost:8082/minio-status"
      );
      if (minioStatusResponse.ok) {
        minioStatus = await minioStatusResponse.json();
        results.bucketExists = minioStatus.bucket_exists || false;
        results.fileCount = minioStatus.file_count || 0;
        console.log("✅ AI Service MinIO status:", minioStatus);
      }
    } catch (error) {
      console.log("❌ Cannot get MinIO status from AI service:", error);
    }

    // Determine overall status
    const allServicesAvailable =
      results.minioApi && results.minioUi && results.aiService;
    const status = allServicesAvailable ? "connected" : "error";

    let message = "";
    if (allServicesAvailable) {
      if (results.bucketExists) {
        message = `MinIO system is fully operational. Bucket exists with ${results.fileCount} files.`;
      } else {
        message =
          "MinIO services are running but bucket 'sugar-sack-images' may not exist.";
      }
    } else {
      const missingServices = [];
      if (!results.minioApi) missingServices.push("MinIO API (port 9000)");
      if (!results.minioUi) missingServices.push("MinIO UI (port 9001)");
      if (!results.aiService) missingServices.push("AI Service (port 8082)");
      message = `Some services are not available: ${missingServices.join(
        ", "
      )}`;
    }

    return {
      status,
      message,
      details: {
        ...results,
        endpoints: {
          minioApi: "http://localhost:9000",
          minioUi: "http://localhost:9001",
          aiService: "http://localhost:8082",
          aiMinioStatus: "http://localhost:8082/minio-status",
        },
      },
    };
  } catch (error: any) {
    console.error("❌ Error in MinIO diagnostic check:", error);
    return {
      status: "error",
      message: `Diagnostic check failed: ${error.message}`,
      details: {
        minioApi: false,
        minioUi: false,
        aiService: false,
        bucketExists: false,
        fileCount: 0,
        endpoints: {
          minioApi: "http://localhost:9000",
          minioUi: "http://localhost:9001",
          aiService: "http://localhost:8082",
          aiMinioStatus: "http://localhost:8082/minio-status",
        },
      },
    };
  }
};

/**
 * Test MinIO save functionality with a simple image
 * @returns Test results with detailed information
 */
export const testMinIOSave = async (): Promise<{
  status: "success" | "warning" | "error";
  message: string;
  testResults: {
    saveEndpoint: boolean;
    storageInfo: boolean;
    filesStored: boolean;
    responseTime: number;
  };
  details: any;
}> => {
  const startTime = Date.now();

  try {
    console.log("🧪 Testing MinIO save functionality...");

    // Create a simple 1x1 pixel PNG image in base64
    const testBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    const sessionId = `test_${Date.now()}`;

    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("original_image_base64", testBase64);
    formData.append("annotated_image_base64", testBase64);
    formData.append("original_filename", "test_pixel.png");

    console.log("📤 Sending test request to AI service...");

    const response = await fetch("http://localhost:8082/save-to-minio", {
      method: "POST",
      body: formData,
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ AI service returned error:", response.status, errorText);
      return {
        status: "error",
        message: `AI service returned error ${
          response.status
        }: ${errorText.substring(0, 100)}`,
        testResults: {
          saveEndpoint: false,
          storageInfo: false,
          filesStored: false,
          responseTime,
        },
        details: {
          statusCode: response.status,
          error: errorText,
          sessionId,
        },
      };
    }

    const data = await response.json();
    console.log("📥 AI service response:", data);

    const hasStorageInfo = data.storage && Object.keys(data.storage).length > 0;
    const filesStored =
      data.storage?.original?.stored === true ||
      data.storage?.annotated?.stored === true;

    const testResults = {
      saveEndpoint: true,
      storageInfo: hasStorageInfo,
      filesStored,
      responseTime,
    };

    let status: "success" | "warning" | "error" = "success";
    let message = "";

    if (!hasStorageInfo) {
      status = "warning";
      message =
        "AI service responded but returned empty storage information. Files may not have been saved to MinIO.";
    } else if (!filesStored) {
      status = "warning";
      message =
        "AI service returned storage information but files were not marked as stored. Check MinIO configuration.";
    } else {
      message = `MinIO save test successful! Files stored in session: ${sessionId}`;
    }

    return {
      status,
      message,
      testResults,
      details: {
        response: data,
        sessionId,
        storageDetails: data.storage,
      },
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error("❌ MinIO save test failed:", error);

    return {
      status: "error",
      message: `Test failed: ${error.message}`,
      testResults: {
        saveEndpoint: false,
        storageInfo: false,
        filesStored: false,
        responseTime,
      },
      details: {
        error: error.message,
        stack: error.stack,
      },
    };
  }
};
export const checkMinIOStatus = async (): Promise<{
  status: string;
  bucket: string;
  bucket_exists: boolean;
  file_count: number;
  endpoint: string;
  details?: any;
}> => {
  try {
    console.log("🔍 Checking MinIO status...", {
      timestamp: new Date().toISOString(),
      expectedEndpoints: [
        "http://localhost:9000",
        "http://localhost:9001 (UI)",
        `${AI_CONFIG.BASE_URL}${AI_CONFIG.ENDPOINTS.MINIO_STATUS}`,
      ],
    });

    const endpoints = [
      `${AI_CONFIG.BASE_URL}${AI_CONFIG.ENDPOINTS.MINIO_STATUS}`,
      ...AI_CONFIG.FALLBACK_ENDPOINTS.map(
        (baseUrl) => `${baseUrl}${AI_CONFIG.ENDPOINTS.MINIO_STATUS}`
      ),
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Checking MinIO status via AI service: ${endpoint}`);

        const response = await axios.get(endpoint, {
          timeout: 10000,
          withCredentials: false,
        });

        console.log(`✅ MinIO status check successful: ${endpoint}`, {
          data: response.data,
          timestamp: new Date().toISOString(),
        });

        // Also try to check MinIO directly
        try {
          const minioDirectCheck = await axios.get(
            "http://localhost:9000/minio/health/live",
            {
              timeout: 5000,
            }
          );
          console.log("✅ MinIO direct health check successful", {
            status: minioDirectCheck.status,
            data: minioDirectCheck.data,
          });
        } catch (directError) {
          console.log(
            "⚠️ MinIO direct health check failed:",
            directError.message
          );
        }

        return {
          ...response.data,
          details: {
            aiServiceEndpoint: endpoint,
            minioEndpoint: "localhost:9000",
            minioUIEndpoint: "localhost:9001",
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error: any) {
        console.log(`❌ MinIO status check failed for ${endpoint}:`, {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          timestamp: new Date().toISOString(),
        });
        continue;
      }
    }

    // If all endpoints failed, try to check MinIO directly
    console.log("🔄 Trying direct MinIO connection check...");
    try {
      const directResponse = await axios.get(
        "http://localhost:9000/minio/health/live",
        {
          timeout: 5000,
        }
      );
      console.log("✅ MinIO is running directly", {
        status: directResponse.status,
        data: directResponse.data,
      });

      return {
        status: "connected",
        bucket: "sugar-sack-images",
        bucket_exists: true, // Assuming bucket exists
        file_count: 0, // Unknown
        endpoint: "localhost:9000",
        details: {
          directCheck: true,
          healthStatus: "live",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (directError) {
      console.log("❌ MinIO direct connection failed:", directError.message);
    }

    // If all endpoints failed
    console.log("❌ All MinIO status checks failed");
    return {
      status: "unavailable",
      bucket: "sugar-sack-images",
      bucket_exists: false,
      file_count: 0,
      endpoint: "localhost:9000",
      details: {
        error: "All endpoints failed",
        timestamp: new Date().toISOString(),
        suggestedActions: [
          "1. Check if MinIO is running: docker ps | grep minio",
          "2. Check MinIO logs: docker logs minio",
          "3. Verify bucket exists: sugar-sack-images",
          "4. Check permissions and credentials",
        ],
      },
    };
  } catch (error: any) {
    console.error("❌ MinIO status check failed:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return {
      status: "error",
      bucket: "sugar-sack-images",
      bucket_exists: false,
      file_count: 0,
      endpoint: "localhost:9000",
      details: {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
    };
  }
};

/**
 * Get MinIO file URL for UI access
 * @param objectName The object name in MinIO
 * @returns URL for MinIO UI
 */
export const getMinIOUIUrl = (objectName: string): string => {
  if (!objectName) return "";

  // Encode the object name for URL
  const encodedObjectName = encodeURIComponent(objectName)
    .replace(/%2F/g, "/")
    .replace(/%20/g, "+");
  const url = `http://localhost:9001/minio/sugar-sack-images/${encodedObjectName}`;

  console.log("🔗 MinIO UI URL generated:", {
    objectName,
    encodedObjectName,
    url,
    timestamp: new Date().toISOString(),
  });

  return url;
};

/**
 * Get direct MinIO file URL
 * @param objectName The object name in MinIO
 * @returns Direct file URL
 */
export const getMinIODirectUrl = (objectName: string): string => {
  if (!objectName) return "";

  const url = `http://localhost:9000/sugar-sack-images/${objectName}`;

  console.log("🔗 MinIO Direct URL generated:", {
    objectName,
    url,
    timestamp: new Date().toISOString(),
  });

  return url;
};

export default {
  detectSacksAndBoxes,
  detectSacks,
  detectBoxes,
  checkAIHealth,
  processImageWithAI,
  drawBoundingBoxes,
  getAvailableAIEndpoint,
  createAIAxiosInstance,
  saveToMinIO,
  checkMinIOStatus,
  getMinIOUIUrl,
  getMinIODirectUrl,
};
