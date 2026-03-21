import { useState } from "react";
import Navbar from "./MNavbar";
import Sidebar from "./MSidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: "#F5F6FA" }}
    >
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Navbar />
      </div>

      <div className="flex flex-1 pt-16 outlets">
        {/* Sidebar */}
        <div
          className={`w-${collapsed ? "16" : ""
            } text-white h-screen fixed left-0 mt-[14px] top-16 bg-[#f4f5f6]`}
        >
          <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
        </div>

        {/* Main Content / Outlet */}
        <div
          className={`flex-1 p-4 h-screen`}
          style={{
            transition: "margin-left 0.3s ease",
            marginLeft: collapsed ? "70px" : "286px",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
