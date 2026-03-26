import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCcw, AlertCircle, ExternalLink } from "lucide-react";
import useLiveMatch from "./useLiveMatch";
import ScoreboardHeader from "./ScoreboardHeader";
import SetScorecard from "./SetScorecard";
import MatchTimeline from "./MatchTimeline";
import { DynamicScorer } from "../scoring";
import useMatchScoring from "../../Manager/Tournament/useMatchScoring";

/**
 * Live Match Dashboard — the single page for viewing and scoring any match.
 * Config-driven, works for all sports.
 *
 * Route: /live/:matchId  OR  /tournament-management/match/:tournamentId/:matchId/live
 */
export default function LiveMatchPage() {
  const { matchId, tournamentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.backTo || (tournamentId ? `/tournaments/${tournamentId}` : "/mtournament-management");

  const { match, isLoading, error, config, matchFormat, derived, lastUpdated, isRealtime } = useLiveMatch(matchId);
  const { submitBulkScores, submitting } = useMatchScoring(matchId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading match...</p>
        </div>
      </div>
    );
  }

  if (error || !match || !config || !derived) {
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

  const timeAgo = lastUpdated
    ? `${Math.round((Date.now() - lastUpdated) / 1000)}s ago`
    : "";

  return (
    <div className="min-h-screen bg-[#0B1220]">
      {/* Top Bar */}
      <div className="bg-[#0E1628] border-b border-[#1E2D4A] px-6 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(backTo)} className="p-2 hover:bg-[#1A2744] rounded-xl transition w-auto">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-200">
                {match.roundName || match.round || "Match"} {match.matchNumber && `• M${match.matchNumber}`}
              </h1>
              <p className="text-[11px] text-gray-500">
                {derived.sportName}
                {match.courtNumber && ` • Court ${match.courtNumber}`}
                {derived.isLive && ` • Updated ${timeAgo}`}
                {isRealtime && " • ⚡ Real-time"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {derived.isLive && (
              <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                LIVE
              </span>
            )}
            {isRealtime && (
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">⚡ RT</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Scoreboard Header */}
        <ScoreboardHeader config={config} derived={derived} matchFormat={matchFormat} />

        {/* Main Content: Two columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left: Scorecard + Scorer (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Set Scorecard */}
            <SetScorecard config={config} derived={derived} matchFormat={matchFormat} />

            {/* Scoring Input — only if not completed and viewer has permission */}
            {!derived.isCompleted && (
              <DynamicScorer
                sportName={derived.sportName}
                matchFormat={matchFormat}
                sets={derived.sets}
                currentSet={match.currentSet || 1}
                player1Name={derived.p1}
                player2Name={derived.p2}
                onSubmitScores={submitBulkScores}
                submitting={submitting}
                onRefresh={() => {}}
              />
            )}
          </div>

          {/* Right: Timeline + Match Info (1/3 width) */}
          <div className="space-y-6">
            {/* Timeline */}
            <MatchTimeline timeline={derived.timeline} config={config} />

            {/* Match Info Card */}
            <div className="bg-[#111B2E] rounded-2xl border border-[#1E2D4A] p-5">
              <h3 className="font-bold text-gray-300 text-sm mb-3">Match Info</h3>
              <div className="space-y-2.5 text-sm">
                <InfoRow label="Sport" value={derived.sportName} />
                <InfoRow label="Format" value={`Best of ${matchFormat.totalSets} ${config.labels.set || "sets"}`} />
                <InfoRow label={`${config.labels.game || "Games"}/Set`} value={matchFormat.gamesToWin ? `First to ${matchFormat.gamesToWin}` : "—"} />
                <InfoRow label={`${config.labels.point || "Points"}/Game`} value={matchFormat.pointsToWinGame || "—"} />
                {matchFormat.marginToWin > 1 && <InfoRow label="Win by" value={`${matchFormat.marginToWin} point margin`} />}
                <InfoRow label="Status" value={
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    derived.isLive ? "bg-red-500/10 text-red-400" :
                    derived.isCompleted ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-gray-800 text-gray-400"
                  }`}>{derived.status}</span>
                } />
              </div>
            </div>

            {/* Quick Stats */}
            {derived.sets.length > 0 && (
              <div className="bg-[#111B2E] rounded-2xl border border-[#1E2D4A] p-5">
                <h3 className="font-bold text-gray-300 text-sm mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <StatBox
                    label={`${config.labels.set || "Sets"} Won`}
                    p1={derived.p1Sets}
                    p2={derived.p2Sets}
                    p1Name={derived.p1.split(" ")[0]}
                    p2Name={derived.p2.split(" ")[0]}
                  />
                  <StatBox
                    label="Total Games"
                    p1={derived.sets.reduce((sum, s) => sum + (s.games || []).filter(g => {
                      const w = g.winner;
                      return w && (w.playerName === derived.p1 || w === "player1");
                    }).length, 0)}
                    p2={derived.sets.reduce((sum, s) => sum + (s.games || []).filter(g => {
                      const w = g.winner;
                      return w && (w.playerName === derived.p2 || w === "player2");
                    }).length, 0)}
                    p1Name={derived.p1.split(" ")[0]}
                    p2Name={derived.p2.split(" ")[0]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="font-medium text-gray-300 text-xs">{value}</span>
    </div>
  );
}

function StatBox({ label, p1, p2, p1Name, p2Name }) {
  return (
    <div className="bg-[#0E1628] rounded-xl p-3 text-center">
      <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">{label}</div>
      <div className="flex items-center justify-center gap-3">
        <div>
          <div className={`text-lg font-black ${p1 > p2 ? "text-emerald-400" : "text-gray-600"}`}>{p1}</div>
          <div className="text-[9px] text-gray-500">{p1Name}</div>
        </div>
        <div className="text-gray-700 font-bold">—</div>
        <div>
          <div className={`text-lg font-black ${p2 > p1 ? "text-emerald-400" : "text-gray-600"}`}>{p2}</div>
          <div className="text-[9px] text-gray-500">{p2Name}</div>
        </div>
      </div>
    </div>
  );
}
