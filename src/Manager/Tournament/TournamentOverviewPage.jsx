import { useParams, useNavigate } from "react-router-dom";
import { Users, Grid3X3, Swords, Trophy, Calendar, MapPin, Award, ArrowRight, Briefcase } from "lucide-react";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import TournamentStepper from "./TournamentStepper";
import axios from "axios";
import { useState, useEffect } from "react";

export default function TournamentOverviewPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { tournament, loading, error, title, sportsType, currentStage, categories } = useTournament(tournamentId);
  const [stats, setStats] = useState({ players: 0, groups: 0, matches: 0, completed: 0 });

  useEffect(() => {
    if (!tournamentId) return;
    (async () => {
      try {
        // Fetch player count
        const bookingsRes = await axios.get(`/api/tournaments/getRegisteredPlayers?tournamentId=${tournamentId}`);
        const players = bookingsRes.data?.bookings?.length || 0;

        // Fetch groups
        const groupsRes = await axios.get(`/api/tournaments/bookinggroups/tournament/${tournamentId}`);
        const groups = (groupsRes.data?.data || []).length;

        // Fetch matches for first group (rough count)
        let matches = 0, completed = 0;
        if (groupsRes.data?.data?.[0]) {
          const matchRes = await axios.get(`/api/tournaments/matches/${tournamentId}/${groupsRes.data.data[0]._id}`);
          matches = matchRes.data?.matches?.length || 0;
          completed = (matchRes.data?.matches || []).filter(m => m.status === "COMPLETED" || m.status === "completed").length;
        }

        setStats({ players, groups, matches, completed });
      } catch {}
    })();
  }, [tournamentId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading tournament...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const formatDate = (d) => {
    if (!d) return "TBD";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const quickActions = [
    { label: "Registered Players", desc: `${stats.players} players`, icon: Users, path: "players", color: "blue" },
    { label: "Groups", desc: `${stats.groups} groups`, icon: Grid3X3, path: "groups", color: "emerald" },
    { label: "Knockout Bracket", desc: "View bracket", icon: Swords, path: "knockout", color: "purple" },
    { label: "Staff Applications", desc: "Review applicants", icon: Briefcase, path: "staff", color: "orange" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Breadcrumbs tournamentName={title} />
      <TournamentStepper currentStage={currentStage} />

      {/* Tournament Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-[#F97316] p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              <div className="flex items-center gap-4 mt-2 text-orange-200 text-sm">
                <span className="flex items-center gap-1"><Award className="w-4 h-4" /> {sportsType}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(tournament?.startDate)} - {formatDate(tournament?.endDate)}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {Array.isArray(tournament?.eventLocation) ? tournament.eventLocation[0] : tournament?.eventLocation || "TBD"}</span>
              </div>
            </div>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
              {currentStage?.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 divide-x divide-gray-100">
          {[
            { label: "Players", value: stats.players, color: "text-orange-500" },
            { label: "Groups", value: stats.groups, color: "text-emerald-600" },
            { label: "Matches", value: stats.matches, color: "text-orange-600" },
            { label: "Completed", value: stats.completed, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="p-4 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <span key={c._id || c.name} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">
              {c.name} {c.fee > 0 && `• ₹${c.fee}`}
            </span>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => navigate(`/tournaments/${tournamentId}/${action.path}`)}
              className="bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`w-10 h-10 rounded-lg bg-${action.color}-50 flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 text-${action.color}-600`} />
                  </div>
                  <h3 className="font-bold text-gray-800">{action.label}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-3">Tournament Info</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Type</span>
            <span className="font-medium text-gray-800">{tournament?.type}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Level</span>
            <span className="font-medium text-gray-800 capitalize">{tournament?.tournamentLevel}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Organizer</span>
            <span className="font-medium text-gray-800">{tournament?.organizerName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Format</span>
            <span className="font-medium text-gray-800">
              {tournament?.groupStageFormat} → {tournament?.knockoutFormat}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Qualify/Group</span>
            <span className="font-medium text-gray-800">{tournament?.qualifyPerGroup || 2}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Fee</span>
            <span className="font-medium text-gray-800">₹{tournament?.tournamentFee || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
