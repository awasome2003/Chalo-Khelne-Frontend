import { ChevronRight } from "lucide-react";

/**
 * Section container with optional header, icon, and "View All" action.
 * Use as a wrapper for dashboard sections, tables, and list blocks.
 *
 * Props:
 * - title: section heading
 * - subtitle: optional secondary text
 * - icon: Lucide icon component
 * - iconColor: tailwind text color class (e.g. "text-orange-500")
 * - action: { label, onClick } — renders a "View All" style link
 * - noPadding: remove body padding (for tables)
 * - children: section content
 */
export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-gray-500",
  action,
  noPadding = false,
  className = "",
  children,
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden ${className}`}>
      {/* Header */}
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
            <div>
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
              {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition w-auto"
            >
              {action.label} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Body */}
      <div className={noPadding ? "" : "p-6"}>
        {children}
      </div>
    </div>
  );
}
