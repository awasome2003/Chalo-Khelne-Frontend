import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Hash,
  CreditCard,
  Newspaper,
  Settings,
  Menu,
  X,
  ChevronRight,
  Gift,
  Briefcase,
} from "lucide-react";

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const navItems = [
    { to: "/mdashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/mtournament-management", icon: <Trophy size={20} />, label: "Tournament Management" },
    { to: "/staff-applications", icon: <Briefcase size={20} />, label: "Staff Applications" },
    { to: "/msocial", icon: <Hash size={20} />, label: "Social" },
    { to: "/mnews", icon: <Newspaper size={20} />, label: "News" },
    { to: "/payments", icon: <CreditCard size={20} />, label: "Payments" },
    { to: "/mcoupons", icon: <Gift size={20} />, label: "Coupons" },
    { to: "/msettings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <div
      className={`h-screen bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col z-50 ${collapsed ? "w-20" : "w-72"
        } border-r border-gray-100`}
    >
      {/* Header / Toggle */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-500 bg-clip-text text-transparent truncate">
            Manager
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-orange-500 transition-colors"
        >
          {collapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                ? "bg-orange-50 text-orange-500 shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-2 rounded-lg transition-all duration-300 ${isActive ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-transparent group-hover:bg-white"
                    }`}
                >
                  {item.icon}
                </div>

                {!collapsed && (
                  <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isActive ? "font-semibold" : ""}`}>
                    {item.label}
                  </span>
                )}

                {/* Active Indicator Strip (Right) */}
                {!collapsed && isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-orange-500" />
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 whitespace-nowrap shadow-xl z-50 border border-gray-700">
                    {item.label}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer (Optional user profile placeholder) */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "px-2"}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm shrink-0">
            M
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Manager Acct</p>
              <p className="text-xs text-gray-500 truncate">manager@sports.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
