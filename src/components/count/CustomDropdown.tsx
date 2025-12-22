"use client";

import { ChevronDown } from "lucide-react";
import { Option, CustomDropdownProps } from "@/utils/types";

export default function CustomDropdown({
  options,
  selected,
  setSelected,
  placeholder = "Select an option",
  disabled = false,
  suppressHydrationWarning = false,
}: CustomDropdownProps) {
  return (
    <div className="relative w-full">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
        suppressHydrationWarning={suppressHydrationWarning}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDown className="w-5 h-5" />
      </div>
    </div>
  );
}
