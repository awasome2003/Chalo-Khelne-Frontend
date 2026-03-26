import axios from "axios";

// ================================================
// ALL API CALLS EXTRACTED FROM MGrouptabs.jsx
// Single source of truth for group stage endpoints
// ================================================

export const groupTabsApi = {
  // ---- Tournament ----
  fetchTournament: (tournamentId) =>
    axios.get(`/api/tournaments/${tournamentId}`),

  // ---- Groups ----
  fetchGroups: (tournamentId) =>
    axios.get(`/api/tournaments/bookinggroups/tournament/${tournamentId}`),

  updateGroup: (groupId, data) =>
    axios.put(`/api/tournaments/bookinggroups/${groupId}`, data),

  getGroupMatchFormat: (groupId) =>
    axios.get(`/api/tournaments/bookinggroups/${groupId}/match-format`),

  updateGroupMatchFormat: (groupId, matchFormat) =>
    axios.put(`/api/tournaments/bookinggroups/${groupId}/match-format`, { matchFormat }),

  // ---- Matches (Round 1 League) ----
  fetchGroupMatches: (tournamentId, groupId) =>
    axios.get(`/api/tournaments/matches/${tournamentId}/${groupId}`),

  generateMatches: (tournamentId, groupId, schedule) =>
    axios.post("/api/tournaments/matches/generate", {
      tournamentId,
      groupId,
      ...schedule,
    }),

  // ---- Round 2 Top Players ----
  fetchRound2Groups: (tournamentId) =>
    axios.get(`/api/tournaments/round2/groups/${tournamentId}`),

  generateRound2Matches: (tournamentId, groupId, schedule) =>
    axios.post("/api/tournaments/matches/generate", {
      tournamentId,
      groupId,
      ...schedule,
    }),

  // ---- Knockout ----
  fetchKnockoutMatches: (tournamentId) =>
    axios.get(`/api/tournaments/knockout-matches/${tournamentId}`),

  // ---- Direct Knockout ----
  fetchDirectKnockoutMatches: (tournamentId) =>
    axios.get(`/api/tournaments/direct-knockout/matches/${tournamentId}`),

  validateDirectKnockoutPlayers: (tournamentId, selectedPlayers) =>
    axios.post("/api/tournaments/direct-knockout/validate-players", {
      tournamentId,
      selectedPlayers,
    }),

  createDirectKnockoutMatches: (tournamentId, selectedPlayers, schedule) =>
    axios.post("/api/tournaments/direct-knockout/create-matches", {
      tournamentId,
      selectedPlayers,
      schedule,
    }),

  fetchAvailablePlayers: (tournamentId) =>
    axios.get(`/api/tournaments/direct-knockout/available-players/${tournamentId}`),

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
