import { forwardRef } from "react";

/**
 * Standardized button component.
 *
 * variant: "primary" | "secondary" | "danger" | "ghost" | "outline"
 * size: "sm" | "md" | "lg"
 */
const VARIANTS = {
  primary: "bg-[#004e93] hover:bg-[#073e73] text-white shadow-sm hover:shadow",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
  outline: "bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50",
  accent: "bg-[#ff6a00] hover:bg-[#cc4c02] text-white shadow-sm hover:shadow",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-sm gap-2",
};

const Button = forwardRef(({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-150 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        w-auto
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
