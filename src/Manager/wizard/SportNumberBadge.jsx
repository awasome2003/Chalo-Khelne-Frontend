import React from "react";

export default function SportNumberBadge({ index, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white text-xs font-semibold ${className}`}
    >
      {index}
    </span>
  );
}
