import { useEffect, useState } from "react";
import { FaUserClock } from "react-icons/fa";

export default function Pending() {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/update/pending-approval`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pending users");
        }
        const data = await response.json();
        setPendingUsers(data);
      } catch (error) {
        console.error("Error fetching pending users:", error);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApproval = async (userId, status) => {
    try {
      const endpoint =
        status === "approved"
          ? `${import.meta.env.VITE_API_BASE_URL}/update/approve/${userId}`
          : `${import.meta.env.VITE_API_BASE_URL}/update/reject/${userId}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update status");

      setPendingUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    // <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
    //   <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-3xl">
    //     <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
    //       <FaUserClock className="text-blue-600" /> Pending Club Admin Requests
    //     </h3>

    //     <div className="space-y-4">
    //       {pendingUsers.length > 0 ? (
    //         pendingUsers.map((user) => (
    //           <div
    //             key={user._id}
    //             className="p-5 flex items-center justify-between bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
    //           >
    //             <div className="flex items-center gap-4">
    //               <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full text-lg font-bold">
    //                 {user.name.charAt(0)}
    //               </div>
    //               <div>
    //                 <h4 className="font-semibold text-gray-800 text-lg">{user.name}</h4>
    //                 <p className="text-gray-500 text-sm">{user.email}</p>
    //               </div>
    //             </div>
    //             <div className="flex gap-3">
    //               <button
    //                 className="px-4 py-2 text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 transition-all"
    //                 onClick={() => handleApproval(user._id, "approved")}
    //               >
    //                 Approve
    //               </button>
    //               <button
    //                 className="px-4 py-2 text-white font-semibold bg-red-600 rounded-lg hover:bg-red-700 transition-all"
    //                 onClick={() => handleApproval(user._id, "rejected")}
    //               >
    //                 Reject
    //               </button>
    //             </div>
    //           </div>
    //         ))
    //       ) : (
    //         <p className="text-gray-500 text-center py-10">No pending requests</p>
    //       )}
    //     </div>
    //   </div>
    // </div>
    <div className="bg-[#f9fafb] flex items-start justify-center pb-10">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <FaUserClock className="text-blue-600 w-6 h-6" />
          <span>Pending Club Admin Requests</span>
        </h3>

        {pendingUsers.length > 0 ? (
          <div className="space-y-5">
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-gray-50 hover:bg-gray-100 transition rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full text-lg font-bold shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {user.name}
                    </h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    className="w-24 px-4 py-2 text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 transition"
                    onClick={() => handleApproval(user._id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="w-24 px-4 py-2 text-white font-semibold bg-red-600 rounded-lg hover:bg-red-700 transition"
                    onClick={() => handleApproval(user._id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No pending requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
