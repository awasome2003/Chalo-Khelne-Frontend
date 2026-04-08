/**
 * Visual set/game scorecard table.
 * Shows set-by-set breakdown for set-based sports.
 * For time/innings sports, shows period scores.
 */
export default function SetScorecard({ config, derived, matchFormat }) {
  const { p1, p2, p1Sets, p2Sets, sets } = derived;
  const labels = config.labels;

  if (sets.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-sm">{labels.set || "Set"} Scorecard</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-gray-500 font-medium w-[40%]">Player</th>
              {sets.map((s, i) => (
                <th key={i} className={`text-center py-3 px-3 font-medium ${
                  s.status === "IN_PROGRESS" ? "text-yellow-600 bg-yellow-50" :
                  s.status === "COMPLETED" ? "text-gray-800" : "text-gray-300"
                }`}>
                  {labels.set?.[0] || "S"}{s.setNumber || i + 1}
                </th>
              ))}
              <th className="text-center py-3 px-4 font-bold text-gray-800 bg-gray-50">
                {labels.matchResult || "Total"}
              </th>
            </tr>
          </thead>
          <tbody>
            <PlayerRow
              name={p1}
              sets={sets}
              playerKey="player1"
              playerName={p1}
              totalWon={p1Sets}
              match={derived}
            />
            <PlayerRow
              name={p2}
              sets={sets}
              playerKey="player2"
              playerName={p2}
              totalWon={p2Sets}
              match={derived}
            />
          </tbody>
        </table>
      </div>

      {/* Game Details */}
      <div className="px-5 py-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {sets.map((set, i) => (
            <SetDetail key={i} set={set} p1={p1} p2={p2} labels={labels} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ name, sets, playerKey, playerName, totalWon }) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {name?.charAt(0)}
          </div>
          <span className="font-semibold text-gray-800 text-sm truncate">{name}</span>
        </div>
      </td>
      {sets.map((set, i) => {
        const gamesWon = (set.games || []).filter((g) => {
          const w = g.winner;
          if (!w) return false;
          if (typeof w === "object") return w.playerName === playerName;
          return w === playerKey || w === playerName;
        }).length;
        const isSetWinner = set.setWinner && (
          (typeof set.setWinner === "string" && (set.setWinner === playerKey || set.setWinner === playerName)) ||
          (typeof set.setWinner === "object" && set.setWinner.playerName === playerName)
        );
        return (
          <td key={i} className={`text-center py-3 px-3 font-bold ${
            set.status === "IN_PROGRESS" ? "bg-yellow-50" : ""
          } ${isSetWinner ? "text-green-600" : "text-gray-400"}`}>
            {set.games?.length > 0 ? gamesWon : "-"}
          </td>
        );
      })}
      <td className="text-center py-3 px-4 font-black text-lg text-orange-500 bg-gray-50">
        {totalWon}
      </td>
    </tr>
  );
}

function SetDetail({ set, p1, p2, labels }) {
  if (!set.games || set.games.length === 0) return null;

  const winnerName = set.setWinner
    ? typeof set.setWinner === "object" ? set.setWinner.playerName : set.setWinner
    : null;
  const displayWinner = winnerName === "player1" ? p1 : winnerName === "player2" ? p2 : winnerName;

  return (
    <div className={`border rounded-xl p-2.5 min-w-[100px] ${
      set.status === "IN_PROGRESS" ? "border-yellow-200 bg-yellow-50" :
      set.status === "COMPLETED" ? "border-gray-200" : "border-gray-100 opacity-50"
    }`}>
      <div className="text-[10px] font-bold text-gray-500 text-center mb-1.5 uppercase">
        {labels.set || "Set"} {set.setNumber}
      </div>
      <div className="space-y-0.5">
        {set.games.map((g, i) => {
          const s1 = g.finalScore?.player1 ?? g.homePoints ?? 0;
          const s2 = g.finalScore?.player2 ?? g.awayPoints ?? 0;
          return (
            <div key={i} className="flex justify-center gap-1.5 text-xs font-bold">
              <span className={s1 > s2 ? "text-green-600" : "text-gray-400"}>{s1}</span>
              <span className="text-gray-200">-</span>
              <span className={s2 > s1 ? "text-green-600" : "text-gray-400"}>{s2}</span>
            </div>
          );
        })}
      </div>
      {displayWinner && (
        <div className="text-[9px] text-center text-green-600 font-bold mt-1 border-t border-gray-100 pt-1 truncate">
          {displayWinner.split(" ")[0]}
        </div>
      )}
    </div>
  );
}
