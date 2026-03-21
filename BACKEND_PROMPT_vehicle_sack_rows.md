# Backend Requirement: เก็บค่า “กรอกกระสอบแต่ละแถว” ของรถ

ต้องการเพิ่มฝั่ง Backend สำหรับเก็บ **config กระสอบต่อแถวของรถ** เพื่อให้ Frontend เรียกใช้งานได้จาก API โดยไม่พึ่ง localStorage

> หมายเหตุสำคัญ: ในระบบมีการใช้คำทั้ง `sack` และ `bag` ปะปนกัน  
> ฝั่ง Backend ต้องรองรับได้ทั้ง 2 คำ โดยถือว่าเป็นความหมายเดียวกัน

---

## 1) เป้าหมาย

- ย้ายข้อมูล `sackRows`/`bagRows` จากการเก็บฝั่ง FE มาเก็บใน DB
- รองรับการสร้าง/แก้ไข/อ่านข้อมูลแถวกระสอบต่อรถ
- ให้ API รถ (`/vehicles`) คืนข้อมูลนี้กลับมาด้วย

---

## 2) โครงสร้าง DB (แนะนำ)

> ใช้ตารางแยก เพื่อ query/validate ง่ายกว่าการเก็บ JSON

### Table: `vehicle_sack_row_configs`

| column     | type        | note |
|------------|-------------|------|
| id         | uuid (PK)   | default gen_random_uuid() |
| vehicle_id | uuid (FK)   | อ้างถึง `vehicles.id`, on delete cascade |
| row_number | int         | ลำดับแถว (เริ่มที่ 1) |
| sack_count | int         | จำนวนกระสอบของแถวนั้น |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | auto update |

### Constraints

- `UNIQUE(vehicle_id, row_number)`
- `CHECK(row_number > 0)`
- `CHECK(sack_count >= 0)`

---

## 3) Prisma model (ตัวอย่าง)

```prisma
model VehicleSackRowConfig {
  id        String   @id @default(uuid())
  vehicleId String   @map("vehicle_id")
  rowNumber Int      @map("row_number")
  sackCount Int      @map("sack_count")

  vehicle   Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([vehicleId, rowNumber])
  @@map("vehicle_sack_row_configs")
}
```

และเพิ่ม relation ใน `Vehicle`:

```prisma
model Vehicle {
  id               String                 @id @default(uuid())
  vehicleCode      String                 @unique @map("vehicle_code")
  licensePlate     String                 @unique @map("license_plate")
  vehicleTypeId    String                 @map("vehicle_type_id")
  maxLoadWeightTon Float                  @map("max_load_weight_ton")
  // ...

  sackRowConfigs   VehicleSackRowConfig[]
}
```

---

## 4) API Contract ที่ต้องเพิ่ม/ปรับ

## `POST /vehicles`

รับ field เพิ่ม:
- `sackRows` (optional) เป็น array ของแถว
- `bagRows` (optional) เป็น alias ของ `sackRows`

ตัวอย่าง request:

```json
{
  "vehicleCode": "VH001",
  "licensePlate": "กข1234",
  "vehicleTypeId": "uuid-string",
  "maxLoadWeightTon": 30,
  "driverUserId": "uuid-string",
  "status": "active",
  "sackRows": [
    { "rowNumber": 1, "sackCount": 20 },
    { "rowNumber": 2, "sackCount": 18 }
  ]
}
```

หรือส่งแบบ alias:

```json
{
  "vehicleCode": "VH001",
  "licensePlate": "กข1234",
  "vehicleTypeId": "uuid-string",
  "maxLoadWeightTon": 30,
  "driverUserId": "uuid-string",
  "status": "active",
  "bagRows": [
    { "rowNumber": 1, "bagCount": 20 },
    { "rowNumber": 2, "bagCount": 18 }
  ]
}
```

## `PATCH /vehicles/:id`

อัปเดตได้:
- `maxLoadWeightTon`
- `sackRows`
- `bagRows` (alias)

ตัวอย่าง:

```json
{
  "maxLoadWeightTon": 35,
  "sackRows": [
    { "rowNumber": 1, "sackCount": 22 },
    { "rowNumber": 2, "sackCount": 19 },
    { "rowNumber": 3, "sackCount": 17 }
  ]
}
```

## `GET /vehicles`, `GET /vehicles/:id`, `GET /vehicles/active`, etc.

ให้คืน:
- `maxLoadWeightTon`
- `sackRows` (sort by `rowNumber` asc)
- `bagRows` (optional alias ของ `sackRows` ถ้าต้องการ backward compatibility)
- `totalSacks` (sum ของ `sackCount`) [optional แต่แนะนำให้คืน]

ตัวอย่าง response:

```json
{
  "id": "uuid-string",
  "vehicleCode": "VH001",
  "licensePlate": "กข1234",
  "vehicleTypeId": "uuid-string",
  "maxLoadWeightTon": 30,
  "vehicleType": {
    "id": "uuid-string",
    "name": "รถบรรทุก 10 ล้อ"
  },
  "sackRows": [
    { "rowNumber": 1, "sackCount": 20 },
    { "rowNumber": 2, "sackCount": 18 }
  ],
  "totalSacks": 38
}
```

---

## 5) Logic ที่ต้องทำใน Service Layer

เวลา `POST/PATCH`:

1. normalize payload:
   - ถ้ามี `bagRows` ให้ map เป็น `sackRows`
   - ถ้า item เป็น `bagCount` ให้ map เป็น `sackCount`
2. validate `sackRows`:
   - ต้องเป็น array
   - `rowNumber` > 0, integer
   - `sackCount` >= 0, integer
   - ห้าม `rowNumber` ซ้ำ
3. ใช้ transaction:
   - ถ้า update: ลบ config เดิมของ vehicle
   - insert ชุดใหม่
4. response คืน `sackRows` ล่าสุด + `totalSacks`
   - (optional) เพิ่ม `bagRows` alias เพื่อให้ FE เก่าทำงานต่อได้

---

## 6) Validation / Error Handling

- `400 Bad Request`:
  - `sackRows` format ไม่ถูก
  - rowNumber ซ้ำ
  - ค่าติดลบ
- `404`:
  - vehicle ไม่พบตอน PATCH
- `409`:
  - conflict จาก unique constraint (ถ้ามี race condition)

---

## 7) Migration Plan

1. สร้างตาราง `vehicle_sack_row_configs`
2. deploy backend รองรับ field ใหม่
3. FE เริ่มส่ง/อ่าน `sackRows` จาก API
4. เลิกพึ่ง localStorage ในส่วนนี้

---

## 8) หมายเหตุ

- ข้อมูล `sackRows`/`bagRows` นี้เป็น **ค่า config ของรถ**
- ไม่ใช่ผลนับจริงของ session (ผลนับจริงยังเก็บในตาราง counting rows ตามเดิม)
