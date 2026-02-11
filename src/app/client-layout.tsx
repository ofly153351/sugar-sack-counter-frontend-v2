"use client";

import { HeroUIProvider } from "@heroui/react";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { useEffect } from "react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
    }
  }, []);

  return (
    <HeroUIProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </HeroUIProvider>
  );
}
