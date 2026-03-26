import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Plus, Search } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";

export default function TopBar({ onMenuClick }) {
  const { auth } = useContext(AuthContext);
  const { unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <header className="bg-[#0E1628] border-b border-[#1E2D4A] px-6 py-3 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="p-2 hover:bg-[#1A2744] rounded-xl md:hidden w-auto">
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search tournaments, players..."
              className="pl-10 pr-4 py-2 w-72 bg-[#111B2E] border border-[#1E2D4A] rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:ring-1 focus:ring-[#FF6A00]/30 focus:border-[#FF6A00]/30 focus:bg-[#162240] transition"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/mtournament-management")}
            className="bg-gradient-to-r from-[#FF6A00] to-[#FF9D32] hover:from-[#FF800A] hover:to-[#FFAB40] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition shadow-lg shadow-orange-500/20 w-auto active:scale-[0.97]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Tournament</span>
          </button>

          <button
            onClick={() => { navigate("/notification"); markAllRead(); }}
            className="relative p-2.5 hover:bg-[#1A2744] rounded-xl transition w-auto"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-[#0E1628] px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Mobile profile */}
          <div className="md:hidden flex items-center gap-2 pl-2 border-l border-[#1E2D4A]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#004E93] to-[#2DA5FF] flex items-center justify-center text-white text-xs font-bold">
              {auth?.name?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
