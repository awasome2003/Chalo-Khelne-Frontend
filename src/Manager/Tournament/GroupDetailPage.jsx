import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Flag, Table, RefreshCcw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import keys from "../../config/queryKeys";
import useTournament from "./useTournament";
import { useGroups, useGroupMatches, useStandings } from "./useGroups";
import Breadcrumbs from "./Breadcrumbs";

export default function GroupDetailPage() {
  const { tournamentId, groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { title } = useTournament(tournamentId);

  const { data: allGroups = [] } = useGroups(tournamentId);
  const group = allGroups.find((g) => g._id === groupId);

  const { data: matches = [], isLoading: matchesLoading } = useGroupMatches(tournamentId, groupId);
  const [showStandings, setShowStandings] = useState(false);
  const { data: standings, refetch: refetchStandings } = useStandings(tournamentId, groupId, showStandings);

  const generateMutation = useMutation({
    mutationFn: (schedule) => axios.post("/api/tournaments/matches/generate", { tournamentId, groupId, ...schedule }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.groupMatches(tournamentId, groupId) });
      alert("Matches generated!");
    },
    onError: (err) => alert("Failed: " + (err.response?.data?.message || err.message)),
  });

  const handleGenerate = () => {
    const court = prompt("Court number:", "1");
    const interval = prompt("Interval (minutes):", "30");
    const time = prompt("Start time (HH:MM):", "10:00");
    if (!court || !time) return;
    generateMutation.mutate({ courtNumber: court, matchInterval: interval, startTime: time });
  };

  const completedCount = matches.filter((m) => m.status === "COMPLETED" || m.status === "completed").length;
  const liveCount = matches.filter((m) => m.status === "IN_PROGRESS" || m.status === "in_progress").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs tournamentName={title} groupName={group?.groupName} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/tournaments/${tournamentId}/groups`)} className="p-2 hover:bg-gray-100 rounded-lg w-auto">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{group?.groupName || "Group"}</h1>
            <p className="text-sm text-gray-500">
              {group?.players?.length || 0} players • {matches.length} matches • {completedCount} completed
              {liveCount > 0 && <span className="text-yellow-600"> • {liveCount} live</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {matches.length === 0 && (
            <button onClick={handleGenerate} disabled={generateMutation.isPending}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-orange-600 w-auto disabled:opacity-50">
              <Flag className="w-4 h-4" /> {generateMutation.isPending ? "Generating..." : "Generate Matches"}
            </button>
          )}
          <button
            onClick={() => { setShowStandings(!showStandings); if (!showStandings) refetchStandings(); }}
            className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 w-auto">
            <Table className="w-4 h-4" /> {showStandings ? "Hide" : "Show"} Standings
          </button>
          <button
            onClick={() => navigate(`/tournament-management/group-stage/${tournamentId}/${groupId}/points-table`, { state: { tournamentId, groupId, round: 1 } })}
            className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 w-auto">
            Full Points Table
          </button>
        </div>
      </div>

      {/* Players */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <h3 className="font-bold text-gray-700 text-sm mb-2">Players</h3>
        <div className="flex flex-wrap gap-2">
          {group?.players?.map((p, i) => (
            <span key={p._id || i} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
              {i + 1}. {p.userId?.name || p.userName || `Player ${i + 1}`}
            </span>
          ))}
        </div>
      </div>

      {/* Standings */}
      {showStandings && standings && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5">
            <h3 className="text-white text-sm font-bold">{standings.groupName} — Standings</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Player</th>
                <th className="px-3 py-2 text-center">P</th>
                <th className="px-3 py-2 text-center">W</th>
                <th className="px-3 py-2 text-center">L</th>
                <th className="px-3 py-2 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.standings?.map((s) => (
                <tr key={s.playerId} className={`border-t border-gray-50 ${s.qualified ? "bg-green-50" : ""}`}>
                  <td className="px-3 py-2 text-gray-500">{s.rank}</td>
                  <td className="px-3 py-2 font-medium text-gray-800">
                    {s.playerName}
                    {s.qualified && <span className="text-[9px] bg-green-500 text-white ml-1 px-1 py-0.5 rounded-full">Q</span>}
                  </td>
                  <td className="px-3 py-2 text-center">{s.played}</td>
                  <td className="px-3 py-2 text-center text-green-600">{s.won}</td>
                  <td className="px-3 py-2 text-center text-red-500">{s.lost}</td>
                  <td className="px-3 py-2 text-center font-bold text-blue-700">{s.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Matches */}
      {matchesLoading ? (
        <div className="text-center py-8 text-gray-400">Loading matches...</div>
      ) : matches.length > 0 ? (
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Matches ({matches.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matches.map((match, idx) => {
              const isComp = match.status === "COMPLETED" || match.status === "completed";
              const isLive = match.status === "IN_PROGRESS" || match.status === "in_progress";
              return (
                <button
                  key={match._id || idx}
                  onClick={() => navigate(`/tournament-management/match/${tournamentId}/${match._id}/score`, {
                    state: { backTo: `/tournaments/${tournamentId}/groups/${groupId}` },
                  })}
                  className={`bg-white rounded-xl border p-4 text-left hover:shadow-md transition-all w-full ${
                    isComp ? "border-green-200 bg-green-50/50" : isLive ? "border-yellow-200 bg-yellow-50/50" : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">M{match.matchNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isComp ? "bg-green-100 text-green-700" : isLive ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                    }`}>{match.status?.replace(/_/g, " ").toUpperCase()}</span>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-sm text-gray-800">{match.player1?.userName || "P1"}</span>
                    <span className="mx-2 text-gray-400 text-xs">vs</span>
                    <span className="font-semibold text-sm text-gray-800">{match.player2?.userName || "P2"}</span>
                  </div>
                  {isComp && match.result?.finalScore && (
                    <div className="text-center mt-1 text-xs text-green-700 font-bold">
                      {match.result.finalScore.player1Sets}-{match.result.finalScore.player2Sets}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Flag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No matches generated yet</p>
        </div>
      )}
    </div>
  );
}
