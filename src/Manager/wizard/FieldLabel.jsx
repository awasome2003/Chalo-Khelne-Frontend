import React from "react";

export default function FieldLabel({ htmlFor, required, children, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
  );
}
