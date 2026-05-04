import React from "react";

export default function OptionCard({
  icon,
  title,
  description,
  selected,
  onClick,
  disabled,
  className = "",
}) {
  const stateClass = disabled
    ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
    : selected
      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-pressed={!!selected}
      disabled={disabled}
      className={`relative text-left rounded-xl border p-4 transition-colors duration-100 ${stateClass} ${className}`}
    >
      <div className="flex items-start gap-3">
        {icon && <span className="text-2xl flex-shrink-0 leading-none">{icon}</span>}
        <div className="min-w-0">
          <div
            className={`text-sm font-semibold ${disabled ? "text-gray-300" : "text-gray-900"}`}
          >
            {title}
          </div>
          {description && (
            <div
              className={`text-xs mt-1 ${disabled ? "text-gray-300" : "text-gray-500"}`}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
