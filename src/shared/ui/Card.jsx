/**
 * Standardized card container.
 *
 * variant: "default" | "outlined" | "elevated" | "live" | "success"
 * padding: "none" | "sm" | "md" | "lg"
 */
const VARIANTS = {
  default: "bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  outlined: "bg-white border border-gray-200",
  elevated: "bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
  live: "bg-white border-2 border-red-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-red-100",
  success: "bg-white border border-emerald-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  ghost: "bg-transparent",
};

const PADDING = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  children,
  ...props
}) {
  return (
    <div
      className={`
        rounded-2xl overflow-hidden
        ${VARIANTS[variant] || VARIANTS.default}
        ${PADDING[padding] || PADDING.md}
        ${hover ? "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-gray-200 transition-all cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card header — use inside Card with padding="none"
 */
Card.Header = function CardHeader({ className = "", children }) {
  return (
    <div className={`px-5 py-3.5 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card body
 */
Card.Body = function CardBody({ className = "", children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

/**
 * Card footer
 */
Card.Footer = function CardFooter({ className = "", children }) {
  return (
    <div className={`px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 ${className}`}>
      {children}
    </div>
  );
};
