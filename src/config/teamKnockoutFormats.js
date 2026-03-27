/**
 * Central Registry — Team Knockout Match Formulas
 *
 * Each format defines:
 * - id: unique key stored in tournament
 * - name: display name
 * - shortName: compact label
 * - totalSets: max sets in a match
 * - setsToWin: sets needed to win
 * - hasDoubles: whether any set is doubles
 * - minPlayers: minimum players per team
 * - sets: ordered list of set definitions
 *   - setNumber: 1-based
 *   - type: "singles" | "doubles"
 *   - label: display label (e.g. "Singles A vs X")
 *   - home: player positions from home team
 *   - away: player positions from away team
 *   - isDecider: true if this set only plays when needed
 *
 * Adding a new format = add one entry. No other file changes needed.
 */

const TEAM_KNOCKOUT_FORMATS = [
  // ═══════════════════════════════════════════
  // SINGLES FORMATS
  // ═══════════════════════════════════════════
  {
    id: "singles_bo3",
    name: "Singles — Best of 3",
    shortName: "Singles BO3",
    description: "3 singles sets. Captain vs Captain, Player vs Player, cross-match decider.",
    totalSets: 3,
    setsToWin: 2,
    hasDoubles: false,
    minPlayers: 2,
    sets: [
      { setNumber: 1, type: "singles", label: "Singles A vs X", home: ["A"], away: ["X"], isDecider: false },
      { setNumber: 2, type: "singles", label: "Singles B vs Y", home: ["B"], away: ["Y"], isDecider: false },
      { setNumber: 3, type: "singles", label: "Singles A vs Y", home: ["A"], away: ["Y"], isDecider: true },
    ],
  },
  {
    id: "singles_bo5",
    name: "Singles — Best of 5",
    shortName: "Singles BO5",
    description: "5 singles sets. All players cross-match. Captain rematch as tie-breaker.",
    totalSets: 5,
    setsToWin: 3,
    hasDoubles: false,
    minPlayers: 2,
    sets: [
      { setNumber: 1, type: "singles", label: "Singles A vs X", home: ["A"], away: ["X"], isDecider: false },
      { setNumber: 2, type: "singles", label: "Singles B vs Y", home: ["B"], away: ["Y"], isDecider: false },
      { setNumber: 3, type: "singles", label: "Singles A vs Y", home: ["A"], away: ["Y"], isDecider: false },
      { setNumber: 4, type: "singles", label: "Singles B vs X", home: ["B"], away: ["X"], isDecider: false },
      { setNumber: 5, type: "singles", label: "Singles A vs X", home: ["A"], away: ["X"], isDecider: true },
    ],
  },
  {
    id: "singles_bo7",
    name: "Singles — Best of 7",
    shortName: "Singles BO7",
    description: "7 singles sets. Full rotation with reverse cross-matches and final showdown.",
    totalSets: 7,
    setsToWin: 4,
    hasDoubles: false,
    minPlayers: 2,
    sets: [
      { setNumber: 1, type: "singles", label: "Singles A vs X", home: ["A"], away: ["X"], isDecider: false },
      { setNumber: 2, type: "singles", label: "Singles B vs Y", home: ["B"], away: ["Y"], isDecider: false },
      { setNumber: 3, type: "singles", label: "Singles A vs Y", home: ["A"], away: ["Y"], isDecider: false },
      { setNumber: 4, type: "singles", label: "Singles B vs X", home: ["B"], away: ["X"], isDecider: false },
      { setNumber: 5, type: "singles", label: "Singles A vs X", home: ["A"], away: ["X"], isDecider: false },
      { setNumber: 6, type: "singles", label: "Singles B vs Y", home: ["B"], away: ["Y"], isDecider: true },
      { setNumber: 7, type: "singles", label: "Singles A vs Y", home: ["A"], away: ["Y"], isDecider: true },
    ],
  },

  // ═══════════════════════════════════════════
  // DOUBLES FORMATS (Mixed Singles + Doubles)
  // ═══════════════════════════════════════════
  {
    id: "doubles_bo3",
    name: "Doubles — Best of 3",
    shortName: "Doubles BO3",
    description: "Singles opener, doubles middle, singles decider.",
    totalSets: 3,
    setsToWin: 2,
    hasDoubles: true,
    minPlayers: 2,
    sets: [
      { setNumber: 1, type: "singles", label: "Singles A vs X", home: ["A"], away: ["X"], isDecider: false },
      { setNumber: 2, type: "doubles", label: "Doubles AB vs XY", home: ["A", "B"], away: ["X", "Y"], isDecider: false },
      { setNumber: 3, type: "singles", label: "Singles B vs Y", home: ["B"], away: ["Y"], isDecider: true },
    ],
  },
  {
    id: "doubles_bo5",
    name: "Doubles — Best of 5",
    shortName: "Doubles BO5",
    description: "2 singles, 1 doubles, then cross-match singles. True Davis Cup format.",
    totalSets: 5,
    setsToWin: 3,
    hasDoubles: true,
    minPlayers: 2,
    sets: [
      { setNumber: 1, type: "singles", label: "Singles A vs X", home: ["A"], away: ["X"], isDecider: false },
      { setNumber: 2, type: "singles", label: "Singles B vs Y", home: ["B"], away: ["Y"], isDecider: false },
      { setNumber: 3, type: "doubles", label: "Doubles AB vs XY", home: ["A", "B"], away: ["X", "Y"], isDecider: false },
      { setNumber: 4, type: "singles", label: "Singles A vs Y", home: ["A"], away: ["Y"], isDecider: false },
      { setNumber: 5, type: "singles", label: "Singles B vs X", home: ["B"], away: ["X"], isDecider: true },
    ],
  },
  {
    id: "doubles_bo7",
    name: "Doubles — Best of 7",
    shortName: "Doubles BO7",
    description: "Extended format with 2 doubles sets. Maximum tactical depth.",
    totalSets: 7,
    setsToWin: 4,
    hasDoubles: true,
    minPlayers: 2,
    sets: [
      { setNumber: 1, type: "singles", label: "Singles A vs X", home: ["A"], away: ["X"], isDecider: false },
      { setNumber: 2, type: "singles", label: "Singles B vs Y", home: ["B"], away: ["Y"], isDecider: false },
      { setNumber: 3, type: "doubles", label: "Doubles AB vs XY", home: ["A", "B"], away: ["X", "Y"], isDecider: false },
      { setNumber: 4, type: "singles", label: "Singles A vs Y", home: ["A"], away: ["Y"], isDecider: false },
      { setNumber: 5, type: "singles", label: "Singles B vs X", home: ["B"], away: ["X"], isDecider: false },
      { setNumber: 6, type: "doubles", label: "Doubles AB vs XY", home: ["A", "B"], away: ["X", "Y"], isDecider: true },
      { setNumber: 7, type: "singles", label: "Singles A vs X", home: ["A"], away: ["X"], isDecider: true },
    ],
  },
];

