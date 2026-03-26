/**
 * Standardized progress bar.
 */
export default function ProgressBar({ value = 0, max = 100, label, sublabel, size = "md", className = "" }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const barColor =
    pct === 100 ? "bg-emerald-500" :
    pct > 66 ? "bg-blue-500" :
    pct > 33 ? "bg-amber-500" :
    "bg-orange-400";

  return (
    <div className={className}>
      {(label || sublabel) && (
        <div className="flex justify-between items-baseline mb-1.5">
          {label && <span className="text-sm font-semibold text-gray-700">{label}</span>}
          {sublabel && <span className="text-xs text-gray-400">{sublabel}</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{value} of {max}</span>
        <span className="font-bold">{pct}%</span>
      </div>
    </div>
  );
}
