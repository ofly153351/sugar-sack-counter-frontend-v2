import { Suspense } from "react";
import CountClient from "./CountClient";

interface CountPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CountPage({ searchParams }: CountPageProps) {
  const { tab } = await searchParams;
  const initialTab =
    tab === "bags" || tab === "boxes" ? tab : undefined;

  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CountClient initialTab={initialTab} />
    </Suspense>
  );
}
