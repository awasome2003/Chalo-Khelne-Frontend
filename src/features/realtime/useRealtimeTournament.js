import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeTournament, isSocketConnected } from "./socketService";

/**
 * Hook: subscribes to real-time tournament updates via WebSocket.
 * Updates dashboard caches. Falls back to polling if disconnected.
 *
 * @param {string} tournamentId
 * @returns {{ isRealtime: boolean, fallbackInterval: number | false }}
 */
export default function useRealtimeTournament(tournamentId) {
  const queryClient = useQueryClient();
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!tournamentId) return;

    const handlers = {
      onScoreUpdate: (data) => {
        // Update any match in the dashboard matches cache
        queryClient.setQueryData(["dashboard-matches", tournamentId], (old) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((m) => {
            if (m._id !== data.matchId) return m;
            return {
              ...m,
              currentSet: data.currentSet,
              currentGame: data.currentGame,
              liveScore: data.liveScore,
              sets: data.sets || m.sets,
              status: "IN_PROGRESS",
            };
          });
        });
      },

      onMatchComplete: (data) => {
        // Update match status in dashboard cache
        queryClient.setQueryData(["dashboard-matches", tournamentId], (old) => {
          if (!old || !Array.isArray(old)) return old;
          return old.map((m) => {
            if (m._id !== data.matchId) return m;
            return { ...m, status: "COMPLETED", winner: data.winner, result: data.result };
          });
        });

        // Also invalidate group-level caches
        queryClient.invalidateQueries({ queryKey: ["dashboard-matches", tournamentId] });
      },
    };

    unsubRef.current = subscribeTournament(tournamentId, handlers);

    return () => {
      unsubRef.current?.();
    };
  }, [tournamentId, queryClient]);

  const connected = isSocketConnected();

  return {
    isRealtime: connected,
    fallbackInterval: connected ? false : 10000,
  };
}
