import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  Plus,
  LogOut,
  User,
  ChevronDown
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { AuthContext } from "../context/AuthContext";
import MCreateTournament from "./MCreateTournament";

const Navbar = ({ toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef(null);
  const { logout, auth } = useContext(AuthContext);
  const { unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const role = auth?.role?.toLowerCase() || "player";
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <Menu size={24} />
          </button>

          <Link
            to={auth?.role === 'corporate_admin' ? "/corporate-dashboard" : "/mdashboard"}
            className="flex items-center gap-2"
          >
            <img
              src="/sportapp_logo.png"
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 md:gap-6">

          {/* Create Tournament Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="hidden md:flex items-center gap-2 bg-[#FF5B04] hover:bg-[#E04F00] text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Create Tournament</span>
          </button>

          {/* Mobile Create Button (Icon only) */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="md:hidden flex items-center justify-center bg-[#FF5B04] text-white w-10 h-10 rounded-full shadow-md active:scale-95"
          >
            <Plus size={20} />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

          {/* Notifications */}
          <button
            onClick={() => { navigate("/notification"); markAllRead(); }}
            className="relative p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 border border-white shadow-sm ring-1 ring-gray-100">
                <User size={18} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-none">
                  {auth?.name || "Manager"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{role || "Manager"}</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-50">
                  <p className="font-semibold text-gray-900">Signed in as</p>
                  <p className="text-sm text-gray-500 truncate">{auth?.email || "manager@example.com"}</p>
                </div>
                <div className="p-2">
                  {/* <button
                    onClick={() => {
                      navigate("/profile");
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left"
                  >
                    <User size={16} className="text-gray-400" />
                    My Profile
                  </button> */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                  >
                    <LogOut size={16} className="text-red-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
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
};

export default Navbar;
