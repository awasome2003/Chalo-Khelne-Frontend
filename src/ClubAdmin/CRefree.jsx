import { toast } from "react-toastify";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import {
  Users,
  FileText,
  Plus,
  X,
  Eye,
  Search,
  Award,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Mail,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusIcons = {
  pending: <AlertCircle size={14} />,
  accepted: <CheckCircle size={14} />,
  rejected: <XCircle size={14} />,
};

const SPORTS_LIST = [
  "Badminton", "Table Tennis", "Tennis", "Cricket", "Football",
  "Basketball", "Volleyball", "Chess", "Carrom", "Pickleball",
];

const CRefree = () => {
  const { auth } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Data
  const [referees, setReferees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // UI
  const [activeTab, setActiveTab] = useState("referees");
  const [selectedReferee, setSelectedReferee] = useState(null);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // Create Request Form
  const [requestForm, setRequestForm] = useState({
    club: auth?.name || "",
    positionType: "Main Referee",
    game: "",
    matchFee: "",
    date: "",
    time: "",
    venue: "",
    duration: "",
    contact: "",
    notes: "",
  });

  useEffect(() => {
    fetchReferees();
    fetchRequests();
  }, []);

  const fetchReferees = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/referee/referees");
      setReferees(res.data || []);
    } catch (err) {
      console.error("Fetch referees error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const res = await axios.get(`/api/referee/requests${params}`);
      setRequests(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Fetch requests error:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "requests") fetchRequests();
  }, [filterStatus]);

  const handleCreateRequest = async () => {
    try {
      const { club, positionType, game, matchFee, date, time, venue, duration, contact } = requestForm;
      if (!game || !matchFee || !date || !time || !venue || !duration || !contact) {
        toast.warn("Please fill all required fields");
        return;
      }
      await axios.post("/api/referee/requests", requestForm);
      setShowCreateRequest(false);
      setRequestForm({
        club: auth?.name || "",
        positionType: "Main Referee",
        game: "",
        matchFee: "",
        date: "",
        time: "",
        venue: "",
        duration: "",
        contact: "",
        notes: "",
      });
      fetchRequests();
      setActiveTab("requests");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateRequestStatus = async (id, status) => {
    try {
      await axios.put(`/api/referee/requests/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const filteredReferees = referees.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = `${r.firstName} ${r.lastName}`.toLowerCase();
    const sports = (r.sports || []).join(" ").toLowerCase();
    return name.includes(q) || sports.includes(q);
  });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Referee Management</h1>
          <p className="text-sm text-gray-500 mt-1">Browse referees and manage match requests</p>
        </div>
        <button
          onClick={() => setShowCreateRequest(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 w-auto"
        >
          <Plus size={16} /> Create Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Referees</p>
            <p className="text-lg font-bold text-gray-800">{referees.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
            <AlertCircle size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending Requests</p>
            <p className="text-lg font-bold text-gray-800">{requests.filter((r) => r.status === "pending").length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Accepted Requests</p>
            <p className="text-lg font-bold text-gray-800">{requests.filter((r) => r.status === "accepted").length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {[
          { key: "referees", label: "Referees", icon: <Users size={16} /> },
          { key: "requests", label: "Requests", icon: <FileText size={16} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all w-auto ${
              activeTab === tab.key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
            {tab.key === "requests" && requests.filter((r) => r.status === "pending").length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {requests.filter((r) => r.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ===== REFEREES TAB ===== */}
      {activeTab === "referees" && (
        <>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search referees by name or sport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading referees...</div>
          ) : filteredReferees.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">No referees found</h3>
              <p className="text-sm text-gray-400 mt-1">Referees will appear here once they register on the platform</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReferees.map((referee) => {
                const fullName = `${referee.firstName || ""} ${referee.lastName || ""}`.trim();
                const user = referee.userId || {};

                return (
                  <div
                    key={referee._id}
                    onClick={() => setSelectedReferee(referee)}
                    className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {user.profileImage ? (
                        <img className="h-12 w-12 rounded-full object-cover" src={user.profileImage} alt={fullName} />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {fullName.charAt(0) || "R"}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {fullName || "Unknown"}
                        </h3>
                        <p className="text-xs text-gray-400">{user.email || ""}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-purple-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-purple-700">{referee.certificationLevel || "—"}</div>
                        <div className="text-[10px] text-purple-500 font-medium uppercase">Certification</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <div className="text-sm font-bold text-blue-700">{referee.experience || 0} yrs</div>
                        <div className="text-[10px] text-blue-500 font-medium uppercase">Experience</div>
                      </div>
                    </div>

                    {referee.sports?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {referee.sports.map((sport, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">
                            {sport}
                          </span>
                        ))}
                      </div>
                    )}

                    {referee.ratings?.length > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600 font-medium">
                          {(referee.ratings.reduce((s, r) => s + r.value, 0) / referee.ratings.length).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">({referee.ratings.length})</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ===== REQUESTS TAB ===== */}
      {activeTab === "requests" && (
        <>
          {/* Filter */}
          <div className="mb-6">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">No requests yet</h3>
              <p className="text-sm text-gray-400 mt-1">Create a referee request for your upcoming matches</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Left: Request Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800">{req.game}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[req.status]}`}>
                          {statusIcons[req.status]} {req.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Award size={14} /> <span>{req.positionType}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Calendar size={14} /> <span>{req.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Clock size={14} /> <span>{req.time} ({req.duration})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <MapPin size={14} /> <span>{req.venue}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="font-medium text-green-700">Match Fee: ₹{req.matchFee}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">Club: {req.club}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500 flex items-center gap-1">
                          <Phone size={12} /> {req.contact}
                        </span>
                      </div>
                      {req.notes && (
                        <p className="mt-2 text-xs text-gray-400 italic">Notes: {req.notes}</p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {req.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateRequestStatus(req._id, "accepted")}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 w-auto flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Accept
                        </button>
                        <button
                          onClick={() => handleUpdateRequestStatus(req._id, "rejected")}
                          className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 w-auto flex items-center gap-1"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== REFEREE DETAIL MODAL ===== */}
      {selectedReferee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Referee Profile</h3>
              <button onClick={() => setSelectedReferee(null)} className="text-gray-400 hover:text-gray-600 w-auto bg-transparent">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                {selectedReferee.userId?.profileImage ? (
                  <img className="h-16 w-16 rounded-full object-cover" src={selectedReferee.userId.profileImage} alt="" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {(selectedReferee.firstName || "R").charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedReferee.firstName} {selectedReferee.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedReferee.userId?.email}</p>
                  {selectedReferee.certificationLevel && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      <Award size={12} /> {selectedReferee.certificationLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <DetailItem label="Experience" value={`${selectedReferee.experience || 0} years`} />
                <DetailItem label="Gender" value={selectedReferee.gender || "—"} />
                <DetailItem label="Date of Birth" value={formatDate(selectedReferee.dob)} />
                <DetailItem label="Address" value={selectedReferee.address || "—"} />
              </div>

              {/* Sports */}
              {selectedReferee.sports?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Sports</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReferee.sports.map((sport, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{sport}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {(selectedReferee.bio || selectedReferee.about) && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">About</h4>
                  <p className="text-sm text-gray-600">{selectedReferee.bio || selectedReferee.about}</p>
                </div>
              )}

              {/* Certificates */}
              {selectedReferee.certificates?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Certificates</h4>
                  <div className="space-y-2">
                    {selectedReferee.certificates.map((cert, i) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-700">{cert.name}</div>
                          <div className="text-xs text-gray-400">Issued by: {cert.issuedBy} | {formatDate(cert.issueDate)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {selectedReferee.availableDays?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Days</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReferee.availableDays.map((day, i) => (
                      <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">{day}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {selectedReferee.emergencyContact && (
                <div className="bg-red-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-red-700 mb-1">Emergency Contact</h4>
                  <p className="text-sm text-red-600">
                    {selectedReferee.emergencyContactName || "—"} — {selectedReferee.emergencyContact}
                  </p>
                </div>
              )}

              {/* Ratings */}
              {selectedReferee.ratings?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Rating: {(selectedReferee.ratings.reduce((s, r) => s + r.value, 0) / selectedReferee.ratings.length).toFixed(1)} / 5
                    <span className="text-gray-400 font-normal"> ({selectedReferee.ratings.length} reviews)</span>
                  </h4>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const avg = selectedReferee.ratings.reduce((s, r) => s + r.value, 0) / selectedReferee.ratings.length;
                      return (
                        <Star
                          key={star}
                          size={16}
                          className={star <= Math.round(avg) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE REQUEST MODAL ===== */}
      {showCreateRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Create Referee Request</h3>
              <button onClick={() => setShowCreateRequest(false)} className="text-gray-400 hover:text-gray-600 w-auto bg-transparent">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                <input
                  type="text"
                  value={requestForm.club}
                  onChange={(e) => setRequestForm({ ...requestForm, club: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sport / Game *</label>
                  <select
                    value={requestForm.game}
                    onChange={(e) => setRequestForm({ ...requestForm, game: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select sport</option>
                    {SPORTS_LIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position Type</label>
                  <select
                    value={requestForm.positionType}
                    onChange={(e) => setRequestForm({ ...requestForm, positionType: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="Main Referee">Main Referee</option>
                    <option value="Assistant Referee">Assistant Referee</option>
                    <option value="Line Judge">Line Judge</option>
                    <option value="Umpire">Umpire</option>
                    <option value="Scorer">Scorer</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Match Fee (₹) *</label>
                  <input
                    type="text"
                    value={requestForm.matchFee}
                    onChange={(e) => setRequestForm({ ...requestForm, matchFee: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    value={requestForm.duration}
                    onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., 3 hours"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={requestForm.date}
                    onChange={(e) => setRequestForm({ ...requestForm, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    value={requestForm.time}
                    onChange={(e) => setRequestForm({ ...requestForm, time: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                <input
                  type="text"
                  value={requestForm.venue}
                  onChange={(e) => setRequestForm({ ...requestForm, venue: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., City Sports Complex, Court 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                <input
                  type="text"
                  value={requestForm.contact}
                  onChange={(e) => setRequestForm({ ...requestForm, contact: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Any special requirements..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowCreateRequest(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-auto">
                Cancel
              </button>
              <button onClick={handleCreateRequest} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-auto">
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component
function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

export default CRefree;
