import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Search, ArrowRight } from "lucide-react";
import axios from "axios";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import TournamentStepper from "./TournamentStepper";

const SIG = "#5E6AD2";

const STATUS_STYLES = {
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmed" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-700", label: "Cancelled" },
};

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
        const res = await axios.get(
          `/api/tournaments/getRegisteredPlayers?tournamentId=${tournamentId}`
        );
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

  const counts = {
    all: players.length,
    confirmed: players.filter((p) => p.status === "confirmed").length,
    pending: players.filter((p) => p.status === "pending").length,
    cancelled: players.filter((p) => p.status === "cancelled").length,
  };

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <Breadcrumbs tournamentName={title} />
      <TournamentStepper currentStage={currentStage} />

      <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1.5">
            Registered players
          </p>
          <h1 className="text-[24px] leading-tight font-semibold tracking-tight text-neutral-950">
            {players.length}
            <span className="text-[14px] font-medium text-neutral-500 ml-2">
              total registrations
            </span>
          </h1>
        </div>
        <button
          onClick={() => navigate(`/tournaments/${tournamentId}/groups`)}
          className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white rounded-lg transition active:scale-[0.98]"
          style={{ backgroundColor: SIG }}
        >
          View groups
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players"
            className="w-full h-8 pl-8 pr-3 border border-neutral-200 rounded-lg text-[12px] bg-white focus:outline-none focus:border-[var(--sig)] focus:ring-2 focus:ring-[var(--sig-tint)]"
            style={{ "--sig": SIG, "--sig-tint": "rgba(94,106,210,0.15)" }}
          />
        </div>
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg">
          {["all", "confirmed", "pending", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-7 px-2.5 inline-flex items-center gap-1 rounded-md text-[12px] font-medium transition ${
                statusFilter === s
                  ? "bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <span className="capitalize">{s}</span>
              <span className="font-mono tabular-nums text-[10px] text-neutral-500">
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
          <div className="text-[13px] text-neutral-400">Loading players…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl px-6 py-14 text-center">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 inline-flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-neutral-400" />
          </div>
          <h3 className="text-[14px] font-semibold text-neutral-900">
            {search || statusFilter !== "all"
              ? "No players match these filters"
              : "No registered players yet"}
          </h3>
          <p className="text-[13px] text-neutral-500 mt-1 max-w-md mx-auto">
            {search || statusFilter !== "all"
              ? "Try clearing the search or status filter."
              : "Players will appear here as they register for the tournament."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100">
                <Th className="w-10">#</Th>
                <Th>Player</Th>
                <Th>Category</Th>
                <Th>Payment</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((p, idx) => {
                const s = STATUS_STYLES[p.status] || {
                  bg: "bg-neutral-100",
                  text: "text-neutral-600",
                  label: p.status || "—",
                };
                return (
                  <tr key={p._id} className="hover:bg-neutral-50/60 transition">
                    <td className="px-4 py-2.5 font-mono tabular-nums text-[12px] text-neutral-400">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-[13px] font-medium text-neutral-900">
                        {p.userName}
                      </div>
                      <div className="text-[12px] text-neutral-500">{p.userEmail}</div>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-neutral-700">
                      {p.category || "Open"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                          {p.paymentMethod || "—"}
                        </span>
                        <span className="font-mono tabular-nums text-[12px] text-neutral-700">
                          ₹{p.paymentAmount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${s.bg} ${s.text}`}
                      >
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400 ${className}`}
    >
      {children}
    </th>
  );
}
