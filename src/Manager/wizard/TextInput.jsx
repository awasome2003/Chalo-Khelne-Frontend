import React from "react";

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
    ? "border-red-200 border-l-4 border-l-red-500 bg-red-50/30"
    : "border-gray-200 bg-white";

  return (
    <div>
      <input
        id={id}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error || undefined}
        className={`w-full px-4 py-2.5 rounded-xl border ${errorClass} text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-[border-color,background-color,border-left-width] duration-100 ease-out ${className}`}
        {...rest}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
