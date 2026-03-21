import { useState } from "react";
import Navbar from "./PNavbar";
import Sidebar from "./PSidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false); 

  const toggleSidebar = () => {
    setCollapsed(!collapsed); // Toggle the sidebar state
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: "#F5F6FA" }}>
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Navbar />
      </div>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <div className={`w-${collapsed ? "16" : "68"} text-white h-screen fixed left-0 top-16`}>
          <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
        </div>

        {/* Main Content / Outlet */}
        <div
          className={`flex-1 ml-${collapsed ? "16" : "64"} p-4 h-screen`}
          style={{ transition: "margin-left 0.3s ease" }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
