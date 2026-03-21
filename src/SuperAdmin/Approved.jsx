// import { useEffect, useState } from "react";
// import axios from "axios";
// import { SlidersHorizontal, Pencil, Eye } from "lucide-react";

// export default function Approved() {
//   const [approvedUsers, setApprovedUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [selectedRole, setSelectedRole] = useState("All");

//   useEffect(() => {
//     fetchApprovedUsers();
//   }, []);

//   const fetchApprovedUsers = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_API_BASE_URL}/update/approved-users`
//       );
//       setApprovedUsers(response.data);
//       setFilteredUsers(response.data);
//     } catch (error) {
//       console.error("Error fetching approved users:", error);
//     }
//   };

//   const handleFilterChange = (role) => {
//     setSelectedRole(role);
//     setFilteredUsers(
//       role === "All"
//         ? approvedUsers
//         : approvedUsers.filter((user) => user.role === role)
//     );
//   };

//   const roles = ["All", "Player", "Trainer", "ClubAdmin"];

//   return (

//     <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <h3 className="text-2xl font-bold text-gray-800">
//           Approved Requests
//           <span className="ml-2 text-blue-600 text-[22px]">
//             ({filteredUsers.length})
//           </span>
//         </h3>

//         {/* Filter Dropdown */}
//         <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700 shadow-sm transition">
//           <SlidersHorizontal className="w-4 h-4 text-blue-600" />
//           <select
//             value={selectedRole}
//             onChange={(e) => handleFilterChange(e.target.value)}
//             className="bg-transparent outline-none cursor-pointer"
//           >
//             {roles.map((role) => (
//               <option key={role} value={role} className="text-gray-800">
//                 {role}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto max-h-[70vh] rounded-lg border border-gray-200">
//         <table className="min-w-full divide-y divide-gray-200 text-sm">
//           <thead className="bg-gray-100 text-gray-700 font-semibold">
//             <tr className="sticky top-0 bg-gray-100 text-gray-700">
//               <th className="px-4 py-3 border text-left">Sr.No</th>
//               <th className="px-4 py-3 border text-left">Name</th>
//               <th className="px-4 py-3 border text-left">Email</th>
//               <th className="px-4 py-3 border text-left">Role</th>
//               <th className="px-4 py-3 border text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {filteredUsers.map((user,index) => (
//               <tr key={user._id} className="hover:bg-gray-50 transition">
//                 <td className="px-4 py-3 border">{index + 1}</td>
//                 <td className="px-4 py-3 border">{user.name}</td>
//                 <td className="px-4 py-3 border">{user.email}</td>
//                 <td className="px-4 py-3 border capitalize">{user.role}</td>
//                 <td className="px-4 py-3 border text-center">
//                   <div className="flex justify-center gap-2">
//                     {/* Edit Button */}
//                     <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition">
//                       <Pencil className="w-4 h-4" />
//                     </button>

//                     {/* View Button */}
//                     <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition">
//                       <Eye className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//             {filteredUsers.length === 0 && (
//               <tr>
//                 <td colSpan="4" className="text-center py-6 text-gray-400">
//                   No approved users found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }





// import { useEffect, useState } from "react";
// import axios from "axios";
// import { SlidersHorizontal, Pencil, Eye,Check, X  } from "lucide-react";

// export default function Approved() {
//   const [approvedUsers, setApprovedUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [selectedRole, setSelectedRole] = useState("All");
//   const [selectedUser, setSelectedUser] = useState(null); // ✅ New state for view

//   useEffect(() => {
//     fetchApprovedUsers();
//   }, []);

//   const fetchApprovedUsers = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_API_BASE_URL}/update/approved-users`
//       );
//       setApprovedUsers(response.data);
//       setFilteredUsers(response.data);
//     } catch (error) {
//       console.error("Error fetching approved users:", error);
//     }
//   };

//   const handleFilterChange = (role) => {
//     setSelectedRole(role);
//     setFilteredUsers(
//       role === "All"
//         ? approvedUsers
//         : approvedUsers.filter((user) => user.role === role)
//     );
//   };
//   const handleStatusChange = async (newStatus) => {
//     try {
//       const response = await axios.put(
//         `${import.meta.env.VITE_API_BASE_URL}/update/user-status/${
//           selectedUser._id
//         }`,
//         {
//           isApproved: newStatus,
//         }
//       );

//       // ✅ Update local selectedUser after successful update
//       setSelectedUser((prevUser) => ({
//         ...prevUser,
//         isApproved: newStatus,
//       }));

//       // Optional: Update list also
//       setApprovedUsers((prevUsers) =>
//         prevUsers.map((u) =>
//           u._id === selectedUser._id ? { ...u, isApproved: newStatus } : u
//         )
//       );
//       setFilteredUsers((prevUsers) =>
//         prevUsers.map((u) =>
//           u._id === selectedUser._id ? { ...u, isApproved: newStatus } : u
//         )
//       );
//     } catch (error) {
//       alert("Failed to update status");
//       console.error("Status update error:", error);
//     }
//   };

//   const roles = ["All", "Player", "Trainer", "ClubAdmin"];

