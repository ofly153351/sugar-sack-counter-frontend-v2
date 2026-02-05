import { ReactNode } from "react";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import Nav from "@/components/Nav/Nav";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/settings";

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  // Note: Authentication and admin role checking is handled by middleware
  // Middleware will redirect to login if user is not authenticated or not admin

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1 flex">
        <AdminSidebar dict={dict} />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
