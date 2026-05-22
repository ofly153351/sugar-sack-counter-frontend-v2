# Backend Requirements: Download Images From LINE In-App Browser

## Problem Summary
- ผู้ใช้ที่เปิดเว็บผ่าน LINE in-app browser มักดาวน์โหลดไฟล์จากฝั่ง frontend โดยตรงไม่ได้ (เช่น `a[download]`, `blob`).
- แนวทางที่เสถียรกว่าคือให้ frontend redirect ไป URL ดาวน์โหลดจริง และให้ backend เป็นผู้ส่งไฟล์พร้อม `Content-Disposition: attachment`.

## Frontend Behavior (Current)
- Frontend จะเปิด URL รูปด้วย query:
  - `download=1`
  - `filename=<suggested-filename>`
- ตัวอย่าง:
  - `GET /images/<object-path>?download=1&filename=bag-row-1-annotated.jpg`

## Backend Changes Required
1. รองรับ query `download=1` บน endpoint เสิร์ฟรูปภาพ
2. เมื่อมี `download=1`:
   - ส่ง header `Content-Disposition: attachment; filename="<safe-filename>"`
   - ส่ง `Content-Type` ตามไฟล์จริง (เช่น `image/jpeg`, `image/png`)
   - ส่งไฟล์แบบ stream กลับ client
3. เมื่อไม่มี `download=1`:
   - ยังสามารถแสดงรูปแบบ inline ได้ตาม behavior เดิม
4. sanitize ค่า `filename` จาก query ก่อนใช้งาน
5. ถ้ามี reverse proxy/CDN ให้ยืนยันว่าไม่ strip `Content-Disposition`

## Recommended Response Headers
- `Content-Type: image/jpeg` (หรือ type จริง)
- `Content-Disposition: attachment; filename="bag-row-1-annotated.jpg"`
- `Content-Length: <bytes>` (ถ้ารู้ขนาด)
- `Cache-Control: private, max-age=300` (ปรับได้ตามระบบ)
- `X-Content-Type-Options: nosniff`

## API Contract (Suggested)
### Option A: Reuse Existing Image Endpoint
- `GET /images/:objectPath`
- Query:
  - `download=1` (optional)
  - `filename=...` (optional)

Behavior:
- `download=1` -> download attachment
- default -> inline image

### Option B: Dedicated Download Endpoint
- `GET /images/:objectPath/download?filename=...`

Behavior:
- Always send attachment
- ลดความซับซ้อนจากการใช้ query flag

## Filename Sanitization Rules
- อนุญาตเฉพาะ `[a-zA-Z0-9._-]`
- แทนช่องว่างด้วย `_`
- ตัด path separator (`/`, `\`) และ control chars
- fallback ชื่อ default เช่น `image.jpg` หาก query ไม่ผ่าน validation

## MinIO / S3 Integration Notes
- หาก backend stream เอง:
  - อ่าน object จาก MinIO/S3 แล้ว pipe response
  - backend คุม headers ได้เต็มที่
- หาก backend redirect (302) ไป signed URL:
  - ต้องแน่ใจว่าปลายทางตอบ `Content-Disposition: attachment`
  - ถ้าปลายทางคุมไม่ได้ ให้ใช้วิธี stream ผ่าน backend แทน

## CORS Notes
- การ redirect/navigation เพื่อดาวน์โหลดมักไม่ติด CORS แบบ `fetch`.
- แต่ถ้า browser ต้อง preflight หรือมี cross-origin policy เพิ่มเติม:
  - อนุญาต origin ของ frontend
  - อนุญาต method `GET`

## Error Handling
- object ไม่พบ: `404`
- ไม่มีสิทธิ์: `403`
- query ไม่ถูกต้อง: `400`
- ทุก error ควรส่ง JSON ที่มี `message` สั้นและชัดเจน

## Example (Node/Express Pseudocode)
```ts
app.get("/images/:objectPath(*)", async (req, res) => {
  const { objectPath } = req.params;
  const forceDownload = req.query.download === "1";
  const requested = String(req.query.filename || "");
  const safeName = sanitizeFilename(requested) || "image.jpg";

  const file = await storage.getObjectStream(objectPath); // MinIO/S3 stream
  const mime = await storage.getObjectMime(objectPath);   // e.g. image/jpeg

  res.setHeader("Content-Type", mime || "application/octet-stream");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (forceDownload) {
    res.setHeader("Content-Disposition", `attachment; filename=\"${safeName}\"`);
  } else {
    res.setHeader("Content-Disposition", "inline");
  }

  file.pipe(res);
});
```

## QA Checklist
- ทดสอบบน LINE iOS และ LINE Android
- ทดสอบบน Safari/Chrome ปกติ
- กดดาวน์โหลดแล้วได้ชื่อไฟล์ตาม `filename`
- กรณี `download=1` ต้องเริ่ม download (หรือเปิด external browser แล้วดาวน์โหลดได้)
- CDN/proxy ไม่ลบ `Content-Disposition`

