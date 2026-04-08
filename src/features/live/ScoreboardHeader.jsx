import { Trophy, Radio } from "lucide-react";

export default function ScoreboardHeader({ config, derived, matchFormat }) {
  const { p1, p2, p1Sets, p2Sets, status, isLive, isCompleted, winner, sportName } = derived;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0B1220]">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: `radial-gradient(circle, ${config.color}, transparent)` }} />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-[0.03]"
          style={{ background: `radial-gradient(circle, ${config.color}, transparent)` }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative px-8 py-8">
        {/* Sport + Status */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{config.icon}</span>
            <span className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">{sportName}</span>
          </div>
          {isLive && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <Radio className="w-4 h-4 text-red-500" />
              <span className="text-xs font-black text-red-400 tracking-wider">LIVE</span>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-400 tracking-wider">COMPLETED</span>
            </div>
          )}
          {!isLive && !isCompleted && (
            <span className="text-xs font-bold text-gray-500 bg-gray-800 px-3 py-1.5 rounded-full">UPCOMING</span>
          )}
        </div>

        {/* Players + Score */}
        <div className="flex items-center justify-between">
          {/* Player 1 */}
          <PlayerSide name={p1} setsWon={p1Sets} isWinner={winner === p1} isCompleted={isCompleted} />

          {/* Center Score */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-4">
              <span className={`text-6xl lg:text-7xl font-black tabular-nums leading-none ${
                winner === p1 ? "text-emerald-400" : "text-white"
              }`}>
                {p1Sets}
              </span>
              <span className="text-2xl font-bold text-gray-600">:</span>
              <span className={`text-6xl lg:text-7xl font-black tabular-nums leading-none ${
                winner === p2 ? "text-emerald-400" : "text-white"
              }`}>
                {p2Sets}
              </span>
            </div>
            <div className="mt-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
              {matchFormat.scoringType === "time" ? `${config.labels.matchResult || "Score"}`
                : matchFormat.scoringType === "innings" ? `${config.labels.matchResult || "Score"}`
                : matchFormat.scoringType === "single" ? `${config.labels.matchResult || "Result"}`
                : `${config.labels.matchResult || "Sets"} · Best of ${matchFormat.totalSets}`}
            </div>
          </div>

          {/* Player 2 */}
          <PlayerSide name={p2} setsWon={p2Sets} isWinner={winner === p2} isCompleted={isCompleted} align="right" />
        </div>

        {/* Winner Banner */}
        {isCompleted && winner && (
          <div className="mt-8 flex items-center justify-center gap-3 pt-6 border-t border-gray-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Trophy className="w-4 h-4 text-yellow-900" />
            </div>
            <span className="font-black text-lg text-white">{winner} wins!</span>
            <span className="text-sm text-gray-500 font-bold">({p1Sets}-{p2Sets})</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerSide({ name, setsWon, isWinner, isCompleted, align = "left" }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"} flex-1 ${isCompleted && !isWinner ? "opacity-30" : ""}`}>
      <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mb-3 transition-all ${
        isWinner
          ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900 shadow-xl shadow-yellow-500/20 scale-110"
          : "bg-[#1A2744] text-gray-500"
      }`}>
        {isWinner ? <Trophy className="w-8 h-8" /> : initial}
        {isWinner && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <span className={`font-black text-sm tracking-wide ${isWinner ? "text-emerald-400" : "text-gray-300"}`}>
        {name}
      </span>
      {isWinner && (
        <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em] mt-1">Champion</span>
      )}
    </div>
  );
}
