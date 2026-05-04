import React from "react";
import { Switch } from "@mui/material";

export default function ToggleCard({
  icon,
  title,
  description,
  checked,
  onChange,
  className = "",
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 bg-white rounded-xl border border-gray-200 ${className}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && <span className="text-emerald-500 flex-shrink-0">{icon}</span>}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>
      </div>
      <Switch
        checked={!!checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </div>
  );
}
