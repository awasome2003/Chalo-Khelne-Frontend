import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Consistent page header with title, subtitle, back button, badge, and action slot.
 *
 * Props:
 * - title: page heading
 * - subtitle: optional secondary text
 * - backTo: string path or true (go back)
 * - actions: ReactNode — buttons for right side
 * - badge: ReactNode — status badge next to title
 * - children: extra content below title
 * - bordered: add bottom border (default false)
 */
export default function PageHeader({
  title,
  subtitle,
  backTo,
  actions,
  badge,
  bordered = false,
  children,
  className = "",
}) {
  const navigate = useNavigate();

  return (
    <div className={`mb-6 ${bordered ? "pb-6 border-b border-gray-100" : ""} ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {backTo && (
            <button
              onClick={() => (typeof backTo === "string" ? navigate(backTo) : navigate(-1))}
              className="mt-0.5 p-2 hover:bg-gray-100 rounded-xl transition flex-shrink-0 w-auto"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight truncate">{title}</h1>
              {badge}
            </div>
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
            {children}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
