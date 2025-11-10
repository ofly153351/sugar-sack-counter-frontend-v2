import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-gray-800 text-white p-4">Admin Panel</nav>
      <div className="p-6">{children}</div>
    </div>
  );
}
