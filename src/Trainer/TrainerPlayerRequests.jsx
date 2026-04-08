import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FaUserAlt,
  FaCalendarCheck,
  FaCalendarTimes,
  FaCheck,
  FaTimes,
  FaFilter,
  FaSearch,
} from "react-icons/fa";

// Color scheme with green as primary (matching TrainerSessions)
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

const TrainerPlayerRequests = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Fallback player requests data
  const fallbackPlayerRequests = [
    {
      _id: "fallback-1",
      type: "player",
      playerName: "Emily Johnson",
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
      type: "player",
      playerName: "Michael Rodriguez",
      status: "accepted",
      sessionType: "group",
      requestedDate: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      requestedTime: "16:30",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Sports Complex",
      notes: "Team training preparation",
    },
    {
      _id: "fallback-3",
      type: "player",
      playerName: "Sarah Kim",
      status: "rejected",
      sessionType: "individual",
      requestedDate: new Date(
        Date.now() + 21 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      requestedTime: "10:00",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Community Sports Center",
      notes: "Interested in joining training program",
    },
  ];

  // Modify fetchPlayerRequests logic in useEffect
  useEffect(() => {
    const fetchPlayerRequests = async () => {
      try {
        if (!isAuthenticated || !user) {
          throw new Error("User not authenticated");
        }

        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${user.id}`
          );

          // Filter for player requests
          const playerRequests =
            response.data.length > 0
              ? response.data.filter((request) => request.type === "player")
              : fallbackPlayerRequests;

          // Sort by creation date (newest first)
          playerRequests.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          setRequests(playerRequests);
          setLoading(false);
        } catch (apiError) {
          setRequests(fallbackPlayerRequests);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error details:", err.response?.data || err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (isAuthenticated && user && user.id) {
      fetchPlayerRequests();
    }
  }, [user, isAuthenticated]);

  // useEffect(() => {
  //   const fetchPlayerRequests = async () => {
  //     try {
  //       if (!isAuthenticated || !user) {
  //         throw new Error("User not authenticated");
  //       }

  //       const response = await axios.get(
  //         `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${user.id}`
  //       );

  //       // Filter for player requests only
  //       const playerRequests = response.data.filter(
  //         (request) => request.type === "player"
  //       );

  //       // Sort by creation date (newest first)
  //       playerRequests.sort(
  //         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  //       );

  //       setRequests(playerRequests);
  //       setLoading(false);
  //     } catch (err) {
  //       setError(err.response?.data?.message || err.message);
  //       setLoading(false);
  //     }
  //   };

  //   if (isAuthenticated && user && user.id) {
  //     fetchPlayerRequests();
  //   }
  // }, [user, isAuthenticated]);

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
        `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${user.id}`
      );
      const playerRequests = response.data.filter(
        (request) => request.type === "player"
      );
      setRequests(playerRequests);

      // Clear selected request
      setSelectedRequest(null);
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
        `${import.meta.env.VITE_API_BASE_URL}/trainer/requests/${user.id}`
      );
      const playerRequests = response.data.filter(
        (request) => request.type === "player"
      );
      setRequests(playerRequests);

      // Clear selected request
      setSelectedRequest(null);
    } catch (err) {
      setError("Failed to reject request: " + err.message);
    }
  };

  // Filtering logic
  const filteredRequests = requests.filter(
    (request) =>
      (statusFilter === "all" || request.status === statusFilter) &&
      (searchTerm === "" ||
        request.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.sessionType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          Player Training Requests
        </h1>
        <Link
          to="/trainer-requests"
          className="px-4 py-2 rounded-md"
          style={{
            backgroundColor: colors.white,
            color: colors.primary,
            border: `1px solid ${colors.primary}`,
          }}
        >
          All Requests
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div
        className="rounded-lg shadow-md p-4 mb-8"
        style={{ backgroundColor: colors.white }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <div className="relative">
              <FaSearch
                className="absolute top-3 left-3"
                style={{ color: colors.textLight }}
              />
              <input
                type="text"
                placeholder="Search requests..."
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

          <div className="w-full md:w-auto flex items-center">
            <FaFilter className="mr-2" style={{ color: colors.primary }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2"
              style={{ borderColor: colors.border }}
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Requests</option>
            </select>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div
          className="rounded-lg shadow-md p-8 text-center"
          style={{ backgroundColor: colors.white }}
        >
          <div
            className="rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <FaUserAlt style={{ color: colors.primary, fontSize: "1.5rem" }} />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            No Player Requests
          </h2>
          <p className="mb-4" style={{ color: colors.textLight }}>
            You don't have any training requests from players yet.
          </p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div
          className="rounded-lg shadow-md p-8 text-center"
          style={{ backgroundColor: colors.white }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            No Matching Requests
          </h2>
          <p className="mb-4" style={{ color: colors.textLight }}>
            No player requests with status "{statusFilter}" found.
          </p>
          <button
            onClick={() => setStatusFilter("all")}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            View All Requests
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-1">
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
                  {statusFilter === "all"
                    ? "All"
                    : statusFilter.charAt(0).toUpperCase() +
                      statusFilter.slice(1)}{" "}
                  Player Requests ({filteredRequests.length})
                </h2>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "70vh" }}>
                {filteredRequests.map((request) => (
                  <div
                    key={request._id}
                    className={`border-b p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedRequest && selectedRequest._id === request._id
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <p
                          className="font-medium"
                          style={{ color: colors.text }}
                        >
                          {request.playerName}
                        </p>
                        <span
                          className="inline-block text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              request.status === "pending"
                                ? "#DEEBFF"
                                : request.status === "accepted"
                                ? colors.primaryLight
                                : "#FFEBE6",
                            color:
                              request.status === "pending"
                                ? "#0052CC"
                                : request.status === "accepted"
                                ? colors.primary
                                : colors.danger,
                          }}
                        >
                          {request.status}
                        </span>
                      </div>
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
                          {request.sessionType}
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
                className="rounded-lg shadow-md p-6"
                style={{ backgroundColor: colors.white }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: colors.text }}
                    >
                      Player Training Request
                    </h2>
                    <p style={{ color: colors.textLight }}>
                      {selectedRequest.playerName} requested a{" "}
                      {selectedRequest.sessionType} session
                    </p>
                  </div>
                  <div>
                    <span
                      className="inline-block text-sm px-3 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          selectedRequest.status === "pending"
                            ? "#DEEBFF"
                            : selectedRequest.status === "accepted"
                            ? colors.primaryLight
                            : "#FFEBE6",
                        color:
                          selectedRequest.status === "pending"
                            ? "#0052CC"
                            : selectedRequest.status === "accepted"
                            ? colors.primary
                            : colors.danger,
                      }}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3
                      className="font-semibold mb-2"
                      style={{ color: colors.text }}
                    >
                      Player Information
                    </h3>
                    <div
                      className="rounded-lg p-4"
                      style={{ backgroundColor: colors.background }}
                    >
                      <p className="mb-2" style={{ color: colors.text }}>
                        <span className="font-medium">Name:</span>{" "}
                        {selectedRequest.playerName}
                      </p>
                      <p className="mb-2" style={{ color: colors.text }}>
                        <span className="font-medium">Request Date:</span>{" "}
                        {new Date(
                          selectedRequest.createdAt
                        ).toLocaleDateString()}
                      </p>
                      <p style={{ color: colors.text }}>
                        <span className="font-medium">Session Type:</span>{" "}
                        <span className="capitalize">
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
                      <p className="mb-2" style={{ color: colors.text }}>
                        <span className="font-medium">Date:</span>
                        {selectedRequest.requestedDate}
                      </p>
                      <p className="mb-2" style={{ color: colors.text }}>
                        <span className="font-medium">Time:</span>{" "}
                        {selectedRequest.requestedTime}
                      </p>
                      <p style={{ color: colors.text }}>
                        <span className="font-medium">Location:</span>{" "}
                        {selectedRequest.location || "Not specified"}
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
                      <p style={{ color: colors.text }}>
                        {selectedRequest.notes}
                      </p>
                    </div>
                  </div>
                )}

                {selectedRequest.status === "pending" && (
                  <div
                    className="border-t pt-6 flex justify-end space-x-3"
                    style={{ borderColor: colors.border }}
                  >
                    <button
                      onClick={() => handleReject(selectedRequest._id)}
                      className="flex items-center justify-center px-4 py-2 rounded-lg"
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
                      className="flex items-center justify-center px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.white,
                      }}
                    >
                      <FaCheck className="mr-2" />
                      Accept Request
                    </button>
                  </div>
                )}

                {selectedRequest.status === "accepted" && (
                  <div
                    className="border-t pt-6"
                    style={{ borderColor: colors.border }}
                  >
                    <div
                      className="p-4 rounded-lg flex items-center"
                      style={{ backgroundColor: colors.primaryLight }}
                    >
                      <FaCalendarCheck
                        className="mr-3 text-xl"
                        style={{ color: colors.primary }}
                      />
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: colors.primary }}
                        >
                          Request Accepted
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: colors.textLight }}
                        >
                          This session has been added to your schedule
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        to="/trainer-upcoming"
                        className="inline-block px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                        }}
                      >
                        View in Upcoming Sessions
                      </Link>
                    </div>
                  </div>
                )}

                {selectedRequest.status === "rejected" && (
                  <div
                    className="border-t pt-6"
                    style={{ borderColor: colors.border }}
                  >
                    <div
                      className="p-4 rounded-lg flex items-center"
                      style={{ backgroundColor: "#FFEBE6" }}
                    >
                      <FaCalendarTimes
                        className="mr-3 text-xl"
                        style={{ color: colors.danger }}
                      />
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: colors.danger }}
                        >
                          Request Rejected
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: colors.textLight }}
                        >
                          This training request has been declined
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="rounded-lg shadow-md p-6 text-center"
                style={{ backgroundColor: colors.white }}
              >
                <div className="py-12">
                  <div
                    className="rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <FaUserAlt
                      style={{
                        color: colors.primary,
                        fontSize: "1.5rem",
                      }}
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
      )}
    </div>
  );
};

export default TrainerPlayerRequests;
