import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    // <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
    //   <div>
    //     <h2 className="text-xl font-semibold text-gray-800 mb-[0px]">
    //       Dashboard
    //     </h2>
    //   </div>
    //   <div className="flex items-center gap-4">
    //     <span className="text-gray-600">{user?.email}</span>
    //     <button
    //       onClick={logout}
    //       className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg mt-[0px]"
    //     >
    //       Logout
    //     </button>
    //   </div>
    // </div>

    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md border border-gray-200">
  {/* Left Section */}
  <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

  {/* Right Section */}
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
      <span className="text-sm text-gray-700">{user?.email}</span>
    </div>
    <button
      onClick={logout}
      className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  </div>
</div>

  );
}
