import { ReactNode } from "react";
import Nav from "@/components/Nav/Nav";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <div className="min-h-screen min-w-screen flex flex-col">{children}</div>
    </>
  );
}
