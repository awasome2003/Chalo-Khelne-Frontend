import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ClipboardCheck, Check, X, User, Mail, Phone, Building2, Calendar, Search, Loader2 } from "lucide-react";

export default function Pending() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update/pending-approval`);
      if (!res.ok) throw new Error("Failed to fetch");
      setPendingUsers(await res.json());
    } catch (err) {
      toast.error("Failed to load pending requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, status) => {
    const action = status === "approved" ? "approve" : "reject";
    if (status === "rejected" && !window.confirm("Reject this request? The user will be removed.")) return;

    setActionLoading(userId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/update/${action}/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success(status === "approved" ? "Club approved successfully!" : "Request rejected");
    } catch (err) {
      toast.error(`Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = pendingUsers.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendingUsers.length} request{pendingUsers.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
        {pendingUsers.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" />
          </div>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-7 h-7 text-orange-300" />
          </div>
          <h3 className="text-base font-bold text-gray-700">
            {search ? "No matching requests" : "All caught up!"}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {search ? "Try a different search" : "No pending club requests right now"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <div key={user._id} className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 transition-all p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {(user.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-gray-900 truncate">{user.name}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="w-3 h-3" /> {user.email}
                      </span>
                      {user.mobile && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" /> {user.mobile}
                        </span>
                      )}
                      {user.clubName && (
                        <span className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                          <Building2 className="w-3 h-3" /> {user.clubName}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <span className="inline-block mt-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      {user.role || "ClubAdmin"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApproval(user._id, "approved")}
                    disabled={actionLoading === user._id}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition active:scale-[0.97] disabled:opacity-50 w-auto"
                  >
                    {actionLoading === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(user._id, "rejected")}
                    disabled={actionLoading === user._id}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-xl border border-red-200 transition active:scale-[0.97] disabled:opacity-50 w-auto"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
