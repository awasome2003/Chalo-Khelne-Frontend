import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, CheckCircle, XCircle, Calendar, CreditCard, Clock, User, FileText, Filter, Trophy, MapPin } from "lucide-react";

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("Online");
  const [notifications, setNotifications] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  // State to track tournament statuses
  const [tournamentStatusMap, setTournamentStatusMap] = useState({});

  // State to track active tournaments for tabs
  const [activeTournaments, setActiveTournaments] = useState([]);

  // State to track payment method within tournament tabs
  const [tournamentPaymentFilter, setTournamentPaymentFilter] = useState({});

  // State for currently selected tournament in tournament tabs
  const [currentTournamentTab, setCurrentTournamentTab] = useState(null);

  const [tournamentStatusFilter, setTournamentStatusFilter] = useState("all");
  const [specificTournamentFilter, setSpecificTournamentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // New filters
  const [typeFilter, setTypeFilter] = useState("all"); // all | tournament | turf
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | accepted | rejected

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = localStorage.getItem("user");
      if (!user) return;

      const manager = JSON.parse(user);
      if (!manager?._id) return;

      try {
        // Fetch tournament payment notifications
        const res = await axios.get(
          `/api/payments/${manager._id}/notifications`
        );
        let allNotifs = [];
        if (res.data.success) {
          const mapped = res.data.notifications.map((n) => ({
            ...n,
            type: "payment",
            status: n.transactionStatus,
            paymentMethod: n.paymentMethod,
            user: n.userId,
          }));
          allNotifs = [...mapped];
        }

        // Also fetch turf booking notifications
        try {
          const bookingRes = await axios.get(
            `/api/payments/${manager._id}/booking-notifications`
          );
          if (bookingRes.data.success) {
            const bookingMapped = bookingRes.data.notifications.map((n) => ({
              ...n,
              type: "booking",
              status: n.type === "booking_cancel" ? "cancelled" : "info",
              paymentMethod: "turf",
              user: n.userId,
              message: n.message || `${n.title}`,
              tournamentId: n.turfId, // reuse for grouping
            }));
            allNotifs = [...allNotifs, ...bookingMapped];
          }
        } catch {}

        // Sort all by createdAt
        allNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(allNotifs);

        // Fetch tournament statuses (only for payment type)
        const paymentNotifs = allNotifs.filter(n => n.type === "payment");
        if (paymentNotifs.length > 0) {
          await fetchTournamentStatuses(paymentNotifs);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    const fetchTournamentStatuses = async (notificationsList) => {
      try {
        // Get unique tournament IDs from notifications
        const tournamentIds = [...new Set(notificationsList.map(n => n.tournamentId))];

        // Fetch each tournament to determine its status
        const statusMap = {};
        const activeTournamentsList = [];

        for (const tournamentId of tournamentIds) {
          try {
            const tournamentRes = await axios.get(`/api/tournaments/${tournamentId}`);
            if (tournamentRes.data.success && tournamentRes.data.tournament) {
              const tournament = tournamentRes.data.tournament;
              const now = new Date();
              const endDate = tournament.endDate ? new Date(tournament.endDate) : null;

              if (endDate) {
                endDate.setHours(23, 59, 59, 999);
              }

              // Determine if tournament is active or expired
              const isExpired = endDate && endDate < now;
              statusMap[tournamentId] = isExpired ? "expired" : "active";

              // Add to active tournaments list if it's active
              if (!isExpired) {
                activeTournamentsList.push(tournament);
              }
            } else {
              statusMap[tournamentId] = "unknown";
            }
          } catch (err) {
            console.error(`Failed to fetch tournament ${tournamentId} status:`, err);
            statusMap[tournamentId] = "unknown";
          }
        }

        setTournamentStatusMap(statusMap);
        setActiveTournaments(activeTournamentsList);
      } catch (err) {
        console.error("Failed to fetch tournament statuses:", err);
      }
    };

    fetchNotifications();
  }, []);

  const handleAction = async (notification, action) => {
    if (!notification?._id) return;

    try {
      const decision = action.toLowerCase();

      // Map payment method from Payment schema to Booking schema
      // Payment schema has: card, upi, netbanking, wallet, any, online -> map to 'cash' or 'free' in Booking
      // Booking schema only accepts: cash, free, waived
      let bookingPaymentMethod = 'cash'; // default
      if (notification.paymentMethod && ['card', 'upi', 'netbanking', 'wallet', 'online'].includes(notification.paymentMethod.toLowerCase())) {
        bookingPaymentMethod = 'cash'; // map online payments to cash for booking purposes
      } else if (notification.paymentMethod && ['free', 'waived'].includes(notification.paymentMethod.toLowerCase())) {
        bookingPaymentMethod = notification.paymentMethod.toLowerCase();
      }

      await axios.patch(
        `/api/payments/booking/update-status`,
        {
          tournamentId: notification.tournamentId,
          userId: notification.user._id,
          decision: decision === "accept" ? "accepted" : "rejected",
          paymentMethod: bookingPaymentMethod, // Pass the mapped payment method
        }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id
            ? { ...n, status: decision === "accept" ? "accepted" : "rejected" }
            : n
        )
      );
    } catch (err) {
      console.error("Failed to update booking/payment:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const bulkAction = async (action) => {
    if (selected.length === 0) return;
    setLoading(true);

    try {
      const items = notifications
        .filter((n) => selected.includes(n._id))
        .map((n) => ({
          userId: n.user._id,
          tournamentId: n.tournamentId,
          // Map payment method from Payment schema to Booking schema
          paymentMethod: n.paymentMethod && ['card', 'upi', 'netbanking', 'wallet', 'online'].includes(n.paymentMethod.toLowerCase())
            ? 'cash'
            : n.paymentMethod && ['free', 'waived'].includes(n.paymentMethod.toLowerCase())
              ? n.paymentMethod.toLowerCase()
              : 'cash' // default
        }));

      await axios.patch(
        `/api/payments/booking/bulk-update`,
        { items, decision: action }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          selected.includes(n._id) ? { ...n, status: action } : n
        )
      );
      setSelected([]);
    } catch (err) {
      console.error("Bulk update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Apply Type Filter (tournament vs turf)
    if (typeFilter === "tournament") {
      filtered = filtered.filter(n => n.type === "payment");
    } else if (typeFilter === "turf") {
      filtered = filtered.filter(n => n.type === "booking");
    }

    // Apply Status Filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(n => {
        if (n.type === "booking") {
          if (statusFilter === "pending") return false; // bookings don't have pending
          if (statusFilter === "accepted") return n.type !== "booking_cancel";
          if (statusFilter === "rejected") return n.type === "booking_cancel";
        }
        return n.status === statusFilter;
      });
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        (n.user?.name && n.user.name.toLowerCase().includes(query)) ||
        (n.registrationId && n.registrationId.toLowerCase().includes(query)) ||
        (n.message && n.message.toLowerCase().includes(query)) ||
        (n.turfName && n.turfName.toLowerCase().includes(query)) ||
        (n.sport && n.sport.toLowerCase().includes(query)) ||
        (n.playerName && n.playerName.toLowerCase().includes(query)) ||
        (n.tournamentId && n.tournamentId.toLowerCase().includes(query))
      );
    }

    // If activeTab is 'All', return filtered
    if (activeTab === "All") {
      return filtered;
    }

    // For tournament-specific tabs, filter by current tournament
    if (activeTab !== "All" && activeTab !== "Payment List") {
      filtered = filtered.filter(n => n.tournamentId === activeTab);

      const currentTournamentPaymentFilter = tournamentPaymentFilter[activeTab] || "All";
      if (currentTournamentPaymentFilter !== "All") {
        filtered = filtered.filter(n =>
          n.paymentMethod?.toLowerCase() === currentTournamentPaymentFilter.toLowerCase()
        );
      }
    }

    // Legacy 'Payment List' tab
    if (activeTab === "Payment List") {
      filtered = filtered.filter(
        (n) =>
          n.type === "payment" &&
          (paymentFilter.toLowerCase() === "all" ||
            n.paymentMethod?.toLowerCase() === paymentFilter.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const renderNotification = (n) => {
    const isBooking = n.type === "booking";

    return (
      <div
        key={n._id}
        className={`group relative flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl border transition-all duration-200 mb-4 ${
          isBooking
            ? "bg-orange-50/30 border-orange-200 shadow-sm hover:shadow-md"
            : selected.includes(n._id)
            ? "bg-orange-50/50 border-orange-200 shadow-md"
            : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100"
        }`}
      >
        <div className="flex items-start gap-4 flex-1 w-full">
          {/* Checkbox (only for payment type) */}
          <div className="pt-1">
            {isBooking ? (
              <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center">
                <Calendar className="w-3 h-3 text-orange-500" />
              </div>
            ) : (
              <input
                type="checkbox"
                checked={selected.includes(n._id)}
                disabled={tournamentStatusMap[n.tournamentId] !== "active"}
                onChange={() => toggleSelect(n._id)}
                className="w-5 h-5 rounded-md border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer disabled:opacity-40 transition-colors"
              />
            )}
          </div>

          {/* Content */}
          <div className="space-y-2 flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-gray-900 text-base flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                {n.user?.name || n.playerName || "Player"}
              </span>
              <span className="text-gray-300 hidden md:inline">•</span>
              {isBooking ? (
                <span className="text-sm text-orange-600 flex items-center gap-1.5 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                  <Calendar className="w-3.5 h-3.5" />
                  Turf Booking
                </span>
              ) : (
                <span className="text-sm text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                  <CreditCard className="w-3.5 h-3.5" />
                  {n.paymentMethod || "Unknown"}
                </span>
              )}
              {/* Status Badge */}
              {isBooking ? (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ml-auto md:ml-0 ${
                  n.type === "booking_cancel"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}>
                  {n.type === "booking_cancel" ? "CANCELLED" : "NEW BOOKING"}
                </span>
              ) : (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ml-auto md:ml-0 ${
                    tournamentStatusMap[n.tournamentId] === "active"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : tournamentStatusMap[n.tournamentId] === "expired"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {tournamentStatusMap[n.tournamentId] || "UNKNOWN"}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
              {n.message}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400 pt-1">
              {isBooking ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{n.date} • {n.timeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-600">₹{n.amount}</span>
                    <span>• {n.sport}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 group-hover:text-orange-500 transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="font-mono tracking-wide">{n.registrationId || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Tournament ID: <span className="font-mono text-gray-500">{n.tournamentId?.substring(0, 8)}...</span></span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 md:mt-0 md:ml-6 flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
          {isBooking ? (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              n.type === "booking_cancel"
                ? "bg-red-50 border-red-100 text-red-700"
                : "bg-green-50 border-green-100 text-green-700"
            }`}>
              {n.type === "booking_cancel" ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-bold capitalize">
                {n.type === "booking_cancel" ? "Cancelled" : "Booked"}
              </span>
            </div>
          ) : n.status === "pending" ? (
            <>
              <button
                onClick={() => handleAction(n, "accept")}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => handleAction(n, "reject")}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 text-sm font-semibold rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </>
          ) : (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              n.status === "accepted"
                ? "bg-green-50 border-green-100 text-green-700"
                : "bg-red-50 border-red-100 text-red-700"
            }`}>
              {getStatusIcon(n.status)}
              <span className="text-sm font-bold capitalize">{n.status}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const filtered = getFilteredNotifications();
  const allSelected =
    filtered.length > 0 && filtered.every((n) => selected.includes(n._id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) =>
        prev.filter((id) => !filtered.some((n) => n._id === id))
      );
    } else {
      const idsToAdd = filtered.map((n) => n._id);
      setSelected((prev) => Array.from(new Set([...prev, ...idsToAdd])));
    }
  };

  const clearAllSelections = () => setSelected([]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Notifications & Requests</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage payment approvals and booking requests</p>
          </div>

          {/* New Premium Search Bar */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-none ring-1 ring-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:text-sm transition-all shadow-sm hover:shadow-md focus:shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar — Type + Status */}
        <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Type:</span>
            {[
              { key: "all", label: "All", icon: null },
              { key: "tournament", label: "Tournament", icon: Trophy },
              { key: "turf", label: "Turf Booking", icon: MapPin },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === key
                    ? key === "tournament"
                      ? "bg-orange-100 text-orange-600 ring-1 ring-orange-200"
                      : key === "turf"
                      ? "bg-orange-100 text-orange-700 ring-1 ring-orange-200"
                      : "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
                <span className="text-[10px] opacity-60 ml-0.5">
                  ({key === "all"
                    ? notifications.length
                    : key === "tournament"
                    ? notifications.filter(n => n.type === "payment").length
                    : notifications.filter(n => n.type === "booking").length})
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { key: "all", label: "All", color: "gray" },
              { key: "pending", label: "Pending", color: "yellow" },
              { key: "accepted", label: "Accepted", color: "green" },
              { key: "rejected", label: "Rejected", color: "red" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === key
                    ? `bg-${color}-100 text-${color}-700 ring-1 ring-${color}-200`
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                style={statusFilter === key ? {
                  backgroundColor: color === "yellow" ? "#FEF3C7" : color === "green" ? "#D1FAE5" : color === "red" ? "#FEE2E2" : "#F3F4F6",
                  color: color === "yellow" ? "#92400E" : color === "green" ? "#065F46" : color === "red" ? "#991B1B" : "#1F2937",
                } : {}}
              >
                {key !== "all" && (
                  <span className={`w-2 h-2 rounded-full`} style={{
                    backgroundColor: color === "yellow" ? "#F59E0B" : color === "green" ? "#10B981" : color === "red" ? "#EF4444" : "#9CA3AF"
                  }} />
                )}
                {label}
              </button>
            ))}
          </div>

          {/* Active filters indicator + clear */}
          {(typeFilter !== "all" || statusFilter !== "all") && (
            <>
              <div className="h-6 w-px bg-gray-200 hidden sm:block" />
              <button
                onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }}
                className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>

        {/* Tabs Section */}
        <div className="space-y-4">
          {/* Primary Navigation - Tournaments */}
          <div className="flex flex-wrap items-center gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-gray-200/50">
            {["All", ...activeTournaments.map(t => t._id)].map((tab) => {
              const tournament = activeTournaments.find(t => t._id === tab);
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 transform scale-105"
                    : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md"
                    }`}
                >
                  {tab === "All"
                    ? "All Notifications"
                    : tournament?.title || `Tournament ${tab.substring(0, 8)}…`}
                </button>
              );
            })}
          </div>

          {/* Secondary Navigation - Payment Methods (Segmented Control) */}
          {activeTab !== "All" && activeTab !== "Payment List" && (
            <div className="flex items-center gap-3 px-2 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="h-px bg-gray-300 w-6"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter By Method</span>

              <div className="flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                {["All", "Online", "Cash"].map((method) => {
                  const currentFilter = tournamentPaymentFilter[activeTab] || "All";
                  const isSubActive = currentFilter === method;

                  return (
                    <button
                      key={method}
                      onClick={() => setTournamentPaymentFilter(prev => ({ ...prev, [activeTab]: method }))}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isSubActive
                        ? "bg-orange-50 text-orange-500 shadow-sm ring-1 ring-orange-100"
                        : "text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      {method}
                      {isSubActive && <CheckCircle className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {activeTab === "Payment List" && (
          // Legacy Filter Block - kept minimal only if needed
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center text-gray-500 italic">
            Legacy View
          </div>
        )}

        {/* Bulk Actions & Selection Header */}
        {filtered.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 rounded-md border-gray-300 text-orange-500 focus:ring-orange-500 group-hover:border-orange-400 transition-colors"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Select All ({filtered.length})
                </span>
              </label>

              {selected.length > 0 && (
                <>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <button
                    onClick={clearAllSelections}
                    className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    Clear Selection
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-4 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-green-200 shadow-sm"></span>
                Active: {filtered.filter(n => tournamentStatusMap[n.tournamentId] === 'active').length}
              </span>
              <span className="w-px h-3 bg-gray-300"></span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-red-200 shadow-sm"></span>
                Expired: {filtered.filter(n => tournamentStatusMap[n.tournamentId] === 'expired').length}
              </span>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No notifications found</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {filtered.map(renderNotification)}
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-gray-900 text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 border border-gray-800">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-700">
              <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {selected.length}
              </span>
              <span className="text-sm font-medium">Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkAction("accepted")}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-5 py-2 rounded-full transition-transform active:scale-95 flex items-center gap-2"
              >
                {loading ? <Clock className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Accept All
              </button>
              <button
                onClick={() => bulkAction("rejected")}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-5 py-2 rounded-full transition-transform active:scale-95 flex items-center gap-2"
              >
                {loading ? <Clock className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
