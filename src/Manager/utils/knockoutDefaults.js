// Shared helpers for the per-round knockout config that drives the bestOf +
// slot + match duration inputs across all four knockout-generation modals.
// Mirrors the cascade in server/utils/courtScheduling.js so client preview
// and server output stay in lockstep.

export const BEST_OF_OPTIONS = [3, 5, 7];

// Default cascade: Final = Bo7 (80/60), SF = Bo5 (50/40), QF and earlier = Bo3 (30/20).
// fromEnd = totalRounds - roundNumber  ⇒  0 final, 1 SF, 2 QF, ...
export function defaultsForRound(roundNumber, totalRounds) {
  const fromEnd = totalRounds - roundNumber;
  if (fromEnd === 0) return { bestOf: 7, slotDurationMinutes: 80, matchDurationMinutes: 60 };
  if (fromEnd === 1) return { bestOf: 5, slotDurationMinutes: 50, matchDurationMinutes: 40 };
  return { bestOf: 3, slotDurationMinutes: 30, matchDurationMinutes: 20 };
}

// drawSize → number of rounds (16 → 4, 32 → 5, 64 → 6, etc.)
export function totalRoundsFor(drawSize) {
  const n = parseInt(drawSize, 10);
  if (!Number.isFinite(n) || n < 2) return 1;
  return Math.ceil(Math.log2(n));
}

export function roundNameFor(roundNumber, totalRounds) {
  const fromEnd = totalRounds - roundNumber;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semi Final";
  if (fromEnd === 2) return "Quarter Final";
  return `Round ${roundNumber}`;
}

// Build a fresh per-round overrides array seeded with cascading defaults.
// Used when the manager toggles into "Customize per round" mode so the table
// pre-populates with sensible values they can then tweak.
export function buildDefaultRoundsArray(totalRounds) {
  const out = [];
  for (let rn = 1; rn <= totalRounds; rn++) {
    out.push({ roundNumber: rn, ...defaultsForRound(rn, totalRounds) });
  }
  return out;
}

// Build the rounds[] payload to send to the server. In uniform mode, fan the
// single bestOf + slot + match across all rounds. In customize mode, send the
// table as-is. Either way the server receives a complete per-round config.
export function buildRequestRounds({
  customizeRounds,
  totalRounds,
  uniformBestOf,
  uniformSlot,
  uniformMatch,
  roundOverrides,
}) {
  if (customizeRounds && Array.isArray(roundOverrides) && roundOverrides.length > 0) {
    // Sort by roundNumber and shape strictly so the server doesn't have to
    // guess. Missing fields fall back to the cascading defaults so a partial
    // edit (e.g. only Final touched) still sends a valid payload.
    return [...roundOverrides]
      .sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0))
      .map((r) => {
        const def = defaultsForRound(r.roundNumber, totalRounds);
        return {
          roundNumber: r.roundNumber,
          bestOf: r.bestOf || def.bestOf,
          slotDurationMinutes: r.slotDurationMinutes || def.slotDurationMinutes,
          matchDurationMinutes: r.matchDurationMinutes || def.matchDurationMinutes,
        };
      });
  }
  // Uniform mode — fan the single values to every round.
  const out = [];
  for (let rn = 1; rn <= totalRounds; rn++) {
    out.push({
      roundNumber: rn,
      bestOf: uniformBestOf || 3,
      slotDurationMinutes: uniformSlot || 30,
      matchDurationMinutes: uniformMatch || 20,
    });
  }
  return out;
}

// Validate a per-round entry. Returns null when valid, or an error string.
export function validateRoundEntry(entry) {
  const slot = parseInt(entry.slotDurationMinutes, 10);
  const match = parseInt(entry.matchDurationMinutes, 10);
  if (!Number.isFinite(slot) || slot < 1) return "Slot must be ≥ 1";
  if (!Number.isFinite(match) || match < 1) return "Match must be ≥ 1";
  if (match > slot) return "Match cannot exceed slot";
  if (entry.bestOf != null && !BEST_OF_OPTIONS.includes(parseInt(entry.bestOf, 10))) {
    return "Best of must be 3, 5 or 7";
  }
  return null;
}

// Derive whether the active sport is set-based. bestOf chips only render for
// set-based sports (Badminton, Table Tennis, Tennis, Volleyball, etc.).
export function isSetBasedSport(tournament, sportId) {
  if (!tournament) return false;
  const sports = tournament.sports || [];
  const sport = sportId
    ? sports.find((s) => String(s.sportId) === String(sportId))
    : sports[0];
  if (!sport) return false;
  const st = (sport.matchFormat?.scoringType || "").toLowerCase();
  return st === "sets";
}
