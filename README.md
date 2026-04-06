# Sugar Sack Counter Frontend v2

โปรเจกต์ Frontend สำหรับระบบนับกระสอบน้ำตาล พัฒนาด้วย Next.js (App Router), TypeScript และรองรับหลายภาษา (ไทย/อังกฤษ)

## Tech Stack

- `Next.js 16` (App Router)
- `React 19` + `TypeScript`
- `Tailwind CSS 4`
- `next-intl` / `i18next` สำหรับ i18n
- `@tanstack/react-query` สำหรับ data fetching/state ฝั่ง server
- `axios` สำหรับเรียก API
- `zustand` สำหรับ state ฝั่ง client

## โครงสร้างไฟล์หลักของโปรเจกต์

```text
.
├── src/
│   ├── app/                         # Route และ layout ของ Next.js App Router
│   │   ├── [locale]/                # เส้นทางแบบหลายภาษา (th, en)
│   │   │   ├── (auth)/              # กลุ่มหน้า login/register
│   │   │   ├── (user)/              # กลุ่มหน้าผู้ใช้งานทั่วไป (home, count)
│   │   │   └── admin/               # กลุ่มหน้า admin และ dashboard
│   │   ├── layout.tsx               # Root layout ของแอป
│   │   ├── client-layout.tsx        # Client wrapper สำหรับส่วนที่ต้องรันฝั่ง browser
│   │   ├── globals.css              # Global styles
│   │   └── page.tsx                 # หน้า root
│   │
│   ├── components/                  # UI components แยกตามโดเมนงาน
│   │   ├── users/                   # ตาราง/ฟอร์ม/โมดัลจัดการผู้ใช้
│   │   ├── vehicles/                # ตาราง/ฟอร์ม/โมดัลจัดการรถ
│   │   ├── products/                # ตาราง/ฟอร์ม/โมดัลจัดการสินค้า
│   │   ├── count/                   # UI สำหรับ flow การนับ (bag/box/upload/tabs)
│   │   ├── image-upload/            # โมดัลอัปโหลดรูป + แสดงผล AI detection
│   │   ├── sidebar/                 # Sidebar ฝั่ง admin
│   │   ├── Nav/                     # Navigation component
│   │   ├── ui/                      # UI base component เช่น chart/card
│   │   └── ...                      # ส่วน reusable อื่นๆ
│   │
│   ├── hooks/                       # Custom hooks สำหรับเรียกข้อมูลแต่ละโมดูล
│   │   ├── useUsers.ts
│   │   ├── useVehicles.ts
│   │   ├── useProducts.ts
│   │   ├── useDashboardSummary.ts
│   │   └── useCount.ts
│   │
│   ├── utils/                       # ฟังก์ชันช่วยเหลือ, API layer และ types
│   │   ├── api-client.ts            # Axios client กลางของระบบ
│   │   ├── config.ts                # อ่านค่า env/config กลาง
│   │   ├── types.ts                 # Shared types
│   │   ├── login/                   # logic/auth/api/form ของ login
│   │   ├── register/                # logic/api/validation ของ register
│   │   ├── admin/                   # API helper สำหรับ admin (users/products/vehicles/dashboard)
│   │   ├── count/                   # API helper สำหรับงาน count
│   │   ├── ai/                      # API helper สำหรับ AI integration
│   │   └── diagnostics/             # utility สำหรับตรวจสอบระบบ (เช่น MinIO)
│   │
│   ├── i18n/                        # ระบบภาษาและ dictionary
│   │   ├── en/common.json           # ข้อความภาษาอังกฤษ
│   │   ├── th/common.json           # ข้อความภาษาไทย
│   │   ├── settings.ts              # ค่าพื้นฐาน locale
│   │   ├── request.ts               # request config สำหรับ i18n
│   │   └── dictionaries.ts          # ตัวช่วยโหลด dictionary
│   │
│   ├── providers/                   # Global providers
│   │   └── ReactQueryProvider.tsx   # React Query provider
│   │
│   ├── store/
│   │   └── user-store.ts            # Zustand store ฝั่งผู้ใช้
│   │
│   └── middleware.ts                # Middleware ของ Next.js (เช่น locale/auth guard)
│
├── public/                          # Static assets
│   ├── images/                      # รูปภาพที่ใช้ในระบบ
│   └── *.svg, *.png                 # ไฟล์ static อื่นๆ
│
├── docs/                            # เอกสารประกอบโครงการ
│   ├── README.md                    # สารบัญเอกสาร
│   ├── BACKEND_API_REQUIREMENTS.md  # สัญญา API ที่ frontend คาดหวัง
│   ├── AI_INTEGRATION_README.md     # คู่มือเชื่อม AI
│   ├── IMAGE_UPLOAD_README.md       # รายละเอียด flow อัปโหลดรูป
│   ├── MINIO_TROUBLESHOOTING.md     # แนวทางแก้ปัญหา MinIO
│   └── TASK.md                      # บันทึกงาน/หมายเหตุ
│
├── check-minio.js                   # สคริปต์ตรวจสอบการเชื่อมต่อ MinIO
├── next.config.ts                   # การตั้งค่า Next.js
├── eslint.config.mjs                # การตั้งค่า ESLint
├── postcss.config.mjs               # การตั้งค่า PostCSS/Tailwind
├── tsconfig.json                    # การตั้งค่า TypeScript
├── package.json                     # dependencies และ scripts
├── .env.example                     # ตัวอย่าง environment variables
└── README.md                        # เอกสารนี้
```

## Routing Overview

โครงสร้าง route หลักภายใต้ `src/app/[locale]`:

- `(auth)`
  - `/[locale]/login`
  - `/[locale]/register`
- `(user)`
  - `/[locale]/home`
  - `/[locale]/count`
- `admin`
  - `/[locale]/admin`
  - `/[locale]/admin/dashboard`
  - `/[locale]/admin/Users`
  - `/[locale]/admin/Products`
  - `/[locale]/admin/VehicleInfo`
  - `/[locale]/admin/EmployeeInfo`
  - `/[locale]/admin/SugarBagsInfo`
  - `/[locale]/admin/SugarBoxsInfo`

## Environment Variables

คัดลอกไฟล์ตัวอย่างก่อน:

```bash
cp .env.example .env
```

ค่าที่ใช้งานบ่อย:

- `NEXT_PUBLIC_API_URL` URL ของ backend API
- `NEXT_PUBLIC_DEFAULT_LOCALE` ภาษาเริ่มต้นของระบบ
- `NEXT_PUBLIC_AUTH_TOKEN_KEY` key สำหรับ token ใน client
- `NEXT_PUBLIC_ENABLE_ADMIN_PANEL` เปิด/ปิดเมนู admin

## การรันโปรเจกต์

```bash
npm install
npm run dev
```

เปิดที่ `http://localhost:3000`

## Scripts

- `npm run dev` รันโหมดพัฒนา
- `npm run build` build production
- `npm run start` รัน production server
- `npm run lint` ตรวจ lint

## เอกสารเพิ่มเติม

- [Documentation Index](./docs/README.md)
- [Backend API Requirements](./docs/BACKEND_API_REQUIREMENTS.md)
- [AI Integration Guide](./docs/AI_INTEGRATION_README.md)
- [Image Upload Guide](./docs/IMAGE_UPLOAD_README.md)
- [MinIO Troubleshooting](./docs/MINIO_TROUBLESHOOTING.md)
