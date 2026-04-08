import { useState } from "react";
import { Users, Search, Plus, FileText, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { useReferees, useRequests, useCreateRequest, useUpdateRequestStatus } from "./useReferees";
import RefereeCard from "./RefereeCard";
import RefereeDetailModal from "./RefereeDetailModal";
import CreateRequestModal from "./CreateRequestModal";

const STATUS_STYLE = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
  accepted: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
};

/**
 * Unified referee management component.
 *
 * Props:
 * - canManage: boolean — show requests tab, create/accept/reject (ClubAdmin)
 * - className: string
 */
export default function RefereeList({ canManage = false, className = "" }) {
  const { data: referees = [], isLoading } = useReferees();
  const [activeTab, setActiveTab] = useState("referees");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedReferee, setSelectedReferee] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: requests = [] } = useRequests(filterStatus);
  const createMutation = useCreateRequest();
  const updateMutation = useUpdateRequestStatus();

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filtered = referees.filter((r) => {
    if (!search) return true;
    const name = (r.name || r.userName || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className={`min-h-screen ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Referee Management</h1>
          <p className="text-sm text-gray-500">{referees.length} referees registered</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-800 transition w-auto"
          >
            <Plus className="w-4 h-4" /> Create Request
          </button>
        )}
      </div>

      {/* Stats (admin only) */}
      {canManage && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Referees" value={referees.length} icon={Users} color="blue" />
          <StatCard label="Pending Requests" value={pendingCount} icon={AlertCircle} color="yellow" />
          <StatCard label="Accepted" value={requests.filter((r) => r.status === "accepted").length} icon={CheckCircle} color="green" />
        </div>
      )}

      {/* Tabs (admin only) */}
      {canManage && (
        <div className="flex gap-2 mb-6 border-b border-gray-100 pb-3">
          {[
            { key: "referees", label: "Referees", badge: referees.length },
            { key: "requests", label: "Requests", badge: pendingCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition w-auto flex items-center gap-2 ${
                activeTab === tab.key ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? "bg-white/20" : "bg-gray-200"
                }`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Referees Tab */}
      {(activeTab === "referees" || !canManage) && (
        <>
          {/* Search */}
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search referees..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading referees...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No referees found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((ref) => (
                <RefereeCard
                  key={ref._id}
                  referee={ref}
                  onClick={canManage ? () => setSelectedReferee(ref) : undefined}
                  compact={!canManage}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Requests Tab (admin only) */}
      {canManage && activeTab === "requests" && (
        <>
          {/* Status Filter */}
          <div className="mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No requests found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const style = STATUS_STYLE[req.status] || STATUS_STYLE.pending;
                const StatusIcon = style.icon;
                return (
                  <div key={req._id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-sm">{req.game}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                          {req.status?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{req.date}</span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      {req.venue && <p>Venue: {req.venue}</p>}
                      {req.matchFee && <p>Fee: ₹{req.matchFee}</p>}
                      {req.positionType && <p>Position: {req.positionType}</p>}
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => updateMutation.mutate({ id: req._id, status: "accepted" })}
                          disabled={updateMutation.isPending}
                          className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 w-auto flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: req._id, status: "rejected" })}
                          disabled={updateMutation.isPending}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 w-auto flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedReferee && (
        <RefereeDetailModal referee={selectedReferee} onClose={() => setSelectedReferee(null)} />
      )}

      <CreateRequestModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={createMutation.mutateAsync}
        loading={createMutation.isPending}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-800">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}
