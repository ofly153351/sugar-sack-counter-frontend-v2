import { Suspense } from "react";
import CountClient from "./CountClient";

export default function CountPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CountClient />
    </Suspense>
  );
}
