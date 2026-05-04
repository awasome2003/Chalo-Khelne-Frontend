import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import keys from "../../config/queryKeys";
import {
  getSportName,
  getCurrentStage,
  getCategories,
  getMatchFormat,
} from "../../utils/sportTrack";

const fetchTournament = async (tournamentId) => {
  const res = await axios.get(`/api/tournaments/${tournamentId}`);
  return res.data.tournament || res.data;
};

export default function useTournament(tournamentId) {
  const { data: tournament, isLoading: loading, error, refetch } = useQuery({
    queryKey: keys.tournament(tournamentId),
    queryFn: () => fetchTournament(tournamentId),
    enabled: !!tournamentId,
  });

  // STEP 17b.ii — read normalized fields off sports[0]. Hook callers
  // currently don't pass sportId; defaulting to first sport matches
  // existing behavior.
  return {
    tournament,
    loading,
    error: error?.response?.data?.message || error?.message || null,
    title: tournament?.title || "Tournament",
    sportsType: getSportName(tournament) || "Unknown",
    currentStage: getCurrentStage(tournament) || "registration",
    categories: getCategories(tournament),
    matchFormat: getMatchFormat(tournament) || {},
    refresh: refetch,
  };
}
