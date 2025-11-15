# 🚀 คู่มือการติดตั้ง Sugar Sack Counter Frontend

## 📋 สิ่งที่ต้องติดตั้งก่อนเริ่มต้น
ก่อนเริ่มต้น ตรวจสอบให้แน่ใจว่าคุณติดตั้งสิ่งต่อไปนี้แล้ว:
- **Git** - สำหรับการควบคุมเวอร์ชัน
- **Node.js** (v18 หรือสูงกว่า) - สำหรับรัน frontend
- **Docker Desktop** - สำหรับรัน backend services
- **Git Bash** (Windows) หรือ Terminal (Mac/Linux)

---

## 🎯 การติดตั้ง Frontend

### ขั้นตอนที่ 1: Clone และตั้งค่า Repository
```bash
# Clone repository (ถ้ายังไม่ได้ทำ)
git clone <repository-url>
cd sugar-sack-counter-frontend-v2

# เปลี่ยนไปยัง branch development
git checkout fix-nune/dev
```

### ขั้นตอนที่ 2: การตั้งค่า Environment
```bash
# คัดลอกไฟล์ environment template
cp .env.example .env

# ติดตั้ง dependencies
npm install
```

### ขั้นตอนที่ 3: เริ่ม Development Server
```bash
# เริ่ม development server
npm run dev
```

Frontend จะพร้อมใช้งานที่: **http://localhost:3000**

---

## 🔧 การติดตั้ง Backend

### ขั้นตอนที่ 1: Clone Backend Repository
```bash
# Clone backend repository
git clone https://github.com/ofly153351/sugar-sack-counter-backend
cd sugar-sack-counter-backend

# เปลี่ยนไปยัง branch implementation
git checkout fix-of/imprement
```

### ขั้นตอนที่ 2: การตั้งค่า Environment
```bash
# คัดลอกไฟล์ environment template
cp .env.example .env

# ติดตั้ง dependencies
npm install
```

### ขั้นตอนที่ 3: เริ่ม Backend Services ด้วย Docker
```bash
# Build และเริ่ม services ทั้งหมดในโหมด detached
docker compose up -d --build
```

สิ่งนี้จะเริ่ม:
- **API Server** - Backend API หลัก
- **Database** - ฐานข้อมูล PostgreSQL
- **Redis** - Cache และ session storage

---

## ✅ การตรวจสอบ

### การตรวจสอบ Frontend
- เปิดเบราว์เซอร์และไปที่ **http://localhost:3000**
- คุณควรเห็นแอปพลิเคชัน Sugar Sack Counter

### การตรวจสอบ Backend
- ตรวจสอบว่า Docker containers กำลังทำงาน:
  ```bash
  docker ps
  ```
- คุณควรเห็น containers สำหรับ API, database, และ Redis

---

## 🛠️ การแก้ไขปัญหา

### ปัญหาทั่วไป

**พอร์ตถูกใช้งานอยู่แล้ว**
```bash
# หยุดกระบวนการที่ใช้พอร์ต 3000
npx kill-port 3000
```

**ปัญหา Docker**
```bash
# รีสตาร์ท Docker Desktop
# จากนั้น rebuild containers
docker compose down
docker compose up -d --build
```

**ปัญหา Node Modules**
```bash
# ล้าง node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

**ปัญหาไฟล์ Environment**
- ตรวจสอบให้แน่ใจว่าไฟล์ `.env` มีอยู่ในทั้งโฟลเดอร์ frontend และ backend
- ตรวจสอบว่าตั้งค่า environment variables ที่จำเป็นทั้งหมดแล้ว

---

## 📁 โครงสร้างโปรเจค
```
sugar-sack-counter-frontend-v2/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── i18n/               # Internationalization
│   └── store/              # State management
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

---

## 🎮 คำสั่งที่ใช้งานได้

### Frontend
```bash
npm run dev          # เริ่ม development server
npm run build        # Build สำหรับ production
npm run start        # เริ่ม production server
npm run lint         # รัน ESLint
```

### Backend (ผ่าน Docker)
```bash
docker compose up -d          # เริ่ม services
docker compose down           # หยุด services
docker compose logs -f        # ดู logs
docker compose restart        # รีสตาร์ท services
```

---

## 📞 การสนับสนุน

หากคุณพบปัญหาใดๆ:
1. ตรวจสอบส่วนการแก้ไขปัญหาด้านบน
2. ตรวจสอบว่าติดตั้ง prerequisites ทั้งหมดแล้ว
3. ตรวจสอบว่า frontend และ backend กำลังทำงานทั้งคู่
4. ตรวจสอบ console สำหรับข้อความผิดพลาด

---

## 🎉 สำเร็จ!
เมื่อทั้ง frontend และ backend ทำงานแล้ว คุณพร้อมที่จะพัฒนาแล้ว! 🚀

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:8000 (โดยทั่วไป)