import React from "react";
import { ChevronDown } from "lucide-react";

const SIG = "#5E6AD2";
const SIG_TINT = "rgba(94,106,210,0.15)";

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
    ? "border-rose-300 bg-rose-50/40"
    : "border-neutral-200 bg-white hover:border-neutral-300";

  return (
    <div>
      <div className="relative">
        <select
          id={id}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          className={`w-full appearance-none h-9 px-3 pr-9 rounded-lg border ${errorClass} text-[13px] text-neutral-900 focus:outline-none focus:ring-2 transition disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed ${className}`}
          style={{
            "--tw-ring-color": error ? "rgba(244,63,94,0.18)" : SIG_TINT,
          }}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = SIG;
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "";
            rest.onBlur?.(e);
          }}
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
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}
