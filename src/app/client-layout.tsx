"use client";

import { HeroUIProvider } from "@heroui/react";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <HeroUIProvider>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </HeroUIProvider>
  );
}
