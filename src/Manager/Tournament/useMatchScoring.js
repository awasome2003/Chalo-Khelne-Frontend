import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import keys from "../../config/queryKeys";

const fetchMatchLiveState = async (matchId) => {
  const res = await axios.get(`/api/tournaments/matches/${matchId}/live-state?autoInit=false`);
  return res.data.match;
};

const completeGameApi = async ({ matchId, player1Score, player2Score }) => {
  const res = await axios.post(`/api/tournaments/matches/${matchId}/complete-game`, {
    finalPlayer1Points: player1Score,
    finalPlayer2Points: player2Score,
  });
  return res.data;
};

const syncPointsTableApi = async (matchId) => {
  await axios.post(`/api/tournaments/scores/${matchId}`, {});
};

export default function useMatchScoring(matchId) {
  const queryClient = useQueryClient();

  const { data: match, isLoading: loading, error } = useQuery({
    queryKey: keys.matchLiveState(matchId),
    queryFn: () => fetchMatchLiveState(matchId),
    enabled: !!matchId,
    refetchInterval: (data) => {
      // Auto-refetch every 5s if match is live
      const status = data?.status?.toUpperCase();
      return status === "IN_PROGRESS" ? 5000 : false;
    },
  });

  // Parse match format
  const fmt = match?.matchFormat || {};
  const matchFormat = match ? {
    totalSets: fmt.maxSets || fmt.totalSets || 5,
    setsToWin: fmt.setsToWin || Math.ceil((fmt.maxSets || fmt.totalSets || 5) / 2),
    totalGames: fmt.maxGames || fmt.totalGames || 5,
    gamesToWin: fmt.gamesToWin || Math.ceil((fmt.maxGames || fmt.totalGames || 5) / 2),
    pointsToWinGame: fmt.pointsToWinGame || 11,
    marginToWin: fmt.marginToWin || 2,
    deuceRule: fmt.deuceRule !== undefined ? fmt.deuceRule : true,
    maxPointsPerGame: fmt.maxPointsPerGame || null,
    serviceRule: {
      pointsPerService: fmt.serviceRule?.pointsPerService || 2,
      deuceServicePoints: fmt.serviceRule?.deuceServicePoints || 1,
    },
  } : null;

  // Complete a single game
  const completeGameMutation = useMutation({
    mutationFn: ({ player1Score, player2Score }) =>
      completeGameApi({ matchId, player1Score, player2Score }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.matchLiveState(matchId) });
    },
  });

  // Sync to points table
  const syncMutation = useMutation({
    mutationFn: () => syncPointsTableApi(matchId),
  });

  // Bulk submit games sequentially
  const submitBulkScores = async (games) => {
    const toSubmit = games.filter((g) => g.a !== "" && g.b !== "");
    if (toSubmit.length === 0) throw new Error("No scores to submit");

    for (const game of toSubmit) {
      const scoreA = parseInt(game.a, 10);
      const scoreB = parseInt(game.b, 10);
      if (isNaN(scoreA) || isNaN(scoreB)) continue;
      await completeGameApi({ matchId, player1Score: scoreA, player2Score: scoreB });
      await new Promise((r) => setTimeout(r, 300));
    }

    // Sync + refetch
    try { await syncPointsTableApi(matchId); } catch {}
    queryClient.invalidateQueries({ queryKey: keys.matchLiveState(matchId) });
  };

  // Derived state
  const player1Name = match?.player1?.userName || match?.player1?.playerName || "Player 1";
  const player2Name = match?.player2?.userName || match?.player2?.playerName || "Player 2";
  const isCompleted = match?.status === "COMPLETED" || match?.status === "completed";
  const isInProgress = match?.status === "IN_PROGRESS" || match?.status === "in_progress" || match?.status === "in-progress";
  const sets = match?.sets || [];

  const countSetsWon = (playerKey, playerName) =>
    sets.filter((s) => {
      if (!s.setWinner) return false;
      const w = s.setWinner;
      if (typeof w === "string") return w === playerKey || w === playerName;
      return w.playerId?.toString() === match?.[playerKey === "player1" ? "player1" : "player2"]?.playerId?.toString() || w.playerName === playerName;
    }).length;

  const player1SetsWon = countSetsWon("player1", player1Name);
  const player2SetsWon = countSetsWon("player2", player2Name);

  const winnerName = match?.winner
    ? typeof match.winner === "object" ? (match.winner.playerName || match.winner.userName) : match.winner
    : null;

  return {
    match, matchFormat, loading,
    error: error?.response?.data?.message || error?.message || null,
    player1Name, player2Name,
    player1Points: match?.liveScore?.player1Points || 0,
    player2Points: match?.liveScore?.player2Points || 0,
    currentSet: match?.currentSet || 1,
    currentGame: match?.currentGame || 1,
    sets, player1SetsWon, player2SetsWon,
    isCompleted, isInProgress, winnerName,

    // Mutations
    completeGame: completeGameMutation.mutateAsync,
    submitting: completeGameMutation.isPending,
    submitBulkScores,
    syncToPointsTable: syncMutation.mutateAsync,
  };
}
