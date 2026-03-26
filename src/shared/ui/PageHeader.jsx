import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Consistent page header with title, subtitle, back button, and action slot.
 */
export default function PageHeader({ title, subtitle, backTo, actions, children, className = "" }) {
  const navigate = useNavigate();

  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          {backTo && (
            <button
              onClick={() => (typeof backTo === "string" ? navigate(backTo) : navigate(-1))}
              className="mt-1 p-2 hover:bg-gray-100 rounded-xl transition flex-shrink-0 w-auto"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            {children}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
