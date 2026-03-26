/**
 * Centralized query key factory.
 * Ensures consistent cache keys across all pages.
 *
 * Usage:
 *   queryKey: keys.tournament(id)
 *   queryKey: keys.groups(tournamentId)
 *   queryKey: keys.groupMatches(tournamentId, groupId)
 *   queryKey: keys.match(matchId)
 */
export const keys = {
  // Tournament
  tournaments: () => ["tournaments"],
  tournament: (id) => ["tournament", id],
  tournamentStats: (id) => ["tournament", id, "stats"],

  // Players
  players: (tournamentId) => ["players", tournamentId],

  // Groups
  groups: (tournamentId) => ["groups", tournamentId],
  group: (groupId) => ["group", groupId],
  groupMatches: (tournamentId, groupId) => ["groupMatches", tournamentId, groupId],
  groupStandings: (tournamentId, groupId) => ["standings", tournamentId, groupId],
  groupMatchFormat: (groupId) => ["groupMatchFormat", groupId],

  // Knockout
  knockoutMatches: (tournamentId) => ["knockoutMatches", tournamentId],
  directKnockoutMatches: (tournamentId) => ["dkMatches", tournamentId],

  // Match
  match: (matchId) => ["match", matchId],
  matchLiveState: (matchId) => ["matchLiveState", matchId],

  // Round 2
  round2Groups: (tournamentId) => ["round2Groups", tournamentId],
};

export default keys;
