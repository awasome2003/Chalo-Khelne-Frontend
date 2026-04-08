/**
 * Standardized badge/pill component.
 *
 * variant: "live" | "completed" | "upcoming" | "pending" | "cancelled" | "info" | "accent" | "sport"
 * size: "xs" | "sm" | "md"
 * dot: boolean — show animated dot (for LIVE)
 */

const VARIANTS = {
  live: "bg-red-50 text-red-600 border-red-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  upcoming: "bg-blue-50 text-blue-600 border-blue-200",
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
  info: "bg-gray-100 text-gray-600 border-gray-200",
  accent: "bg-amber-50 text-amber-700 border-amber-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  primary: "bg-orange-50 text-orange-700 border-orange-200",
  secondary: "bg-emerald-50 text-emerald-700 border-emerald-200",
  sport: "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-sm",
};

const SIZES = {
  xs: "text-[10px] px-1.5 py-0.5",
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export default function Badge({
  variant = "info",
  size = "sm",
  dot = false,
  children,
  className = "",
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-bold rounded-full border
        ${VARIANTS[variant] || VARIANTS.info}
        ${SIZES[size] || SIZES.sm}
        ${className}
      `}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-40" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}

/**
 * Helper: get badge variant from match status string.
 */
Badge.fromStatus = function BadgeFromStatus({ status, ...props }) {
  const s = (status || "").toUpperCase().replace(/_/g, " ");
  let variant = "info";
  let label = s;

  if (s.includes("PROGRESS") || s === "LIVE") { variant = "live"; label = "LIVE"; }
  else if (s === "COMPLETED") { variant = "completed"; }
  else if (s === "SCHEDULED" || s === "UPCOMING") { variant = "upcoming"; }
  else if (s === "PENDING") { variant = "pending"; }
  else if (s === "CANCELLED") { variant = "cancelled"; }

  return (
    <Badge variant={variant} dot={variant === "live"} {...props}>
      {label}
    </Badge>
  );
};
