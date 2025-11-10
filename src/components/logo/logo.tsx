import * as React from "react";

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
  return (
    <div className={`inline-block ${className}`}>
      <img
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
        }}
        src="/images/mitrphol-logo.png"
        alt="Mitr Phol Logo"
      />
    </div>
  );
};

export default Logo;
