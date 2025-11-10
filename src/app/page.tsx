import { redirect } from "next/navigation";
import { i18nSettings } from "@/i18n/settings";

export default async function RootPage() {
  redirect(`/${i18nSettings.defaultLocale}/login`);
}
