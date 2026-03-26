/**
 * Stat display card used in dashboards and overviews.
 */
export default function StatCard({ label, value, icon: Icon, trend, color = "blue", className = "" }) {
  const COLORS = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", value: "text-blue-700" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600", value: "text-emerald-700" },
    red: { bg: "bg-red-50", icon: "text-red-600", value: "text-red-700" },
    orange: { bg: "bg-orange-50", icon: "text-orange-600", value: "text-orange-700" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", value: "text-purple-700" },
    gray: { bg: "bg-gray-50", icon: "text-gray-600", value: "text-gray-700" },
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", value: "text-indigo-700" },
  };

  const c = COLORS[color] || COLORS.blue;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        )}
        {trend && (
          <span className={`text-[11px] font-bold ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className={`text-3xl font-black ${c.value} leading-none mb-1`}>{value}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  );
}