/**
 * Get a format by ID. Throws if not found.
 */
export function getTeamKnockoutFormat(formatId) {
  const format = TEAM_KNOCKOUT_FORMATS.find((f) => f.id === formatId);
  if (!format) throw new Error(`Unknown team knockout format: "${formatId}"`);
  return format;
}

/**
 * Get all available formats (for selector UI).
 */
export function getAllTeamKnockoutFormats() {
  return TEAM_KNOCKOUT_FORMATS;
}

/**
 * Get formats filtered by type.
 */
export function getFormatsByType(hasDoubles) {
  return TEAM_KNOCKOUT_FORMATS.filter((f) => f.hasDoubles === hasDoubles);
}

/**
 * Map old backend format string to new format ID.
 * For backward compatibility with existing tournaments.
 */
export function legacyFormatToId(formatString) {
  const map = {
    "Singles - 3 Sets": "singles_bo3",
    "Singles - 5 Sets": "singles_bo5",
    "Singles - 3 Sets (2 Players)": "singles_bo3",
    "Singles - 5 Sets (2 Players)": "singles_bo5",
    "Doubles - 3 Sets": "doubles_bo3",
    "Doubles - 5 Sets": "doubles_bo5",
    "Doubles - 3 Sets (2 Players)": "doubles_bo3",
    "Doubles - 5 Sets (2 Players)": "doubles_bo5",
  };
  return map[formatString] || "singles_bo3";
}

/**
 * Map format ID to backend format string.
 */
export function formatIdToLegacy(formatId) {
  const map = {
    singles_bo3: "Singles - 3 Sets",
    singles_bo5: "Singles - 5 Sets",
    singles_bo7: "Singles - 5 Sets", // Backend doesn't support BO7 yet, fallback
    doubles_bo3: "Doubles - 3 Sets",
    doubles_bo5: "Doubles - 5 Sets",
    doubles_bo7: "Doubles - 5 Sets", // Fallback
  };
  return map[formatId] || "Singles - 3 Sets";
}

export default TEAM_KNOCKOUT_FORMATS;
