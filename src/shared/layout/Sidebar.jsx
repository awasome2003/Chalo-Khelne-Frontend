import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeft, LogOut } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { getSidebarForRole } from "./sidebarConfig";
import SidebarSection from "./SidebarSection";

export default function Sidebar({ role = "manager", mobileOpen = false, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const sections = getSidebarForRole(role);
  const isExpanded = !collapsed || hoverExpanded;

  const handleLogout = () => { logout(); navigate("/login"); };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${isExpanded ? "px-5" : "px-3 justify-center"} py-5 border-b border-gray-200`}>
        {isExpanded ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#004E93] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm">
              CK
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-800 leading-none">Chalo Khelne</h1>
              <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">{role}</span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 bg-[#004E93] rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm">
            CK
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-hide">
        {sections.map((section) => (
          <SidebarSection key={section.key} section={section} collapsed={!isExpanded} />
        ))}
      </nav>

      {/* User + Controls */}
      <div className="border-t border-gray-200 p-3 space-y-2">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50 ${!isExpanded ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-[#004E93] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {auth?.name?.charAt(0) || "U"}
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-800 truncate">{auth?.name || "User"}</div>
              <div className="text-[10px] text-gray-400 capitalize">{role}</div>
            </div>
          )}
        </div>
        <div className={`flex ${isExpanded ? "gap-2" : "flex-col gap-1 items-center"}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition w-auto ${isExpanded ? "flex-1 px-3 py-2 text-xs font-medium" : "p-2"}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {isExpanded && <span>Logout</span>}
          </button>
          <button
            onClick={() => { setCollapsed(!collapsed); setHoverExpanded(false); }}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition w-auto hidden md:flex items-center justify-center"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        onMouseEnter={() => { if (collapsed) setHoverExpanded(true); }}
        onMouseLeave={() => setHoverExpanded(false)}
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out ${isExpanded ? "w-[240px]" : "w-[68px]"}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-black/30" />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
