import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import keys from "../../config/queryKeys";

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

  return {
    tournament,
    loading,
    error: error?.response?.data?.message || error?.message || null,
    title: tournament?.title || "Tournament",
    sportsType: tournament?.sportsType || "Unknown",
    currentStage: tournament?.currentStage || "registration",
    categories: tournament?.category || [],
    matchFormat: tournament?.matchFormat || {},
    refresh: refetch,
  };
}
