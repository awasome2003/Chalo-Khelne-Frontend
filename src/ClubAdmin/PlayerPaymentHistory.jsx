import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFileDownload,
  FaFilter,
  FaTrophy,
  FaFutbol,
  FaShoppingBag,
  FaReceipt,
  FaAngleRight,
  FaAngleDown,
  FaRegCalendarAlt,
  FaInfoCircle,
  FaSortAmountDown,
  FaSortAmountUp,
  FaCreditCard,
  FaMoneyBillWave,
  FaPaypal,
} from "react-icons/fa";

const PaymentHistoryPage = () => {
  // State for filters and controls
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Sample payment data
  const [payments, setPayments] = useState([
    {
      id: "PMT-2354",
      amount: 150.0,
      date: new Date("2023-11-15"),
      type: "tournament",
      category: "registration",
      paymentMethod: "card",
      status: "completed",
      reference: "TRN-SUMMER-CUP",
      description: "Summer Cup Tournament Registration",
      details: {
        tournamentName: "Summer Cup 2023",
        location: "Main Field Complex",
        participants: 1,
        team: "Blue Falcons",
      },
    },
    {
      id: "PMT-2355",
      amount: 75.0,
      date: new Date("2023-12-02"),
      type: "turf",
      category: "booking",
      paymentMethod: "cash",
      status: "completed",
      reference: "BKG-FIELD-01",
      description: "Turf Booking - Field 1",
      details: {
        field: "Main Field 1",
        duration: "2 hours",
        time: "3:00 PM - 5:00 PM",
        date: "Dec 5, 2023",
      },
    },
    {
      id: "PMT-2356",
      amount: 120.0,
      date: new Date("2024-01-10"),
      type: "tournament",
      category: "registration",
      paymentMethod: "paypal",
      status: "completed",
      reference: "TRN-WINTER-LEAGUE",
      description: "Winter League Registration",
      details: {
        tournamentName: "Winter League 2024",
        location: "City Sports Center",
        participants: 1,
        team: "Blue Falcons",
      },
    },
    {
      id: "PMT-2357",
      amount: 50.0,
      date: new Date("2024-02-05"),
      type: "turf",
      category: "booking",
      paymentMethod: "card",
      status: "refunded",
      reference: "BKG-FIELD-02",
      description: "Turf Booking - Field 2",
      details: {
        field: "Practice Field 2",
        duration: "1 hour",
        time: "6:00 PM - 7:00 PM",
        date: "Feb 10, 2024",
        refundReason: "Weather conditions",
      },
    },
    {
      id: "PMT-2358",
      amount: 200.0,
      date: new Date("2024-02-20"),
      type: "tournament",
      category: "registration",
      paymentMethod: "bank",
      status: "pending",
      reference: "TRN-SPRING-CUP",
      description: "Spring Cup Tournament Entry",
      details: {
        tournamentName: "Spring Cup 2024",
        location: "Regional Sports Complex",
        participants: 1,
        team: "Blue Falcons",
        pendingReason: "Bank transfer processing",
      },
    },
    {
      id: "PMT-2359",
      amount: 45.0,
      date: new Date("2024-03-05"),
      type: "store",
      category: "merchandise",
      paymentMethod: "card",
      status: "completed",
      reference: "MER-JERSEY-01",
      description: "Team Jersey Purchase",
      details: {
        items: [{ name: "Team Jersey (Blue)", quantity: 1, price: 45.0 }],
        size: "Medium",
        delivery: "Store Pickup",
      },
    },
    {
      id: "PMT-2360",
      amount: 60.0,
      date: new Date("2024-03-18"),
      type: "turf",
      category: "booking",
      paymentMethod: "card",
      status: "completed",
      reference: "BKG-FIELD-03",
      description: "Turf Booking - Main Field",
      details: {
        field: "Main Field 1",
        duration: "1 hour",
        time: "5:00 PM - 6:00 PM",
        date: "Mar 25, 2024",
      },
    },
  ]);

  // Check if on small screen
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter and sort payments
  const getFilteredPayments = () => {
    return [...payments]
      .filter((payment) => {
        // Filter by tab
        if (activeTab !== "all" && payment.type !== activeTab) return false;

        // Filter by search
        if (
          searchQuery &&
          !payment.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          !payment.reference.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Filter by date range
        if (startDate) {
          const filterStart = new Date(startDate);
          if (payment.date < filterStart) return false;
        }

        if (endDate) {
          const filterEnd = new Date(endDate);
          filterEnd.setHours(23, 59, 59);
          if (payment.date > filterEnd) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Handle sorting
        if (sortField === "date") {
          return sortDirection === "asc"
            ? a.date.getTime() - b.date.getTime()
            : b.date.getTime() - a.date.getTime();
        } else if (sortField === "amount") {
          return sortDirection === "asc"
            ? a.amount - b.amount
            : b.amount - a.amount;
        }
        return 0;
      });
  };

  const filteredPayments = getFilteredPayments();

  // Calculate totals
  const totalSpent = filteredPayments
    .filter((p) => p.status !== "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  const completedPayments = filteredPayments.filter(
    (p) => p.status === "completed"
  ).length;
  const pendingPayments = filteredPayments.filter(
    (p) => p.status === "pending"
  ).length;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Toggle payment details
  const togglePaymentDetails = (id) => {
    setExpandedPayment(expandedPayment === id ? null : id);
  };

  // Download receipt
  const downloadReceipt = (payment) => {
    toast.info(`Downloading receipt for ${payment.id}`);
  };

  // Payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "card":
        return <FaCreditCard className="text-blue-500" />;
      case "cash":
        return <FaMoneyBillWave className="text-green-500" />;
      case "paypal":
        return <FaPaypal className="text-indigo-500" />;
      default:
        return <FaMoneyBillWave className="text-gray-500" />;
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
            Pending
          </span>
        );
      case "refunded":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
            Refunded
          </span>
        );
      default:
        return null;
    }
  };

  // Type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case "tournament":
        return <FaTrophy className="text-yellow-500" />;
      case "turf":
        return <FaFutbol className="text-green-500" />;
      case "store":
        return <FaShoppingBag className="text-blue-500" />;
      default:
        return null;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
  };

  // Export payments as CSV
  const exportPayments = () => {
    const headers = ["Date", "Description", "Reference", "Amount", "Status"];
    const csvData = [
      headers.join(","),
      ...filteredPayments.map((p) =>
        [
          formatDate(p.date),
          `"${p.description}"`,
          p.reference,
          p.amount,
          p.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-history.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className=" mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payment History
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage your payment transactions
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 w-full md:w-auto">
            <div className="text-sm text-gray-500">Total Spent</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalSpent)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedPayments} completed • {pendingPayments} pending
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Tabs Navigation */}
        <div className="border-b">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap bg-transparent mt-0 hover:bg-transparent ${activeTab === "all"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              All Payments
            </button>
            <button
              onClick={() => setActiveTab("tournament")}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap flex items-center bg-transparent mt-0 hover:bg-transparent ${activeTab === "tournament"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <FaTrophy className="mr-2" /> Tournament Fees
            </button>
            <button
              onClick={() => setActiveTab("turf")}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap flex items-center bg-transparent mt-0 hover:bg-transparent ${activeTab === "turf"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <FaFutbol className="mr-2" /> Turf Bookings
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap flex items-center bg-transparent mt-0 hover:bg-transparent ${activeTab === "store"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <FaShoppingBag className="mr-2" /> Store Purchases
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by description or reference..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-5 text-gray-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative flex items-center">
                <FaRegCalendarAlt className="absolute left-3 text-gray-400" />
                <input
                  type="date"
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="relative flex items-center">
                <FaRegCalendarAlt className="absolute left-3 text-gray-400" />
                <input
                  type="date"
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center bg-[transparent] text-[#333] hover:bg-[#DBEAFE]"
              >
                <FaFilter className="mr-2" /> Clear
              </button>

              <button
                onClick={exportPayments}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center bg-[transparent] text-[#333] hover:bg-[#DBEAFE]"
              >
                <FaFileDownload className="mr-2" /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-500">
                Loading your payment history...
              </p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                <FaInfoCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No payments found
              </h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              {!isSmallScreen && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Payment
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center">
                          Date
                          {sortField === "date" &&
                            (sortDirection === "asc" ? (
                              <FaSortAmountUp className="ml-1" />
                            ) : (
                              <FaSortAmountDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center">
                          Amount
                          {sortField === "amount" &&
                            (sortDirection === "asc" ? (
                              <FaSortAmountUp className="ml-1" />
                            ) : (
                              <FaSortAmountDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <React.Fragment key={payment.id}>
                        <tr
                          className={`hover:bg-gray-50 ${expandedPayment === payment.id ? "bg-blue-50" : ""
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                                {getTypeIcon(payment.type)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.description}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {payment.reference}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <span className="ml-1 capitalize">
                                {payment.paymentMethod}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end space-x-2">
                              {payment.status === "completed" && (
                                <button
                                  onClick={() => downloadReceipt(payment)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center bg-transparent hover:bg-transparent"
                                >
                                  <FaReceipt className="mr-1" />
                                  Receipt
                                </button>
                              )}
                              <button
                                onClick={() => togglePaymentDetails(payment.id)}
                                className="text-gray-600 hover:text-gray-900 flex items-center bg-transparent hover:bg-transparent"
                              >
                                {expandedPayment === payment.id ? (
                                  <>
                                    <FaAngleDown className="mr-1" />
                                    Less
                                  </>
                                ) : (
                                  <>
                                    <FaAngleRight className="mr-1" />
                                    Details
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded details row */}
                        {expandedPayment === payment.id && (
                          <tr className="bg-blue-50">
                            <td colSpan={5} className="px-6 py-4">
                              <div className="text-sm">
                                <h4 className="font-medium text-gray-900 mb-3">
                                  Payment Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2">
                                      Transaction Info
                                    </h5>
                                    <ul className="space-y-1 text-gray-600">
                                      <li>
                                        <span className="font-medium">
                                          Payment ID:
                                        </span>{" "}
                                        {payment.id}
                                      </li>
                                      <li>
                                        <span className="font-medium">
                                          Reference:
                                        </span>{" "}
                                        {payment.reference}
                                      </li>
                                      <li>
                                        <span className="font-medium">
                                          Method:
                                        </span>{" "}
                                        {payment.paymentMethod
                                          .charAt(0)
                                          .toUpperCase() +
                                          payment.paymentMethod.slice(1)}
                                      </li>
                                      <li>
                                        <span className="font-medium">
                                          Status:
                                        </span>{" "}
                                        {payment.status
                                          .charAt(0)
                                          .toUpperCase() +
                                          payment.status.slice(1)}
                                      </li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2">
                                      {payment.type === "tournament"
                                        ? "Tournament Details"
                                        : payment.type === "turf"
                                          ? "Booking Details"
                                          : "Purchase Details"}
                                    </h5>

                                    <ul className="space-y-1 text-gray-600">
                                      {payment.type === "tournament" &&
                                        payment.details && (
                                          <>
                                            <li>
                                              <span className="font-medium">
                                                Tournament:
                                              </span>{" "}
                                              {payment.details.tournamentName}
                                            </li>
                                            <li>
                                              <span className="font-medium">
                                                Location:
                                              </span>{" "}
                                              {payment.details.location}
                                            </li>
                                            <li>
                                              <span className="font-medium">
                                                Team:
                                              </span>{" "}
                                              {payment.details.team}
                                            </li>
                                          </>
                                        )}

                                      {payment.type === "turf" &&
                                        payment.details && (
                                          <>
                                            <li>
                                              <span className="font-medium">
                                                Field:
                                              </span>{" "}
                                              {payment.details.field}
                                            </li>
                                            <li>
                                              <span className="font-medium">
                                                Duration:
                                              </span>{" "}
                                              {payment.details.duration}
                                            </li>
                                            <li>
                                              <span className="font-medium">
                                                Date/Time:
                                              </span>{" "}
                                              {payment.details.date},{" "}
                                              {payment.details.time}
                                            </li>
                                          </>
                                        )}

                                      {payment.type === "store" &&
                                        payment.details &&
                                        payment.details.items &&
                                        payment.details.items.map(
                                          (item, idx) => (
                                            <li key={idx}>
                                              <span className="font-medium">
                                                {item.name}:
                                              </span>{" "}
                                              {item.quantity} x{" "}
                                              {formatCurrency(item.price)}
                                            </li>
                                          )
                                        )}

                                      {payment.status === "refunded" &&
                                        payment.details &&
                                        payment.details.refundReason && (
                                          <li>
                                            <span className="font-medium">
                                              Refund Reason:
                                            </span>{" "}
                                            {payment.details.refundReason}
                                          </li>
                                        )}

                                      {payment.status === "pending" &&
                                        payment.details &&
                                        payment.details.pendingReason && (
                                          <li>
                                            <span className="font-medium">
                                              Pending Reason:
                                            </span>{" "}
                                            {payment.details.pendingReason}
                                          </li>
                                        )}
                                    </ul>
                                  </div>
                                </div>

                                {payment.status === "completed" && (
                                  <div className="mt-4 flex justify-end">
                                    <button
                                      onClick={() => downloadReceipt(payment)}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                    >
                                      <FaReceipt className="mr-2" />
                                      Download Receipt
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Mobile View */}
              {isSmallScreen && (
                <div className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <div key={payment.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                            {getTypeIcon(payment.type)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.reference}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(payment.date)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="mt-1">
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-gray-500 flex items-center">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="ml-1 capitalize">
                            {payment.paymentMethod}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          {payment.status === "completed" && (
                            <button
                              onClick={() => downloadReceipt(payment)}
                              className="text-xs text-blue-600 px-2 py-1 border border-blue-200 rounded-md flex items-center bg-transparent"
                            >
                              <FaReceipt className="mr-1" />
                              Receipt
                            </button>
                          )}
                          <button
                            onClick={() => togglePaymentDetails(payment.id)}
                            className="text-xs text-gray-600 px-2 py-1 border border-gray-200 rounded-md flex items-center"
                          >
                            {expandedPayment === payment.id ? (
                              <>
                                Less <FaAngleDown className="ml-1" />
                              </>
                            ) : (
                              <>
                                Details <FaAngleRight className="ml-1" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Mobile expanded details */}
                      {expandedPayment === payment.id && (
                        <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Payment Details
                          </h5>
                          <ul className="space-y-1 text-gray-600">
                            <li>
                              <span className="font-medium">Payment ID:</span>{" "}
                              {payment.id}
                            </li>
                            <li>
                              <span className="font-medium">Reference:</span>{" "}
                              {payment.reference}
                            </li>
                            <li>
                              <span className="font-medium">Method:</span>{" "}
                              {payment.paymentMethod.charAt(0).toUpperCase() +
                                payment.paymentMethod.slice(1)}
                            </li>

                            {payment.type === "tournament" &&
                              payment.details && (
                                <>
                                  <li>
                                    <span className="font-medium">
                                      Tournament:
                                    </span>{" "}
                                    {payment.details.tournamentName}
                                  </li>
                                  <li>
                                    <span className="font-medium">Team:</span>{" "}
                                    {payment.details.team}
                                  </li>
                                </>
                              )}

                            {payment.type === "turf" && payment.details && (
                              <>
                                <li>
                                  <span className="font-medium">Field:</span>{" "}
                                  {payment.details.field}
                                </li>
                                <li>
                                  <span className="font-medium">
                                    Date/Time:
                                  </span>{" "}
                                  {payment.details.date}, {payment.details.time}
                                </li>
                              </>
                            )}

                            {payment.type === "store" &&
                              payment.details &&
                              payment.details.items &&
                              payment.details.items.map((item, idx) => (
                                <li key={idx}>
                                  <span className="font-medium">
                                    {item.name}:
                                  </span>{" "}
                                  {formatCurrency(item.price)}
                                </li>
                              ))}

                            {payment.status === "refunded" &&
                              payment.details &&
                              payment.details.refundReason && (
                                <li>
                                  <span className="font-medium">
                                    Refund Reason:
                                  </span>{" "}
                                  {payment.details.refundReason}
                                </li>
                              )}
                          </ul>

                          {payment.status === "completed" && (
                            <div className="mt-3">
                              <button
                                onClick={() => downloadReceipt(payment)}
                                className="w-full px-3 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 flex items-center justify-center"
                              >
                                <FaReceipt className="mr-2" />
                                Download Receipt
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination - Only show if there are payments */}
        {filteredPayments.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{filteredPayments.length}</span>{" "}
                of <span className="font-medium">{payments.length}</span>{" "}
                payments
              </div>

              {/* For demonstration. In a real app, you'd implement proper pagination */}
              <div className="flex items-center space-x-2">
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={true}
                >
                  Previous
                </button>
                <span className="px-3 py-2 bg-blue-100 text-blue-600 font-medium text-sm rounded-md">
                  1
                </span>
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={true}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment FAQs Panel */}
      <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Payment FAQs</h2>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4">
            <h3 className="text-md font-medium text-gray-900">
              How do I get a receipt for my payment?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              You can download receipts for completed payments by clicking the
              "Receipt" button next to any completed payment. Receipts include
              all payment details and can be used for reimbursement or
              record-keeping purposes.
            </p>
          </div>

          <div className="px-6 py-4">
            <h3 className="text-md font-medium text-gray-900">
              What payment methods are accepted?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              We accept credit/debit cards, PayPal, bank transfers, and cash
              payments at our facility. Online payments are processed securely
              through our payment gateway with encryption.
            </p>
          </div>

          <div className="px-6 py-4">
            <h3 className="text-md font-medium text-gray-900">
              How do I request a refund?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              To request a refund, please contact our support team at
              support@chalokelne.com or visit the club house. Refund eligibility
              depends on our cancellation policy, which generally allows full
              refunds up to 48 hours before a scheduled event.
            </p>
          </div>

          <div className="px-6 py-4">
            <h3 className="text-md font-medium text-gray-900">
              Why is my payment showing as pending?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Payments may show as pending while we wait for confirmation from
              your bank or payment provider. This typically resolves within 1-2
              business days. If a payment remains pending for longer, please
              contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-medium text-blue-900">
              Need help with a payment?
            </h3>
            <p className="mt-1 text-blue-700">
              Our support team is ready to assist with any payment issues or
              questions.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
