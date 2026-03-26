import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeft, LogOut, ChevronRight } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { getSidebarForRole } from "./sidebarConfig";
import SidebarSection from "./SidebarSection";

/**
 * Modern sidebar with expand/collapse, hover-expand, mobile drawer.
 *
 * Props:
 * - role: "manager" | "clubadmin" (determines which nav items show)
 * - mobileOpen: boolean (controlled by parent for mobile drawer)
 * - onMobileClose: () => void
 */
export default function Sidebar({ role = "manager", mobileOpen = false, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const sections = getSidebarForRole(role);
  const isExpanded = !collapsed || hoverExpanded;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className={`flex items-center ${isExpanded ? "px-5" : "px-3 justify-center"} py-5 border-b border-[#1E2D4A]`}>
        {isExpanded ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FF6A00] to-[#FF9D32] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/20">
              CK
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-100 leading-none">Chalo Khelne</h1>
              <span className="text-[9px] text-gray-500 font-medium uppercase tracking-widest">{role}</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF6A00] to-[#FF9D32] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/20">
            CK
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-hide">
        {sections.map((section) => (
          <SidebarSection key={section.key} section={section} collapsed={!isExpanded} />
        ))}
      </nav>

      {/* User + Collapse */}
      <div className="border-t border-[#1E2D4A] p-3 space-y-2">
        {/* User */}
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-[#111B2E] ${!isExpanded ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#004E93] to-[#2DA5FF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {auth?.name?.charAt(0) || "U"}
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-gray-200 truncate">{auth?.name || "User"}</div>
              <div className="text-[10px] text-gray-500 capitalize">{role}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex ${isExpanded ? "gap-2" : "flex-col gap-1 items-center"}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition w-auto ${
              isExpanded ? "flex-1 px-3 py-2 text-xs font-medium" : "p-2"
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {isExpanded && <span>Logout</span>}
          </button>

          <button
            onClick={() => { setCollapsed(!collapsed); setHoverExpanded(false); }}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-[#1A2744] transition w-auto hidden md:flex items-center justify-center"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => { if (collapsed) setHoverExpanded(true); }}
        onMouseLeave={() => setHoverExpanded(false)}
        className={`
          hidden md:flex flex-col bg-[#0B1220] border-r border-[#1E2D4A] h-screen sticky top-0 z-30
          transition-all duration-300 ease-in-out
          ${isExpanded ? "w-[240px]" : "w-[68px]"}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#0B1220] shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
