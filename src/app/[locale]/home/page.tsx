// src/app/[locale]/home/page.tsx
import { getDictionary } from "@/i18n/dictionaries";
import { i18nSettings, Locale } from "@/i18n/settings";
import { ReactNode } from "react";

// Wrapper component
function HomeWrapper({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="p-4 bg-gray-100">Home Page Layout</header>
      {children}
    </div>
  );
}

// Static params for /[locale]/home
export async function generateStaticParams() {
  return i18nSettings.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <HomeWrapper>
      <main>
        <h1>{dict["welcome"]}</h1>
        <p>{dict["logout"]}</p>
      </main>
    </HomeWrapper>
  );
}
