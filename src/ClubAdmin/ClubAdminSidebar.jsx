import { NavLink } from "react-router-dom";
import {
  FaTrophy,
  FaCogs,
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaMoneyBillWave,
  FaUserCog,
  FaCalendarAlt,
  FaRegNewspaper,
  FaGavel,
} from "react-icons/fa";
import { FiGrid, FiCalendar } from "react-icons/fi";
import "../App.css";

const ClubAdminSidebar = ({ collapsed, toggleSidebar }) => {
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
          { to: "/club-dashboard", icon: <FiGrid />, label: "Dashboard" },
          {
            to: "/turf-management",
            icon: <FaCalendarAlt />,
            label: "Turf Management",
          },
          {
            to: "/staff-admin",
            icon: <FaUserCog />,
            label: "Staff Admin",
          },
          {
            to: "/payment-history",
            icon: <FaMoneyBillWave />,
            label: "Payments",
          },
          { 
            to: "/club-social", 
            icon: <FaRegNewspaper />, 
            label: "Posts" 
          },
          {
            to: "/club-refree",
            icon: <FaGavel />,
            label: "Referee"
          },
          {
            to: "/club-finance",
            icon: <FaTachometerAlt />,
            label: "Financial Overview",
          },
          {
            to: "/forum",
            icon: <FaTachometerAlt />,
            label: "Forum",
          },
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
              <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default ClubAdminSidebar;