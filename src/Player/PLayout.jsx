import { useState } from "react";
import Navbar from "./PNavbar";
import Sidebar from "./PSidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F5F7FA]">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Navbar />
      </div>

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <div
          className="text-white h-screen fixed left-0 top-16 transition-all duration-300"
          style={{ width: collapsed ? 64 : 250 }}
        >
          <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
        </div>

        {/* Main Content */}
        <div
          className="flex-1 p-6 lg:p-8 overflow-y-auto"
          style={{ marginLeft: collapsed ? 64 : 250, transition: "margin-left 0.3s ease" }}
        >
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
