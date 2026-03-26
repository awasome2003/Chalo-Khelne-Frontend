import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Plus, Search } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import MCreateTournament from "../../Manager/MCreateTournament";

export default function TopBar({ onMenuClick }) {
  const { auth } = useContext(AuthContext);
  const { unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-xl md:hidden w-auto">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tournaments, players..."
                className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#004E93]/20 focus:border-[#004E93] focus:bg-white transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#FF6A00] hover:bg-[#E55D00] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-sm w-auto active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Tournament</span>
            </button>
            <button
              onClick={() => { navigate("/notification"); markAllRead(); }}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition w-auto"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <div className="md:hidden flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#004E93] flex items-center justify-center text-white text-xs font-bold">
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
