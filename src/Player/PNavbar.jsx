import { FiBell, FiSearch } from "react-icons/fi"; 
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md"; 
import { FaUserCircle } from "react-icons/fa"; 
import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from React Router
import '../App.css'; 

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`navbar ${darkMode ? 'navbar-dark' : ''}`}>
      {/* Left: */}
      <div className="flex items-center gap-20">
        <h1 className={darkMode ? 'text-white' : 'text-black'}>Chalo Khelne</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search"
            className="search-input"
          />
          <FiSearch className="search-icon" />
        </div>
      </div>

      {/* Right: Icons + Button */}
      <div className="right-section">
        {/* Toggle Switch */}
        <div className="relative flex items-center">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`toggle-button ${darkMode ? 'toggle-button-dark' : 'toggle-button-light'}`}
          >
            <div
              className={`toggle-switch ${darkMode ? 'toggle-switch-dark' : 'toggle-switch-light'}`}
            >
              {darkMode ? (
                <MdOutlineDarkMode className="text-gray-600 text-lg" />
              ) : (
                <MdOutlineLightMode className="text-orange-500 text-lg" />
              )}
            </div>
          </button>
        </div>

        {/* Bell Icon */}
        <div className="bell-icon">
          <FiBell className="text-gray-600 text-xl" />
        </div>

        {/* Profile Icon (Clickable) */}
        <Link to="/pprofile" className="profile-icon">
          <FaUserCircle className="text-gray-600 text-2xl cursor-pointer" />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
