/**
 * Design tokens — single source of truth for the entire app.
 * Import where needed. No magic numbers in components.
 *
 * Palette derived from the CK logo:
 *   Orange ring → PRIMARY
 *   Green K     → SECONDARY
 *   Cream lines → ACCENT (gold)
 */

// Primary — Orange (from CK logo ring)
export const PRIMARY = {
  50: "#FFF7ED",
  100: "#FFEDD5",
  200: "#FED7AA",
  300: "#FDBA74",
  400: "#FB923C",
  500: "#F97316",
  600: "#EA580C",
  700: "#C2410C",
  800: "#9A3412",
  900: "#7C2D12",
  950: "#431407",
};

// Secondary — Teal/Green (from CK logo K)
export const SECONDARY = {
  50: "#EFFEFA",
  100: "#C7FBE8",
  200: "#90F5D3",
  300: "#52E5B8",
  400: "#21CC9A",
  500: "#0EA572",
  600: "#07875E",
  700: "#066B4D",
  800: "#08553F",
  900: "#084636",
  950: "#03281F",
};

// Accent — Warm Gold (from CK logo cream highlights)
export const ACCENT = {
  50: "#FFFDF7",
  100: "#FEF9E7",
  200: "#FDF0C3",
  300: "#FCE38A",
  400: "#FAD352",
  500: "#F5C31C",
  600: "#DCA30F",
  700: "#B77D0B",
  800: "#946210",
  900: "#7A5114",
  950: "#462B07",
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

export default { PRIMARY, SECONDARY, ACCENT, STATUS, SPACING, SHADOW };
