import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaHistory,
  FaStopwatch,
  FaCalendarAlt,
  FaClipboardList,
  FaUserCircle,
  FaCogs,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "../App.css";

const TrainerSidebar = ({ collapsed, toggleSidebar }) => {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        className={`toggle-btn transition-all duration-300 ${
          collapsed ? "w-8" : "w-16"
        }`}
        onClick={toggleSidebar}
      >
        {collapsed ? <FaBars /> : <FaTimes />}
      </button>

      <nav className="flex flex-col mt-9 navlinks">
        {[
          {
            to: "/trainer-dashboard",
            icon: <FaTachometerAlt />,
            label: "Dashboard",
          },
          {
            to: "/trainer-current",
            icon: <FaStopwatch />,
            label: "Current Session",
          },
          {
            to: "/trainer-history",
            icon: <FaHistory />,
            label: "Session History",
          },
          {
            to: "/trainer-sessions",
            icon: <FaCalendarAlt />,
            label: "Schedule",
          },
          {
            to: "/trainer-requests",
            icon: <FaClipboardList />,
            label: "Requests",
          },
          { to: "/trainer-profile", icon: <FaUserCircle />, label: "Profile" },
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="relative nav-link group"
            activeClassName="active"
          >
            <span className="icon">{icon}</span>
            <span className="text">{label}</span>

            {collapsed && (
              <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default TrainerSidebar;
