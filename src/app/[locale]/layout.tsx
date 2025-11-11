import { ReactNode } from "react";
import { i18nSettings, Locale } from "@/i18n/settings";

export async function generateStaticParams() {
  return i18nSettings.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen  flex flex-col">
      <main className="bg-[#F5F5F5] flex-1 bg-[] flex flex-col justify-center items-center ">
        {children}
      </main>
    </div>
  );
}
