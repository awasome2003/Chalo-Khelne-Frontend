import React from "react";

export default function SectionHeader({ icon, title, right, className = "" }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-neutral-500 flex-shrink-0">{icon}</span>}
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-900">
          {title}
        </h3>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
