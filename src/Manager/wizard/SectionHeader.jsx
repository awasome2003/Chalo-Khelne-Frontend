import React from "react";

export default function SectionHeader({ icon, title, right, className = "" }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-500 flex-shrink-0">{icon}</span>}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
