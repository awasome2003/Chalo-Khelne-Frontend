import { useLocation, useNavigate } from "react-router-dom";

export default function SidebarItem({ item, collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const Icon = item.icon;

  const isActive =
    location.pathname === item.path ||
    location.pathname.startsWith(item.path + "/") ||
    (item.path === "/mtournament-management" && location.pathname.startsWith("/tournaments"));

  return (
    <button
      onClick={() => navigate(item.path)}
      title={collapsed ? item.label : undefined}
      className={`
        w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative
        ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
        ${isActive
          ? "text-white shadow-md"
          : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
        }
      `}
      style={isActive ? { background: "linear-gradient(to right, #F97316, #EA580C)", boxShadow: "0 4px 6px -1px rgba(249,115,22,0.2)" } : undefined}
    >
      {/* Green accent bar on active */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ backgroundColor: "#0EA572" }} />
      )}

      <div className={`flex-shrink-0 ${collapsed ? "" : "w-5"} flex items-center justify-center`}>
        <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-700"}`} />
      </div>

      {!collapsed && (
        <span className="text-[13px] font-semibold whitespace-nowrap truncate">
          {item.label}
        </span>
      )}

      {/* Live badge */}
      {item.badge === "live" && (
        <span className={`flex-shrink-0 ${collapsed ? "absolute -top-0.5 -right-0.5" : "ml-auto"}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        </span>
      )}
    </button>
  );
}
