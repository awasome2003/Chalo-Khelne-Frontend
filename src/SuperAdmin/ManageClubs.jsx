import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Building2, Pencil, Trash2, X, Loader2, Search, Mail, Phone, MapPin, Trophy } from "lucide-react";

export default function ManageClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      const res = await axios.get("/api/clubadminprofile");
      setClubs(res.data);
      setSelectedUsers([]);
    } catch (error) {
      toast.error("Failed to fetch clubs");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await axios.patch(`/api/clubadminprofile/${userId}/status`);
      toast.success(res.data.message);
      setClubs(clubs.map((c) => c._id === userId ? { ...c, isActive: res.data.isActive } : c));
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this club admin? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/clubadminprofile/${userId}`);
      toast.success("Club deleted successfully");
      fetchClubs();
    } catch (error) {
      toast.error("Failed to delete club");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedUsers.length} selected clubs? This cannot be undone.`)) return;
    try {
      await axios.delete("/api/clubadminprofile/bulk", { data: { userIds: selectedUsers } });
      toast.success("Selected clubs deleted");
      fetchClubs();
    } catch (error) {
      toast.error("Failed to delete selected");
    }
  };

  const handleSelectAll = (e) => {
    setSelectedUsers(e.target.checked ? filtered.map((c) => c._id) : []);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const handleEditClick = (club) => {
    setEditForm({
      userId: club._id,
      name: club.name || "",
      email: club.email || "",
      mobile: club.mobile || "",
      clubName: club.profile?.clubName || club.clubName || "",
      address: club.profile?.address || "",
      city: club.profile?.city || "",
      area: club.profile?.area || "",
      sports: club.profile?.sports || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`/api/clubadminprofile/${editForm.userId}`, editForm);
      toast.success("Club updated successfully");
      setIsEditModalOpen(false);
      fetchClubs();
    } catch (error) {
      toast.error("Failed to update club");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = clubs.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (c.name || "").toLowerCase().includes(s) ||
           (c.email || "").toLowerCase().includes(s) ||
           (c.profile?.clubName || c.clubName || "").toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Clubs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {clubs.length} clubs</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clubs..."
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition w-56" />
          </div>
          {selectedUsers.length > 0 && (
            <button onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition w-auto">
              <Trash2 className="w-4 h-4" /> Delete ({selectedUsers.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-orange-300" />
          </div>
          <h3 className="text-base font-bold text-gray-700">{search ? "No matching clubs" : "No clubs yet"}</h3>
          <p className="text-sm text-gray-400 mt-1">
            {search ? "Try a different search" : "Create your first club from 'Create Club Admin'"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="w-12 px-4 py-3 text-center">
                    <input type="checkbox" checked={selectedUsers.length > 0 && selectedUsers.length === filtered.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500/20 w-4 h-4 cursor-pointer" />
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Club</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Admin</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Contact</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Location</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((club) => {
                  const isSelected = selectedUsers.includes(club._id);
                  return (
                    <tr key={club._id} className={`transition ${isSelected ? "bg-orange-50/50" : "hover:bg-orange-50/20"}`}>
                      <td className="px-4 py-4 text-center">
                        <input type="checkbox" checked={isSelected} onChange={() => handleSelectUser(club._id)}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500/20 w-4 h-4 cursor-pointer" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{club.profile?.clubName || club.clubName || "N/A"}</p>
                            {club.profile?.clubID && <p className="text-[10px] text-gray-400 font-mono">{club.profile.clubID}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-800">{club.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {club.email}</p>
                          {club.mobile && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {club.mobile}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {(club.profile?.city || club.profile?.area) ? (
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {[club.profile?.area, club.profile?.city].filter(Boolean).join(", ")}
                          </p>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => handleToggleStatus(club._id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition w-auto ${
                            club.isActive !== false
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}>
                          {club.isActive !== false ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEditClick(club)}
                            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition w-auto" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(club._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition w-auto" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg font-bold text-white">Edit Club Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition w-auto">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModalField label="Admin Name *" name="name" value={editForm.name} onChange={handleEditChange} required />
                <ModalField label="Club Name *" name="clubName" value={editForm.clubName} onChange={handleEditChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModalField label="Email (read-only)" name="email" type="email" value={editForm.email} disabled />
                <ModalField label="Phone *" name="mobile" type="tel" value={editForm.mobile} onChange={handleEditChange} required />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ModalField label="City" name="city" value={editForm.city} onChange={handleEditChange} />
                  <ModalField label="Area" name="area" value={editForm.area} onChange={handleEditChange} />
                </div>
              </div>

              <ModalField label="Sports (comma separated)" name="sports" value={editForm.sports} onChange={handleEditChange} />

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Detailed Address</label>
                <textarea name="address" rows={2} value={editForm.address} onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition resize-none" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-100 rounded-xl transition w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition flex items-center gap-2 w-auto">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalField({ label, name, type = "text", value, onChange, required, disabled }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} disabled={disabled}
        className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm transition outline-none ${
          disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        }`} />
    </div>
  );
}
