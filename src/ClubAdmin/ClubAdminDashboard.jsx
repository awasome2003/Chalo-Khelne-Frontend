import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Trophy,
  DollarSign,
  MapPin,
  TrendingUp,
  CreditCard,
  Calendar,
  ArrowRight,
  Gavel,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const ClubAdminDashboard = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [profileData, setProfileData] = useState(null);
  const [overview, setOverview] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth?._id) {
      fetchAll();
    }
  }, [auth]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, overviewRes, paymentsRes] = await Promise.allSettled([
        axios.get(`/api/user/profile/${auth._id}`, { headers }),
        axios.get("/api/club-admin/finance/overview", { headers }),
        axios.get("/api/club-admin/finance/payments?limit=5", { headers }),
      ]);

      if (profileRes.status === "fulfilled") setProfileData(profileRes.value.data);
      if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data.overview);
      if (paymentsRes.status === "fulfilled") setRecentPayments(paymentsRes.value.data.payments || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalManagers = overview?.totalManagers || 0;
  const totalTournaments = overview?.totalTournaments || 0;
  const grandRevenue = overview?.grandTotalRevenue || 0;
  const totalBookings = overview?.totalBookings || 0;
  const tournamentRevenue = overview?.totalTournamentRevenue || 0;
  const bookingRevenue = overview?.totalBookingRevenue || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {profileData?.name || auth?.name || "Club Admin"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {profileData?.clubName || auth?.clubName || "Your club"} — Dashboard Overview
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {(profileData?.name || auth?.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{profileData?.name || auth?.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                <span>{profileData?.email || auth?.email}</span>
                <span>{profileData?.mobile || auth?.mobile || "—"}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/ClubAdminProfile")}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 w-auto flex items-center gap-1"
          >
            Edit Profile <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Users size={22} />}
          color="blue"
          label="Managers"
          value={totalManagers}
          onClick={() => navigate("/staff-admin")}
        />
        <StatCard
          icon={<Trophy size={22} />}
          color="purple"
          label="Tournaments"
          value={totalTournaments}
          onClick={() => navigate("/club-finance")}
        />
        <StatCard
          icon={<DollarSign size={22} />}
          color="green"
          label="Total Revenue"
          value={formatCurrency(grandRevenue)}
          onClick={() => navigate("/payment-history")}
        />
        <StatCard
          icon={<MapPin size={22} />}
          color="orange"
          label="Turf Bookings"
          value={totalBookings}
          onClick={() => navigate("/turf-management")}
        />
      </div>

      {/* Revenue Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-600" /> Revenue Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={18} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Tournament Revenue</span>
              </div>
              <div className="text-2xl font-bold text-purple-800">{formatCurrency(tournamentRevenue)}</div>
              <div className="text-xs text-purple-500 mt-1">From {totalTournaments} tournament(s)</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Turf Booking Revenue</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{formatCurrency(bookingRevenue)}</div>
              <div className="text-xs text-blue-500 mt-1">From {totalBookings} booking(s)</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Manage Turfs", icon: <MapPin size={16} />, path: "/turf-management", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
              { label: "Staff / Managers", icon: <Users size={16} />, path: "/staff-admin", color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
              { label: "Financial Overview", icon: <TrendingUp size={16} />, path: "/club-finance", color: "text-green-600 bg-green-50 hover:bg-green-100" },
              { label: "Payment History", icon: <CreditCard size={16} />, path: "/payment-history", color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
              { label: "Referee Management", icon: <Gavel size={16} />, path: "/club-refree", color: "text-red-600 bg-red-50 hover:bg-red-100" },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${action.color} transition-colors`}
              >
                <span className="flex items-center gap-2">{action.icon} {action.label}</span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Managers + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Managers */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users size={20} className="text-blue-600" /> Managers
            </h3>
            <button
              onClick={() => navigate("/club-finance")}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium w-auto bg-transparent"
            >
              View All
            </button>
          </div>
          {overview?.managers?.length > 0 ? (
            <div className="space-y-3">
              {overview.managers.slice(0, 5).map((mgr) => (
                <div
                  key={mgr._id}
                  onClick={() => navigate("/club-finance")}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {mgr.name?.charAt(0)?.toUpperCase() || "M"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{mgr.name}</div>
                      <div className="text-xs text-gray-400">{mgr.tournaments} tournaments</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-700">{formatCurrency(mgr.totalRevenue)}</div>
                    <div className="text-[10px] text-gray-400">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              <Users size={32} className="mx-auto mb-2 text-gray-300" />
              No managers yet
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard size={20} className="text-green-600" /> Recent Payments
            </h3>
            <button
              onClick={() => navigate("/payment-history")}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium w-auto bg-transparent"
            >
              View All
            </button>
          </div>
          {recentPayments.length > 0 ? (
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      p.type === "tournament" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      {p.type === "tournament" ? <Trophy size={14} /> : <MapPin size={14} />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{p.playerName}</div>
                      <div className="text-xs text-gray-400">{p.reference}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">{formatCurrency(p.amount)}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      p.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
                      p.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {p.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              <CreditCard size={32} className="mx-auto mb-2 text-gray-300" />
              No payments yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function StatCard({ icon, color, label, value, onClick }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default ClubAdminDashboard;