//   return (
//     <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
//       {/* ✅ IF user is selected show DETAILS */}
//       {selectedUser ? (
//         <div className="">
//           {/* 🔙 Back Button */}
//           <div className="mb-4">
//             <button
//               onClick={() => setSelectedUser(null)}
//               className="px-4 py-2 border text-black rounded-lg hover:bg-blue-500 hover:text-white"
//             >
//               ←
//             </button>
//           </div>

//           {/* 👤 User Details */}
//           <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
//             User Details
//           </h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Name */}
//             <div className="flex flex-col md:flex-row md:items-center gap-[5px]">
//               <span className="font-semibold text-gray-700">Name:</span>
//               <span className="text-gray-800">{selectedUser.name}</span>
//             </div>

//             {/* Email */}
//             <div className="flex flex-col md:flex-row md:items-center gap-[5px]">
//               <span className="font-semibold text-gray-700">Email:</span>
//               <span className="text-gray-800">{selectedUser.email}</span>
//             </div>

//             {/* Role */}
//             <div className="flex flex-col md:flex-row md:items-center gap-[5px]">
//               <span className="font-semibold text-gray-700">Role:</span>
//               <span className="capitalize text-gray-800">
//                 {selectedUser.role}
//               </span>
//               <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition">
//                 <Pencil className="w-4 h-4" />
//               </button>
//             </div>

//             {/* Mobile No */}
//             <div className="flex flex-col md:flex-row md:items-center gap-[5px]">
//               <span className="w-auto font-semibold text-gray-700">
//                 Mobile No:
//               </span>
//               <span className="text-gray-800">{selectedUser.mobile}</span>
//             </div>

//             {/* Status + Button */}
//             <div className="flex flex-col md:flex-row md:items-center md:col-span-2 gap-[5px]">
//               <span className="font-semibold text-gray-700">Status:</span>
//               <div className="flex items-center gap-4 mt-1 md:mt-0">
//                 <span
//                   className={`py-1 rounded-full capitalize ${
//                     selectedUser.isApproved ? "" : ""
//                   }`}
//                 >
//                   {selectedUser.isApproved ? "Active" : "Inactive"}
//                 </span>

//                 <button
//                   onClick={() => handleStatusChange(!selectedUser.isApproved)}
//                   className={`px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm ${
//                     selectedUser.isApproved
//                       ? "bg-red-600 text-white hover:bg-red-700"
//                       : "bg-green-600 text-white hover:bg-green-700"
//                   }`}
//                 >
//                   {selectedUser.isApproved ? "Deactivate" : "Activate"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//             <h3 className="text-2xl font-bold text-gray-800">
//               Approved Requests
//               <span className="ml-2 text-blue-600 text-[22px]">
//                 ({filteredUsers.length})
//               </span>
//             </h3>

//             {/* Filter Dropdown */}
//             <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700 shadow-sm transition">
//               <SlidersHorizontal className="w-4 h-4 text-blue-600" />
//               <select
//                 value={selectedRole}
//                 onChange={(e) => handleFilterChange(e.target.value)}
//                 className="bg-transparent outline-none cursor-pointer"
//               >
//                 {roles.map((role) => (
//                   <option key={role} value={role} className="text-gray-800">
//                     {role}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto max-h-[70vh] rounded-lg border border-gray-200">
//             <table className="min-w-full divide-y divide-gray-200 text-sm">
//               <thead className="bg-gray-100 text-gray-700 font-semibold">
//                 <tr className="sticky top-0 bg-gray-100 text-gray-700">
//                   <th className="px-4 py-3 border text-left">Sr.No</th>
//                   <th className="px-4 py-3 border text-left">Name</th>
//                   <th className="px-4 py-3 border text-left">Email</th>
//                   <th className="px-4 py-3 border text-left">Role</th>
//                   <th className="px-4 py-3 border text-center">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {filteredUsers.map((user, index) => (
//                   <tr key={user._id} className="hover:bg-gray-50 transition">
//                     <td className="px-4 py-3 border">{index + 1}</td>
//                     <td className="px-4 py-3 border">{user.name}</td>
//                     <td className="px-4 py-3 border">{user.email}</td>
//                     <td className="px-4 py-3 border capitalize">{user.role}</td>
//                     <td className="px-4 py-3 border text-center">
//                       <div className="flex justify-center gap-2">
//                         {/* Edit Button */}
//                         <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition">
//                           <Pencil className="w-4 h-4" />
//                         </button>

//                         {/* ✅ View Button */}
//                         <button
//                           onClick={() => setSelectedUser(user)}
//                           className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition"
//                         >
//                           <Eye className="w-5 h-5" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//                 {filteredUsers.length === 0 && (
//                   <tr>
//                     <td colSpan="5" className="text-center py-6 text-gray-400">
//                       No approved users found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import axios from "axios";
import {
  SlidersHorizontal,
  Pencil,
  Eye,
  Check,
  X,
} from "lucide-react";

