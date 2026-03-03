# Image Upload Feature Documentation

## Overview
ระบบอัปโหลดรูปภาพถูกเพิ่มเข้ามาในแอปพลิเคชัน Sugar Sack Counter Frontend v2 เพื่อให้ผู้ใช้สามารถอัปโหลดรูปภาพสำหรับการนับกล่องและกระสอบน้ำตาลได้

## Components ที่เพิ่มเข้ามา

### 1. ImageUploadModal (`src/components/image-upload/ImageUploadModal.tsx`)
คอมโพเนนต์ Modal สำหรับอัปโหลดรูปภาพที่มีคุณสมบัติ:
- แสดงตัวอย่างรูปภาพก่อนอัปโหลด
- ตรวจสอบประเภทไฟล์ (JPEG, PNG, JPG, WebP)
- ตรวจสอบขนาดไฟล์ (สูงสุด 5MB)
- ฟิลด์คำอธิบายเพิ่มเติม
- การจัดการข้อผิดพลาด

### 2. API Functions (`src/utils/count/count-api.ts`)
ฟังก์ชัน API สำหรับอัปโหลดรูปภาพ:
- `uploadCountingSessionImage()` - อัปโหลดรูปภาพสำหรับเซสชันการนับ
- `uploadRowImage()` - อัปโหลดรูปภาพสำหรับแถวเฉพาะในเซสชัน

## การใช้งาน

### ในหน้า SugarBoxsInfo และ SugarBagsInfo

#### 1. เพิ่มปุ่มอัปโหลดในตาราง
ตารางในทั้งสองหน้าจะมีปุ่มอัปโหลดรูปภาพเพิ่มเข้ามา (ไอคอน 📤) ถัดจากปุ่มแก้ไขและลบ

#### 2. ฟังก์ชันการทำงาน
เมื่อคลิกปุ่มอัปโหลด:
1. Modal อัปโหลดรูปภาพจะปรากฏขึ้น
2. ผู้ใช้สามารถเลือกรูปภาพจากอุปกรณ์
3. ระบบจะตรวจสอบประเภทและขนาดไฟล์
4. ผู้ใช้สามารถเพิ่มคำอธิบายได้ (ไม่จำเป็น)
5. คลิก "อัปโหลด" เพื่อส่งไฟล์

#### 3. API Endpoints
ระบบจะเรียกใช้ API endpoints ต่อไปนี้:
- `POST /counting-sessions/{sessionId}/upload-image` - สำหรับอัปโหลดรูปภาพเซสชัน
- `POST /counting-sessions/{sessionId}/rows/{rowNumber}/upload-image` - สำหรับอัปโหลดรูปภาพแถว

## ในหน้า Count (BagRow และ BoxRow)

### 1. ปุ่มอัปโหลดในแถว
แต่ละแถวในการนับจะมีปุ่มอัปโหลดรูปภาพที่ทำงานได้จริง

### 2. ฟังก์ชันการทำงาน
1. คลิกปุ่ม "อัปโหลด" หรือคลิกที่พื้นที่รูปภาพ
2. เลือกรูปภาพจากอุปกรณ์
3. ระบบจะอัปโหลดไฟล์ทันที
4. แสดงตัวอย่างรูปภาพในแถว

### 3. API Endpoint
- `POST /counting-sessions/rows/upload` - สำหรับอัปโหลดรูปภาพแถว

## Configuration

### 1. ไฟล์ที่อนุญาต
- image/jpeg
- image/png  
- image/jpg
- image/webp

### 2. ขนาดไฟล์สูงสุด
- 5MB (5 * 1024 * 1024 bytes)

### 3. Environment Variables
```env
NEXT_PUBLIC_USE_MOCK_API=true  # สำหรับใช้ mock response ใน development
```

## Mock Responses

