"use client";

import { Search } from "lucide-react";

interface AdminSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  label?: string;
  className?: string;
}

const mergeClassNames = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

export function AdminSearchInput({
  value,
  onValueChange,
  placeholder,
  label,
  className,
}: AdminSearchInputProps) {
  return (
    <div className={mergeClassNames("w-full max-w-md", className)}>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
