import Link from "next/link";
import { LogIn } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { i18nSettings, Locale } from "@/i18n/settings";

export default async function HomePage({
  params,
}: {
  params?: { locale?: Locale };
}) {
  const locale =
    params?.locale && i18nSettings.locales.includes(params.locale)
      ? params.locale
      : i18nSettings.defaultLocale;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      {/* Fullscreen Banner */}
      <div
        className="relative w-full h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/Logistic.png')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4 sm:px-8 -translate-y-20">
          <h2 className="text-white text-3xl sm:text-5xl font-extrabold mb-3 leading-tight drop-shadow-md">
            {t("title")}
          </h2>
          <p className="text-gray-200 mb-8 text-base sm:text-lg font-light drop-shadow">
            {t("description")}
          </p>

          <Link
            href={`/${locale}/count`}
            className={`flex items-center gap-3 text-white font-bold px-12 py-5 rounded-full shadow-2xl
              bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
              hover:from-blue-400 hover:via-blue-500 hover:to-blue-600
              transform transition duration-300 ease-in-out hover:scale-105
              focus:outline-none focus:ring-4 focus:ring-blue-300`}
          >
            <LogIn className="w-6 h-6" />
            {t("startButton")}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-5 flex flex-col items-center bg-white border-t border-gray-200 mt-0">
        <p className="font-medium text-gray-700 mb-3 text-sm">{t("footer")}</p>
      </footer>
    </div>
  );
}
