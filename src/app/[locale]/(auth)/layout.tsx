import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-fit">
        <div className="bg-white rounded-2xl  shadow-2xl p-8">{children}</div>
      </div>
    </div>
  );
}
