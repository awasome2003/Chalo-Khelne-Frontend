// import { NavLink } from "react-router-dom"; 
// import { FaTrophy, FaCalendar, FaUser, FaCogs } from "react-icons/fa";

// const Sidebar = () => {
//   return (
//     <div className="w-68 h-screen text-white p-4">
//       <nav className="flex flex-col gap-4">
//         <NavLink 
//           to="/dashboard" 
//           className={({ isActive }) =>
//             `flex items-center gap-1 py-[13px] px-[16px] transition-all ${
//               isActive ? 'bg-[#735DFF] text-white rounded-[25px]' : 'hover:bg-[#735DFF] hover:rounded-[25px] hover:text-white'
//             }`
//           }
//         >
//           <FaTrophy className="flex-shrink-0" />Dashboard
//         </NavLink>
//         <NavLink 
//           to="/tournament-management" 
//           className={({ isActive }) =>
//             `flex items-center gap-1 py-[13px] px-[16px] transition-all ${
//               isActive ? 'bg-[#735DFF] text-white rounded-[25px]' : 'hover:bg-[#735DFF] hover:rounded-[25px] hover:text-white'
//             }`
//           }
//         >
//           <FaTrophy className="flex-shrink-0" />Tournament Management
//         </NavLink>
//         <NavLink 
//           to="/slot-booking" 
//           className={({ isActive }) =>
//             `flex items-center gap-1 py-[13px] px-[16px] transition-all ${
//               isActive ? 'bg-[#735DFF] text-white rounded-[25px]' : 'hover:bg-[#735DFF] hover:rounded-[25px] hover:text-white'
//             }`
//           }
//         >
//           <FaCalendar className="flex-shrink-0" /> Slot Booking
//         </NavLink>
//         <NavLink 
//           to="/trainer" 
//           className={({ isActive }) =>
//             `flex items-center gap-1 py-[13px] px-[16px] transition-all ${
//               isActive ? 'bg-[#735DFF] text-white rounded-[25px]' : 'hover:bg-[#735DFF] hover:rounded-[25px] hover:text-white'
//             }`
//           }
//         >
//           <FaUser className="flex-shrink-0" /> Trainer
//         </NavLink>
//         <NavLink 
//           to="/settings" 
//           className={({ isActive }) =>
//             `flex items-center gap-1 py-[13px] px-[16px] transition-all ${
//               isActive ? 'bg-[#735DFF] text-white rounded-[25px]' : 'hover:bg-[#735DFF] hover:rounded-[25px] hover:text-white'
//             }`
//           }
//         >
//           <FaCogs className="flex-shrink-0" /> Settings
//         </NavLink>
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;

// import { NavLink } from "react-router-dom"; 
// import { FaTrophy, FaCalendar, FaUser, FaCogs } from "react-icons/fa";
// import './App.css'; // Import the CSS file

// const Sidebar = () => {
//   return (
//     <div className="sidebar">
//       <nav className="flex flex-col gap-4">
//         <NavLink 
//           to="/dashboard" 
//           className="nav-link"
//           activeClassName="active"
//         >
//           <FaTrophy className="flex-shrink-0" /> <span>Dashboard</span>
//         </NavLink>
//         <NavLink 
//           to="/tournament-management" 
//           className="nav-link"
//           activeClassName="active"
//         >
//           <FaTrophy className="flex-shrink-0" /> <span>Tournament Management</span>
//         </NavLink>
//         <NavLink 
//           to="/slot-booking" 
//           className="nav-link"
//           activeClassName="active"
//         >
//           <FaCalendar className="flex-shrink-0" /> <span>Slot Booking</span>
//         </NavLink>
//         <NavLink 
//           to="/trainer" 
//           className="nav-link"
//           activeClassName="active"
//         >
//           <FaUser className="flex-shrink-0" /> <span>Trainer</span>
//         </NavLink>
//         <NavLink 
//           to="/settings" 
//           className="nav-link"
//           activeClassName="active"
//         >
//           <FaCogs className="flex-shrink-0" /> <span>Settings</span>
//         </NavLink>
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;
import { useState } from "react";
import { NavLink } from "react-router-dom"; 
import { FaTrophy, FaCalendar, FaUser, FaCogs } from "react-icons/fa";
import '../App.css'; // Import the CSS file

const Sidebar = ({ collapsed, toggleSidebar }) => {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button
  className={`toggle-btn transition-all duration-300 ${
    collapsed ? "w-8" : "w-16"
  }`}
  onClick={toggleSidebar}
>
  {collapsed ? ">" : "<"}
</button>

      <nav className="flex flex-col gap-4 mt-9">
        <NavLink to="/phome" className="nav-link" activeClassName="active">
          <FaTrophy className="icon" /> <span className="text">Home</span>
        </NavLink>
        <NavLink to="/ptournament-management" className="nav-link" activeClassName="active">
          <FaTrophy className="icon" /> <span className="text">Tournament Management</span>
        </NavLink>
        <NavLink to="/pslot-booking" className="nav-link" activeClassName="active">
          <FaCalendar className="icon" /> <span className="text">Slot Booking</span>
        </NavLink>
        <NavLink to="/ptrainers" className="nav-link" activeClassName="active">
          <FaUser className="icon" /> <span className="text">Trainers</span>
        </NavLink>
        <NavLink to="/psettings" className="nav-link" activeClassName="active">
          <FaCogs className="icon" /> <span className="text">Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
