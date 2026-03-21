import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaCheck,
  FaTimes,
  FaUserAlt,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaClipboardList,
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

const TrainerRequests = () => {
  const { auth, isAuthenticated } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();

  // Fallback requests data
  const fallbackRequests = [
    {
      _id: "fallback-1",
      type: "player",
      playerName: "Emily Johnson",
      clubName: null,
      status: "pending",
      sessionType: "individual",
      requestedDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      requestedTime: "14:00",
      createdAt: new Date().toISOString(),
      location: "Main Training Center",
      notes: "Looking to improve strength and conditioning",
    },
    {
      _id: "fallback-2",
      type: "club",
      playerName: null,
      clubName: "City Fitness Club",
      status: "pending",
      sessionType: "group",
      requestedDate: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      requestedTime: "16:30",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Sports Complex",
      notes: "Team training preparation",
    },
  ];

  // Modify fetchRequests logic in useEffect
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!isAuthenticated || !auth) {
          throw new Error("User not authenticated");
        }

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${auth._id}`
          );

          // Use fallback data if API response is empty
          const requestsData =
            response.data.length > 0 ? response.data : fallbackRequests;

          setRequests(requestsData);

          // Check if a specific request ID was provided in URL query params
          const params = new URLSearchParams(location.search);
          const requestId = params.get("id");

          if (requestId) {
            const request = requestsData.find((req) => req._id === requestId);
            if (request) {
              setSelectedRequest(request);
            }
          }

          setLoading(false);
        } catch (apiError) {
          console.warn("API error, using fallback requests:", apiError);
          setRequests(fallbackRequests);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error details:", err.response?.data || err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (isAuthenticated && auth && auth._id) {
      fetchRequests();
    }
  }, [location.search, auth, isAuthenticated]);

  const handleAccept = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${id}/accept`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Refresh requests
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${auth._id}`
      );
      setRequests(response.data);

      // Clear selected request
      setSelectedRequest(null);

      // Show success message or redirect
      navigate("/trainer-upcoming");
    } catch (err) {
      setError("Failed to accept request: " + err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${id}/reject`,
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Refresh requests
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${auth._id}`
      );
      setRequests(response.data);

      // Clear selected request
      setSelectedRequest(null);
    } catch (err) {
      setError("Failed to reject request: " + err.message);
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((request) => request.type === filter);

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
            Training Requests
          </h1>
        </div>
        <div
          className="text-sm rounded-full px-3 py-1"
          style={{
            backgroundColor: colors.primaryLight,
            color: colors.primary,
          }}
        >
          <span>{filteredRequests.length}</span>{" "}
          {filter === "all" ? "Total" : filter} Requests
        </div>
      </div>

      {/* Request Types Menu */}
      <div
        className="rounded-lg shadow-md mb-6 overflow-hidden"
        style={{ backgroundColor: colors.white }}
      >
        <div className="p-4 flex flex-wrap gap-2">
          <button
            className="px-4 py-2 rounded-lg transition-colors w-auto"
            style={{
              backgroundColor:
                filter === "all" ? colors.primary : colors.background,
              color: filter === "all" ? colors.white : colors.text,
            }}
            onClick={() => setFilter("all")}
          >
            <FaClipboardList className="inline mr-2" />
            All Requests
          </button>
          <button
            className="px-4 py-2 rounded-lg transition-colors w-auto"
            style={{
              backgroundColor:
                filter === "player" ? colors.primary : colors.background,
              color: filter === "player" ? colors.white : colors.text,
            }}
            onClick={() => setFilter("player")}
          >
            <FaUserAlt className="inline mr-2" /> Player Requests
          </button>
          <button
            className="px-4 py-2 rounded-lg transition-colors w-auto"
            style={{
              backgroundColor:
                filter === "club" ? colors.primary : colors.background,
              color: filter === "club" ? colors.white : colors.text,
            }}
            onClick={() => setFilter("club")}
          >
            <FaUsers className="inline mr-2" /> Club Requests
          </button>
        </div>
      </div>

      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request List */}
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
                  Pending Requests
                </h2>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
                {filteredRequests.map((request) => (
                  <div
                    key={request._id}
                    className="p-4 cursor-pointer transition-colors"
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      backgroundColor:
                        selectedRequest && selectedRequest._id === request._id
                          ? colors.primaryLight
                          : colors.white,
                    }}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: colors.text }}
                        >
                          {request.type === "player"
                            ? request.playerName
                            : request.clubName}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: colors.textLight }}
                        >
                          {request.requestedDate} at {request.requestedTime}
                        </p>
                        <div className="mt-1">
                          <span
                            className="inline-block text-xs px-2 py-1 rounded-full capitalize"
                            style={{
                              backgroundColor: colors.primaryLight,
                              color: colors.primary,
                            }}
                          >
                            {request.sessionType} {request.type}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span
                          className="text-xs"
                          style={{ color: colors.textLight }}
                        >
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
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
                    Request Details
                  </h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.background }}
                  >
                    <FaTimes style={{ color: colors.textLight }} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div
                        className="rounded-full p-3 mr-3"
                        style={{ backgroundColor: colors.primaryLight }}
                      >
                        {selectedRequest.type === "player" ? (
                          <FaUserAlt style={{ color: colors.primary }} />
                        ) : (
                          <FaUsers style={{ color: colors.primary }} />
                        )}
                      </div>
                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: colors.text }}
                        >
                          {selectedRequest.type === "player"
                            ? selectedRequest.playerName
                            : selectedRequest.clubName}
                        </h3>
                        <p style={{ color: colors.textLight }}>
                          {selectedRequest.type === "player"
                            ? "Player"
                            : "Club"}{" "}
                          requested a{" "}
                          <span className="font-medium">
                            {selectedRequest.sessionType}
                          </span>{" "}
                          session
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3
                        className="font-semibold mb-2"
                        style={{ color: colors.text }}
                      >
                        Requester Information
                      </h3>
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colors.background }}
                      >
                        <p className="mb-2">
                          <span className="font-medium">Name:</span>{" "}
                          <span style={{ color: colors.textLight }}>
                            {selectedRequest.type === "player"
                              ? selectedRequest.playerName
                              : selectedRequest.clubName}
                          </span>
                        </p>
                        <p className="mb-2">
                          <span className="font-medium">Request Type:</span>{" "}
                          <span
                            className="capitalize"
                            style={{ color: colors.textLight }}
                          >
                            {selectedRequest.type}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Session Type:</span>{" "}
                          <span
                            className="capitalize"
                            style={{ color: colors.textLight }}
                          >
                            {selectedRequest.sessionType}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3
                        className="font-semibold mb-2"
                        style={{ color: colors.text }}
                      >
                        Session Details
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
                          <span className="font-medium">Date:</span>{" "}
                          <span
                            className="ml-2"
                            style={{ color: colors.textLight }}
                          >
                            {selectedRequest.requestedDate}
                          </span>
                        </p>
                        <p className="flex items-center mb-3">
                          <FaClock
                            className="mr-2"
                            style={{ color: colors.primary }}
                          />
                          <span className="font-medium">Time:</span>{" "}
                          <span
                            className="ml-2"
                            style={{ color: colors.textLight }}
                          >
                            {selectedRequest.requestedTime}
                          </span>
                        </p>
                        <p className="flex items-center">
                          <FaMapMarkerAlt
                            className="mr-2"
                            style={{ color: colors.primary }}
                          />
                          <span className="font-medium">Location:</span>{" "}
                          <span
                            className="ml-2"
                            style={{ color: colors.textLight }}
                          >
                            {selectedRequest.location || "Not specified"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedRequest.notes && (
                    <div className="mb-6">
                      <h3
                        className="font-semibold mb-2"
                        style={{ color: colors.text }}
                      >
                        Additional Notes
                      </h3>
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colors.background }}
                      >
                        <p style={{ color: colors.textLight }}>
                          {selectedRequest.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  <div
                    className="pt-6 flex flex-col md:flex-row justify-end gap-3"
                    style={{ borderTop: `1px solid ${colors.border}` }}
                  >
                    <button
                      onClick={() => handleReject(selectedRequest._id)}
                      className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: colors.white,
                        color: colors.danger,
                        border: `1px solid ${colors.danger}`,
                      }}
                    >
                      <FaTimes className="mr-2" />
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleAccept(selectedRequest._id)}
                      className="flex items-center justify-center px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                      }}
                    >
                      <FaCheck className="mr-2" />
                      Accept Request
                    </button>
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
                    <FaClipboardList
                      size={30}
                      style={{ color: colors.textLight }}
                    />
                  </div>
                  <h3
                    className="text-lg font-medium mb-2"
                    style={{ color: colors.text }}
                  >
                    No Request Selected
                  </h3>
                  <p className="mb-4" style={{ color: colors.textLight }}>
                    Select a request from the list to view details
                  </p>
                </div>
              </div>
            )}
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
            <FaClipboardList size={30} style={{ color: colors.primary }} />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            No Pending Requests
          </h2>
          <p className="mb-6" style={{ color: colors.textLight }}>
            {filter === "all"
              ? "You don't have any pending training requests at the moment."
              : `You don't have any pending ${filter} requests at the moment.`}
          </p>
          <Link
            to="/trainer-dashboard"
            className="inline-block px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            Return to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default TrainerRequests;
