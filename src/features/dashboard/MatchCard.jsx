import { Radio, Trophy, Clock } from "lucide-react";

/**
 * Compact match card used across Live, Completed, Upcoming sections.
 */
export default function MatchCard({ match, onClick }) {
  const p1 = match.player1?.userName || match.player1?.playerName || "TBD";
  const p2 = match.player2?.userName || match.player2?.playerName || "TBD";
  const status = (match.status || "").toUpperCase();
  const isLive = status === "IN_PROGRESS";
  const isComp = status === "COMPLETED";

  const winner = match.winner
    ? typeof match.winner === "object" ? (match.winner.playerName || match.winner.userName) : match.winner
    : null;

  const score = match.result?.finalScore
    ? `${match.result.finalScore.player1Sets}-${match.result.finalScore.player2Sets}`
    : null;

  const timeStr = match.startTime
    ? new Date(match.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : "";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-md transition-all ${
        isLive ? "border-red-200 ring-1 ring-red-100" :
        isComp ? "border-green-200" :
        "border-gray-100"
      }`}
    >
      {/* Top row: badge + time */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          {match.matchNumber && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              M{match.matchNumber}
            </span>
          )}
          {match.groupName && (
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              {match.groupName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              <Radio className="w-3 h-3" /> LIVE
            </span>
          )}
          {isComp && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <Trophy className="w-3 h-3" /> DONE
            </span>
          )}
          {!isLive && !isComp && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock className="w-3 h-3" /> {timeStr}
            </span>
          )}
        </div>
      </div>

      {/* Players */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            winner === p1 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
          }`}>
            {p1.charAt(0)}
          </div>
          <span className={`text-sm font-semibold truncate ${winner === p1 ? "text-green-700" : "text-gray-800"}`}>
            {p1}
          </span>
        </div>

        {/* Score */}
        <div className="mx-3 flex-shrink-0">
          {score ? (
            <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-lg font-mono">
              {score}
            </span>
          ) : isLive && match.liveScore ? (
            <span className="text-red-600 text-xs font-bold animate-pulse">
              {match.liveScore.player1Points || 0}:{match.liveScore.player2Points || 0}
            </span>
          ) : (
            <span className="text-xs text-gray-300 font-bold">vs</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className={`text-sm font-semibold truncate text-right ${winner === p2 ? "text-green-700" : "text-gray-800"}`}>
            {p2}
          </span>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            winner === p2 ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
          }`}>
            {p2.charAt(0)}
          </div>
        </div>
      </div>
    </button>
  );
}
