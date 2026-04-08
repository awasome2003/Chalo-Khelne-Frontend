import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeft, LogOut } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { getSidebarForRole } from "./sidebarConfig";
import SidebarSection from "./SidebarSection";

const BRAND = { primary: "#F97316", primaryDark: "#EA580C", secondary: "#0EA572" };

export default function Sidebar({ role = "manager", mobileOpen = false, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const sections = getSidebarForRole(role);
  const isExpanded = !collapsed || hoverExpanded;

  const handleLogout = () => { logout(); navigate("/login"); };

  const logoStyle = { background: `linear-gradient(to bottom right, ${BRAND.primary}, ${BRAND.primaryDark})` };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo / Brand */}
      <div className={`flex items-center ${isExpanded ? "px-5" : "px-3 justify-center"} py-4 border-b border-gray-100`}>
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <img src="/sportapp_logo.png" alt="CK" className="w-10 h-10 rounded-xl object-contain" />
            <div>
              <h1 className="text-sm font-black text-gray-900 leading-none tracking-tight">Chalo Khelne</h1>
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: BRAND.secondary }}>{role}</span>
            </div>
          </div>
        ) : (
          <img src="/sportapp_logo.png" alt="CK" className="w-10 h-10 rounded-xl object-contain" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide">
        {sections.map((section) => (
          <SidebarSection key={section.key} section={section} collapsed={!isExpanded} />
        ))}
      </nav>

      {/* User Card + Controls */}
      <div className="border-t border-gray-100 p-3 space-y-2">
        <div className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/60 ${!isExpanded ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm" style={logoStyle}>
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
            className={`flex items-center gap-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all w-auto ${isExpanded ? "flex-1 px-3 py-2 text-xs font-semibold" : "p-2"}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {isExpanded && <span>Logout</span>}
          </button>
          <button
            onClick={() => { setCollapsed(!collapsed); setHoverExpanded(false); }}
            className="p-2 rounded-xl text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all w-auto hidden md:flex items-center justify-center"
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        onMouseEnter={() => { if (collapsed) setHoverExpanded(true); }}
        onMouseLeave={() => setHoverExpanded(false)}
        className={`hidden md:flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out ${isExpanded ? "w-[250px]" : "w-[68px]"}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
