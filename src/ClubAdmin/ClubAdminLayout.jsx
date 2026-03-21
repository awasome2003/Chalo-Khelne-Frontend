import { useState } from "react";
import ClubAdminNavbar from "./ClubAdminNavbar";
import ClubAdminSidebar from "./ClubAdminSidebar";
import { Outlet } from "react-router-dom";

const ClubAdminLayout = () => {
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
        <ClubAdminNavbar />
      </div>

      <div className="flex flex-1 pt-16 outlets">
        {/* Sidebar */}
        <div
          className={`w-${
            collapsed ? "16" : ""
          } text-white h-screen fixed left-0 mt-3 top-16 bg-[#f4f5f6]`}
        >
          <ClubAdminSidebar
            collapsed={collapsed}
            toggleSidebar={toggleSidebar}
          />
        </div>

        {/* Main Content / Outlet */}
        <div
          className={`flex-1 p-4 h-screen`}
          style={{
            transition: "margin-left 0.3s ease",
            marginLeft: collapsed ? "70px" : "230px",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ClubAdminLayout;
