import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Trophy, ArrowLeft, Medal, Star, ChevronDown, User } from "lucide-react";

const RANK_STYLES = {
  1: { bg: "bg-yellow-50", border: "border-yellow-300", badge: "bg-yellow-400", text: "text-yellow-900", icon: "🥇" },
  2: { bg: "bg-gray-50", border: "border-gray-300", badge: "bg-gray-400", text: "text-gray-800", icon: "🥈" },
  3: { bg: "bg-orange-50", border: "border-orange-300", badge: "bg-orange-400", text: "text-orange-900", icon: "🥉" },
};

export default function TournamentLeaderboard() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard", tournamentId],
    queryFn: async () => {
      const res = await axios.get(`/api/tournaments/leaderboard/${tournamentId}/players`);
      return res.data;
    },
    enabled: !!tournamentId,
  });

  // API returns { success, data: { players: [...], statistics } }
  const players = data?.data?.players || data?.leaderboard || data?.players || [];
  const tournament = data?.data?.tournament || data?.tournament || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load leaderboard</p>
        <p className="text-sm text-gray-400 mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Final Rankings</h1>
          <p className="text-sm text-gray-500">{tournament.title || "Tournament"}</p>
        </div>
        <div className="ml-auto">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
      </div>

      {/* Podium — Top 3 */}
      {players.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8 px-4">
          {/* 2nd Place */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl mb-2">🥈</div>
            <p className="font-bold text-sm text-gray-700 text-center truncate w-full">{players[1]?.playerName || "—"}</p>
            <p className="text-xs text-gray-400">{players[1]?.totalWins || 0}W {players[1]?.totalLosses || 0}L</p>
            <div className="w-full bg-gray-200 rounded-t-xl mt-2 h-20 flex items-center justify-center">
              <span className="text-2xl font-black text-gray-500">2</span>
            </div>
          </div>
          {/* 1st Place */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center text-3xl mb-2 border-4 border-yellow-400 shadow-lg shadow-yellow-200">🏆</div>
            <p className="font-bold text-sm text-gray-800 text-center truncate w-full">{players[0]?.playerName || "—"}</p>
            <p className="text-xs text-gray-500">{players[0]?.totalWins || 0}W {players[0]?.totalLosses || 0}L</p>
            <div className="w-full bg-yellow-400 rounded-t-xl mt-2 h-28 flex items-center justify-center">
              <span className="text-3xl font-black text-yellow-900">1</span>
            </div>
          </div>
          {/* 3rd Place */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl mb-2">🥉</div>
            <p className="font-bold text-sm text-gray-700 text-center truncate w-full">{players[2]?.playerName || "—"}</p>
            <p className="text-xs text-gray-400">{players[2]?.totalWins || 0}W {players[2]?.totalLosses || 0}L</p>
            <div className="w-full bg-orange-200 rounded-t-xl mt-2 h-14 flex items-center justify-center">
              <span className="text-2xl font-black text-orange-700">3</span>
            </div>
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Medal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-bold text-gray-600">All Players ({players.length})</span>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No ranking data available</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {players.map((p, idx) => {
              const rank = idx + 1;
              const rs = RANK_STYLES[rank];
              const winRate = p.totalMatches > 0 ? Math.round((p.totalWins / p.totalMatches) * 100) : 0;

              return (
                <div key={p.playerId || idx} className={`flex items-center gap-3 px-4 py-3 ${rs ? rs.bg : "hover:bg-gray-50"} transition`}>
                  {/* Rank */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${rs ? `${rs.badge} text-white` : "bg-gray-100 text-gray-500"}`}>
                    {rs ? rs.icon : rank}
                  </div>

                  {/* Player Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{p.playerName || "Unknown"}</p>
                    {p.stageReached && (
                      <p className="text-[10px] text-gray-400">{p.stageReached}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-center">
                      <p className="font-black text-gray-800">{p.totalMatches || 0}</p>
                      <p className="text-gray-400">Played</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-green-600">{p.totalWins || 0}</p>
                      <p className="text-gray-400">Won</p>
                    </div>
                    <div className="text-center">
                      <p className="font-black text-red-500">{p.totalLosses || 0}</p>
                      <p className="text-gray-400">Lost</p>
                    </div>
                    <div className="text-center min-w-[40px]">
                      <p className="font-black text-orange-500">{winRate}%</p>
                      <p className="text-gray-400">WR</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
