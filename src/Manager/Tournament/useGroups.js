import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import keys from "../../config/queryKeys";

const fetchGroups = async (tournamentId) => {
  const res = await axios.get(`/api/tournaments/bookinggroups/tournament/${tournamentId}`);
  return res.data?.data || [];
};

const fetchGroupMatches = async (tournamentId, groupId) => {
  const res = await axios.get(`/api/tournaments/matches/${tournamentId}/${groupId}`);
  return res.data?.matches || [];
};

const fetchStandings = async (tournamentId, groupId) => {
  const res = await axios.get(`/api/tournaments/standings/${tournamentId}/${groupId}`);
  return res.data?.data || null;
};

const fetchPlayers = async (tournamentId) => {
  const res = await axios.get(`/api/tournaments/getRegisteredPlayers?tournamentId=${tournamentId}`);
  return res.data?.bookings || [];
};

export function useGroups(tournamentId) {
  return useQuery({
    queryKey: keys.groups(tournamentId),
    queryFn: () => fetchGroups(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useGroupMatches(tournamentId, groupId) {
  return useQuery({
    queryKey: keys.groupMatches(tournamentId, groupId),
    queryFn: () => fetchGroupMatches(tournamentId, groupId),
    enabled: !!tournamentId && !!groupId,
  });
}

export function useStandings(tournamentId, groupId, enabled = false) {
  return useQuery({
    queryKey: keys.groupStandings(tournamentId, groupId),
    queryFn: () => fetchStandings(tournamentId, groupId),
    enabled: !!tournamentId && !!groupId && enabled,
  });
}

export function usePlayers(tournamentId) {
  return useQuery({
    queryKey: keys.players(tournamentId),
    queryFn: () => fetchPlayers(tournamentId),
    enabled: !!tournamentId,
  });
}
