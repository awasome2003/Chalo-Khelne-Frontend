import React from "react";
import { Plus } from "lucide-react";

const SIG = "#5E6AD2";

export default function DashedAddButton({
  children,
  onClick,
  icon,
  className = "",
  disabled,
  tabIndex,
}) {
  const ic = icon === undefined ? <Plus className="w-3.5 h-3.5" /> : icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
      className={`w-full inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-dashed border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50/60 text-[13px] font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{ color: SIG }}
    >
      {ic}
      {children}
    </button>
  );
}
