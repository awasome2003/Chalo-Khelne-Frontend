import axios from "axios";

// ================================================
// ALL API CALLS EXTRACTED FROM MGrouptabs.jsx
// Single source of truth for group stage endpoints
// ================================================

// Helper: append `?sportId=X` to a URL when sportId is truthy. Returns the
// URL untouched otherwise so legacy callers (no sportId) still work.
const withSport = (url, sportId) =>
  sportId ? `${url}${url.includes("?") ? "&" : "?"}sportId=${sportId}` : url;

export const groupTabsApi = {
  // ---- Tournament ----
  fetchTournament: (tournamentId) =>
    axios.get(`/api/tournaments/${tournamentId}`),

  // ---- Groups (sport-scoped) ----
  fetchGroups: (tournamentId, sportId) =>
    axios.get(withSport(`/api/tournaments/bookinggroups/tournament/${tournamentId}`, sportId)),

  updateGroup: (groupId, data) =>
    axios.put(`/api/tournaments/bookinggroups/${groupId}`, data),

  getGroupMatchFormat: (groupId) =>
    axios.get(`/api/tournaments/bookinggroups/${groupId}/match-format`),

  updateGroupMatchFormat: (groupId, matchFormat) =>
    axios.put(`/api/tournaments/bookinggroups/${groupId}/match-format`, { matchFormat }),

  // ---- Matches (Round 1 League) ----
  // Already groupId-scoped (which inherits sportId). No need to thread sportId.
  fetchGroupMatches: (tournamentId, groupId) =>
    axios.get(`/api/tournaments/matches/${tournamentId}/${groupId}`),

  generateMatches: (tournamentId, groupId, schedule) =>
    axios.post("/api/tournaments/matches/generate", {
      tournamentId,
      groupId,
      ...schedule,
    }),

  // ---- Round 2 Top Players (sport-scoped) ----
  fetchRound2Groups: (tournamentId, sportId) =>
    axios.get(withSport(`/api/tournaments/round2/groups/${tournamentId}`, sportId)),

  generateRound2Matches: (tournamentId, groupId, schedule) =>
    axios.post("/api/tournaments/matches/generate", {
      tournamentId,
      groupId,
      ...schedule,
    }),

  // ---- Knockout (sport-scoped — see polish item #1 noted in STEP 11c summary) ----
  fetchKnockoutMatches: (tournamentId, sportId) =>
    axios.get(withSport(`/api/tournaments/knockout-matches/${tournamentId}`, sportId)),

  // ---- Direct Knockout (sport-scoped) ----
  fetchDirectKnockoutMatches: (tournamentId, sportId) =>
    axios.get(withSport(`/api/tournaments/direct-knockout/matches/${tournamentId}`, sportId)),

  validateDirectKnockoutPlayers: (tournamentId, selectedPlayers, sportId) =>
    axios.post("/api/tournaments/direct-knockout/validate-players", {
      tournamentId,
      sportId,
      selectedPlayers,
    }),

  createDirectKnockoutMatches: (tournamentId, selectedPlayers, schedule, sportId) =>
    axios.post("/api/tournaments/direct-knockout/create-matches", {
      tournamentId,
      sportId,
      selectedPlayers,
      schedule,
    }),

  // (sport-scoped — see polish item #2 noted in STEP 11c summary)
  fetchAvailablePlayers: (tournamentId, sportId) =>
    axios.get(withSport(`/api/tournaments/direct-knockout/available-players/${tournamentId}`, sportId)),

  // ---- Standings ----
  fetchStandings: (tournamentId, groupId) =>
    axios.get(`/api/tournaments/standings/${tournamentId}/${groupId}`),

  // ---- Transition ----
  transitionToKnockout: (tournamentId) =>
    axios.post(`/api/tournaments/transition-to-knockout/${tournamentId}`),

  // ---- Bulk Scores ----
  bulkUploadScores: (tournamentId, groupId, scores) =>
    axios.post("/api/tournaments/matches/bulk-upload-scores", {
      tournamentId,
      groupId,
      scores,
    }),
};

export default groupTabsApi;
