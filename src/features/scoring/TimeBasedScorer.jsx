import { useState } from "react";
import { Check, RefreshCcw, Plus, Clock } from "lucide-react";

/**
 * Scorer for time-based sports: Football, Basketball, Kabaddi.
 * Records goals/points with minute timestamps per period.
 *
 * Props:
 * - config: sport UI config
 * - matchFormat: from match
 * - player1Name, player2Name
 * - onSubmitScores: (games[]) => Promise — adapts events to game format
 * - submitting: boolean
 * - onRefresh: () => void
 */
export default function TimeBasedScorer({
  config,
  matchFormat,
  player1Name,
  player2Name,
  onSubmitScores,
  submitting,
  onRefresh,
}) {
  const labels = config.labels;
  const periods = config.scoring.periods || 2;
  const hasPointValues = !!config.scoring.pointValues;

  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [events, setEvents] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(1);

  const addEvent = (player, value = 1) => {
    const event = {
      player,
      value,
      period: currentPeriod,
      minute: "",
      id: Date.now(),
    };
    setEvents([...events, event]);
    if (player === 1) setPlayer1Score((p) => p + value);
    else setPlayer2Score((p) => p + value);
  };

  const removeLastEvent = () => {
    if (events.length === 0) return;
    const last = events[events.length - 1];
    if (last.player === 1) setPlayer1Score((p) => p - last.value);
    else setPlayer2Score((p) => p - last.value);
    setEvents(events.slice(0, -1));
  };

  const handleSubmit = async () => {
    // Adapt time-based score to game format: single "game" with final scores
    await onSubmitScores([{ a: String(player1Score), b: String(player2Score) }]);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setEvents([]);
  };

  const p1Short = player1Name?.split(" ")[0] || "P1";
  const p2Short = player2Name?.split(" ")[0] || "P2";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-800 mb-1">Match Scoring</h3>
      <p className="text-sm text-gray-500 mb-4">
        {labels.period} {currentPeriod} of {periods}
      </p>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: periods }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => setCurrentPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition w-auto ${
              currentPeriod === p ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {labels.period} {p}
          </button>
        ))}
      </div>

      {/* Live Score */}
      <div className="flex items-center justify-center gap-8 py-6 bg-gray-50 rounded-xl mb-4">
        <div className="text-center">
          <div className="text-3xl font-black" style={{ color: config.color }}>{player1Score}</div>
          <div className="text-xs font-bold text-gray-500 mt-1">{p1Short}</div>
        </div>
        <div className="text-lg font-bold text-gray-300">vs</div>
        <div className="text-center">
          <div className="text-3xl font-black" style={{ color: config.color }}>{player2Score}</div>
          <div className="text-xs font-bold text-gray-500 mt-1">{p2Short}</div>
        </div>
      </div>

      {/* Score Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 text-center">{p1Short}</p>
          {hasPointValues ? (
            <div className="flex gap-2 justify-center">
              {config.scoring.pointValues.map((v) => (
                <button
                  key={v}
                  onClick={() => addEvent(1, v)}
                  className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 font-bold text-lg hover:bg-blue-100 transition"
                >
                  +{v}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => addEvent(1)}
              className="w-full py-3 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> {labels.score}
            </button>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-500 text-center">{p2Short}</p>
          {hasPointValues ? (
            <div className="flex gap-2 justify-center">
              {config.scoring.pointValues.map((v) => (
                <button
                  key={v}
                  onClick={() => addEvent(2, v)}
                  className="w-12 h-12 rounded-xl bg-red-50 text-red-700 font-bold text-lg hover:bg-red-100 transition"
                >
                  +{v}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => addEvent(2)}
              className="w-full py-3 rounded-xl bg-red-50 text-red-700 font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> {labels.score}
            </button>
          )}
        </div>
      </div>

      {/* Event Log */}
      {events.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500">{labels.score} Log</span>
            <button onClick={removeLastEvent} className="text-xs text-red-500 hover:underline w-auto">
              Undo Last
            </button>
          </div>
          <div className="space-y-1">
            {events.map((e) => (
              <div key={e.id} className="text-xs text-gray-600 flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="font-medium">{e.player === 1 ? p1Short : p2Short}</span>
                <span>+{e.value} {labels.score.toLowerCase()}</span>
                <span className="text-gray-400">({labels.period} {e.period})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || (player1Score === 0 && player2Score === 0)}
          className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><RefreshCcw className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Check className="w-4 h-4" /> Save Final Score</>
          )}
        </button>
        <button onClick={onRefresh} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
