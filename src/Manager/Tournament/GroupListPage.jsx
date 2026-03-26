import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid3X3, Users, Trophy, ArrowRight, AlertCircle } from "lucide-react";
import axios from "axios";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import TournamentStepper from "./TournamentStepper";

export default function GroupListPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { title, currentStage } = useTournament(tournamentId);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchCounts, setMatchCounts] = useState({});

  useEffect(() => {
    if (!tournamentId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/tournaments/bookinggroups/tournament/${tournamentId}`);
        const allGroups = res.data?.data || [];
        setGroups(allGroups);

        // Fetch match counts per group
        const counts = {};
        for (const g of allGroups.slice(0, 20)) {
          try {
            const mRes = await axios.get(`/api/tournaments/matches/${tournamentId}/${g._id}`);
            const matches = mRes.data?.matches || [];
            counts[g._id] = {
              total: matches.length,
              completed: matches.filter((m) => m.status === "COMPLETED" || m.status === "completed").length,
              inProgress: matches.filter((m) => m.status === "IN_PROGRESS" || m.status === "in_progress").length,
            };
          } catch {
            counts[g._id] = { total: 0, completed: 0, inProgress: 0 };
          }
        }
        setMatchCounts(counts);
      } catch (err) {
        console.error("Error fetching groups:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [tournamentId]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading groups...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs tournamentName={title} />
      <TournamentStepper currentStage={currentStage} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Groups</h1>
          <p className="text-sm text-gray-500">{groups.length} groups in this tournament</p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">No groups created yet</p>
          <p className="text-gray-400 text-sm mt-1">Go to Registered Players to create groups</p>
          <button
            onClick={() => navigate(`/tournaments/${tournamentId}/players`)}
            className="mt-4 bg-[#004E93] text-white px-5 py-2 rounded-lg text-sm font-semibold w-auto"
          >
            Go to Players
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, idx) => {
            const mc = matchCounts[group._id] || { total: 0, completed: 0, inProgress: 0 };
            const progress = mc.total > 0 ? Math.round((mc.completed / mc.total) * 100) : 0;
            const isRound2 = group.groupName?.toLowerCase().includes("round 2") || group.isRound2;

            return (
              <button
                key={group._id}
                onClick={() => navigate(`/tournaments/${tournamentId}/groups/${group._id}`)}
                className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-md hover:border-gray-200 transition-all group"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isRound2 ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {isRound2 ? "R2" : String.fromCharCode(65 + idx)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{group.groupName || `Group ${idx + 1}`}</h3>
                      {group.category && <span className="text-[10px] text-gray-400 font-medium">{group.category}</span>}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Players */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <Users className="w-3.5 h-3.5" />
                  <span>{group.players?.length || 0} players</span>
                </div>

                {/* Match Progress */}
                {mc.total > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>{mc.completed}/{mc.total} matches</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {mc.inProgress > 0 && (
                      <div className="text-[10px] text-yellow-600 font-medium mt-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                        {mc.inProgress} live
                      </div>
                    )}
                  </div>
                )}

                {mc.total === 0 && (
                  <div className="text-[10px] text-gray-400 bg-gray-50 rounded-lg py-1.5 px-2 text-center">
                    No matches generated
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
