import React from "react";

const SIG = "#5E6AD2";
const SIG_TINT = "rgba(94,106,210,0.15)";

export default function TextInput({
  id,
  value,
  onChange,
  placeholder,
  error,
  className = "",
  type = "text",
  ...rest
}) {
  const errorClass = error
    ? "border-rose-300 bg-rose-50/40"
    : "border-neutral-200 bg-white hover:border-neutral-300";

  return (
    <div>
      <input
        id={id}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error || undefined}
        className={`w-full h-9 px-3 rounded-lg border ${errorClass} text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition ${className}`}
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
      />
      {error && (
        <p className="text-[11px] text-rose-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}
