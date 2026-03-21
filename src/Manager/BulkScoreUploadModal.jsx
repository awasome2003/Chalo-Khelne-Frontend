import { useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import axios from "axios";

/**
 * Reusable Bulk Score Upload Modal
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSuccess: () => void  (called after successful upload to refresh data)
 * - matches: array of match objects (pending/scheduled matches to score)
 * - tournamentId: string
 * - groupId: string (optional, for group stage matches)
 * - matchType: "player" | "team"  (default: "player")
 *   - "player" uses player1/player2 + /api/tournaments/matches/bulk-upload-scores
 *   - "team" uses team names + /api/tournaments/team-knockout/bulk-upload-scores
 * - maxSets: number (default: 5)
 * - setsToWin: number (default: 3)
 * - getPlayerName: (match, side) => string  (optional custom name resolver)
 * - title: string (optional, modal title override)
 */
export default function BulkScoreUploadModal({
  isOpen,
  onClose,
  onSuccess,
  matches = [],
  tournamentId,
  groupId,
  matchType = "player",
  maxSets = 5,
  setsToWin: propSetsToWin,
  getPlayerName,
  title,
}) {
  const setsToWin = propSetsToWin || Math.ceil(maxSets / 2);

  const [bulkScores, setBulkScores] = useState(() => {
    const initial = {};
    matches.forEach((match) => {
      initial[match._id] = {
        sets: Array.from({ length: maxSets }, () => ({
          player1Score: "",
          player2Score: "",
        })),
      };
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen || matches.length === 0) return null;

  // Name resolvers
  const getName = (match, side) => {
    if (getPlayerName) return getPlayerName(match, side);
    if (matchType === "team") {
      if (side === 1) return match.team1Name || match.team1Id?.teamName || "Team 1";
      return match.team2Name || match.team2Id?.teamName || "Team 2";
    }
    if (side === 1) return match.player1?.userName || match.player1?.playerName || "Player 1";
    return match.player2?.userName || match.player2?.playerName || "Player 2";
  };

  const handleChange = (matchId, setIndex, field, value) => {
    setBulkScores((prev) => {
      const updated = { ...prev };
      const matchData = { ...updated[matchId] };
      const sets = [...matchData.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      matchData.sets = sets;
      updated[matchId] = matchData;
      return updated;
    });
  };

  const handleSubmit = async () => {
    const scoresToSubmit = [];

    for (const [matchId, data] of Object.entries(bulkScores)) {
      const filledSets = data.sets
        .filter((s) => s.player1Score !== "" && s.player2Score !== "")
        .map((s) => ({
          player1Score: parseInt(s.player1Score, 10),
          player2Score: parseInt(s.player2Score, 10),
        }));

      if (filledSets.length === 0) continue;

      // Validate: no ties
      const tiedSet = filledSets.find((s) => s.player1Score === s.player2Score);
      if (tiedSet) {
        alert("Invalid score: Set scores cannot be tied. Each set must have a winner.");
        return;
      }

      // Validate: enough sets to determine winner
      let p1Wins = 0,
        p2Wins = 0;
      for (const s of filledSets) {
        if (s.player1Score > s.player2Score) p1Wins++;
        else p2Wins++;
      }

      if (p1Wins < setsToWin && p2Wins < setsToWin) {
        const match = matches.find((m) => m._id === matchId);
        alert(
          `Match ${getName(match, 1)} vs ${getName(match, 2)}: Not enough sets filled. Need ${setsToWin} set wins to determine a winner.`
        );
        return;
      }

      scoresToSubmit.push({ matchId, sets: filledSets });
    }

    if (scoresToSubmit.length === 0) {
      alert("No scores to submit. Please fill in set scores for at least one match.");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        matchType === "team"
          ? "/api/tournaments/team-knockout/bulk-upload-scores"
          : "/api/tournaments/matches/bulk-upload-scores";

      const response = await axios.post(endpoint, {
        tournamentId,
        groupId,
        scores: scoresToSubmit,
      });

      if (response.data.success) {
        const resultText = response.data.results
          .map((r) => {
            const p1 = r.player1 || r.team1 || "Team 1";
            const p2 = r.player2 || r.team2 || "Team 2";
            return `${p1} vs ${p2}: ${r.winner} wins (${r.finalScore})`;
          })
          .join("\n");

        alert(`${response.data.message}\n\n${resultText}`);
        onSuccess?.();
        onClose();
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (err) {
      console.error("Bulk score upload error:", err);
      alert("Failed to upload scores: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-white text-lg font-bold">
              {title || "Bulk Score Upload"}
            </h3>
            <p className="text-purple-200 text-sm">
              Enter set scores for {matches.length} pending match{matches.length !== 1 ? "es" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 bg-transparent w-auto"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {matches.map((match) => {
            const scoreData = bulkScores[match._id];
            if (!scoreData) return null;

            const name1 = getName(match, 1);
            const name2 = getName(match, 2);

            return (
              <div
                key={match._id}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                {/* Match Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 text-blue-700 rounded-full text-xs font-medium px-2.5 py-1">
                    {match.matchNumber ? `M${match.matchNumber}` : `Match`}
                  </span>
                  <span className="text-xs text-gray-500">
                    Best of {maxSets} (need {setsToWin} to win)
                  </span>
                </div>

                {/* Player/Team Names */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="font-semibold text-[#004E93] text-sm text-right flex-1">
                    {name1}
                  </span>
                  <span className="text-gray-400 text-xs font-medium">VS</span>
                  <span className="font-semibold text-[#004E93] text-sm text-left flex-1">
                    {name2}
                  </span>
                </div>

                {/* Set Score Inputs */}
                <div className="space-y-2">
                  {scoreData.sets.map((setScore, setIdx) => {
                    // Count wins so far
                    let p1Wins = 0,
                      p2Wins = 0;
                    for (let i = 0; i < setIdx; i++) {
                      const s = scoreData.sets[i];
                      if (s.player1Score !== "" && s.player2Score !== "") {
                        const p1 = parseInt(s.player1Score, 10);
                        const p2 = parseInt(s.player2Score, 10);
                        if (!isNaN(p1) && !isNaN(p2)) {
                          if (p1 > p2) p1Wins++;
                          else if (p2 > p1) p2Wins++;
                        }
                      }
                    }
                    // Hide if match already decided
                    if (p1Wins >= setsToWin || p2Wins >= setsToWin) return null;

                    return (
                      <div
                        key={setIdx}
                        className="flex items-center gap-2 justify-center"
                      >
                        <span className="text-xs text-gray-500 w-12 text-right">
                          Set {setIdx + 1}
                        </span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={setScore.player1Score}
                          onChange={(e) =>
                            handleChange(match._id, setIdx, "player1Score", e.target.value)
                          }
                          className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm font-medium focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                        />
                        <span className="text-gray-400 text-xs">-</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={setScore.player2Score}
                          onChange={(e) =>
                            handleChange(match._id, setIdx, "player2Score", e.target.value)
                          }
                          className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm font-medium focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Winner preview */}
                {(() => {
                  let p1W = 0,
                    p2W = 0;
                  scoreData.sets.forEach((s) => {
                    if (s.player1Score !== "" && s.player2Score !== "") {
                      const p1 = parseInt(s.player1Score, 10);
                      const p2 = parseInt(s.player2Score, 10);
                      if (!isNaN(p1) && !isNaN(p2) && p1 !== p2) {
                        if (p1 > p2) p1W++;
                        else p2W++;
                      }
                    }
                  });
                  if (p1W >= setsToWin) {
                    return (
                      <div className="mt-2 text-center text-green-600 text-xs font-semibold bg-green-50 rounded-lg py-1">
                        Winner: {name1} ({p1W}-{p2W})
                      </div>
                    );
                  }
                  if (p2W >= setsToWin) {
                    return (
                      <div className="mt-2 text-center text-green-600 text-xs font-semibold bg-green-50 rounded-lg py-1">
                        Winner: {name2} ({p1W}-{p2W})
                      </div>
                    );
                  }
                  if (p1W > 0 || p2W > 0) {
                    return (
                      <div className="mt-2 text-center text-orange-500 text-xs font-medium">
                        Sets: {p1W}-{p2W} (need {setsToWin} to win)
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 bg-white w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed w-auto flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <FiCheck />
                Submit All Scores
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
