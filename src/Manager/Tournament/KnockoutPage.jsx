import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Swords, Trophy, ArrowLeft, ChevronDown, ChevronUp, UserPlus, Shield } from "lucide-react";
import { FaMedal } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import TournamentStepper from "./TournamentStepper";
import AssignUmpireModal from "./AssignUmpireModal";

export default function KnockoutPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { title, currentStage } = useTournament(tournamentId);
  const [matchesByRound, setMatchesByRound] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRound, setExpandedRound] = useState(null);
  const [assignModalMatch, setAssignModalMatch] = useState(null);

  const refreshMatches = useCallback(async () => {
    if (!tournamentId) return;
    try {
      setLoading(true);
      let grouped = {};
      // Try knockout matches first
      const res = await axios.get(`/api/tournaments/knockout-matches/${tournamentId}`);
      if (res.data.success) {
        const matches = res.data.matches || [];
        matches.forEach((m) => {
          const round = m.roundName || m.round || "round-1";
          if (!grouped[round]) grouped[round] = [];
          grouped[round].push(m);
        });
      }
      // Fallback to direct-knockout if first source empty
      if (Object.keys(grouped).length === 0) {
        const dkRes = await axios.get(`/api/tournaments/direct-knockout/matches/${tournamentId}`);
        if (dkRes.data.success) {
          const matches = dkRes.data.matches || [];
          matches.forEach((m) => {
            const round = m.round || "round-1";
            if (!grouped[round]) grouped[round] = [];
            grouped[round].push(m);
          });
        }
      }
      setMatchesByRound(grouped);
      setExpandedRound((prev) =>
        prev || (Object.keys(grouped).length > 0 ? Object.keys(grouped)[0] : null)
      );
    } catch (err) {
      console.error("Error fetching knockout:", err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    refreshMatches();
  }, [refreshMatches]);

  const roundEntries = Object.entries(matchesByRound);
  const totalMatches = roundEntries.reduce((sum, [, m]) => sum + m.length, 0);
  const completedMatches = roundEntries.reduce(
    (sum, [, m]) => sum + m.filter((x) => x.status === "COMPLETED" || x.status === "completed").length, 0
  );

  if (loading) return <div className="p-8 text-center text-gray-400">Loading knockout bracket...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs tournamentName={title} />
      <TournamentStepper currentStage={currentStage} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Knockout Bracket</h1>
          <p className="text-sm text-gray-500">
            {roundEntries.length} rounds • {totalMatches} matches • {completedMatches} completed
          </p>
        </div>
      </div>

      {roundEntries.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Swords className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">No knockout matches yet</p>
          <p className="text-gray-400 text-sm mt-1">Complete group stage first, then generate knockout brackets</p>
        </div>
      ) : (
        <div className="space-y-4">
          {roundEntries.map(([roundName, matches]) => {
            const isExpanded = expandedRound === roundName;
            const roundCompleted = matches.filter((m) => m.status === "COMPLETED" || m.status === "completed").length;
            const allDone = roundCompleted === matches.length;
            const label = roundName.charAt(0).toUpperCase() + roundName.slice(1).replace(/-/g, " ");

            return (
              <div key={roundName} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Round Header */}
                <button
                  onClick={() => setExpandedRound(isExpanded ? null : roundName)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${allDone ? "bg-green-100" : "bg-orange-100"}`}>
                      {allDone ? <Trophy className="w-4 h-4 text-green-600" /> : <Swords className="w-4 h-4 text-orange-500" />}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800">{label}</h3>
                      <p className="text-xs text-gray-500">{roundCompleted}/{matches.length} completed</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {/* Matches */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    {matches.map((match) => (
                      <KnockoutMatchRow
                        key={match._id}
                        match={match}
                        onScore={() =>
                          navigate(`/tournament-management/match/${tournamentId}/${match._id}/score`, {
                            state: { backTo: `/tournaments/${tournamentId}/knockout` },
                          })
                        }
                        onAssign={(m) => setAssignModalMatch(m)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AssignUmpireModal
        isOpen={!!assignModalMatch}
        onClose={() => setAssignModalMatch(null)}
        matchId={assignModalMatch?._id}
        tournamentId={tournamentId}
        matchLabel={assignModalMatch ? `${assignModalMatch.roundName || assignModalMatch.round || "Match"} • M${assignModalMatch.matchNumber}` : ""}
        onAssigned={() => {
          refreshMatches();
          toast.success("Umpire assigned. Awaiting their response.");
        }}
      />
    </div>
  );
}

function KnockoutMatchRow({ match, onScore, onAssign }) {
  const p1 = match.player1?.playerName || match.player1?.userName || "TBD";
  const p2 = match.player2?.playerName || match.player2?.userName || "TBD";
  const isComp = match.status === "COMPLETED" || match.status === "completed";
  const isLive = match.status === "IN_PROGRESS" || match.status === "in_progress" || match.status === "in-progress";
  const umpireName = getUmpireName(match.referee);

  const winner = match.winner
    ? typeof match.winner === "object" ? (match.winner.playerName || match.winner.userName) : match.winner
    : null;

  const isP1Winner = winner === p1;
  const isP2Winner = winner === p2;

  return (
    <div className="flex flex-col gap-0">
      <button
        onClick={onScore}
        className={`w-full flex items-center justify-between p-4 rounded-t-xl border transition-all hover:shadow-sm ${
          isComp ? "border-green-200 bg-green-50/30" :
          isLive ? "border-yellow-200 bg-yellow-50/30" :
          "border-gray-100 hover:border-gray-200"
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            M{match.matchNumber}
          </span>

          <div className="flex items-center gap-6 flex-1 justify-center">
            <span className={`font-semibold text-sm ${isP1Winner ? "text-green-700" : "text-gray-800"}`}>
              {p1}
              {isP1Winner && <FaMedal className="inline ml-1 text-yellow-500 w-3 h-3" />}
            </span>

            <div className="flex flex-col items-center min-w-[50px]">
              {isComp ? (
                (() => { const { readMatchResult } = require("../../shared/utils/matchResultUtils"); const r = readMatchResult(match); return (
                <span className="bg-gray-900 text-white px-3 py-0.5 rounded-lg text-sm font-bold">
                  {r?.player1Score || 0}-{r?.player2Score || 0}
                </span>); })()
              ) : isLive ? (
                <span className="text-yellow-600 font-bold text-sm animate-pulse">LIVE</span>
              ) : (
                <span className="text-gray-300 text-xs font-bold">VS</span>
              )}
            </div>

            <span className={`font-semibold text-sm ${isP2Winner ? "text-green-700" : "text-gray-800"}`}>
              {isP2Winner && <FaMedal className="inline mr-1 text-yellow-500 w-3 h-3" />}
              {p2}
            </span>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isComp ? "bg-green-100 text-green-700" :
          isLive ? "bg-yellow-100 text-yellow-700" :
          "bg-gray-100 text-gray-500"
        }`}>
          {isComp ? "DONE" : isLive ? "LIVE" : "PENDING"}
        </span>
      </button>

      {/* Umpire status bar */}
      <div className="bg-gray-50 border border-t-0 border-gray-100 rounded-b-xl px-3 py-2 flex items-center justify-between">
        {umpireName ? (
          <>
            <span className="flex items-center gap-1.5 text-xs text-gray-600">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold">Umpire:</span>
              <span className="text-gray-800">{umpireName}</span>
            </span>
            <span className="text-[10px] text-gray-400">assigned</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Shield className="w-3.5 h-3.5 text-gray-300" />
              <span>No umpire</span>
            </span>
            {!isComp && (
              <button
                onClick={() => onAssign?.(match)}
                className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 px-2 py-0.5 rounded hover:bg-orange-50 w-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Assign
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const getUmpireName = (referee) => {
  if (!referee) return null;
  if (typeof referee === "string") return "Assigned";
  return referee.name || referee.userName || "Assigned";
};
