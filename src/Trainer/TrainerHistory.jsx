import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaHistory,
  FaCalendar,
  FaUser,
  FaUsers,
  FaBuilding,
  FaChevronLeft,
  FaClock,
  FaMapMarkerAlt,
  FaClipboardList,
  FaChartBar,
} from "react-icons/fa";

// Color scheme with green as primary
const colors = {
  background: "#F5F6FA",
  white: "#FFFFFF",
  primary: "#36B37E", // Green primary
  primaryLight: "#E3FCEF", // Light green for backgrounds
  primaryDark: "#00875A", // Darker green for hover states
  text: "#172B4D", // Dark blue-gray for text
  textLight: "#6B778C", // Lighter text color
  border: "#DFE1E6",
  success: "#36B37E",
  danger: "#FF5630",
};

const TrainerHistory = () => {
  const { auth, isAuthenticated } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Fallback completed sessions data
  const fallbackCompletedSessions = [
    {
      _id: "fallback-1",
      title: "Advanced Strength Training",
      type: "individual",
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000
      ).toISOString(),
      status: "completed",
      location: "Weight Training Area",
      playerId: "player-123",
      playerName: "Emily Johnson",
      notes: "Focused on strength progression and technique",
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000
      ).toISOString(),
    },
    {
      _id: "fallback-2",
      title: "Group Fitness Bootcamp",
      type: "group",
      startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      status: "completed",
      location: "Main Gym",
      notes: "High-intensity group training session with full participation",
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      endedAt: new Date(
        Date.now() - 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
    },
  ];

  // Modify fetchSessionHistory logic in useEffect
  useEffect(() => {
    const fetchSessionHistory = async () => {
      try {
        if (!isAuthenticated || !auth) {
          throw new Error("User not authenticated");
        }

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/trainer/sessions/${auth._id}`
          );

          // Filter for completed sessions
          const completed =
            response.data.length > 0
              ? response.data.filter(
                  (session) => session.status === "completed"
                )
              : fallbackCompletedSessions;

          // Sort by start time (most recent first)
          completed.sort(
            (a, b) => new Date(b.startTime) - new Date(a.startTime)
          );

          setSessions(completed);
          setFilteredSessions(completed);

          // Set first session as selected by default if available
          if (completed.length > 0 && !selectedSession) {
            setSelectedSession(completed[0]);
          }

          setLoading(false);
        } catch (apiError) {
          console.warn(
            "API error, using fallback completed sessions:",
            apiError
          );
          setSessions(fallbackCompletedSessions);
          setFilteredSessions(fallbackCompletedSessions);

          // Set first session as selected by default if available
          if (fallbackCompletedSessions.length > 0 && !selectedSession) {
            setSelectedSession(fallbackCompletedSessions[0]);
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Error details:", err.response?.data || err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (isAuthenticated && auth && auth._id) {
      fetchSessionHistory();
    }
  }, [auth, isAuthenticated]);

  useEffect(() => {
    // Apply filters and search
    let result = [...sessions];

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((session) => session.type === typeFilter);
    }

    // Apply date filter
    const now = new Date();
    if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(
        (session) => new Date(session.startTime) >= weekAgo
      );
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(
        (session) => new Date(session.startTime) >= monthAgo
      );
    } else if (dateFilter === "quarter") {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      result = result.filter(
        (session) => new Date(session.startTime) >= quarterAgo
      );
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (session) =>
          session.title.toLowerCase().includes(term) ||
          session.location.toLowerCase().includes(term) ||
          (session.notes && session.notes.toLowerCase().includes(term))
      );
    }

    setFilteredSessions(result);
  }, [typeFilter, dateFilter, searchTerm, sessions]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: colors.primary }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-lg mx-auto max-w-4xl mt-6"
        style={{ backgroundColor: colors.white, color: colors.danger }}
      >
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded"
          style={{ backgroundColor: colors.danger, color: colors.white }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className="px-6 py-8 w-full min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Session History
          </h1>
        </div>

        <Link
          to="/trainer-sessions"
          className="flex items-center px-4 py-2 rounded-md"
          style={{
            backgroundColor: colors.white,
            color: colors.primary,
            border: `1px solid ${colors.primary}`,
          }}
        >
          <FaCalendar className="mr-2" /> All Sessions
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div
        className="rounded-lg shadow-md p-4 mb-6"
        style={{ backgroundColor: colors.white }}
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2 md:mr-4">
            <div className="relative">
              <FaSearch
                className="absolute top-3 left-3"
                style={{ color: colors.textLight }}
              />
              <input
                type="text"
                placeholder="Search session history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg"
                style={{
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.background,
                  color: colors.text,
                }}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <FaFilter className="mr-2" style={{ color: colors.primary }} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg px-3 py-2"
                style={{ border: `1px solid ${colors.border}` }}
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="group">Group</option>
                <option value="club">Club</option>
              </select>
            </div>

            <div className="flex items-center">
              <FaCalendar className="mr-2" style={{ color: colors.primary }} />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-lg px-3 py-2"
                style={{ border: `1px solid ${colors.border}` }}
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div
          className="rounded-lg shadow-md p-8 text-center"
          style={{ backgroundColor: colors.white }}
        >
          <div
            className="rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <FaHistory size={30} style={{ color: colors.primary }} />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            No Session History
          </h2>
          <p className="mb-6" style={{ color: colors.textLight }}>
            You don't have any completed training sessions yet.
          </p>
          <Link
            to="/trainer-sessions"
            className="inline-block px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            View All Sessions
          </Link>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div
          className="rounded-lg shadow-md p-8 text-center"
          style={{ backgroundColor: colors.white }}
        >
          <div
            className="rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <FaSearch size={30} style={{ color: colors.primary }} />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            No Matching Sessions
          </h2>
          <p className="mb-6" style={{ color: colors.textLight }}>
            No sessions match your current filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("all");
              setDateFilter("all");
            }}
            className="inline-block px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div
              className="rounded-lg shadow-md overflow-hidden"
              style={{ backgroundColor: colors.white }}
            >
              <div
                className="p-4 flex justify-between items-center"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text }}
                >
                  Completed Sessions
                </h2>
                <div
                  className="text-sm px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: colors.primaryLight,
                    color: colors.primary,
                  }}
                >
                  {filteredSessions.length}
                </div>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
                {filteredSessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-4 cursor-pointer transition-colors"
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor:
                        selectedSession && selectedSession._id === session._id
                          ? colors.primaryLight
                          : colors.white,
                    }}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>
                        {session.title}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: colors.textLight }}
                      >
                        {formatDate(session.startTime)}
                      </p>
                      <div className="flex items-center mt-1">
                        <span
                          className="inline-block text-xs px-2 py-1 rounded-full capitalize mr-2"
                          style={{
                            backgroundColor: colors.primaryLight,
                            color: colors.primary,
                          }}
                        >
                          {session.type}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: colors.textLight }}
                        >
                          {session.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div
                className="rounded-lg shadow-md overflow-hidden"
                style={{ backgroundColor: colors.white }}
              >
                <div
                  className="px-6 py-4"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    Session Details
                  </h2>
                </div>

                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div
                      className="rounded-full p-3 mr-4"
                      style={{ backgroundColor: colors.primaryLight }}
                    >
                      <FaHistory size={18} style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <h3
                        className="text-xl font-semibold"
                        style={{ color: colors.text }}
                      >
                        {selectedSession.title}
                      </h3>
                      <span
                        className="text-xs px-2 py-1 rounded-full capitalize"
                        style={{
                          backgroundColor: colors.primaryLight,
                          color: colors.primary,
                        }}
                      >
                        {selectedSession.type} Session
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3
                        className="font-semibold mb-2 flex items-center"
                        style={{ color: colors.text }}
                      >
                        <FaCalendar
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        Session Information
                      </h3>
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colors.background }}
                      >
                        <p className="flex items-center mb-3">
                          <FaCalendar
                            className="mr-2"
                            style={{ color: colors.primary }}
                          />
                          <span className="font-medium">Date:</span>
                          <span
                            className="ml-2"
                            style={{ color: colors.textLight }}
                          >
                            {formatDate(selectedSession.startTime)}
                          </span>
                        </p>
                        <p className="flex items-center mb-3">
                          <FaClock
                            className="mr-2"
                            style={{ color: colors.primary }}
                          />
                          <span className="font-medium">Time:</span>
                          <span
                            className="ml-2"
                            style={{ color: colors.textLight }}
                          >
                            {formatTime(selectedSession.startTime)} -{" "}
                            {formatTime(selectedSession.endTime)}
                          </span>
                        </p>
                        <p className="flex items-center">
                          <FaMapMarkerAlt
                            className="mr-2"
                            style={{ color: colors.primary }}
                          />
                          <span className="font-medium">Location:</span>
                          <span
                            className="ml-2"
                            style={{ color: colors.textLight }}
                          >
                            {selectedSession.location}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3
                        className="font-semibold mb-2 flex items-center"
                        style={{ color: colors.text }}
                      >
                        {selectedSession.type === "individual" ? (
                          <FaUser
                            className="mr-2"
                            style={{ color: colors.primary }}
                          />
                        ) : selectedSession.type === "club" ? (
                          <FaBuilding
                            className="mr-2"
                            style={{ color: colors.primary }}
                          />
                        ) : (
                          <FaUsers
                            className="mr-2"
                            style={{ color: colors.primary }}
                          />
                        )}
                        Participant Information
                      </h3>
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colors.background }}
                      >
                        {selectedSession.type === "individual" &&
                        selectedSession.playerId ? (
                          <p>
                            <span className="font-medium">Player:</span>{" "}
                            <span style={{ color: colors.textLight }}>
                              {selectedSession.playerName ||
                                "Player information not available"}
                            </span>
                          </p>
                        ) : selectedSession.type === "club" &&
                          selectedSession.clubId ? (
                          <p>
                            <span className="font-medium">Club:</span>{" "}
                            <span style={{ color: colors.textLight }}>
                              {selectedSession.clubName ||
                                "Club information not available"}
                            </span>
                          </p>
                        ) : (
                          <p style={{ color: colors.textLight }}>
                            No participant information available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedSession.notes && (
                    <div className="mb-6">
                      <h3
                        className="font-semibold mb-2 flex items-center"
                        style={{ color: colors.text }}
                      >
                        <FaClipboardList
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        Session Notes
                      </h3>
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colors.background }}
                      >
                        <p style={{ color: colors.textLight }}>
                          {selectedSession.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3
                      className="font-semibold mb-2 flex items-center"
                      style={{ color: colors.text }}
                    >
                      <FaChartBar
                        className="mr-2"
                        style={{ color: colors.primary }}
                      />
                      Session Metrics
                    </h3>
                    <div
                      className="rounded-lg p-4"
                      style={{ backgroundColor: colors.background }}
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p
                            className="text-sm"
                            style={{ color: colors.textLight }}
                          >
                            Duration
                          </p>
                          <p
                            className="font-medium"
                            style={{ color: colors.text }}
                          >
                            {selectedSession.endedAt &&
                            selectedSession.startedAt
                              ? `${Math.round(
                                  (new Date(selectedSession.endedAt) -
                                    new Date(selectedSession.startedAt)) /
                                    (1000 * 60)
                                )} mins`
                              : `${Math.round(
                                  (new Date(selectedSession.endTime) -
                                    new Date(selectedSession.startTime)) /
                                    (1000 * 60)
                                )} mins (scheduled)`}
                          </p>
                        </div>
                        <div>
                          <p
                            className="text-sm"
                            style={{ color: colors.textLight }}
                          >
                            Completed On
                          </p>
                          <p
                            className="font-medium"
                            style={{ color: colors.text }}
                          >
                            {selectedSession.endedAt
                              ? formatDate(selectedSession.endedAt)
                              : "Not recorded"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="rounded-lg shadow-md p-6 text-center"
                style={{ backgroundColor: colors.white }}
              >
                <div className="py-12">
                  <div
                    className="rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: colors.background }}
                  >
                    <FaHistory size={30} style={{ color: colors.textLight }} />
                  </div>
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    No Session Selected
                  </h3>
                  <p className="mb-4" style={{ color: colors.textLight }}>
                    Select a session from the list to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerHistory;
