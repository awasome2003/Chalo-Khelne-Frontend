import React from "react";

export default function Card({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`bg-white border border-neutral-200 rounded-2xl p-6 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
