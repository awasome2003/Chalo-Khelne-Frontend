import { useLocation, useNavigate } from "react-router-dom";

const SIG = "#5E6AD2";
const SIG_TINT = "rgba(94,106,210,0.08)";

export default function SidebarItem({ item, collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const Icon = item.icon;

  const isActive =
    location.pathname === item.path ||
    location.pathname.startsWith(item.path + "/") ||
    (item.path === "/mtournament-management" &&
      location.pathname.startsWith("/tournaments"));

  return (
    <button
      onClick={() => navigate(item.path)}
      title={collapsed ? item.label : undefined}
      className={`w-full relative flex items-center gap-2.5 h-8 rounded-md transition-colors group ${
        collapsed ? "px-0 justify-center" : "px-2"
      } ${
        isActive
          ? "text-neutral-950"
          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
      }`}
      style={isActive ? { backgroundColor: SIG_TINT } : undefined}
    >
      {isActive && !collapsed && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r"
          style={{ backgroundColor: SIG }}
        />
      )}

      <Icon
        className="w-4 h-4 flex-shrink-0"
        style={isActive ? { color: SIG } : undefined}
        strokeWidth={isActive ? 2.25 : 2}
      />

      {!collapsed && (
        <span
          className={`text-[13px] truncate ${
            isActive ? "font-semibold" : "font-medium"
          }`}
        >
          {item.label}
        </span>
      )}

      {item.badge === "live" && (
        <span
          className={`flex-shrink-0 ${
            collapsed ? "absolute top-1 right-1" : "ml-auto"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
        </span>
      )}

      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-2 px-2 py-1 bg-neutral-950 text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-50">
          {item.label}
        </span>
      )}
    </button>
  );
}
