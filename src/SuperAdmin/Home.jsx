import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  UserLock,
  MessageSquare,
  Building2,
  Trophy,
  Plus,
  Activity,
} from "lucide-react";

export default function Home() {
  const [overview, setOverview] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    stats: {
      players: 0,
      trainers: 0,
      clubAdmins: 0,
      corporateAdmins: 0,
      totalInquiries: 0,
      pendingInquiries: 0
    }
  });
  const [sportName, setSportName] = useState("");
  const [success, setSuccess] = useState("");
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, sportsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/update/overview`),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/sports`)
        ]);
        setOverview(overviewRes.data);
        setSports(sportsRes.data.data || sportsRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [success]);

  const handleAddSport = async () => {
    if (!sportName.trim()) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/sports`,
        { name: sportName }
      );
      setSuccess("Sport added successfully");
      setSportName("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      toast.info(err.response?.data?.message || "Failed to add sport");
    }
  };

  const toggleSportStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/sports/${id}`, {
        isActive: !currentStatus,
      });
      setSports((prev) =>
        prev.map((sport) =>
          sport._id === id ? { ...sport, isActive: !currentStatus } : sport
        )
      );
      setSuccess("Sport status updated");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading && !overview.totalRequests) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: overview.totalRequests, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Approvals", value: overview.pending, icon: UserLock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Approved Users", value: overview.approved, icon: UserCheck, color: "bg-green-50 text-green-600" },
    { label: "Players", value: overview.stats?.players || 0, icon: Trophy, color: "bg-purple-50 text-purple-600" },
    { label: "Club Admins", value: overview.stats?.clubAdmins || 0, icon: Building2, color: "bg-indigo-50 text-indigo-600" },
    { label: "Corporate Admins", value: overview.stats?.corporateAdmins || 0, icon: Activity, color: "bg-orange-50 text-orange-600" },
    { label: "Total Inquiries", value: overview.stats?.totalInquiries || 0, icon: MessageSquare, color: "bg-teal-50 text-teal-600" },
    { label: "Pending Inquiries", value: overview.stats?.pendingInquiries || 0, icon: MessageSquare, color: "bg-pink-50 text-pink-600" },
  ];

  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h3>
        <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
          Real-time Statistics
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label.split(' ')[0]}</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Sport Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <h4 className="text-xl font-bold text-gray-800">Add New Sport</h4>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={sportName}
                onChange={(e) => setSportName(e.target.value)}
                placeholder="Enter sport name (e.g. Badminton)"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50"
              />
              <button
                onClick={handleAddSport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition font-semibold shadow-lg shadow-blue-200 active:scale-95"
              >
                Add Sport
              </button>
            </div>
            {success && (
              <p className="text-green-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {success}
              </p>
            )}
          </div>
        </div>

        {/* Available Sports Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Trophy className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-gray-800">Available Sports</h4>
            </div>
            <span className="text-sm font-medium text-gray-400">{sports.length} Sports</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider">Sport</th>
                  <th className="px-6 py-4 text-center font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sports.map((sport) => (
                  <tr key={sport._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 capitalize italic">{sport.name}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${sport.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {sport.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleSportStatus(sport._id, sport.isActive)}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95 ${sport.isActive
                          ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                      >
                        {sport.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
