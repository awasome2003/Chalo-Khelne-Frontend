import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import tournamentImage from "../assets/tournament.avif";
import {
  Trophy,
  MapPin,
  Clock,
  Calendar,
  ChevronRight,
  Users,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";
import { StatCard, Badge, SectionCard, EmptyState, Button } from "../shared/ui";

const Dashboard = () => {
  const [tournaments, setTournaments] = useState([]);
  const [whitelistedEmployees, setWhitelistedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournamentsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const managerId = user?._id;

        if (!managerId) {
          setTournaments([]);
          setLoading(false);
          return;
        }

        // Fetch all tournaments specifically for this manager
        const response = await axios.get(`/api/tournaments/manager/${managerId}`);
        const allTournaments = response.data.tournaments || [];

        // Aggregate whitelist from all tournaments
        const allWhitelisted = [];
        allTournaments.forEach(t => {
          if (t.whitelist && Array.isArray(t.whitelist)) {
            t.whitelist.forEach(emp => {
              allWhitelisted.push({
                ...emp,
                tournamentTitle: t.title,
                tournamentId: t._id
              });
            });
          }
        });
        setWhitelistedEmployees(allWhitelisted);

        const sortedRecentTournaments = [...allTournaments]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3); // latest 3

        setTournaments(sortedRecentTournaments);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTournamentsData();
  }, []);

  const handleViewAllTournaments = () => navigate("/mtournament-management");
  const handleTournamentClick = () => navigate("/mtournament-management");

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-red-100">
            <Activity className="text-red-500 w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-red-500 mb-6">{error}</p>
          <Button variant="danger" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fadeIn">

      {/* ─── Hero Header ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-400 rounded-2xl p-6 lg:p-8 text-white">
        {/* Decorative sport shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.06]">
          <svg viewBox="0 0 200 200" fill="currentColor">
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="3" fill="none" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-[#FF9D32]" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Manager Hub</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black leading-tight">
              Welcome back!
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              Here's your tournament activity at a glance.
            </p>
          </div>
          <Button
            variant="accent"
            size="lg"
            onClick={handleViewAllTournaments}
            className="flex-shrink-0"
          >
            <Trophy className="w-4 h-4" />
            Manage Tournaments
          </Button>
        </div>

        {/* Inline stats row */}
        <div className="relative mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="text-2xl font-black">{tournaments.length}</div>
            <div className="text-xs text-white/60 font-medium">Active Tournaments</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="text-2xl font-black">{whitelistedEmployees.length}</div>
            <div className="text-xs text-white/60 font-medium">Whitelisted Players</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span className="text-2xl font-black">High</span>
            </div>
            <div className="text-xs text-white/60 font-medium">Activity Level</div>
          </div>
        </div>
      </div>

      {/* ─── Recent Tournaments ─── */}
      <SectionCard
        title="Recent Tournaments"
        icon={Trophy}
        iconColor="text-orange-500"
        action={{ label: "View All", onClick: handleViewAllTournaments }}
        noPadding
      >
        {tournaments.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No tournaments yet"
            description="Create your first tournament to get started."
            action={
              <Button variant="accent" onClick={handleViewAllTournaments}>
                Create Tournament
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {tournaments.map((tournament) => {
              // Formatting Date Logic
              const startDateStr = tournament.startDate
                ? new Date(tournament.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                : "";
              const endDateStr = tournament.endDate
                ? new Date(tournament.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                : "";

              const dateDisplay = startDateStr
                ? (endDateStr && startDateStr !== endDateStr ? `${startDateStr} – ${endDateStr}` : startDateStr)
                : "TBA";

              // Fee Calculation Logic
              const cats = tournament.categories || tournament.category || [];
              let parsedCats = [];
              if (Array.isArray(cats)) parsedCats = cats;

              const fees = parsedCats.map(cat => Number(cat.fee) || 0);
              const minFee = fees.length ? Math.min(...fees) : 0;
              const maxFee = fees.length ? Math.max(...fees) : 0;

              const feeDisplay = (minFee > 0 || maxFee > 0)
                ? (minFee === maxFee ? `₹${minFee}` : `₹${minFee} – ₹${maxFee}`)
                : "Free";

              return (
                <div
                  key={tournament._id || tournament.id}
                  onClick={handleTournamentClick}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-gray-100">
                    <img
                      src={
                        tournament.tournamentLogo
                          ? `/uploads/${tournament.tournamentLogo}`
                          : tournamentImage
                      }
                      alt={tournament.title}
                      onError={(e) => { e.currentTarget.src = tournamentImage; }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-orange-500 transition-colors">
                      {tournament.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {dateDisplay}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {tournament.eventLocation?.[0] || "TBA"}
                      </span>
                    </div>
                  </div>

                  {/* Fee + Arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={feeDisplay === "Free" ? "success" : "accent"} size="sm">
                      {feeDisplay}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ─── Whitelisted Employees ─── */}
      <SectionCard
        title="Whitelisted Employees"
        subtitle={whitelistedEmployees.length > 0 ? `${whitelistedEmployees.length} total` : undefined}
        icon={Users}
        iconColor="text-emerald-600"
        noPadding
      >
        {whitelistedEmployees.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No whitelisted employees"
            description="Employees will appear here once added to a tournament."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mobile</th>
                    <th className="px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tournament</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {whitelistedEmployees.slice(0, 5).map((emp, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {emp.name?.charAt(0) || "E"}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-400 font-mono">
                        {emp.employeeId}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-xs text-gray-500 font-medium">
                        {emp.mobile}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <Badge variant="primary" size="xs">
                          {emp.tournamentTitle}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {whitelistedEmployees.length > 5 && (
              <div className="px-6 py-3 border-t border-gray-50 text-center">
                <p className="text-xs text-gray-400">
                  Showing 5 of <span className="font-bold text-gray-600">{whitelistedEmployees.length}</span> employees
                </p>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
};

export default Dashboard;
