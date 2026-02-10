"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function LocaleNotFound() {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "th";

  return (
    <main style={{ padding: "48px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
        ไม่พบหน้าที่คุณต้องการ
      </h1>
      <p style={{ marginBottom: "24px" }}>
        หน้านี้ไม่มีอยู่หรือถูกย้ายไปแล้ว
      </p>
      <Link
        href={`/${locale}/home`}
        style={{
          display: "inline-block",
          padding: "10px 16px",
          borderRadius: "8px",
          background: "#111827",
          color: "#fff",
          textDecoration: "none",
        }}
      >
        กลับหน้าแรก
      </Link>
    </main>
  );
}
