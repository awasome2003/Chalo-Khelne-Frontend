import { toast } from "react-toastify";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import {
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  ChevronRight,
  Calendar,
  MapPin,
  User,
  CreditCard,
  BarChart3,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
} from "lucide-react";

const statusBadge = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  upcoming: "bg-blue-100 text-blue-700",
  "in-progress": "bg-orange-100 text-orange-700",
};

export default function ClubAdminFinance() {
  const { auth } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // State
  const [view, setView] = useState("overview"); // overview | manager | tournament
  const [overview, setOverview] = useState(null);
  const [managerDetail, setManagerDetail] = useState(null);
  const [tournamentDetail, setTournamentDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedManagerName, setSelectedManagerName] = useState("");

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/club-admin/finance/overview", { headers });
      setOverview(res.data.overview);
    } catch (err) {
      console.error("Finance overview error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openManagerDetail = async (managerId, managerName) => {
    try {
      setLoading(true);
      setSelectedManagerName(managerName);
      const res = await axios.get(`/api/club-admin/finance/manager/${managerId}`, { headers });
      setManagerDetail(res.data);
      setView("manager");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const openTournamentDetail = async (tournamentId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/club-admin/finance/tournament/${tournamentId}`, { headers });
      setTournamentDetail(res.data);
      setView("tournament");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (view === "tournament") {
      setView("manager");
      setTournamentDetail(null);
    } else if (view === "manager") {
      setView("overview");
      setManagerDetail(null);
    }
  };

  const formatCurrency = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {view !== "overview" && (
          <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors w-auto bg-white border border-gray-200">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {view === "overview" && "Financial Overview"}
            {view === "manager" && `${selectedManagerName} — Details`}
            {view === "tournament" && `Tournament — ${tournamentDetail?.tournament?.title || ""}`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {view === "overview" && "Track all managers, tournaments, and revenue"}
            {view === "manager" && "Tournaments, bookings, and revenue breakdown"}
            {view === "tournament" && "Registrations and category-wise revenue"}
          </p>
        </div>
      </div>

      {/* =================== OVERVIEW VIEW =================== */}
      {view === "overview" && overview && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard icon={<Users />} color="blue" label="Total Managers" value={overview.totalManagers} />
            <SummaryCard icon={<Trophy />} color="purple" label="Total Tournaments" value={overview.totalTournaments} />
            <SummaryCard icon={<DollarSign />} color="green" label="Tournament Revenue" value={formatCurrency(overview.totalTournamentRevenue)} />
            <SummaryCard icon={<TrendingUp />} color="orange" label="Grand Total Revenue" value={formatCurrency(overview.grandTotalRevenue)} />
          </div>

          {/* Manager Cards */}
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Managers</h2>
          {overview.managers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">No managers found</h3>
              <p className="text-sm text-gray-400 mt-1">Create managers from your dashboard to see their financial data here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.managers.map((mgr) => (
                <div
                  key={mgr._id}
                  onClick={() => openManagerDetail(mgr._id, mgr.name)}
                  className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                >
                  {/* Manager Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                      {mgr.name?.charAt(0)?.toUpperCase() || "M"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{mgr.name}</h3>
                      <p className="text-xs text-gray-400">{mgr.email}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-bold text-purple-700">{mgr.tournaments}</div>
                      <div className="text-[10px] text-purple-500 font-medium uppercase">Tournaments</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-bold text-green-700">{formatCurrency(mgr.totalRevenue)}</div>
                      <div className="text-[10px] text-green-500 font-medium uppercase">Revenue</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-bold text-blue-700">{mgr.tournamentBookings}</div>
                      <div className="text-[10px] text-blue-500 font-medium uppercase">Registrations</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2.5 text-center">
                      <div className="text-lg font-bold text-orange-700">{mgr.turfBookings}</div>
                      <div className="text-[10px] text-orange-500 font-medium uppercase">Turf Bookings</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${mgr.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {mgr.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Joined {new Date(mgr.joinedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* =================== MANAGER DETAIL VIEW =================== */}
      {view === "manager" && managerDetail && (
        <>
          {/* Manager Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <SummaryCard icon={<Trophy />} color="purple" label="Tournaments" value={managerDetail.totals.totalTournaments} />
            <SummaryCard icon={<DollarSign />} color="green" label="Tournament Revenue" value={formatCurrency(managerDetail.totals.totalTournamentRevenue)} />
            <SummaryCard icon={<MapPin />} color="blue" label="Turf Bookings" value={managerDetail.totals.totalTurfBookings} />
            <SummaryCard icon={<CreditCard />} color="orange" label="Turf Revenue" value={formatCurrency(managerDetail.totals.totalTurfRevenue)} />
            <SummaryCard icon={<TrendingUp />} color="emerald" label="Grand Total" value={formatCurrency(managerDetail.totals.grandTotal)} />
          </div>

          {/* Tournaments Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Trophy size={20} className="text-purple-600" /> Tournaments ({managerDetail.tournaments.length})
              </h3>
            </div>
            {managerDetail.tournaments.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No tournaments created by this manager</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tournament</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sport</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Registrations</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {managerDetail.tournaments.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800 text-sm">{t.tournamentName || t.title}</div>
                          <div className="text-xs text-gray-400">{t.type}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{t.sport || t.sportsType || "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[t.status || t.currentStage?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                            {t.status || t.currentStage || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm font-semibold text-gray-800">{t.confirmedRegistrations}</div>
                          <div className="text-[10px] text-gray-400">{t.totalRegistrations} total</div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-700 text-sm">
                          {formatCurrency(t.paidRevenue)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {t.startDate || "—"} — {t.endDate || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openTournamentDetail(t._id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-auto"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Turf Bookings Summary */}
          {managerDetail.turfSummary.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" /> Turf Bookings
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Turf</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Confirmed</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Cancelled</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {managerDetail.turfSummary.map((turf) => (
                      <tr key={turf.turfId} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800 text-sm">{turf.turfName}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{turf.totalBookings}</td>
                        <td className="px-4 py-3 text-center text-sm text-green-600 font-medium">{turf.confirmedBookings}</td>
                        <td className="px-4 py-3 text-center text-sm text-red-500">{turf.cancelledBookings}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-700 text-sm">{formatCurrency(turf.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* =================== TOURNAMENT DETAIL VIEW =================== */}
      {view === "tournament" && tournamentDetail && (
        <>
          {/* Tournament Info Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex flex-wrap gap-6 items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{tournamentDetail.tournament.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{tournamentDetail.tournament.sportsType}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{tournamentDetail.tournament.type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[tournamentDetail.tournament.currentStage?.toLowerCase()] || "bg-gray-100 text-gray-600"}`}>
                    {tournamentDetail.tournament.currentStage}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {tournamentDetail.tournament.startDate} — {tournamentDetail.tournament.endDate}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard icon={<Users />} color="blue" label="Total Registrations" value={tournamentDetail.summary.totalRegistrations} />
            <SummaryCard icon={<CheckCircle />} color="green" label="Confirmed" value={tournamentDetail.summary.confirmedRegistrations} />
            <SummaryCard icon={<Clock />} color="yellow" label="Pending" value={tournamentDetail.summary.pendingRegistrations} />
            <SummaryCard icon={<DollarSign />} color="emerald" label="Total Revenue" value={formatCurrency(tournamentDetail.summary.totalRevenue)} />
          </div>

          {/* Category Breakdown */}
          {tournamentDetail.summary.categoryBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 size={20} className="text-purple-600" /> Category-wise Breakdown
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Fee</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Confirmed</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Paid</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tournamentDetail.summary.categoryBreakdown.map((cat, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800 text-sm">{cat.name}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(cat.fee)}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{cat.total}</td>
                        <td className="px-4 py-3 text-center text-sm text-green-600 font-medium">{cat.confirmed}</td>
                        <td className="px-4 py-3 text-center text-sm text-blue-600 font-medium">{cat.paid}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-700 text-sm">{formatCurrency(cat.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Registration List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Receipt size={20} className="text-blue-600" /> All Registrations ({tournamentDetail.registrations.length})
              </h3>
            </div>
            {tournamentDetail.registrations.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No registrations yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Player</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Categories</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tournamentDetail.registrations.map((reg) => (
                      <tr key={reg._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800 text-sm">{reg.userName}</div>
                          <div className="text-xs text-gray-400">{reg.userEmail || reg.userPhone || ""}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(reg.selectedCategories || []).map((cat, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                                {cat.name} ({formatCurrency(cat.price)})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[reg.status] || "bg-gray-100 text-gray-600"}`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            reg.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                            reg.paymentStatus === "waived" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {reg.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                          {formatCurrency(reg.paymentAmount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(reg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Reusable Summary Card Component
function SummaryCard({ icon, color, label, value }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    yellow: "bg-yellow-100 text-yellow-600",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color] || colors.blue}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}
