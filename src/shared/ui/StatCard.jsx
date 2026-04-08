import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * Stat display card used in dashboards and overviews.
 *
 * Props:
 * - label: description text below value
 * - value: the number/text to display
 * - icon: Lucide icon component
 * - trend: percentage change (positive = green, negative = red)
 * - color: "blue" | "green" | "red" | "orange" | "purple" | "gray" | "indigo"
 * - variant: "default" | "compact" — compact is for inline stat rows
 */
export default function StatCard({ label, value, icon: Icon, trend, color = "blue", variant = "default", className = "" }) {
  const COLORS = {
    primary: { bg: "bg-orange-50",   icon: "text-orange-600",  value: "text-orange-700",  ring: "ring-orange-100" },
    secondary:{ bg: "bg-emerald-50", icon: "text-emerald-600", value: "text-emerald-700", ring: "ring-emerald-100" },
    accent: { bg: "bg-amber-50",     icon: "text-amber-600",   value: "text-amber-700",   ring: "ring-amber-100" },
    blue:   { bg: "bg-blue-50",      icon: "text-blue-600",    value: "text-blue-700",    ring: "ring-blue-100" },
    green:  { bg: "bg-emerald-50",   icon: "text-emerald-600", value: "text-emerald-700", ring: "ring-emerald-100" },
    red:    { bg: "bg-red-50",       icon: "text-red-500",     value: "text-red-600",     ring: "ring-red-100" },
    orange: { bg: "bg-orange-50",    icon: "text-orange-600",  value: "text-orange-700",  ring: "ring-orange-100" },
    purple: { bg: "bg-purple-50",    icon: "text-purple-600",  value: "text-purple-700",  ring: "ring-purple-100" },
    gray:   { bg: "bg-gray-50",      icon: "text-gray-600",    value: "text-gray-700",    ring: "ring-gray-100" },
    indigo: { bg: "bg-indigo-50",    icon: "text-indigo-600",  value: "text-indigo-700",  ring: "ring-indigo-100" },
  };

  const c = COLORS[color] || COLORS.blue;

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {Icon && (
          <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center ring-1 ${c.ring}`}>
            <Icon className={`w-4 h-4 ${c.icon}`} />
          </div>
        )}
        <div>
          <div className={`text-lg font-black ${c.value} leading-none`}>{value}</div>
          <div className="text-[11px] text-gray-400 font-medium mt-0.5">{label}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center ring-1 ${c.ring}`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        )}
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${trend > 0 ? "text-emerald-600 bg-emerald-50" : trend < 0 ? "text-red-500 bg-red-50" : "text-gray-400 bg-gray-50"}`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
            {trend > 0 ? "+" : ""}{trend}%
          </div>
        )}
      </div>
      <div className={`text-3xl font-black ${c.value} leading-none mb-1.5`}>{value}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  );
}
