import { Radio, Trophy, Clock } from "lucide-react";
import { readMatchResult } from "../../shared/utils/matchResultUtils";

export default function MatchCard({ match, onClick, dark = false }) {
  const p1 = match.player1?.userName || match.player1?.playerName || "TBD";
  const p2 = match.player2?.userName || match.player2?.playerName || "TBD";
  const status = (match.status || "").toUpperCase();
  const isLive = status === "IN_PROGRESS";
  const isComp = status === "COMPLETED";

  // Sport-aware result reading
  const matchResult = readMatchResult(match);

  const winner = matchResult?.winner
    ? typeof matchResult.winner === "object" ? (matchResult.winner.playerName || matchResult.winner.userName) : matchResult.winner
    : null;

  const score = matchResult?.completed
    ? `${matchResult.player1Score}-${matchResult.player2Score}`
    : null;

  const timeStr = match.startTime
    ? new Date(match.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : "";

  const bg = dark ? "bg-[#111B2E]" : "bg-white";
  const borderBase = dark ? "border-[#1E2D4A]" : "border-gray-100";
  const textPrimary = dark ? "text-gray-100" : "text-gray-800";
  const textMuted = dark ? "text-gray-500" : "text-gray-400";

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl border p-4 transition-all duration-200
        hover:scale-[1.01] active:scale-[0.99]
        ${bg} ${borderBase}
        ${isLive
          ? `border-red-500/40 ${dark ? "shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "ring-1 ring-red-100"}`
          : isComp
          ? `${dark ? "border-emerald-500/30" : "border-emerald-200"}`
          : `hover:${dark ? "border-[#2A3F66]" : "border-gray-200"} hover:shadow-md`
        }
      `}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          {match.matchNumber && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              dark ? "bg-[#1A2744] text-gray-400" : "bg-gray-100 text-gray-500"
            }`}>
              M{match.matchNumber}
            </span>
          )}
          {match.groupName && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              dark ? "bg-orange-500/20 text-blue-400" : "bg-blue-50 text-blue-600"
            }`}>
              {match.groupName}
            </span>
          )}
        </div>
        {isLive && (
          <span className="flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse">
            <Radio className="w-3 h-3" /> LIVE
          </span>
        )}
        {isComp && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <Trophy className="w-3 h-3" /> DONE
          </span>
        )}
        {!isLive && !isComp && (
          <span className={`flex items-center gap-1 text-[10px] ${textMuted}`}>
            <Clock className="w-3 h-3" /> {timeStr}
          </span>
        )}
      </div>

      {/* Players + Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
            winner === p1
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              : dark
              ? "bg-[#1A2744] text-gray-400"
              : "bg-gray-100 text-gray-600"
          }`}>
            {p1.charAt(0)}
          </div>
          <span className={`text-sm font-bold truncate ${
            winner === p1 ? (dark ? "text-emerald-400" : "text-emerald-700") : textPrimary
          }`}>
            {p1}
          </span>
        </div>

        <div className="mx-3 flex-shrink-0">
          {score ? (
            <span className={`px-3 py-1.5 rounded-xl font-mono text-sm font-black tracking-wider ${
              dark
                ? "bg-gradient-to-r from-orange-500 to-[#FF9D32] text-white shadow-lg shadow-orange-500/20"
                : "bg-gray-900 text-white"
            }`}>
              {score}
            </span>
          ) : isLive && match.liveScore ? (
            <span className="text-red-500 text-sm font-black tabular-nums animate-pulse">
              {match.liveScore.player1Points || 0}:{match.liveScore.player2Points || 0}
            </span>
          ) : (
            <span className={`text-xs font-bold ${textMuted}`}>vs</span>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
          <span className={`text-sm font-bold truncate text-right ${
            winner === p2 ? (dark ? "text-emerald-400" : "text-emerald-700") : textPrimary
          }`}>
            {p2}
          </span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
            winner === p2
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              : dark
              ? "bg-[#1A2744] text-gray-400"
              : "bg-gray-100 text-gray-600"
          }`}>
            {p2.charAt(0)}
          </div>
        </div>
      </div>
    </button>
  );
}
