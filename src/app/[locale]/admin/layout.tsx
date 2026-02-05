import { ReactNode } from "react";
import AdminSidebar from "@/components/sidebar/AdminSidebar";
import Nav from "@/components/Nav/Nav";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/settings";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/count/count-api";

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

  // Check if user is authenticated and has admin role
  const currentUser = await getCurrentUser();
  console.log("🔍 AdminLayout: currentUser =", currentUser);

  // Check if user exists and has admin role
  if (!currentUser) {
    console.log("❌ AdminLayout: No current user found, redirecting to login");
    redirect(`/${locale}/login`);
  }

  console.log(
    "🔍 AdminLayout: User role =",
    currentUser.role,
    "Expected: admin"
  );
  if (currentUser.role !== "admin") {
    console.log("❌ AdminLayout: User is not admin, redirecting to login");
    redirect(`/${locale}/login`);
  }

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
