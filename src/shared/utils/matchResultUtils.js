/**
 * Frontend match result abstraction.
 * Mirrors server-side readMatchResult — normalizes match data for display.
 *
 * Usage:
 *   import { readMatchResult, getScoreDisplay, getResultLabels } from "../shared/utils/matchResultUtils";
 *   const result = readMatchResult(match);
 *   // result.type → "sets" | "time" | "innings" | "single"
 *   // result.player1Score, result.player2Score
 *   // result.labels → { round, score, result }
 */

const SPORT_SCORING_TYPES = {
  "Table Tennis": "sets",
  "Badminton": "sets",
  "Tennis": "sets",
  "Pickleball": "sets",
  "Volleyball": "sets",
  "Squash": "sets",
  "Cricket": "innings",
  "Football": "time",
  "Basketball": "time",
  "Hockey": "time",
  "Kabaddi": "time",
  "Chess": "single",
  "Carrom": "single",
  "Snooker": "single",
  "Turf Games": "single",
  "Cricket Nets": "single",
};

function getScoringType(sportName) {
  if (!sportName) return null;
  const key = Object.keys(SPORT_SCORING_TYPES).find(
    (k) => k.toLowerCase() === sportName.toLowerCase()
  );
  return SPORT_SCORING_TYPES[key] || null;
}

const LABELS = {
  sets:    { round: "Set", subRound: "Game", score: "Points", result: "Sets" },
  time:    { round: "Period", subRound: null, score: "Goals", result: "Score" },
  innings: { round: "Innings", subRound: "Over", score: "Runs", result: "Score" },
  single:  { round: "Game", subRound: null, score: "Result", result: "Result" },
};

/**
 * Read normalized match result.
 * @param {Object} match — match object from API
 * @param {Object} [opts] — { tournament, sportName }
 * @returns {{ type, player1Score, player2Score, completed, winner, labels }}
 */
export function readMatchResult(match, opts = {}) {
  if (!match) return null;

  // FAST PATH: use pre-computed matchResult if available
  if (match.matchResult && match.matchResult.type) {
    return {
      ...match.matchResult,
      labels: LABELS[match.matchResult.type] || LABELS.sets,
    };
  }

  // Also check _normalizedResult (from socket events)
  if (match._normalizedResult && match._normalizedResult.type) {
    return {
      ...match._normalizedResult,
      labels: LABELS[match._normalizedResult.type] || LABELS.sets,
    };
  }

  // LEGACY PATH: extract from old schema fields
  const scoringType = match.matchFormat?.scoringType
    || getScoringType(match.sportsType || match.sport || opts.sportName)
    || "sets";

  const completed = (match.status || "").toUpperCase() === "COMPLETED";

  let p1Score = 0, p2Score = 0;

  if (match.result?.finalScore) {
    p1Score = match.result.finalScore.player1Sets || 0;
    p2Score = match.result.finalScore.player2Sets || 0;
  } else if (match.score) {
    p1Score = match.score.player1Sets || 0;
    p2Score = match.score.player2Sets || 0;
  } else if (match.setsWon) {
    p1Score = match.setsWon.home || 0;
    p2Score = match.setsWon.away || 0;
  }

  let winner = null;
  if (match.result?.winner) winner = match.result.winner;
  else if (match.winner) winner = match.winner;

  return {
    type: scoringType,
    completed,
    player1Score: p1Score,
    player2Score: p2Score,
    winner,
    labels: LABELS[scoringType] || LABELS.sets,
  };
}

/**
 * Get display string for match score.
 */
export function getScoreDisplay(match, opts = {}) {
  const r = readMatchResult(match, opts);
  if (!r) return "-";
  return `${r.player1Score}-${r.player2Score}`;
}

/**
 * Get labels for a sport/scoringType.
 */
export function getResultLabels(scoringTypeOrSportName) {
  const st = LABELS[scoringTypeOrSportName]
    ? scoringTypeOrSportName
    : getScoringType(scoringTypeOrSportName) || "sets";
  return LABELS[st] || LABELS.sets;
}

export { getScoringType, LABELS };
