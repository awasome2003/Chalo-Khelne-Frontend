import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import {
  Search,
  Filter,
  Trophy,
  MapPin,
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
} from "lucide-react";

const statusColors = {
  paid: "bg-green-100 text-green-700",
  approved: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  confirmed: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  waived: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
};

const PaymentHistoryPage = () => {
  const { auth } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [payments, setPayments] = useState([]);
  const [totals, setTotals] = useState({ count: 0, revenue: 0, completed: 0, pending: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [activeTab, statusFilter, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagination.page, limit: 30 });
      if (activeTab !== "all") params.append("type", activeTab);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await axios.get(`/api/club-admin/finance/payments?${params}`, { headers });
      setPayments(res.data.payments || []);
      setTotals(res.data.totals || { count: 0, revenue: 0, completed: 0, pending: 0 });
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error("Fetch payments error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchPayments();
  };

  const formatCurrency = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
        <p className="text-sm text-gray-500 mt-1">All tournament registrations and turf booking payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<DollarSign />} color="blue" label="Total Payments" value={totals.count} />
        <StatCard icon={<TrendingUp />} color="green" label="Total Revenue" value={formatCurrency(totals.revenue)} />
        <StatCard icon={<CheckCircle />} color="emerald" label="Completed" value={totals.completed} />
        <StatCard icon={<Clock />} color="yellow" label="Pending" value={totals.pending} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="flex border-b border-gray-100">
          {[
            { key: "all", label: "All Payments", icon: <CreditCard size={16} /> },
            { key: "tournament", label: "Tournament", icon: <Trophy size={16} /> },
            { key: "turf", label: "Turf Bookings", icon: <MapPin size={16} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPagination((p) => ({ ...p, page: 1 })); }}
              className={`px-5 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-all w-auto bg-transparent mt-0 ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="p-4 flex flex-wrap gap-3 items-center">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by player name, tournament, or manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 380px)" }}>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No payments found</h3>
            <p className="text-sm text-gray-400 mt-1">Payments from tournament registrations and turf bookings will appear here</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Player</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Reference</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Manager</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Amount</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Payment</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase bg-gray-50">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.type === "tournament" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {p.type === "tournament" ? <Trophy size={12} /> : <MapPin size={12} />}
                        {p.type === "tournament" ? "Tournament" : "Turf"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 text-sm">{p.playerName}</div>
                      <div className="text-xs text-gray-400">{p.playerEmail}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{p.reference}</div>
                      {p.categories && <div className="text-xs text-gray-400">{p.categories}</div>}
                      {p.timeSlot && <div className="text-xs text-gray-400">{p.timeSlot}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.manager}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500 capitalize">{p.paymentMethod}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[p.paymentStatus] || statusColors[p.status] || "bg-gray-100 text-gray-600"
                      }`}>
                        {p.paymentStatus || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 w-auto"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 w-auto"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({ icon, color, label, value }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    emerald: "bg-emerald-100 text-emerald-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default PaymentHistoryPage;
