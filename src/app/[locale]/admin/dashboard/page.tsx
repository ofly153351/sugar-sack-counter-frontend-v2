import DashboardClient from "./DashboardClient";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/settings";

interface AdminDashboardProps {
  params: { locale: Locale };
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <DashboardClient dict={dict} />;
}
