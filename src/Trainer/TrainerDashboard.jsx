import React, { useState, useEffect, useContext } from "react";
import { AuthContext, AuthProvider } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserFriends,
  FaHistory,
  FaClipboardList,
  FaEdit,
  FaClock,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

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

const TrainerDashboard = () => {
  const [trainer, setTrainer] = useState(null);
  const { auth, isAuthenticated } = useContext(AuthContext);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!isAuthenticated || !auth) {
          throw new Error("User not authenticated");
        }


        // Fetch trainer profile
        const profileRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/trainer/profile/${auth._id}`
        );
        setTrainer(profileRes.data);

        // Fetch upcoming sessions
        const sessionsRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/trainer/sessions/${auth._id}`
        );
        // Filter for upcoming sessions (start time > now)
        const upcoming = sessionsRes.data
          .filter((session) => new Date(session.startTime) > new Date())
          .slice(0, 3); // Get only 3 most recent
        setUpcomingSessions(upcoming);

        // Fetch pending requests
        const requestsRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${auth._id}`
        );
        const pendingOnly = requestsRes.data
          .filter((request) => request.status === "pending")
          .slice(0, 3); // Get only 3 most recent
        setPendingRequests(pendingOnly);

        setLoading(false);
      } catch (err) {
        console.error("Error details:", err.response?.data || err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (isAuthenticated && auth && auth._id) {
      fetchDashboardData();
    }
  }, [auth, isAuthenticated]);

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
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
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
          Trainer Dashboard
        </h1>
        <Link
          to="/trainer-profile"
          className="px-4 py-2 rounded-md transition flex items-center"
          style={{ backgroundColor: colors.primary, color: colors.white }}
        >
          <FaEdit className="mr-2" /> Edit Profile
        </Link>
      </div>

      {/* Trainer Profile Card */}
      <div
        className="rounded-lg shadow-md p-6 mb-8"
        style={{ backgroundColor: colors.white }}
      >
        <div className="flex items-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4"
            style={{ backgroundColor: colors.primary }}
          >
            {trainer?.firstName?.[0]}
            {trainer?.lastName?.[0]}
          </div>
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ color: colors.text }}
            >
              {trainer?.firstName} {trainer?.lastName}
            </h2>
            <p style={{ color: colors.textLight }}>
              {trainer?.sport || "Sport not specified"}
            </p>
            <div className="flex mt-2 space-x-4">
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: colors.primaryLight,
                  color: colors.primary,
                }}
              >
                {trainer?.experience || 0} years experience
              </span>
              <span
                className="text-sm px-3 py-1 rounded-full"
                style={{
                  backgroundColor: colors.primaryLight,
                  color: colors.primary,
                }}
              >
                {trainer?.certificates?.length || 0} certificates
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.white }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              Upcoming Sessions
            </h3>
            <FaCalendarAlt
              className="text-2xl"
              style={{ color: colors.primary }}
            />
          </div>
          <p
            className="text-3xl font-bold mb-2"
            style={{ color: colors.primary }}
          >
            {upcomingSessions.length}
          </p>
          <Link
            to="/trainer-upcoming"
            className="text-sm flex items-center"
            style={{ color: colors.primary }}
          >
            View all sessions <span className="ml-1">→</span>
          </Link>
        </div>

        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.white }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              Pending Requests
            </h3>
            <FaClipboardList
              className="text-2xl"
              style={{ color: colors.primary }}
            />
          </div>
          <p
            className="text-3xl font-bold mb-2"
            style={{ color: colors.primary }}
          >
            {pendingRequests.length}
          </p>
          <Link
            to="/trainer-requests"
            className="text-sm flex items-center"
            style={{ color: colors.primary }}
          >
            View all requests <span className="ml-1">→</span>
          </Link>
        </div>

        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.white }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              Session History
            </h3>
            <FaHistory className="text-2xl" style={{ color: colors.primary }} />
          </div>
          <Link
            to="/trainer-history"
            className="text-sm flex items-center mt-9"
            style={{ color: colors.primary }}
          >
            View session history <span className="ml-1">→</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions Section */}
        <div
          className="rounded-lg shadow-md overflow-hidden"
          style={{ backgroundColor: colors.white }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: colors.border }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              Upcoming Sessions
            </h2>
          </div>
          <div className="p-6">
            {upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session._id}
                    className="pb-4"
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                  >
                    <div className="flex justify-between">
                      <h3
                        className="font-semibold"
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
                        {session.type}
                      </span>
                    </div>
                    <div
                      className="mt-2 space-y-1 text-sm"
                      style={{ color: colors.textLight }}
                    >
                      <p className="flex items-center">
                        <FaCalendarAlt
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        {new Date(session.startTime).toLocaleDateString()}
                      </p>
                      <p className="flex items-center">
                        <FaClock
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        {new Date(session.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -
                        {new Date(session.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="flex items-center">
                        <FaMapMarkerAlt
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        {session.location}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-center">
                  <Link
                    to="/trainer-upcoming"
                    className="px-4 py-2 rounded-md inline-block"
                    style={{
                      backgroundColor: colors.primaryLight,
                      color: colors.primary,
                    }}
                  >
                    View All Upcoming Sessions
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaCalendarAlt
                  className="mx-auto text-4xl mb-3"
                  style={{ color: colors.border }}
                />
                <p style={{ color: colors.textLight }}>No upcoming sessions</p>
                <Link
                  to="/trainer-sessions"
                  className="mt-4 inline-block px-4 py-2 rounded-md"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.white,
                  }}
                >
                  Schedule a Session
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests Section */}
        <div
          className="rounded-lg shadow-md overflow-hidden"
          style={{ backgroundColor: colors.white }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: colors.border }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: colors.text }}
            >
              Pending Requests
            </h2>
          </div>
          <div className="p-6">
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request._id}
                    className="pb-4"
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                  >
                    <div className="flex justify-between">
                      <h3
                        className="font-semibold"
                        style={{ color: colors.text }}
                      >
                        {request.type === "player"
                          ? request.playerName
                          : request.clubName}
                      </h3>
                      <span
                        className="text-xs px-2 py-1 rounded-full capitalize"
                        style={{
                          backgroundColor: colors.primaryLight,
                          color: colors.primary,
                        }}
                      >
                        {request.sessionType} {request.type}
                      </span>
                    </div>
                    <div
                      className="mt-2 space-y-1 text-sm"
                      style={{ color: colors.textLight }}
                    >
                      <p className="flex items-center">
                        <FaCalendarAlt
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        {request.requestedDate}
                      </p>
                      <p className="flex items-center">
                        <FaClock
                          className="mr-2"
                          style={{ color: colors.primary }}
                        />
                        {request.requestedTime}
                      </p>
                      {request.location && (
                        <p className="flex items-center">
                          <FaMapMarkerAlt
                            className="mr-2"
                            style={{ color: colors.primary }}
                          />
                          {request.location}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        className="px-3 py-1 rounded-md flex items-center"
                        style={{
                          color: colors.danger,
                          backgroundColor: "#FFF5F5",
                        }}
                      >
                        <FaTimes className="mr-1" /> Reject
                      </button>
                      <button
                        className="px-3 py-1 rounded-md flex items-center"
                        style={{
                          color: colors.success,
                          backgroundColor: "#F2FFF8",
                        }}
                      >
                        <FaCheck className="mr-1" /> Accept
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 text-center">
                  <Link
                    to="/trainer-requests"
                    className="px-4 py-2 rounded-md inline-block"
                    style={{
                      backgroundColor: colors.primaryLight,
                      color: colors.primary,
                    }}
                  >
                    View All Requests
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaClipboardList
                  className="mx-auto text-4xl mb-3"
                  style={{ color: colors.border }}
                />
                <p style={{ color: colors.textLight }}>No pending requests</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
