import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCcw, Users, Grid3X3, Swords, Award, Calendar, MapPin, ArrowRight } from "lucide-react";
import { getSportConfig } from "../scoring/sportUIConfig";
import useTournamentDashboard from "./useTournamentDashboard";
import TournamentStats from "./TournamentStats";
import LiveMatchesPanel from "./LiveMatchesPanel";
import MatchCard from "./MatchCard";
import ActivityFeed from "./ActivityFeed";

export default function TournamentDashboardPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const {
    tournament, groups, players, allMatches,
    live, completed, upcoming, progress, loading, refetchMatches,
  } = useTournamentDashboard(tournamentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Tournament not found</p>
          <button onClick={() => navigate("/mtournament-management")} className="mt-4 text-blue-600 underline">
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  const sportConfig = getSportConfig(tournament.sportsType);
  const title = tournament.title || "Tournament";
  const stage = tournament.currentStage || "registration";

  const formatDate = (d) => {
    if (!d) return "TBD";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const goToMatch = (match) => {
    navigate(`/tournaments/${tournamentId}/live/${match._id}`, {
      state: { backTo: `/tournaments/${tournamentId}/dashboard` },
    });
  };

  const quickActions = [
    { label: "Players", icon: Users, path: `/tournaments/${tournamentId}/players`, count: players.length },
    { label: "Groups", icon: Grid3X3, path: `/tournaments/${tournamentId}/groups`, count: groups.length },
    { label: "Knockout", icon: Swords, path: `/tournaments/${tournamentId}/knockout`, count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/mtournament-management")} className="p-2 hover:bg-gray-100 rounded-lg w-auto">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{sportConfig.icon}</span>
                  <h1 className="text-lg font-bold text-gray-800">{title}</h1>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{
                    backgroundColor: `${sportConfig.color}15`,
                    color: sportConfig.color,
                  }}>
                    {stage.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {Array.isArray(tournament.eventLocation) ? tournament.eventLocation[0] : tournament.eventLocation || "TBD"}</span>
                  <span className="flex items-center gap-1"><Award className="w-3 h-3 capitalize" /> {tournament.tournamentLevel}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => refetchMatches()}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition w-auto"
              title="Refresh data"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <TournamentStats
          players={players}
          groups={groups}
          allMatches={allMatches}
          live={live}
          completed={completed}
          upcoming={upcoming}
          progress={progress}
        />

        {/* Live Matches */}
        <LiveMatchesPanel matches={live} onMatchClick={goToMatch} />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => navigate(a.path)}
                className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800 text-sm">{a.label}</div>
                    {a.count !== null && <div className="text-[10px] text-gray-400">{a.count} total</div>}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>

        {/* Two-column: Upcoming + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Matches */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-sm">Upcoming Matches</h3>
              <span className="text-[10px] text-gray-400">{upcoming.length} pending</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="p-8 text-center">
                <Swords className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No upcoming matches</p>
              </div>
            ) : (
              <div className="p-4 space-y-2 max-h-[350px] overflow-y-auto">
                {upcoming.slice(0, 10).map((m) => (
                  <MatchCard key={m._id} match={m} onClick={() => goToMatch(m)} />
                ))}
                {upcoming.length > 10 && (
                  <p className="text-center text-xs text-gray-400 py-2">
                    +{upcoming.length - 10} more
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <ActivityFeed completed={completed} />
        </div>

        {/* Completed Matches (collapsible) */}
        {completed.length > 0 && (
          <details className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <summary className="px-5 py-3 bg-gray-50 border-b border-gray-100 cursor-pointer font-bold text-gray-800 text-sm flex items-center justify-between list-none">
              <span>All Completed Matches ({completed.length})</span>
              <span className="text-[10px] text-gray-400">Click to expand</span>
            </summary>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
              {completed.map((m) => (
                <MatchCard key={m._id} match={m} onClick={() => goToMatch(m)} />
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
