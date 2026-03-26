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
      className={`
        w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative
        ${collapsed ? "justify-center px-3 py-3" : "px-3 py-2.5"}
        ${isActive
          ? "bg-[#004E93] text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
      `}
    >
      <div className={`flex-shrink-0 ${collapsed ? "" : "w-5"} flex items-center justify-center`}>
        <Icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}`} />
      </div>

      {/* Label — hidden when collapsed */}
      <span
        className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
          collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
        }`}
      >
        {item.label}
      </span>

      {/* Badge */}
      {item.badge === "live" && (
        <span className={`flex-shrink-0 ${collapsed ? "absolute top-1 right-1" : "ml-auto"}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        </span>
      )}

      {/* Hover label when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
          {item.label}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </button>
  );
}
