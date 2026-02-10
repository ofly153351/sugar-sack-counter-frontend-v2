import Link from "next/link";
import { i18nSettings } from "../i18n/settings";

export default function RootNotFound() {
  const locale = i18nSettings.defaultLocale;

  return (
    <main style={{ padding: "48px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
        Page not found
      </h1>
      <p style={{ marginBottom: "24px" }}>
        The page you requested does not exist.
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
        Go to home
      </Link>
    </main>
  );
}
