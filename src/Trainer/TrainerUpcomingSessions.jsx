import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaChevronRight,
  FaPlay,
  FaChevronLeft,
} from "react-icons/fa";

// Color scheme with green as primary
const colors = {
  background: "#F5F7FA",
  white: "#FFFFFF",
  primary: "#0EA572", // Green primary
  primaryLight: "#C7FBE8", // Light green for backgrounds
  primaryDark: "#07875E", // Darker green for hover states
  text: "#111827", // Dark blue-gray for text
  textLight: "#6B778C", // Lighter text color
  border: "#DFE1E6",
  success: "#0EA572",
  danger: "#EF4444",
};

const TrainerUpcomingSessions = () => {
  const { auth, isAuthenticated } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fallback upcoming sessions data
  const fallbackUpcomingSessions = [
    {
      _id: "fallback-1",
      title: "Advanced Strength Training",
      type: "individual",
      startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000
      ).toISOString(),
      location: "Weight Training Area",
      status: "scheduled",
      playerId: "player-123",
      playerName: "Emily Johnson",
      notes: "Advanced strength and conditioning",
    },
    {
      _id: "fallback-2",
      title: "Group Fitness Bootcamp",
      type: "group",
      startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      location: "Main Gym",
      status: "scheduled",
      notes: "High-intensity group training session",
    },
  ];

  // Modify fetchUpcomingSessions logic in useEffect
  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        if (!isAuthenticated || !auth) {
          throw new Error("User not authenticated");
        }

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/trainer/sessions/${auth._id}`
          );

          // Filter for upcoming sessions (start time > now)
          const upcoming =
            response.data.length > 0
              ? response.data.filter(
                  (session) => new Date(session.startTime) > new Date()
                )
              : fallbackUpcomingSessions;

          // Sort by start time (earliest first)
          upcoming.sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime)
          );

          setSessions(upcoming);

          // Select the first session by default if available
          if (upcoming.length > 0 && !selectedSession) {
            setSelectedSession(upcoming[0]);
          }

          setLoading(false);
        } catch (apiError) {
          setSessions(fallbackUpcomingSessions);

          // Select the first session by default if available
          if (fallbackUpcomingSessions.length > 0 && !selectedSession) {
            setSelectedSession(fallbackUpcomingSessions[0]);
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
      fetchUpcomingSessions();
    }
  }, [auth, isAuthenticated]);

  const handleDelete = async (id) => {
    if (!confirmDelete) {
      setConfirmDelete(id);
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/trainer/sessions/${id}`
      );

      // Update sessions list
      setSessions(sessions.filter((session) => session._id !== id));

      // Clear selected session if it was deleted
      if (selectedSession && selectedSession._id === id) {
        setSelectedSession(sessions.length > 1 ? sessions[0] : null);
      }

      setConfirmDelete(false);
    } catch (err) {
      setError("Failed to delete session: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
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
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Upcoming Sessions
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
          <FaCalendarAlt className="mr-2" /> All Sessions
        </Link>
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
            <FaCalendarAlt size={30} style={{ color: colors.primary }} />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            No Upcoming Sessions
          </h2>
          <p className="mb-6" style={{ color: colors.textLight }}>
            You don't have any upcoming training sessions scheduled.
          </p>
          <Link
            to="/trainer-sessions"
            className="inline-block px-6 py-2 rounded-lg"
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            Schedule a Session
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session List */}
          <div className="lg:col-span-1">
            <div
              className="rounded-lg shadow-md overflow-hidden"
              style={{ backgroundColor: colors.white }}
            >
              <div
                className="p-4"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{ color: colors.text }}
                >
                  Scheduled Sessions ({sessions.length})
                </h2>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
                {sessions.map((session) => (
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
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: colors.text }}
                        >
                          {session.title}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: colors.textLight }}
                        >
                          {new Date(session.startTime).toLocaleDateString()}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: colors.textLight }}
                        >
                          {formatTime(session.startTime)} -{" "}
                          {formatTime(session.endTime)}
                        </p>
                        <div className="mt-1">
                          <span
                            className="inline-block text-xs px-2 py-1 rounded-full capitalize"
                            style={{
                              backgroundColor: colors.primaryLight,
                              color: colors.primary,
                            }}
                          >
                            {session.type}
                          </span>
                        </div>
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: colors.primary }}
                      >
                        <FaChevronRight />
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
                  className="px-6 py-4 flex justify-between items-center"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: colors.text }}
                  >
                    Session Details
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      className="p-2 rounded-full"
                      style={{
                        backgroundColor: colors.primaryLight,
                        color: colors.primary,
                      }}
                      title="Edit Session"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      className="p-2 rounded-full"
                      style={{
                        backgroundColor: "#FFEBE6",
                        color: colors.danger,
                      }}
                      title="Delete Session"
                      onClick={() => handleDelete(selectedSession._id)}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div
                      className="rounded-full p-3 mr-4"
                      style={{ backgroundColor: colors.primaryLight }}
                    >
                      <FaCalendarAlt
                        size={18}
                        style={{ color: colors.primary }}
                      />
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

                  {/* Confirmation Modal */}
                  {confirmDelete === selectedSession._id && (
                    <div
                      className="p-4 mb-6 rounded-lg"
                      style={{
                        backgroundColor: "#FFEBE6",
                        border: `1px solid ${colors.danger}`,
                      }}
                    >
                      <p className="mb-4" style={{ color: colors.danger }}>
                        Are you sure you want to delete this session?
                      </p>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="px-4 py-2 rounded-lg"
                          style={{
                            backgroundColor: colors.white,
                            color: colors.textLight,
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(selectedSession._id)}
                          className="px-4 py-2 rounded-lg"
                          style={{
                            backgroundColor: colors.danger,
                            color: colors.white,
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3
                        className="font-semibold mb-2"
                        style={{ color: colors.text }}
                      >
                        Session Information
                      </h3>
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colors.background }}
                      >
                        <p className="flex items-center mb-3">
                          <FaCalendarAlt
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
                        className="font-semibold mb-2"
                        style={{ color: colors.text }}
                      >
                        Participant Information
                      </h3>
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colors.background }}
                      >
                        {selectedSession.type === "individual" &&
                        selectedSession.playerId ? (
                          <p className="mb-2">
                            <span className="font-medium">Player:</span>{" "}
                            <span style={{ color: colors.textLight }}>
                              {selectedSession.playerName ||
                                "Player information not available"}
                            </span>
                          </p>
                        ) : selectedSession.type === "club" &&
                          selectedSession.clubId ? (
                          <p className="mb-2">
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
                        className="font-semibold mb-2"
                        style={{ color: colors.text }}
                      >
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

                  <div
                    className="pt-6"
                    style={{ borderTop: `1px solid ${colors.border}` }}
                  >
                    <Link
                      to={`/trainer-current?id=${selectedSession._id}`}
                      className="inline-flex items-center px-6 py-2 rounded-lg"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                      }}
                    >
                      <FaPlay className="mr-2" size={12} />
                      Start Session
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="rounded-lg shadow-md text-center"
                style={{ backgroundColor: colors.white }}
              >
                <div className="p-12">
                  <div
                    className="rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: colors.background }}
                  >
                    <FaCalendarAlt
                      size={30}
                      style={{ color: colors.textLight }}
                    />
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

export default TrainerUpcomingSessions;
