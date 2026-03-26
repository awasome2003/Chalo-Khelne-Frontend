/**
 * Sport UI Configuration Registry.
 *
 * Each sport defines how its scoring UI should render.
 * Adding a new sport = adding one entry here. No other file changes needed.
 *
 * scoringType:
 *   "sets"    → Sets → Games → Points (TT, Badminton, Tennis, Volleyball)
 *   "time"    → Halves/Quarters → Goals (Football, Basketball, Hockey)
 *   "innings" → Innings → Overs → Runs (Cricket)
 *   "rounds"  → Rounds → Points (Boxing, Wrestling)
 *   "single"  → Single score value (Chess, Carrom)
 */

const SPORT_UI = {
  "Table Tennis": {
    scoringType: "sets",
    icon: "🏓",
    color: "#FF6A00",
    labels: {
      set: "Set",
      game: "Game",
      point: "Point",
      matchResult: "Sets",
    },
    scoring: {
      inputType: "counter",      // +1 / -1 buttons
      showDeuce: true,
      showService: true,
      showGameScore: true,
    },
    defaults: {
      totalSets: 5,
      setsToWin: 3,
      gamesPerSet: 5,
      gamesToWin: 3,
      pointsToWin: 11,
      marginToWin: 2,
    },
  },

  "Badminton": {
    scoringType: "sets",
    icon: "🏸",
    color: "#059669",
    labels: {
      set: "Set",
      game: "Game",
      point: "Point",
      matchResult: "Sets",
    },
    scoring: {
      inputType: "counter",
      showDeuce: true,
      showService: true,
      showGameScore: true,
    },
    defaults: {
      totalSets: 3,
      setsToWin: 2,
      gamesPerSet: 1,
      gamesToWin: 1,
      pointsToWin: 21,
      marginToWin: 2,
    },
  },

  "Tennis": {
    scoringType: "sets",
    icon: "🎾",
    color: "#84CC16",
    labels: {
      set: "Set",
      game: "Game",
      point: "Point",
      matchResult: "Sets",
    },
    scoring: {
      inputType: "counter",
      showDeuce: true,
      showService: true,
      showGameScore: true,
      showTiebreak: true,
    },
    defaults: {
      totalSets: 5,
      setsToWin: 3,
      gamesPerSet: 13,
      gamesToWin: 7,
      pointsToWin: 4,
      marginToWin: 2,
    },
  },

  "Pickleball": {
    scoringType: "sets",
    icon: "🥒",
    color: "#10B981",
    labels: {
      set: "Set",
      game: "Game",
      point: "Point",
      matchResult: "Sets",
    },
    scoring: {
      inputType: "counter",
      showDeuce: true,
      showService: true,
      showGameScore: true,
    },
    defaults: {
      totalSets: 3,
      setsToWin: 2,
      gamesPerSet: 1,
      gamesToWin: 1,
      pointsToWin: 11,
      marginToWin: 2,
    },
  },

  "Volleyball": {
    scoringType: "sets",
    icon: "🏐",
    color: "#F59E0B",
    labels: {
      set: "Set",
      game: "Game",
      point: "Point",
      matchResult: "Sets",
    },
    scoring: {
      inputType: "counter",
      showDeuce: true,
      showService: false,
      showGameScore: true,
    },
    defaults: {
      totalSets: 5,
      setsToWin: 3,
      gamesPerSet: 1,
      gamesToWin: 1,
      pointsToWin: 25,
      marginToWin: 2,
    },
  },

  "Football": {
    scoringType: "time",
    icon: "⚽",
    color: "#3B82F6",
    labels: {
      period: "Half",
      score: "Goal",
      matchResult: "Goals",
    },
    scoring: {
      inputType: "event",          // goal events with minute
      periods: 2,
      periodDuration: 45,
      extraTime: true,
      penalties: true,
    },
    defaults: {
      periods: 2,
      periodDuration: 45,
    },
  },

  "Basketball": {
    scoringType: "time",
    icon: "🏀",
    color: "#EF4444",
    labels: {
      period: "Quarter",
      score: "Point",
      matchResult: "Points",
    },
    scoring: {
      inputType: "event",
      periods: 4,
      periodDuration: 12,
      extraTime: true,
      penalties: false,
      pointValues: [1, 2, 3],     // free throw, 2pt, 3pt
    },
    defaults: {
      periods: 4,
      periodDuration: 12,
    },
  },

  "Cricket": {
    scoringType: "innings",
    icon: "🏏",
    color: "#1D6A8B",
    labels: {
      innings: "Innings",
      over: "Over",
      score: "Run",
      matchResult: "Runs",
      wicket: "Wicket",
    },
    scoring: {
      inputType: "ballByBall",
      ballValues: [0, 1, 2, 3, 4, 6],
      extras: ["wide", "no-ball", "bye", "leg-bye"],
      showWickets: true,
      showRunRate: true,
    },
    defaults: {
      overs: 20,
      innings: 2,
    },
  },

  "Chess": {
    scoringType: "single",
    icon: "♟️",
    color: "#374151",
    labels: {
      score: "Result",
      matchResult: "Result",
    },
    scoring: {
      inputType: "result",         // Win/Draw/Loss selector
      possibleResults: ["1-0", "0-1", "0.5-0.5"],
      resultLabels: { "1-0": "White wins", "0-1": "Black wins", "0.5-0.5": "Draw" },
    },
    defaults: {},
  },

  "Carrom": {
    scoringType: "single",
    icon: "🎯",
    color: "#92400E",
    labels: {
      set: "Board",
      score: "Point",
      matchResult: "Points",
    },
    scoring: {
      inputType: "manual",
      showCoinCount: true,
    },
    defaults: {
      totalSets: 3,
      setsToWin: 2,
      pointsToWin: 25,
    },
  },

  "Kabaddi": {
    scoringType: "time",
    icon: "🤼",
    color: "#7C3AED",
    labels: {
      period: "Half",
      score: "Point",
      matchResult: "Points",
    },
    scoring: {
      inputType: "event",
      periods: 2,
      periodDuration: 20,
      pointValues: [1, 2, 3],
    },
    defaults: {
      periods: 2,
      periodDuration: 20,
    },
  },
};

/**
 * Get sport config. Falls back to generic sets-based config.
 */
export function getSportConfig(sportName) {
  return SPORT_UI[sportName] || {
    scoringType: "sets",
    icon: "🏅",
    color: "#6B7280",
    labels: { set: "Set", game: "Game", point: "Point", matchResult: "Sets" },
    scoring: { inputType: "manual", showDeuce: false, showService: false, showGameScore: true },
    defaults: { totalSets: 3, setsToWin: 2, gamesPerSet: 3, gamesToWin: 2, pointsToWin: 11, marginToWin: 2 },
  };
}

/**
 * Get the scoring renderer component name for a sport.
 */
export function getScoringRenderer(sportName) {
  const config = getSportConfig(sportName);
  switch (config.scoringType) {
    case "sets": return "SetBasedScorer";
    case "time": return "TimeBasedScorer";
    case "innings": return "InningsBasedScorer";
    case "single": return "SingleResultScorer";
    default: return "SetBasedScorer";
  }
}

export default SPORT_UI;
