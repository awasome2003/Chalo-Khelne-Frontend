import { createContext, useContext } from "react";

/**
 * Brand color palette — derived from the Chalo Khelne (CK) logo.
 *
 * Logo colors:
 *  - Orange ring  → primary
 *  - Teal/Green K → secondary
 *  - Cream lines  → accent
 */
export const colors = {
  // ─── Primary (Orange) ────────────────────────────
  primary: {
    50: "#FFF7ED",
    100: "#FFEDD5",
    200: "#FED7AA",
    300: "#FDBA74",
    400: "#FB923C",
    500: "#F97316",   // ← logo orange
    600: "#EA580C",
    700: "#C2410C",
    800: "#9A3412",
    900: "#7C2D12",
    950: "#431407",
  },

  // ─── Secondary (Teal / Green) ────────────────────
  secondary: {
    50: "#EFFEFA",
    100: "#C7FBE8",
    200: "#90F5D3",
    300: "#52E5B8",
    400: "#21CC9A",
    500: "#0EA572",   // ← logo green
    600: "#07875E",
    700: "#066B4D",
    800: "#08553F",
    900: "#084636",
    950: "#03281F",
  },

  // ─── Accent (Warm Cream / Gold) ──────────────────
  accent: {
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
  },

  // ─── Neutrals ────────────────────────────────────
  neutral: {
    0: "#FFFFFF",
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
    950: "#030712",
  },

  // ─── Semantic ────────────────────────────────────
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // ─── Quick-access aliases ────────────────────────
  brand: "#F97316",
  brandDark: "#EA580C",
  brandGreen: "#0EA572",
  brandGreenDark: "#07875E",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
};

/**
 * CSS custom-property map — inject into :root via ThemeProvider
 * or reference directly in Tailwind config.
 */
export const cssVars = {
  "--color-primary": colors.primary[500],
  "--color-primary-light": colors.primary[100],
  "--color-primary-dark": colors.primary[700],
  "--color-secondary": colors.secondary[500],
  "--color-secondary-light": colors.secondary[100],
  "--color-secondary-dark": colors.secondary[700],
  "--color-accent": colors.accent[500],
  "--color-bg": colors.background,
  "--color-surface": colors.surface,
  "--color-text": colors.textPrimary,
  "--color-text-muted": colors.textSecondary,
  "--color-border": colors.border,
};

const ThemeContext = createContext(colors);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={colors}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
