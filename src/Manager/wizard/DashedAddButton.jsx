import React from "react";
import { Plus } from "lucide-react";

export default function DashedAddButton({
  children,
  onClick,
  icon,
  className = "",
  disabled,
  tabIndex,
}) {
  const ic = icon === undefined ? <Plus className="w-4 h-4" /> : icon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      tabIndex={tabIndex}
      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 hover:border-emerald-400 transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {ic}
      {children}
    </button>
  );
}
