import { ReactNode } from "react";
import { i18nSettings, Locale } from "@/i18n/settings";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
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
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen min-w-screen flex flex-col">
        <main className="bg-[#F5F5F5] flex-1 flex flex-col">{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}
