import { Trophy, Clock, Target } from "lucide-react";

/**
 * Recent activity feed — shows latest completed matches.
 */
export default function ActivityFeed({ completed }) {
  const recent = [...completed]
    .sort((a, b) => new Date(b.updatedAt || b.startTime || 0) - new Date(a.updatedAt || a.startTime || 0))
    .slice(0, 8);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 text-sm mb-3">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No completed matches yet</p>
        </div>
      </div>
    );
  }

  const timeAgo = (d) => {
    if (!d) return "";
    const ms = Date.now() - new Date(d).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm">Recent Activity</h3>
        <span className="text-[10px] text-gray-400">{completed.length} total</span>
      </div>

      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
        {recent.map((m) => {
          const p1 = m.player1?.userName || m.player1?.playerName || "P1";
          const p2 = m.player2?.userName || m.player2?.playerName || "P2";
          const winner = m.winner
            ? typeof m.winner === "object" ? (m.winner.playerName || m.winner.userName) : m.winner
            : null;
          const score = m.result?.finalScore
            ? `${m.result.finalScore.player1Sets}-${m.result.finalScore.player2Sets}`
            : "";

          return (
            <div key={m._id} className="px-5 py-3 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className={`font-semibold truncate ${winner === p1 ? "text-green-700" : "text-gray-600"}`}>
                      {p1}
                    </span>
                    {score && <span className="text-xs font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{score}</span>}
                    <span className={`font-semibold truncate ${winner === p2 ? "text-green-700" : "text-gray-600"}`}>
                      {p2}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                    {m.groupName && <span>{m.groupName}</span>}
                    <span>{timeAgo(m.updatedAt || m.startTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
