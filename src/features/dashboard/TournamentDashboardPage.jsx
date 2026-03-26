import { useParams, useNavigate } from "react-router-dom";
import { Users, Grid3X3, Swords, Award, Calendar, MapPin, ArrowRight, RefreshCcw, Radio } from "lucide-react";
import { getSportConfig } from "../scoring/sportUIConfig";
import useTournamentDashboard from "./useTournamentDashboard";
import LiveMatchesPanel from "./LiveMatchesPanel";
import MatchCard from "./MatchCard";
import ActivityFeed from "./ActivityFeed";
import { PageHeader, StatCard, Card, Badge, Button, ProgressBar, EmptyState } from "../../shared/ui";

export default function TournamentDashboardPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const {
    tournament, groups, players, allMatches,
    live, completed, upcoming, progress, loading, refetchMatches, isRealtime,
  } = useTournamentDashboard(tournamentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCcw className="w-8 h-8 text-[#004e93] animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Swords}
          title="Tournament not found"
          action={<Button onClick={() => navigate("/mtournament-management")}>Back to Tournaments</Button>}
        />
      </div>
    );
  }

  const sportConfig = getSportConfig(tournament.sportsType);
  const title = tournament.title || "Tournament";
  const stage = tournament.currentStage || "registration";

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "TBD";

  const goToMatch = (match) => {
    navigate(`/tournaments/${tournamentId}/live/${match._id}`, {
      state: { backTo: `/tournaments/${tournamentId}/dashboard` },
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <PageHeader
        title={title}
        backTo="/mtournament-management"
        actions={
          <div className="flex items-center gap-2">
            {isRealtime && (
              <Badge variant="success" size="xs" dot>Real-time</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={refetchMatches}>
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        }
      >
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <Badge variant="primary" size="sm">{sportConfig.icon} {tournament.sportsType}</Badge>
          <Badge variant="accent" size="sm">{stage.replace(/_/g, " ").toUpperCase()}</Badge>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {Array.isArray(tournament.eventLocation) ? tournament.eventLocation[0] : tournament.eventLocation || "TBD"}
          </span>
        </div>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Players" value={players.length} icon={Users} color="blue" />
        <StatCard label="Groups" value={groups.length} icon={Grid3X3} color="indigo" />
        <StatCard label="Matches" value={allMatches.length} icon={Swords} color="gray" />
        <StatCard label="Live Now" value={live.length} icon={Radio} color="red" />
        <StatCard label="Completed" value={completed.length} icon={Award} color="green" />
        <StatCard label="Upcoming" value={upcoming.length} icon={Calendar} color="orange" />
      </div>

      {/* Progress */}
      <Card className="mb-8">
        <ProgressBar
          value={completed.length}
          max={allMatches.length}
          label="Tournament Progress"
          sublabel={`${upcoming.length} matches remaining`}
          size="md"
        />
      </Card>

      {/* Live Matches */}
      {live.length > 0 && (
        <div className="mb-8">
          <LiveMatchesPanel matches={live} onMatchClick={goToMatch} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Players", desc: `${players.length} registered`, icon: Users, path: `/tournaments/${tournamentId}/players` },
          { label: "Groups", desc: `${groups.length} groups`, icon: Grid3X3, path: `/tournaments/${tournamentId}/groups` },
          { label: "Knockout", desc: "View bracket", icon: Swords, path: `/tournaments/${tournamentId}/knockout` },
        ].map((a) => (
          <Card key={a.label} hover onClick={() => navigate(a.path)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff7ff] flex items-center justify-center">
                  <a.icon className="w-5 h-5 text-[#004e93]" />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">{a.label}</div>
                  <div className="text-xs text-gray-400">{a.desc}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </div>
          </Card>
        ))}
      </div>

      {/* Two Column: Upcoming + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card padding="none">
          <Card.Header className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">Upcoming Matches</h3>
            <Badge variant="info" size="xs">{upcoming.length}</Badge>
          </Card.Header>
          {upcoming.length === 0 ? (
            <EmptyState icon={Swords} title="No upcoming matches" />
          ) : (
            <div className="p-4 space-y-2 max-h-[350px] overflow-y-auto">
              {upcoming.slice(0, 10).map((m) => (
                <MatchCard key={m._id} match={m} onClick={() => goToMatch(m)} />
              ))}
              {upcoming.length > 10 && (
                <p className="text-center text-xs text-gray-400 py-2">+{upcoming.length - 10} more</p>
              )}
            </div>
          )}
        </Card>

        <ActivityFeed completed={completed} />
      </div>

      {/* Completed (collapsible) */}
      {completed.length > 0 && (
        <Card padding="none">
          <details>
            <summary className="px-5 py-3.5 border-b border-gray-100 cursor-pointer font-bold text-gray-800 text-sm flex items-center justify-between list-none">
              <span>All Completed Matches</span>
              <Badge variant="completed" size="xs">{completed.length}</Badge>
            </summary>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
              {completed.map((m) => (
                <MatchCard key={m._id} match={m} onClick={() => goToMatch(m)} />
              ))}
            </div>
          </details>
        </Card>
      )}
    </div>
  );
}