export default function Approved() {
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [newRole, setNewRole] = useState("");

  const roles = ["All", "Player", "Trainer", "ClubAdmin"];

  useEffect(() => {
    fetchApprovedUsers();
  }, []);

  const fetchApprovedUsers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/update/approved-users`
      );
      setApprovedUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching approved users:", error);
    }
  };

  const handleFilterChange = (role) => {
    setSelectedRole(role);
    setFilteredUsers(
      role === "All"
        ? approvedUsers
        : approvedUsers.filter((user) => user.role === role)
    );
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/update/user-status/${selectedUser._id}`,
        { isApproved: newStatus }
      );

      setSelectedUser((prev) => ({ ...prev, isApproved: newStatus }));

      // Update list also
      setApprovedUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, isApproved: newStatus } : u
        )
      );
      setFilteredUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, isApproved: newStatus } : u
        )
      );
    } catch (error) {
      alert("Failed to update status");
      console.error("Status update error:", error);
    }
  };
const handleRoleUpdate = async () => {
  console.log("🚀 Updating role to:", newRole);

  try {
    const res = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/update/user-role/${selectedUser._id}`,
      { role: newRole }
    );

    console.log("✅ Response from server:", res.data);

    // ✅ Update UI locally with new role
    setSelectedUser((prevUser) => ({
      ...prevUser,
      role: newRole,
    }));

    setApprovedUsers((prevUsers) =>
      prevUsers.map((u) =>
        u._id === selectedUser._id ? { ...u, role: newRole } : u
      )
    );

    setFilteredUsers((prevUsers) =>
      prevUsers.map((u) =>
        u._id === selectedUser._id ? { ...u, role: newRole } : u
      )
    );

    setIsEditingRole(false);
  } catch (err) {
    console.error("Role update failed", err);
    alert("Role update failed");
  }
};




  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
      {selectedUser ? (
        <div>
          {/* 🔙 Back Button */}
          <div className="mb-4">
            <button
              onClick={() => {
                setSelectedUser(null);
                setIsEditingRole(false);
              }}
              className="px-4 py-2 border text-black rounded-lg hover:bg-blue-500 hover:text-white"
            >
              ←
            </button>
          </div>

          {/* 👤 User Details */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
            User Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col md:flex-row md:items-center gap-[5px]">
              <span className="font-semibold text-gray-700">Name:</span>
              <span className="text-gray-800">{selectedUser.name}</span>
            </div>

            {/* Email */}
            <div className="flex flex-col md:flex-row md:items-center gap-[5px]">
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-800">{selectedUser.email}</span>
            </div>

            {/* ✅ Editable Role */}
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="font-semibold text-gray-700">Role:</span>
              {isEditingRole ? (
                <>
                  <select
                    className="border rounded px-2 py-1 text-sm capitalize"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    {["Player", "Manager", "Club", "Organization"].map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button
                      className="bg-green-600 text-white p-1 rounded hover:bg-green-700"
                      onClick={handleRoleUpdate}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="bg-gray-300 text-gray-700 p-1 rounded hover:bg-gray-400"
                      onClick={() => setIsEditingRole(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="capitalize text-gray-800">
                    {selectedUser.role}
                  </span>
                  <button
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition"
                    onClick={() => {
                      setIsEditingRole(true);
                      setNewRole(selectedUser.role);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile */}
            <div className="flex flex-col md:flex-row md:items-center gap-[5px]">
              <span className="font-semibold text-gray-700">Mobile No:</span>
              <span className="text-gray-800">{selectedUser.mobile}</span>
            </div>

            {/* Status */}
            <div className="flex flex-col md:flex-row md:items-center md:col-span-2 gap-[5px]">
              <span className="font-semibold text-gray-700">Status:</span>
              <div className="flex items-center gap-4 mt-1 md:mt-0">
                <span className="py-1 rounded-full capitalize
                  ${
                    selectedUser.isApproved
                      ? ''
                      : ''
                  }">
                  {selectedUser.isApproved ? "Active" : "Inactive"}
                </span>

                <button
                  onClick={() => handleStatusChange(!selectedUser.isApproved)}
                  className={`px-4 py-1 rounded-full text-sm font-medium transition-colors duration-200 shadow-sm ${
                    selectedUser.isApproved
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {selectedUser.isApproved ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              Approved Requests
              <span className="ml-2 text-blue-600 text-[22px]">
                ({filteredUsers.length})
              </span>
            </h3>

            {/* Filter */}
            <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm text-gray-700 shadow-sm transition">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <select
                value={selectedRole}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="bg-transparent outline-none cursor-pointer"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[70vh] rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 py-3 border text-left">Sr.No</th>
                  <th className="px-4 py-3 border text-left">Name</th>
                  <th className="px-4 py-3 border text-left">Email</th>
                  <th className="px-4 py-3 border text-left">Role</th>
                  <th className="px-4 py-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 border">{index + 1}</td>
                    <td className="px-4 py-3 border">{user.name}</td>
                    <td className="px-4 py-3 border">{user.email}</td>
                    <td className="px-4 py-3 border capitalize">{user.role}</td>
                    <td className="px-4 py-3 border text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditingRole(false);
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-400">
                      No approved users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

