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
  LayoutDashboard,
  Users,
  TrendingUp,
  Activity
} from "lucide-react";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="text-red-500" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <LayoutDashboard className="text-blue-600" size={32} />
                Management Dashboard
              </h1>
              <p className="text-gray-500 mt-2 text-lg">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            {/* Quick Actions (Placeholder) */}
            <div className="flex gap-3">
              <button
                onClick={handleViewAllTournaments}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                Manage Tournaments
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Tournaments</p>
              <h3 className="text-2xl font-bold text-gray-900">{tournaments.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Whitelisted Employees</p>
              <h3 className="text-2xl font-bold text-gray-900">{whitelistedEmployees.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Activity</p>
              <h3 className="text-2xl font-bold text-gray-900">High</h3>
            </div>
          </div>
        </div>

        {/* Tournaments Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="text-orange-500" size={24} />
              Recent Tournaments
            </h2>
            <button
              onClick={handleViewAllTournaments}
              className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 transition"
            >
              View All <ChevronRight size={18} />
            </button>
          </div>

          {tournaments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Tournaments found</h3>
              <p className="text-gray-500 mb-8">Get started by creating your first tournament event.</p>
              <button
                onClick={handleViewAllTournaments}
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
              >
                Create Tournament
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

                // Fee Calculation Logic (Fixed scope)
                const cats = tournament.categories || tournament.category || [];
                let parsedCats = [];
                if (Array.isArray(cats)) parsedCats = cats;

                const fees = parsedCats.map(cat => Number(cat.fee) || 0);
                const minFee = fees.length ? Math.min(...fees) : 0;
                const maxFee = fees.length ? Math.max(...fees) : 0;

                const feeDisplay = (minFee > 0 || maxFee > 0)
                  ? (minFee === maxFee ? `₹${minFee}` : `₹${minFee} – ₹${maxFee}`)
                  : "Free / TBA";

                return (
                  <div
                    key={tournament._id || tournament.id}
                    onClick={handleTournamentClick}
                    className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer flex flex-col h-full"
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img
                        src={
                          tournament.tournamentLogo
                            ? `/uploads/${tournament.tournamentLogo}`
                            : tournamentImage
                        }
                        alt={tournament.title}
                        onError={(e) => { e.currentTarget.src = tournamentImage; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">
                          Tournament
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="text-xs font-medium opacity-90 mb-1 flex items-center gap-1">
                          <Calendar size={12} /> {dateDisplay}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-3">
                        {tournament.title}
                      </h3>

                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-start gap-2 text-gray-500 text-sm">
                          <Users size={16} className="mt-0.5 shrink-0 text-blue-500" />
                          <span className="line-clamp-1">{tournament.organizerName || "Organizer"}</span>
                        </div>
                        <div className="flex items-start gap-2 text-gray-500 text-sm">
                          <MapPin size={16} className="mt-0.5 shrink-0 text-red-500" />
                          <span className="line-clamp-1">{tournament.eventLocation || "Location TBA"}</span>
                        </div>
                        <div className="flex items-start gap-2 text-gray-500 text-sm">
                          <Clock size={16} className="mt-0.5 shrink-0 text-orange-500" />
                          <span>
                            {tournament.selectedTime?.startTime
                              ? `${tournament.selectedTime.startTime} – ${tournament.selectedTime.endTime || ''}`
                              : "Time TBA"
                            }
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Entry Fee</p>
                          <p className="text-lg font-bold text-green-600">{feeDisplay}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Whitelisted Employees Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-purple-600" size={24} />
              Recently Whitelisted Employees
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {whitelistedEmployees.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500">No whitelisted employees found yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tournament</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {whitelistedEmployees.slice(0, 5).map((emp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                              {emp.name?.charAt(0) || "E"}
                            </div>
                            <span className="font-semibold text-gray-900">{emp.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {emp.employeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                          {emp.mobile}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            {emp.tournamentTitle}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {whitelistedEmployees.length > 5 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Showing top 5 of <span className="font-bold text-gray-900">{whitelistedEmployees.length}</span> whitelisted employees.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
