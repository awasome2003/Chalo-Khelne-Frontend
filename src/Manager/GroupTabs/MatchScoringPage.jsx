import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Trophy, RefreshCcw, Check, AlertCircle } from "lucide-react";
import useMatchScoring from "../Tournament/useMatchScoring";
import { DynamicScorer, getSportConfig } from "../../features/scoring";

/**
 * Dedicated match scoring page — replaces all scoring modals.
 * Route: /tournament-management/match/:matchId/score
 * Works for group stage, knockout, direct knockout, team knockout.
 */
export default function MatchScoringPage() {
  const { matchId, tournamentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.backTo || `/tournament-management/group-stage?tournamentId=${tournamentId}`;

  const {
    match, matchFormat, loading, error, submitting,
    player1Name, player2Name,
    sets, player1SetsWon, player2SetsWon,
    isCompleted, isInProgress, winnerName,
    // manualGames managed internally by DynamicScorer
    submitBulkScores, loadMatch,
  } = useMatchScoring(matchId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading match...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-semibold">{error || "Match not found"}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#004E93] text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(backTo)} className="p-2 hover:bg-white/10 rounded-lg transition w-auto">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Match Scoring</h1>
            <p className="text-blue-200 text-sm">
              {match.roundName || match.round || "Group Stage"} {match.matchNumber && `• M${match.matchNumber}`}
              {matchFormat && ` • Best of ${matchFormat.totalSets} sets • ${matchFormat.gamesToWin} games/set • ${matchFormat.pointsToWinGame} pts/game`}
            </p>
          </div>
          <StatusBadge status={match.status} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Players + Score Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <div className="flex items-center justify-between">
              <PlayerCard name={player1Name} setsWon={player1SetsWon} isWinner={winnerName === player1Name} />
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Score</span>
                <span className="text-3xl font-black text-gray-800">
                  {player1SetsWon} — {player2SetsWon}
                </span>
              </div>
              <PlayerCard name={player2Name} setsWon={player2SetsWon} isWinner={winnerName === player2Name} />
            </div>
          </div>

          {/* Winner Banner */}
          {isCompleted && winnerName && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-white text-center">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">{winnerName} wins!</span>
                <span className="text-green-100">({player1SetsWon}-{player2SetsWon})</span>
              </div>
            </div>
          )}
        </div>

        {/* Set Scorecard */}
        {sets.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Set Scorecard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Player</th>
                    {sets.map((s, i) => (
                      <th key={i} className={`text-center py-2 px-3 font-medium ${s.status === "COMPLETED" ? "text-gray-800" : "text-gray-300"}`}>
                        S{s.setNumber || i + 1}
                      </th>
                    ))}
                    <th className="text-center py-2 px-3 font-bold text-gray-800">Sets</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-3 px-3 font-semibold text-[#004E93]">{player1Name}</td>
                    {sets.map((s, i) => {
                      const gamesWon = s.games?.filter((g) => {
                        const w = g.winner;
                        if (!w) return false;
                        return w.playerId?.toString() === match.player1?.playerId?.toString() || w.playerName === player1Name;
                      }).length || 0;
                      return (
                        <td key={i} className={`text-center py-3 px-3 font-bold ${gamesWon > (s.games?.length - gamesWon || 0) ? "text-green-600" : "text-gray-400"}`}>
                          {s.status === "COMPLETED" || s.games?.length > 0 ? gamesWon : "-"}
                        </td>
                      );
                    })}
                    <td className="text-center py-3 px-3 font-black text-lg text-[#004E93]">{player1SetsWon}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-[#004E93]">{player2Name}</td>
                    {sets.map((s, i) => {
                      const gamesWon = s.games?.filter((g) => {
                        const w = g.winner;
                        if (!w) return false;
                        return w.playerId?.toString() === match.player2?.playerId?.toString() || w.playerName === player2Name;
                      }).length || 0;
                      return (
                        <td key={i} className={`text-center py-3 px-3 font-bold ${gamesWon > (s.games?.length - gamesWon || 0) ? "text-green-600" : "text-gray-400"}`}>
                          {s.status === "COMPLETED" || s.games?.length > 0 ? gamesWon : "-"}
                        </td>
                      );
                    })}
                    <td className="text-center py-3 px-3 font-black text-lg text-[#004E93]">{player2SetsWon}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Game Details per Set */}
            <div className="mt-4 flex flex-wrap gap-3">
              {sets.map((s, i) => (
                <SetDetail key={i} set={s} player1Name={player1Name} player2Name={player2Name} match={match} />
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Score Entry — sport-aware, config-driven */}
        {!isCompleted && matchFormat && (
          <DynamicScorer
            sportName={match.sportsType || match.sport || "Table Tennis"}
            matchFormat={matchFormat}
            sets={sets}
            currentSet={match.currentSet || 1}
            player1Name={player1Name}
            player2Name={player2Name}
            onSubmitScores={submitBulkScores}
            submitting={submitting}
            onRefresh={() => {}}
          />
        )}
      </div>
    </div>
  );
}

// ---- Sub-components ----

function StatusBadge({ status }) {
  const s = (status || "").toUpperCase();
  const config = {
    COMPLETED: { bg: "bg-green-500", text: "Completed" },
    IN_PROGRESS: { bg: "bg-yellow-500", text: "Live" },
    SCHEDULED: { bg: "bg-blue-400", text: "Scheduled" },
  };
  const c = config[s] || config.SCHEDULED;
  return <span className={`${c.bg} text-white text-xs font-bold px-3 py-1 rounded-full`}>{c.text}</span>;
}

function PlayerCard({ name, setsWon, isWinner }) {
  return (
    <div className={`flex flex-col items-center ${isWinner ? "scale-105" : ""}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black ${isWinner ? "bg-green-500 ring-4 ring-green-200" : "bg-[#004E93]"}`}>
        {name?.charAt(0) || "?"}
      </div>
      <span className={`mt-2 font-bold text-sm ${isWinner ? "text-green-700" : "text-gray-800"}`}>{name}</span>
      {isWinner && <Trophy className="w-4 h-4 text-yellow-500 mt-1" />}
    </div>
  );
}

function SetDetail({ set, player1Name, player2Name, match }) {
  if (!set.games || set.games.length === 0) return null;
  return (
    <div className={`border rounded-xl p-3 min-w-[120px] ${set.status === "COMPLETED" ? "border-gray-200" : "border-blue-200 bg-blue-50"}`}>
      <div className="text-xs font-bold text-gray-500 mb-2 text-center uppercase">Set {set.setNumber}</div>
      <div className="space-y-1">
        {set.games.map((g, i) => {
          const p1 = g.finalScore?.player1 ?? g.homePoints ?? 0;
          const p2 = g.finalScore?.player2 ?? g.awayPoints ?? 0;
          return (
            <div key={i} className="flex justify-center gap-2 text-sm">
              <span className={`font-bold ${p1 > p2 ? "text-green-600" : "text-gray-400"}`}>{p1}</span>
              <span className="text-gray-300">-</span>
              <span className={`font-bold ${p2 > p1 ? "text-green-600" : "text-gray-400"}`}>{p2}</span>
            </div>
          );
        })}
      </div>
      {set.setWinner && (
        <div className="text-[10px] text-center text-green-600 font-bold mt-1 border-t border-gray-100 pt-1">
          {typeof set.setWinner === "object" ? (set.setWinner.playerName || "Winner") : set.setWinner === "player1" ? player1Name : player2Name}
        </div>
      )}
    </div>
  );
}
