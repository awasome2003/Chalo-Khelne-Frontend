import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FaStopwatch,
  FaUserAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClipboardList,
  FaCheck,
  FaTimes,
  FaClock,
  FaChevronRight,
} from "react-icons/fa";

// Color scheme with mix of green and orange accents
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

const TrainerCurrentSession = () => {
  const [session, setSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [confirmComplete, setConfirmComplete] = useState(false);
  const { auth, isAuthenticated } = useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Fallback sessions data for TrainerCurrentSession
  const fallbackSessions = [
    {
      _id: "fallback-1",
      title: "Personal Training - Advanced Strength",
      type: "individual",
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(
        Date.now() + 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000
      ).toISOString(),
      location: "Weight Training Area",
      status: "scheduled",
      playerId: "player-123",
      playerName: "Emily Johnson",
      notes: "Focus on strength and conditioning",
    },
    {
      _id: "fallback-2",
      title: "Group Fitness Conditioning",
      type: "group",
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
      ).toISOString(),
      location: "Main Gym",
      status: "scheduled",
      notes: "Team group training session",
    },
  ];

  // Modify fetchSessions logic in useEffect
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        if (!isAuthenticated || !auth) {
          throw new Error("User not authenticated");
        }

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/trainer/sessions/${auth._id}`
          );

          // Look for session ID in query parameters
          const params = new URLSearchParams(location.search);
          const sessionId = params.get("id");

          const allSessions =
            response.data.length > 0 ? response.data : fallbackSessions;

          // First check for an active in-progress session
          let currentSession = allSessions.find(
            (s) => s.status === "in-progress"
          );

          // If no active session but ID provided, use that one
          if (!currentSession && sessionId) {
            currentSession = allSessions.find((s) => s._id === sessionId);
          }

          // Filter available sessions (only include scheduled sessions with start time <= now)
          const now = new Date();
          const availableSessions = allSessions.filter(
            (s) => s.status === "scheduled" && new Date(s.startTime) <= now
          );

          setSessions(availableSessions);

          if (currentSession) {
            setSession(currentSession);
            setSessionNotes(currentSession.notes || "");

            // If session is in progress, calculate elapsed time
            if (currentSession.status === "in-progress") {
              const startedAt = new Date(
                currentSession.startedAt || currentSession.startTime
              );
              const elapsed = Math.floor((now - startedAt) / 1000);
              setElapsedTime(elapsed > 0 ? elapsed : 0);
              setTimerRunning(true);
            }
          }

          setLoading(false);
        } catch (apiError) {
          setSessions(fallbackSessions);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error details:", err.response?.data || err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (isAuthenticated && auth && auth._id) {
      fetchSessions();
    }
  }, [location.search, auth, isAuthenticated]);

  // Timer effect
  useEffect(() => {
    let interval;

    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleSessionSelect = async (selectedSession) => {
    try {
      // Update session status to in-progress
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/trainer/sessions/${
          selectedSession._id
        }`,
        {
          ...selectedSession,
          status: "in-progress",
          startedAt: new Date(),
        }
      );

      // Update local state
      setSession({
        ...selectedSession,
        status: "in-progress",
        startedAt: new Date(),
      });
      setSessionNotes(selectedSession.notes || "");
      setElapsedTime(0);
      setTimerRunning(true);

      // Remove this session from available sessions
      setSessions(sessions.filter((s) => s._id !== selectedSession._id));

      // Update URL to include session ID
      navigate(`/trainer-current?id=${selectedSession._id}`);
    } catch (err) {
      setError("Failed to start session: " + err.message);
    }
  };

  const handleCompleteSession = async () => {
    if (!confirmComplete) {
      setConfirmComplete(true);
      return;
    }

    try {
      // Update session status to completed and save notes
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/trainer/sessions/${session._id}`,
        {
          status: "completed",
          notes: sessionNotes,
          endedAt: new Date(),
        }
      );

      setTimerRunning(false);
      setConfirmComplete(false);

      // Redirect to history page
      navigate("/trainer-history");
    } catch (err) {
      setError("Failed to complete session: " + err.message);
    }
  };

  const handleCancelSession = async () => {
    try {
      // Update session status back to scheduled
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/trainer/sessions/${session._id}`,
        {
          status: "scheduled",
          startedAt: null,
        }
      );

      setTimerRunning(false);
      setSession(null);

      // Refresh available sessions
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/trainer/sessions/${auth._id}`
      );
      const now = new Date();
      const availableSessions = response.data.filter(
        (s) => s.status === "scheduled" && new Date(s.startTime) <= now
      );
      setSessions(availableSessions);

      // Clear URL parameter
      navigate("/trainer-current");
    } catch (err) {
      setError("Failed to cancel session: " + err.message);
    }
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
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Current Training Session
        </h1>
        <button
          onClick={() => navigate("/trainer-sessions")}
          className="px-4 py-2 rounded flex items-center w-auto"
          style={{
            backgroundColor: colors.white,
            color: colors.primary,
            border: `1px solid ${colors.primary}`,
          }}
        >
          View All Sessions <FaChevronRight className="ml-1" size={12} />
        </button>
      </div>

      {session ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Timer & Controls */}
          <div className="lg:col-span-1">
            <div
              className="rounded-lg shadow-md p-6"
              style={{ backgroundColor: colors.white }}
            >
              <div className="text-center mb-6">
                <div
                  className="rounded-full h-28 w-28 flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: colors.primaryLight }}
                >
                  <div
                    className="rounded-full h-20 w-20 flex items-center justify-center"
                    style={{
                      backgroundColor: colors.white,
                      border: `2px solid ${colors.primary}`,
                    }}
                  >
                    <FaStopwatch size={30} style={{ color: colors.primary }} />
                  </div>
                </div>
                <h2
                  className="text-3xl font-bold mb-1"
                  style={{ color: colors.primary }}
                >
                  {formatTime(elapsedTime)}
                </h2>
                <p style={{ color: colors.textLight }}>Session Duration</p>
              </div>

              <div
                className="pt-6"
                style={{ borderTop: `1px solid ${colors.border}` }}
              >
                <h3
                  className="font-semibold mb-5"
                  style={{ color: colors.text }}
                >
                  Session Controls
                </h3>

                {/* Confirmation UI */}
                {confirmComplete ? (
                  <div
                    className="p-4 mb-6 rounded-lg"
                    style={{
                      backgroundColor: "#FFF5E6",
                      border: "1px solid #FFAB00",
                    }}
                  >
                    <p className="mb-4" style={{ color: "#B76E00" }}>
                      Are you sure you want to complete this session?
                    </p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setConfirmComplete(false)}
                        className="px-4 py-2 rounded-lg"
                        style={{
                          border: "1px solid #DFE1E6",
                          color: colors.textLight,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCompleteSession}
                        className="px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: colors.success,
                          color: colors.white,
                        }}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleCompleteSession}
                      className="w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                      }}
                    >
                      <FaCheck className="mr-2" />
                      Complete Session
                    </button>
                    <button
                      onClick={handleCancelSession}
                      className="w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors"
                      style={{
                        backgroundColor: colors.white,
                        color: colors.danger,
                        border: `1px solid ${colors.danger}`,
                      }}
                    >
                      <FaTimes className="mr-2" />
                      Cancel Session
                    </button>
                  </div>
                )}
              </div>

              <div
                className="mt-6 pt-6"
                style={{ borderTop: `1px solid ${colors.border}` }}
              >
                <div
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: "#FFEBE6" }}
                >
                  <p className="text-sm" style={{ color: "#EF4444" }}>
                    Make sure to complete your session properly to maintain
                    accurate history records.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Details & Notes */}
          <div className="lg:col-span-2">
            <div
              className="rounded-lg shadow-md overflow-hidden"
              style={{ backgroundColor: colors.white }}
            >
              <div
                className="px-6 py-4"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <h2
                  className="text-xl font-semibold"
                  style={{ color: colors.text }}
                >
                  Session Details
                </h2>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div
                    className="rounded-full p-2 mr-3"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <FaUserAlt style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-lg"
                      style={{ color: colors.text }}
                    >
                      {session.title}
                    </h3>
                    <span
                      className="text-xs px-2 py-1 rounded-full capitalize"
                      style={{
                        backgroundColor: colors.primaryLight,
                        color: colors.primary,
                      }}
                    >
                      {session.type} Session
                    </span>
                  </div>
                </div>

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
                          {new Date(session.startTime).toLocaleDateString()}
                        </span>
                      </p>
                      <p className="flex items-center mb-3">
                        <FaClock
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        <span className="font-medium">Scheduled Time:</span>
                        <span
                          className="ml-2"
                          style={{ color: colors.textLight }}
                        >
                          {new Date(session.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -
                          {new Date(session.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
                          {session.location}
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
                      <div className="flex items-center mb-3">
                        <FaUserAlt
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        <span className="font-medium">Session Type:</span>
                        <span
                          className="ml-2 capitalize"
                          style={{ color: colors.textLight }}
                        >
                          {session.type}
                        </span>
                      </div>

                      {session.type === "individual" && session.playerId ? (
                        <p className="mb-2">
                          <span className="font-medium">Player:</span>{" "}
                          <span style={{ color: colors.textLight }}>
                            {session.playerName ||
                              "Player information not available"}
                          </span>
                        </p>
                      ) : session.type === "club" && session.clubId ? (
                        <p className="mb-2">
                          <span className="font-medium">Club:</span>{" "}
                          <span style={{ color: colors.textLight }}>
                            {session.clubName ||
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

                {/* Session Notes */}
                <div>
                  <div className="flex items-center mb-3">
                    <FaClipboardList
                      className="mr-2"
                      style={{ color: colors.primary }}
                    />
                    <h3
                      className="font-semibold"
                      style={{ color: colors.text }}
                    >
                      Session Notes
                    </h3>
                  </div>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full rounded-lg p-3 min-h-32"
                    placeholder="Add notes about this training session..."
                    style={{
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.background,
                      color: colors.text,
                    }}
                  ></textarea>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: colors.textLight }}
                  >
                    These notes will be saved in the session history when you
                    complete the session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {sessions.length > 0 ? (
            <div
              className="rounded-lg shadow-md overflow-hidden"
              style={{ backgroundColor: colors.white }}
            >
              <div
                className="px-6 py-4"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <h2
                  className="text-xl font-semibold"
                  style={{ color: colors.text }}
                >
                  Available Sessions
                </h2>
              </div>
              <div className="p-6">
                <p className="mb-6" style={{ color: colors.textLight }}>
                  Select a training session to start:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessions.map((s) => (
                    <div
                      key={s._id}
                      className="border rounded-lg p-4 cursor-pointer transition-colors hover:shadow-md"
                      style={{ borderColor: colors.border }}
                      onClick={() => handleSessionSelect(s)}
                    >
                      <h3
                        className="font-semibold"
                        style={{ color: colors.text }}
                      >
                        {s.title}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: colors.textLight }}
                      >
                        {new Date(s.startTime).toLocaleDateString()} at{" "}
                        {new Date(s.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="flex items-center mt-2">
                        <span
                          className="capitalize text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: colors.primaryLight,
                            color: colors.primary,
                          }}
                        >
                          {s.type}
                        </span>
                        <span
                          className="text-xs ml-2"
                          style={{ color: colors.textLight }}
                        >
                          {s.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-lg shadow-md p-8 text-center"
              style={{ backgroundColor: colors.white }}
            >
              <div
                className="rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <FaStopwatch size={30} style={{ color: colors.primary }} />
              </div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: colors.text }}
              >
                No Active Session
              </h2>
              <p className="mb-6" style={{ color: colors.textLight }}>
                You don't have any scheduled sessions available to start right
                now.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => navigate("/trainer-upcoming")}
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                  }}
                >
                  View Upcoming Sessions
                </button>
                <button
                  onClick={() => navigate("/trainer-sessions")}
                  className="px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: colors.white,
                    color: colors.primary,
                    border: `1px solid ${colors.primary}`,
                  }}
                >
                  Schedule a Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrainerCurrentSession;