ในโหมด development (เมื่อ `NEXT_PUBLIC_USE_MOCK_API=true`):
- `uploadCountingSessionImage()`: ส่งคืน path `/uploads/{timestamp}_{filename}`
- `uploadRowImage()`: ส่งคืน path `/uploads/rows/{timestamp}_{filename}`

## Error Handling

ระบบจัดการข้อผิดพลาดดังนี้:
1. **ประเภทไฟล์ไม่ถูกต้อง**: แสดงข้อความ "ไฟล์ต้องเป็นประเภท: image/jpeg, image/png, image/jpg, image/webp"
2. **ขนาดไฟล์เกินกำหนด**: แสดงข้อความ "ไฟล์ต้องมีขนาดไม่เกิน 5MB"
3. **อัปโหลดล้มเหลว**: แสดงข้อความจาก server หรือ "ไม่สามารถอัปโหลดรูปภาพได้"
4. **ไม่พบ session ID**: แสดงข้อความ "ไม่พบรหัสเซสชันสำหรับอัปโหลดรูปภาพ"

## Testing

### 1. ทดสอบใน Development
```bash
# ตั้งค่า environment variable
NEXT_PUBLIC_USE_MOCK_API=true

# รันแอปพลิเคชัน
npm run dev
```

### 2. ทดสอบฟังก์ชัน
1. ไปที่หน้า SugarBoxsInfo หรือ SugarBagsInfo
2. คลิกปุ่มอัปโหลดรูปภาพในตาราง
3. เลือกรูปภาพทดสอบ
4. ตรวจสอบว่ามีข้อความสำเร็จปรากฏ

## Dependencies

### 1. Packages ที่ใช้
- `axios` - สำหรับ HTTP requests
- `sweetalert2` - สำหรับแสดง dialog
- `lucide-react` - สำหรับไอคอน

### 2. Import Statements
```typescript
// ใน count-api.ts
import axios from "axios";

// ใน components
import { Upload, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
```

## Future Improvements

1. **Multiple File Upload**: รองรับการอัปโหลดหลายไฟล์พร้อมกัน
2. **Image Compression**: บีบอัดรูปภาพก่อนอัปโหลด
3. **Progress Indicator**: แสดงความคืบหน้าของการอัปโหลด
4. **Image Gallery**: แสดงแกลเลอรี่รูปภาพที่อัปโหลดแล้ว
5. **Cloud Storage**: อัปโหลดไปยัง cloud storage เช่น S3, Cloudinary

## Troubleshooting

### 1. ปุ่มอัปโหลดไม่แสดง
- ตรวจสอบว่า Table component มี prop `onUploadImage`
- ตรวจสอบว่าไอคอน Upload ถูก import ถูกต้อง

### 2. อัปโหลดไม่ทำงาน
- ตรวจสอบ console log สำหรับข้อผิดพลาด
- ตรวจสอบ network tab ว่า API call ถูกส่งหรือไม่
- ตรวจสอบ CORS settings ใน backend

### 3. Mock response ไม่ทำงาน
- ตรวจสอบว่า `NEXT_PUBLIC_USE_MOCK_API=true`
- รีสตาร์ท development server

## Security Considerations

1. **File Validation**: ตรวจสอบประเภทและขนาดไฟล์บน client-side
2. **Server-side Validation**: ควรมี validation เพิ่มเติมบน server-side
3. **Sanitization**: ทำความสะอาดชื่อไฟล์ก่อนบันทึก
4. **Access Control**: ตรวจสอบสิทธิ์การเข้าถึงก่อนอัปโหลด

## Related Files

1. `src/components/image-upload/ImageUploadModal.tsx`
2. `src/components/table/table.tsx`
3. `src/app/[locale]/admin/SugarBoxsInfo/page.tsx`
4. `src/app/[locale]/admin/SugarBagsInfo/page.tsx`
5. `src/components/count/BagRow.tsx`
6. `src/components/count/BoxRow.tsx`
7. `src/utils/count/count-api.ts`
