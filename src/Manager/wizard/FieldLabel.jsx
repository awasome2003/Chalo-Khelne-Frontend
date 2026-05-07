import React from "react";

export default function FieldLabel({ htmlFor, required, children, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1.5 ${className}`}
    >
      {children}
      {required && (
        <span className="text-rose-500 ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
