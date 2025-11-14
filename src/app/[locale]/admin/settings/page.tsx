import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/settings";

interface AdminSettingsProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AdminSettings({ params }: AdminSettingsProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">{dict.dashboard.sidebar.settings}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Admin settings page - coming soon</p>
      </div>
    </main>
  );
}
