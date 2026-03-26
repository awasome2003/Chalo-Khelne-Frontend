import { Trophy, Radio } from "lucide-react";

/**
 * Top scoreboard bar. Shows players/teams, live score, sport badge, status.
 * Config-driven labels.
 */
export default function ScoreboardHeader({ config, derived, matchFormat }) {
  const { p1, p2, p1Sets, p2Sets, status, isLive, isCompleted, winner, sportName } = derived;

  const statusStyles = {
    IN_PROGRESS: { bg: "bg-red-500", text: "LIVE", pulse: true },
    COMPLETED: { bg: "bg-green-500", text: "COMPLETED", pulse: false },
    SCHEDULED: { bg: "bg-blue-400", text: "UPCOMING", pulse: false },
  };
  const st = statusStyles[status] || statusStyles.SCHEDULED;

  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${config.color}dd, ${config.color}99)` }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 text-8xl">{config.icon}</div>
        <div className="absolute bottom-4 right-4 text-8xl rotate-12">{config.icon}</div>
      </div>

      <div className="relative p-6 text-white">
        {/* Sport + Status bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <span className="text-sm font-bold uppercase tracking-widest opacity-80">{sportName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`${st.bg} text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5`}>
              {st.pulse && <span className="w-2 h-2 bg-white rounded-full animate-ping" />}
              {st.pulse && <Radio className="w-3 h-3" />}
              {st.text}
            </span>
          </div>
        </div>

        {/* Players + Score */}
        <div className="flex items-center justify-between">
          {/* Player 1 */}
          <PlayerSide
            name={p1}
            setsWon={p1Sets}
            isWinner={winner === p1}
            isCompleted={isCompleted}
          />

          {/* Center Score */}
          <div className="flex flex-col items-center px-6">
            <div className="text-5xl font-black tracking-wider">
              {p1Sets} <span className="text-white/40 mx-1">—</span> {p2Sets}
            </div>
            <div className="text-xs font-medium opacity-60 mt-1">
              {config.labels.matchResult || "Sets"} • Best of {matchFormat.totalSets}
            </div>
          </div>

          {/* Player 2 */}
          <PlayerSide
            name={p2}
            setsWon={p2Sets}
            isWinner={winner === p2}
            isCompleted={isCompleted}
            align="right"
          />
        </div>

        {/* Winner Banner */}
        {isCompleted && winner && (
          <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="font-black text-lg">{winner} wins!</span>
            <span className="text-sm opacity-60">({p1Sets}-{p2Sets})</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerSide({ name, setsWon, isWinner, isCompleted, align = "left" }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className={`flex flex-col items-${align === "right" ? "end" : "start"} flex-1 ${isCompleted && !isWinner ? "opacity-40" : ""}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-2 ${
        isWinner ? "bg-yellow-400 text-yellow-900 ring-4 ring-yellow-200/50 shadow-xl" : "bg-white/20"
      }`}>
        {isWinner ? <Trophy className="w-7 h-7" /> : initial}
      </div>
      <span className="font-bold text-sm truncate max-w-[140px]">{name}</span>
      {isWinner && <span className="text-[10px] font-bold text-yellow-300 uppercase mt-0.5">Winner</span>}
    </div>
  );
}
