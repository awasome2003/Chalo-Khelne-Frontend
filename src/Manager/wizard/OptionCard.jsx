import React from "react";

const SIG = "#5E6AD2";

export default function OptionCard({
  icon,
  title,
  description,
  selected,
  onClick,
  disabled,
  className = "",
}) {
  const base = "relative text-left rounded-xl border p-3.5 transition";
  const stateClass = disabled
    ? "border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed"
    : selected
    ? "border-transparent ring-2"
    : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/60";

  const selectedStyle = selected && !disabled
    ? {
        backgroundColor: "rgba(94,106,210,0.06)",
        "--tw-ring-color": SIG,
      }
    : undefined;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-pressed={!!selected}
      disabled={disabled}
      className={`${base} ${stateClass} ${className}`}
      style={selectedStyle}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span className="text-xl flex-shrink-0 leading-none">{icon}</span>
        )}
        <div className="min-w-0">
          <div
            className={`text-[13px] font-semibold ${
              disabled ? "text-neutral-300" : "text-neutral-950"
            }`}
          >
            {title}
          </div>
          {description && (
            <div
              className={`text-[12px] mt-0.5 ${
                disabled ? "text-neutral-300" : "text-neutral-500"
              }`}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
