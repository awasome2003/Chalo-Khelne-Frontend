import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, Plus, ChevronRight } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import MCreateTournament from "../../Manager/MCreateTournament";

/**
 * Route → page title + breadcrumb mapping.
 * Keeps TopBar dynamic without prop-drilling.
 */
const PAGE_META = {
  "/mdashboard": { title: "Dashboard", crumbs: [] },
  "/mtournament-management": { title: "Tournaments", crumbs: [] },
  "/invite-employees": { title: "Invite Employees", crumbs: [{ label: "Tournaments", path: "/mtournament-management" }] },
  "/mslot-Bookingt": { title: "Slot Booking", crumbs: [] },
  "/msocial": { title: "Social Feed", crumbs: [] },
  "/mrefree": { title: "Referee Panel", crumbs: [] },
  "/mtrainers": { title: "Trainers", crumbs: [] },
  "/mnews": { title: "News", crumbs: [] },
  "/group-chat": { title: "Group Chats", crumbs: [] },
  "/payments": { title: "Payments", crumbs: [] },
  "/mcoupons": { title: "Coupons", crumbs: [] },
  "/notification": { title: "Notifications", crumbs: [] },
  "/msettings": { title: "Settings", crumbs: [] },
  "/club-dashboard": { title: "Dashboard", crumbs: [] },
  "/club-social": { title: "Social Feed", crumbs: [] },
  "/club-refree": { title: "Referee Panel", crumbs: [] },
  "/turf-management": { title: "Turf Management", crumbs: [] },
  "/payment-history": { title: "Payments", crumbs: [] },
  "/club-finance": { title: "Financial Overview", crumbs: [] },
  "/staff-admin": { title: "Staff Admin", crumbs: [] },
  "/home": { title: "Dashboard", crumbs: [] },
  "/pending": { title: "Pending Users", crumbs: [] },
  "/approved": { title: "Approved Users", crumbs: [] },
  "/inquiries": { title: "Inquiries", crumbs: [] },
  "/sports": { title: "Sports Management", crumbs: [] },
  "/rule-books": { title: "Rule Books", crumbs: [] },
  "/rbac": { title: "Roles & Permissions", crumbs: [] },
  "/vendor-marketplace": { title: "Vendor Marketplace", crumbs: [] },
  "/trainer-dashboard": { title: "Dashboard", crumbs: [] },
  "/trainer-sessions": { title: "All Sessions", crumbs: [] },
  "/trainer-current": { title: "Current Session", crumbs: [] },
  "/trainer-upcoming": { title: "Upcoming Sessions", crumbs: [] },
  "/trainer-history": { title: "Session History", crumbs: [] },
  "/trainer-requests": { title: "Requests", crumbs: [] },
  "/trainer-profile": { title: "Profile", crumbs: [] },
  "/corporate-dashboard": { title: "Dashboard", crumbs: [] },
  "/corporate-tournaments": { title: "Tournaments", crumbs: [] },
  "/corporate-staff": { title: "Staff Management", crumbs: [] },
  "/corporate-profile": { title: "Company Profile", crumbs: [] },
  "/phome": { title: "Home", crumbs: [] },
  "/ptournament-management": { title: "Tournaments", crumbs: [] },
  "/pslot-booking": { title: "Slot Booking", crumbs: [] },
  "/ptrainers": { title: "Trainers", crumbs: [] },
  "/psettings": { title: "Settings", crumbs: [] },
  "/pprofile": { title: "Profile", crumbs: [] },
};

function getPageMeta(pathname) {
  // Exact match first
  if (PAGE_META[pathname]) return PAGE_META[pathname];

  // Dynamic routes
  if (pathname.match(/^\/tournaments\/[^/]+\/dashboard$/))
    return { title: "Tournament Dashboard", crumbs: [{ label: "Tournaments", path: "/mtournament-management" }] };
  if (pathname.match(/^\/tournaments\/[^/]+\/players$/))
    return { title: "Players", crumbs: [{ label: "Tournaments", path: "/mtournament-management" }] };
  if (pathname.match(/^\/tournaments\/[^/]+\/groups\/[^/]+$/))
    return { title: "Group Detail", crumbs: [{ label: "Tournaments", path: "/mtournament-management" }] };
  if (pathname.match(/^\/tournaments\/[^/]+\/groups$/))
    return { title: "Groups", crumbs: [{ label: "Tournaments", path: "/mtournament-management" }] };
  if (pathname.match(/^\/tournaments\/[^/]+\/knockout$/))
    return { title: "Knockout Bracket", crumbs: [{ label: "Tournaments", path: "/mtournament-management" }] };
  if (pathname.match(/^\/tournaments\/[^/]+$/))
    return { title: "Tournament Overview", crumbs: [{ label: "Tournaments", path: "/mtournament-management" }] };
  if (pathname.startsWith("/group-chat/"))
    return { title: "Chat", crumbs: [{ label: "Group Chats", path: "/group-chat" }] };
  if (pathname.startsWith("/turf-details/"))
    return { title: "Turf Details", crumbs: [{ label: "Turf Management", path: "/turf-management" }] };

  return { title: "", crumbs: [] };
}

export default function TopBar({ onMenuClick }) {
  const { auth } = useContext(AuthContext);
  const { unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { title, crumbs } = getPageMeta(location.pathname);

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          {/* Left: menu + title + breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-xl md:hidden w-auto">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Breadcrumbs + Page title */}
            <div className="hidden sm:flex items-center gap-1.5 min-w-0">
              {crumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <button
                    onClick={() => navigate(crumb.path)}
                    className="text-xs font-medium text-gray-400 hover:text-orange-500 transition w-auto"
                  >
                    {crumb.label}
                  </button>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                </span>
              ))}
              {title && (
                <h2 className="text-sm font-bold text-gray-800 truncate">{title}</h2>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Create Tournament CTA */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-orange-200 w-auto active:scale-[0.97]"
              style={{ backgroundColor: "#F97316" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#EA580C"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#F97316"}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Tournament</span>
            </button>

            {/* Notification bell */}
            <button
              onClick={() => { navigate("/notification"); markAllRead(); }}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition w-auto"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white px-1 shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Mobile user avatar */}
            <div className="md:hidden flex items-center gap-2 pl-2 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ background: "linear-gradient(to bottom right, #F97316, #EA580C)" }}>
                {auth?.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Create Tournament Modal */}
      <MCreateTournament
        showPopup={showCreateModal}
        setShowPopup={setShowCreateModal}
      />
    </>
  );
}
