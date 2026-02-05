/**
 * MinIO Diagnostic Utilities
 * Tools for diagnosing and troubleshooting MinIO storage issues
 */

export interface MinIODiagnosticResult {
  status: "healthy" | "warning" | "error";
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
    aiServiceDetails?: {
      modelLoaded: boolean;
      minioAvailable: boolean;
      minioInitialized: boolean;
    };
  };
  timestamp: string;
}

export interface MinIOTestResult {
  status: "success" | "warning" | "error";
  message: string;
  testResults: {
    saveEndpoint: boolean;
    storageInfo: boolean;
    filesStored: boolean;
    responseTime: number;
  };
  details: any;
  timestamp: string;
}

/**
 * Comprehensive MinIO diagnostic check
 */
export const checkMinIOStatusDetailed =
  async (): Promise<MinIODiagnosticResult> => {
    const timestamp = new Date().toISOString();

    try {
      // Running comprehensive MinIO diagnostic check...

      const results = {
        minioApi: false,
        minioUi: false,
        aiService: false,
        bucketExists: false,
        fileCount: 0,
      };

      let aiServiceDetails: any = null;

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
        // MinIO API (port 9000) is accessible
      } catch (error) {
        // MinIO API (port 9000) is not accessible
      }

      // Check MinIO UI
      try {
        const minioUiResponse = await fetch("http://localhost:9001", {
          method: "GET",
          mode: "no-cors",
        });
        results.minioUi = true;
        // MinIO UI (port 9001) is accessible
      } catch (error) {
        // MinIO UI (port 9001) is not accessible
      }

      // Check AI Service
      try {
        const aiHealthResponse = await fetch("http://localhost:8082/health");
        if (aiHealthResponse.ok) {
          const data = await aiHealthResponse.json();
          results.aiService = true;
          aiServiceDetails = {
            modelLoaded: data.model_loaded || false,
            minioAvailable: data.minio_available || false,
            minioInitialized: data.minio_initialized || false,
          };
          // AI Service (port 8082) is healthy
        } else {
          // AI Service (port 8082) returned error
        }
      } catch (error) {
        // AI Service (port 8082) is not accessible
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
          // AI Service MinIO status retrieved
        }
      } catch (error) {
        // Cannot get MinIO status from AI service
      }

      // Determine overall status
      const allServicesAvailable =
        results.minioApi && results.minioUi && results.aiService;
      let status: "healthy" | "warning" | "error" = "healthy";
      let message = "";

      if (allServicesAvailable) {
        if (results.bucketExists) {
          message = `MinIO system is fully operational. Bucket exists with ${results.fileCount} files.`;
          status = "healthy";
        } else {
          message =
            "MinIO services are running but bucket 'sugar-sack-images' may not exist.";
          status = "warning";
        }
      } else {
        const missingServices = [];
        if (!results.minioApi) missingServices.push("MinIO API (port 9000)");
        if (!results.minioUi) missingServices.push("MinIO UI (port 9001)");
        if (!results.aiService) missingServices.push("AI Service (port 8082)");
        message = `Some services are not available: ${missingServices.join(
          ", "
        )}`;
        status = "error";
      }

      // Additional warnings
      if (results.aiService && aiServiceDetails) {
        if (!aiServiceDetails.minioAvailable) {
          message += " AI service reports MinIO is not available.";
          status = "warning";
        }
        if (!aiServiceDetails.minioInitialized) {
          message += " AI service reports MinIO is not initialized.";
          status = "warning";
        }
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
          aiServiceDetails,
        },
        timestamp,
      };
    } catch (error: any) {
      // Error in MinIO diagnostic check
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
        timestamp,
      };
    }
  };

/**
 * Test MinIO save functionality with a simple image
 */
export const testMinIOSave = async (): Promise<MinIOTestResult> => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Testing MinIO save functionality...

    // Create a simple 1x1 pixel PNG image in base64
    const testBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    const sessionId = `test_${Date.now()}`;

    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("original_image_base64", testBase64);
    formData.append("annotated_image_base64", testBase64);
    formData.append("original_filename", "test_pixel.png");

    // Sending test request to AI service...

    const response = await fetch("http://localhost:8082/save-to-minio", {
      method: "POST",
      body: formData,
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      // AI service returned error
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
        timestamp,
      };
    }

    const data = await response.json();
    // AI service response received

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
      timestamp,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    // MinIO save test failed

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
      timestamp,
    };
  }
};

