import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Search, CheckCircle, Eye, ArrowLeft, Pencil, Check, X, Shield, Mail, Phone, User, Loader2 } from "lucide-react";

const ROLES = ["All", "Player", "Trainer", "ClubAdmin", "corporate_admin"];
const EDITABLE_ROLES = ["Player", "Trainer", "ClubAdmin", "corporate_admin", "Manager"];

export default function Approved() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingRole, setEditingRole] = useState(false);
  const [newRole, setNewRole] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/update/approved-users`);
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesRole = selectedRole === "All" || u.role === selectedRole;
    const matchesSearch = !search || (u.name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleStatusToggle = async () => {
    const newStatus = !selectedUser.isApproved;
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/update/user-status/${selectedUser._id}`, { isApproved: newStatus });
      setSelectedUser((p) => ({ ...p, isApproved: newStatus }));
      setUsers((p) => p.map((u) => u._id === selectedUser._id ? { ...u, isApproved: newStatus } : u));
      toast.success(newStatus ? "User activated" : "User deactivated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleRoleUpdate = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/update/user-role/${selectedUser._id}`, { role: newRole });
      setSelectedUser((p) => ({ ...p, role: newRole }));
      setUsers((p) => p.map((u) => u._id === selectedUser._id ? { ...u, role: newRole } : u));
      setEditingRole(false);
      toast.success("Role updated");
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Detail View
  if (selectedUser) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <button onClick={() => { setSelectedUser(null); setEditingRole(false); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 w-auto">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
              {(selectedUser.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
              <p className="text-white/70 text-sm">{selectedUser.email}</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Role */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">Role</span>
              </div>
              {editingRole ? (
                <div className="flex items-center gap-2">
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm bg-gray-50 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none">
                    {EDITABLE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={handleRoleUpdate} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 w-auto"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingRole(false)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 w-auto"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 capitalize">{selectedUser.role}</span>
                  <button onClick={() => { setEditingRole(true); setNewRole(selectedUser.role); }}
                    className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition w-auto">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">Email</span>
              </div>
              <span className="text-sm text-gray-900">{selectedUser.email}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">Mobile</span>
              </div>
              <span className="text-sm text-gray-900">{selectedUser.mobile || "N/A"}</span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">Status</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${selectedUser.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  {selectedUser.isApproved ? "Active" : "Inactive"}
                </span>
                <button onClick={handleStatusToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition w-auto ${
                    selectedUser.isApproved
                      ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                      : "bg-emerald-500 text-white hover:bg-emerald-600"
                  }`}>
                  {selectedUser.isApproved ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approved Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {users.length} users</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition w-48" />
          </div>
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none cursor-pointer">
            {ROLES.map((r) => <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <CheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">No users found</h3>
          <p className="text-sm text-gray-400 mt-1">{search ? "Try a different search" : "No approved users yet"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">User</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Role</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="text-center px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user._id} className="hover:bg-orange-50/30 transition cursor-pointer" onClick={() => { setSelectedUser(user); setEditingRole(false); }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {(user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.isApproved ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      {user.isApproved ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition w-auto"
                      onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setEditingRole(false); }}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
