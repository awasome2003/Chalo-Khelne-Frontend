import React from "react";

export default function Card({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={`bg-white border border-gray-100 shadow-sm rounded-2xl p-6 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