/**
 * Get troubleshooting guide for MinIO issues
 */
export const getMinIOTroubleshootingGuide = (): string => {
  return `
<div class="space-y-4">
  <h3 class="font-bold text-lg">🔧 แก้ไขปัญหา MinIO</h3>

  <div class="bg-blue-50 p-4 rounded border border-blue-200">
    <h4 class="font-semibold text-blue-800">1. ตรวจสอบว่า MinIO ทำงานอยู่</h4>
    <ul class="list-disc pl-5 text-blue-700 space-y-1">
      <li>เปิดเบราว์เซอร์ไปที่ <a href="http://localhost:9001" target="_blank" class="underline">http://localhost:9001</a></li>
      <li>ล็อกอินด้วย: username: <code>minioadmin</code>, password: <code>minioadmin</code></li>
      <li>ตรวจสอบว่า bucket "sugar-sack-images" มีอยู่</li>
    </ul>
  </div>

  <div class="bg-yellow-50 p-4 rounded border border-yellow-200">
    <h4 class="font-semibold text-yellow-800">2. ถ้า MinIO ไม่ทำงาน</h4>
    <p class="text-yellow-
700 mb-2">รันคำสั่งนี้ใน terminal:</p>
    <pre class="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
docker run -d -p 9000:9000 -p 9001:9001 \\
  -e MINIO_ROOT_USER=minioadmin \\
  -e MINIO_ROOT_PASSWORD=minioadmin \\
  --name minio \\
  minio/minio server /data --console-address ':9001'</pre>
  </div>

  <div class="bg-green-50 p-4 rounded border border-green-200">
    <h4 class="font-semibold text-green-800">3. ตรวจสอบ AI Service</h4>
    <ul class="list-disc pl-5 text-green-700 space-y-1">
      <li>ตรวจสอบว่า AI service ทำงานที่พอร์ต 8082: <a href="http://localhost:8082/health" target="_blank" class="underline">http://localhost:8082/health</a></li>
      <li>ตรวจสอบ MinIO status จาก AI: <a href="http://localhost:8082/minio-status" target="_blank" class="underline">http://localhost:8082/minio-status</a></li>
    </ul>
  </div>

  <div class="bg-red-50 p-4 rounded border border-red-200">
    <h4 class="font-semibold text-red-800">4. ปัญหาทั่วไปและวิธีแก้ไข</h4>
    <ul class="list-disc pl-5 text-red-700 space-y-2">
      <li><strong>Bucket ไม่มีอยู่:</strong> สร้าง bucket "sugar-sack-images" ใน MinIO UI</li>
      <li><strong>สิทธิ์ไม่พอ:</strong> ตรวจสอบว่า AI service มี MINIO_ACCESS_KEY และ MINIO_SECRET_KEY ถูกต้อง</li>
      <li><strong>CORS error:</strong> ใน MinIO UI ไปที่ Settings → CORS → เพิ่ม rule สำหรับ origin "*"</li>
      <li><strong>Network error:</strong> ตรวจสอบว่า MinIO และ AI service ทำงานใน network เดียวกัน</li>
    </ul>
  </div>

  <div class="bg-purple-50 p-4 rounded border border-purple-200">
    <h4 class="font-semibold text-purple-800">5. ทดสอบด้วยคำสั่ง curl</h4>
    <p class="text-purple-700 mb-2">ทดสอบการบันทึกไฟล์ด้วยคำสั่ง:</p>
    <pre class="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
curl -X POST http://localhost:8082/save-to-minio \\
  -F "session_id=test_\$(date +%s)" \\
  -F "original_image_base64=iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" \\
  -F "original_filename=test.png"</pre>
  </div>

  <div class="bg-gray-50 p-4 rounded border border-gray-200">
    <h4 class="font-semibold text-gray-800">6. ตรวจสอบ logs</h4>
    <ul class="list-disc pl-5 text-gray-700 space-y-1">
      <li>ตรวจสอบ console logs ของเบราว์เซอร์ (F12 → Console)</li>
      <li>ตรวจสอบ logs ของ AI service (ถ้ามี access)</li>
      <li>ตรวจสอบ logs ของ MinIO (ถ้ามี access)</li>
    </ul>
  </div>
</div>
  `;
};

