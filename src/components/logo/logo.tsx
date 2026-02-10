"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface LogoProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  width = 96,
  height = 96,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const pathname = usePathname();

  const getHomeHref = () => {
    const segments = pathname.split("/");
    const locale = segments[1];
    if (locale === "en" || locale === "th") {
      return `/${locale}/home`;
    }
    return "/th/home";
  };

  const homeHref = getHomeHref();

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <Link href={homeHref} aria-label="Home">
        <div
          className={`inline-flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
          style={{
            width: typeof width === "number" ? `${width}px` : width,
            height: typeof height === "number" ? `${height}px` : height,
          }}
        >
          <svg
            width={typeof width === "number" ? width - 20 : 76}
            height={typeof height === "number" ? height - 20 : 76}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" rx="10" fill="#1E40AF" />
            <circle cx="50" cy="40" r="15" fill="white" />
            <rect x="35" y="60" width="30" height="10" rx="5" fill="white" />
            <text
              x="50"
              y="90"
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              MP
            </text>
          </svg>
        </div>
      </Link>
    );
  }

  return (
    <Link href={homeHref} aria-label="Home">
      <div className={`inline-block ${className}`}>
        <Image
          src="/images/mitrphol-logo.png"
          alt="Mitr Phol Logo"
          width={typeof width === "number" ? width : 96}
          height={typeof height === "number" ? height : 96}
          style={{
            width: typeof width === "number" ? `${width}px` : width,
            height: typeof height === "number" ? `${height}px` : height,
          }}
          onError={handleImageError}
          priority
        />
      </div>
    </Link>
  );
};

export default Logo;
