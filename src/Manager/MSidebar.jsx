import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Hash,
  CreditCard,
  Newspaper,
  Settings,
  Briefcase,
  Gift,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const SIG = "#5E6AD2";
const SIG_TINT = "rgba(94,106,210,0.08)";

const SECTIONS = [
  {
    label: "Navigate",
    items: [
      { to: "/mdashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/mtournament-management", icon: Trophy, label: "Tournaments" },
      { to: "/staff-applications", icon: Briefcase, label: "Staff applications" },
    ],
  },
  {
    label: "Engage",
    items: [
      { to: "/msocial", icon: Hash, label: "Social" },
      { to: "/mnews", icon: Newspaper, label: "News" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/payments", icon: CreditCard, label: "Payments" },
      { to: "/mcoupons", icon: Gift, label: "Coupons" },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/msettings", icon: Settings, label: "Settings" }],
  },
];

const Sidebar = ({ collapsed, toggleSidebar }) => {
  return (
    <aside
      className={`h-screen bg-white border-r border-neutral-200 flex flex-col transition-[width] duration-200 ease-out ${
        collapsed ? "w-14" : "w-[240px]"
      }`}
    >
      <div
        className={`h-12 border-b border-neutral-100 flex items-center ${
          collapsed ? "justify-center" : "justify-end px-2"
        }`}
      >
        <button
          onClick={toggleSidebar}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className={`px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400 transition-opacity ${
                collapsed ? "opacity-0 h-0 overflow-hidden mb-0" : "opacity-100"
              }`}
            >
              {section.label}
            </p>
            <div className="space-y-px">
              {section.items.map((item) => (
                <SidebarItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

function SidebarItem({ item, collapsed }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 h-8 rounded-md transition-colors group ${
          collapsed ? "px-0 justify-center" : "px-2"
        } ${
          isActive
            ? "text-neutral-950"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
        }`
      }
      style={({ isActive }) =>
        isActive ? { backgroundColor: SIG_TINT } : undefined
      }
    >
      {({ isActive }) => (
        <>
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
          <span
            className={`text-[13px] truncate transition-opacity ${
              isActive ? "font-semibold" : "font-medium"
            } ${collapsed ? "hidden" : "inline"}`}
          >
            {item.label}
          </span>

          {collapsed && (
            <span
              className="pointer-events-none absolute left-full ml-2 px-2 py-1 bg-neutral-950 text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-50"
            >
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default Sidebar;