/**
 * Generate a diagnostic report
 */
export const generateDiagnosticReport = async (): Promise<string> => {
  const diagnostic = await checkMinIOStatusDetailed();
  const testResult = await testMinIOSave();

  return `
# MinIO Diagnostic Report
**Generated:** ${new Date().toLocaleString()}

## System Status: ${diagnostic.status.toUpperCase()}
**Message:** ${diagnostic.message}

## Service Availability
- ✅ MinIO API (${diagnostic.details.endpoints.minioApi}): ${
    diagnostic.details.minioApi ? "Available" : "Unavailable"
  }
- ✅ MinIO UI (${diagnostic.details.endpoints.minioUi}): ${
    diagnostic.details.minioUi ? "Available" : "Unavailable"
  }
- ✅ AI Service (${diagnostic.details.endpoints.aiService}): ${
    diagnostic.details.aiService ? "Available" : "Unavailable"
  }
- ✅ Bucket "sugar-sack-images": ${
    diagnostic.details.bucketExists ? "Exists" : "Does not exist"
  }
- ✅ Files in bucket: ${diagnostic.details.fileCount}

## AI Service Details
${
  diagnostic.details.aiServiceDetails
    ? `
- Model Loaded: ${
        diagnostic.details.aiServiceDetails.modelLoaded ? "Yes" : "No"
      }
- MinIO Available: ${
        diagnostic.details.aiServiceDetails.minioAvailable ? "Yes" : "No"
      }
- MinIO Initialized: ${
        diagnostic.details.aiServiceDetails.minioInitialized ? "Yes" : "No"
      }
`
    : "No AI service details available"
}

## MinIO Save Test
**Status:** ${testResult.status.toUpperCase()}
**Message:** ${testResult.message}
**Response Time:** ${testResult.testResults.responseTime}ms
**Save Endpoint:** ${
    testResult.testResults.saveEndpoint ? "✅ Working" : "❌ Failed"
  }
**Storage Info:** ${
    testResult.testResults.storageInfo ? "✅ Received" : "❌ Missing"
  }
**Files Stored:** ${testResult.testResults.filesStored ? "✅ Yes" : "❌ No"}

## Recommended Actions
${
  diagnostic.status === "healthy" && testResult.status === "success"
    ? `
✅ System appears to be working correctly. If files are still not appearing in MinIO:
1. Check MinIO UI for the files
2. Verify bucket permissions
3. Check AI service logs for errors
`
    : `
⚠️ Issues detected:
1. ${diagnostic.message}
2. ${testResult.message}
3. Follow the troubleshooting guide below
`
}

## Quick Links
- [MinIO UI](${diagnostic.details.endpoints.minioUi})
- [AI Service Health](${diagnostic.details.endpoints.aiService}/health)
- [MinIO Status from AI](${diagnostic.details.endpoints.aiMinioStatus})
  `;
};

/**
 * Simple health check
 */
export const quickHealthCheck = async (): Promise<{
  healthy: boolean;
  issues: string[];
}> => {
  const diagnostic = await checkMinIOStatusDetailed();

  const issues: string[] = [];

  if (!diagnostic.details.minioApi) {
    issues.push("MinIO API is not accessible");
  }

  if (!diagnostic.details.minioUi) {
    issues.push("MinIO UI is not accessible");
  }

  if (!diagnostic.details.aiService) {
    issues.push("AI Service is not accessible");
  }

  if (!diagnostic.details.bucketExists) {
    issues.push("Bucket 'sugar-sack-images' does not exist");
  }

  if (diagnostic.details.aiServiceDetails) {
    if (!diagnostic.details.aiServiceDetails.minioAvailable) {
      issues.push("AI service reports MinIO is not available");
    }
    if (!diagnostic.details.aiServiceDetails.minioInitialized) {
      issues.push("AI service reports MinIO is not initialized");
    }
  }

  const testResult = await testMinIOSave();
  if (testResult.status !== "success") {
    issues.push(`MinIO save test failed: ${testResult.message}`);
  }

  return {
    healthy: issues.length === 0,
    issues,
  };
};
