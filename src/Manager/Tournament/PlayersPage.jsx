import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Search, Check, X, Mail, Phone } from "lucide-react";
import axios from "axios";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import TournamentStepper from "./TournamentStepper";

export default function PlayersPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { title, currentStage } = useTournament(tournamentId);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!tournamentId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/tournaments/getRegisteredPlayers?tournamentId=${tournamentId}`);
        setPlayers(res.data?.bookings || []);
      } catch (err) {
        console.error("Error fetching players:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [tournamentId]);

  const filtered = players.filter((p) => {
    const name = (p.userName || "").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: players.length,
    confirmed: players.filter((p) => p.status === "confirmed").length,
    pending: players.filter((p) => p.status === "pending").length,
    cancelled: players.filter((p) => p.status === "cancelled").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs tournamentName={title} />
      <TournamentStepper currentStage={currentStage} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Registered Players</h1>
          <p className="text-sm text-gray-500">{players.length} total registrations</p>
        </div>
        <button
          onClick={() => navigate(`/tournaments/${tournamentId}/groups`)}
          className="bg-[#004E93] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-800 transition w-auto"
        >
          View Groups →
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
        </div>
        {["all", "confirmed", "pending", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition w-auto ${
              statusFilter === s ? "bg-[#004E93] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {/* Player List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading players...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No players found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Player</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p._id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{p.userName}</div>
                    <div className="text-xs text-gray-400">{p.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category || "Open"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-gray-500">{p.paymentMethod} • ₹{p.paymentAmount || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      p.status === "confirmed" ? "bg-green-100 text-green-700" :
                      p.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {p.status}
                    </span>
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
