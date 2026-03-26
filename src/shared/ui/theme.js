/**
 * Design tokens — single source of truth for the entire app.
 * Import where needed. No magic numbers in components.
 */

// Congress Blue palette
export const PRIMARY = {
  50: "#eff7ff",
  100: "#deeeff",
  200: "#b6ddff",
  300: "#76c2ff",
  400: "#2da5ff",
  500: "#028cf5",
  600: "#0071d2",
  700: "#0059aa",
  800: "#004e93",
  900: "#073e73",
  950: "#04274d",
};

// Blaze Orange palette
export const ACCENT = {
  50: "#fff8ec",
  100: "#ffefd3",
  200: "#ffdca5",
  300: "#ffc26d",
  400: "#ff9d32",
  500: "#ff800a",
  600: "#ff6a00",
  700: "#cc4c02",
  800: "#a13c0b",
  900: "#82330c",
  950: "#461704",
};

// Semantic colors
export const STATUS = {
  live: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", dot: "bg-red-500" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  upcoming: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", dot: "bg-blue-500" },
  pending: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-500" },
  cancelled: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200", dot: "bg-gray-400" },
};

// Spacing (8px grid)
export const SPACING = {
  page: "p-6 lg:p-8",
  section: "mb-8",
  card: "p-5",
  cardSm: "p-4",
  gap: "gap-6",
  gapSm: "gap-4",
};

// Shadows
export const SHADOW = {
  card: "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  cardHover: "shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
  dropdown: "shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
};

export default { PRIMARY, ACCENT, STATUS, SPACING, SHADOW };
