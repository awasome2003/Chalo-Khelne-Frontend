import { useState } from "react";
import { Check, RefreshCcw, Slash } from "lucide-react";

/**
 * Scorer for innings-based sports: Cricket.
 * Ball-by-ball or over-by-over score entry.
 *
 * Props:
 * - config: sport UI config
 * - matchFormat: from match
 * - player1Name, player2Name (team names)
 * - onSubmitScores: (games[]) => Promise
 * - submitting: boolean
 * - onRefresh: () => void
 */
export default function InningsBasedScorer({
  config,
  matchFormat,
  player1Name,
  player2Name,
  onSubmitScores,
  submitting,
  onRefresh,
}) {
  const labels = config.labels;
  const ballValues = config.scoring.ballValues || [0, 1, 2, 3, 4, 6];
  const extras = config.scoring.extras || ["wide", "no-ball"];

  const [batting, setBatting] = useState(1); // 1 = player1 bats first
  const [currentInnings, setCurrentInnings] = useState(1);
  const [runs, setRuns] = useState({ 1: 0, 2: 0 });
  const [wickets, setWickets] = useState({ 1: 0, 2: 0 });
  const [overs, setOvers] = useState({ 1: 0, 2: 0 });
  const [balls, setBalls] = useState(0);
  const [ballLog, setBallLog] = useState([]);

  const battingTeam = batting === 1 ? player1Name : player2Name;
  const bowlingTeam = batting === 1 ? player2Name : player1Name;
  const maxOvers = matchFormat?.oversCount || config.defaults?.overs || 20;

  const addBall = (value, isExtra = false) => {
    const entry = { value, isExtra, over: overs[batting], ball: balls + 1 };
    setBallLog([...ballLog, entry]);
    setRuns((p) => ({ ...p, [batting]: p[batting] + value }));

    if (!isExtra) {
      const newBalls = balls + 1;
      if (newBalls >= 6) {
        setOvers((p) => ({ ...p, [batting]: p[batting] + 1 }));
        setBalls(0);
      } else {
        setBalls(newBalls);
      }
    }
  };

  const addWicket = () => {
    setWickets((p) => ({ ...p, [batting]: p[batting] + 1 }));
    const entry = { value: 0, isWicket: true, over: overs[batting], ball: balls + 1 };
    setBallLog([...ballLog, entry]);

    const newBalls = balls + 1;
    if (newBalls >= 6) {
      setOvers((p) => ({ ...p, [batting]: p[batting] + 1 }));
      setBalls(0);
    } else {
      setBalls(newBalls);
    }
  };

  const switchInnings = () => {
    setBatting(batting === 1 ? 2 : 1);
    setCurrentInnings(2);
    setBalls(0);
    setBallLog([]);
  };

  const handleSubmit = async () => {
    await onSubmitScores([{ a: String(runs[1]), b: String(runs[2]) }]);
  };

  const p1Short = player1Name?.split(" ")[0] || "Team 1";
  const p2Short = player2Name?.split(" ")[0] || "Team 2";
  const runRate = overs[batting] > 0 ? (runs[batting] / overs[batting]).toFixed(2) : "0.00";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-800 mb-1">Cricket Scoring</h3>
      <p className="text-sm text-gray-500 mb-4">
        {labels.innings} {currentInnings} — {battingTeam} batting
      </p>

      {/* Scoreboard */}
      <div className="bg-gray-900 rounded-xl p-5 text-white mb-5">
        <div className="grid grid-cols-2 divide-x divide-gray-700">
          <div className={`text-center pr-4 ${batting === 1 ? "opacity-100" : "opacity-40"}`}>
            <div className="text-xs font-bold text-gray-400 mb-1">{p1Short}</div>
            <div className="text-3xl font-black">{runs[1]}/{wickets[1]}</div>
            <div className="text-xs text-gray-400 mt-1">({overs[1]}.{batting === 1 ? balls : 0} ov)</div>
          </div>
          <div className={`text-center pl-4 ${batting === 2 ? "opacity-100" : "opacity-40"}`}>
            <div className="text-xs font-bold text-gray-400 mb-1">{p2Short}</div>
            <div className="text-3xl font-black">{runs[2]}/{wickets[2]}</div>
            <div className="text-xs text-gray-400 mt-1">({overs[2]}.{batting === 2 ? balls : 0} ov)</div>
          </div>
        </div>
        {config.scoring.showRunRate && (
          <div className="text-center text-xs text-gray-400 mt-3 border-t border-gray-700 pt-2">
            CRR: {runRate} • Overs: {overs[batting]}.{balls}/{maxOvers}
          </div>
        )}
      </div>

      {/* Run Buttons */}
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-500 mb-2">{labels.score}s</p>
        <div className="flex gap-2 flex-wrap">
          {ballValues.map((v) => (
            <button
              key={v}
              onClick={() => addBall(v)}
              className="w-14 h-14 rounded-xl text-lg font-black transition hover:scale-105"
              style={{
                backgroundColor: v === 4 ? "#DBEAFE" : v === 6 ? "#D1FAE5" : "#F3F4F6",
                color: v === 4 ? "#1D4ED8" : v === 6 ? "#059669" : "#374151",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Extras + Wicket */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={addWicket}
          className="px-4 py-2.5 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition flex items-center gap-1 w-auto"
        >
          <Slash className="w-3.5 h-3.5" /> Wicket
        </button>
        {extras.map((e) => (
          <button
            key={e}
            onClick={() => addBall(1, true)}
            className="px-4 py-2.5 rounded-xl bg-yellow-50 text-yellow-700 font-bold text-sm hover:bg-yellow-100 transition w-auto capitalize"
          >
            {e}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        {currentInnings === 1 && (
          <button
            onClick={switchInnings}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition w-auto"
          >
            End {labels.innings} 1 → Switch
          </button>
        )}
      </div>

      {/* Submit Final */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><RefreshCcw className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Check className="w-4 h-4" /> Save Match Result</>
          )}
        </button>
        <button onClick={onRefresh} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
