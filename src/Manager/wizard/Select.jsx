import React from "react";
import { ChevronDown } from "lucide-react";

export default function Select({
  id,
  value,
  onChange,
  options = [],
  placeholder,
  error,
  disabled,
  className = "",
  ...rest
}) {
  const errorClass = error
    ? "border-red-200 border-l-4 border-l-red-500 bg-red-50/30"
    : "border-gray-200 bg-white";

  return (
    <div>
      <div className="relative">
        <select
          id={id}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          className={`w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border ${errorClass} text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-[border-color,background-color,border-left-width] duration-100 ease-out disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const v = typeof opt === "object" ? opt.value : opt;
            const l = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={String(v)} value={v}>
                {l}
              </option>
            );
          })}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
