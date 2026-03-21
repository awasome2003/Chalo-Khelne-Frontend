import React, { useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaFileExport,
  FaCalendarAlt,
  FaSortAmountDown,
  FaSortAmountUp,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMoneyBillWave,
  FaCreditCard,
  FaPaypal,
  FaBan,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaTrophy,
  FaFutbol,
} from "react-icons/fa";

const PaymentHistoryPage = () => {
  // State variables
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "descending",
  });
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Sample data for demonstration
  const samplePayments = [
    {
      id: "PMT12354",
      customer: "John Smith",
      email: "john.smith@example.com",
      amount: 500.0,
      date: new Date("2023-03-15"),
      type: "tournament",
      category: "registration",
      paymentMethod: "card",
      status: "completed",
      reference: "TRN-2023-03-15",
    },
    {
      id: "PMT12353",
      customer: "Sarah Johnson",
      email: "sarah.j@example.com",
      amount: 150.0,
      date: new Date("2023-03-16"),
      type: "turf",
      category: "booking",
      paymentMethod: "cash",
      status: "completed",
      reference: "BKG-2023-03-16",
    },
    {
      id: "PMT12352",
      customer: "David Wilson",
      email: "david.w@example.com",
      amount: 750.0,
      date: new Date("2023-03-18"),
      type: "turf",
      category: "merchandise",
      paymentMethod: "bank",
      status: "completed",
      reference: "SPT-2023-03-18",
    },
    {
      id: "PMT12351",
      customer: "Emily Brown",
      email: "emily.b@example.com",
      amount: 200.0,
      date: new Date("2023-03-20"),
      type: "tournament",
      category: "sponsorship",
      paymentMethod: "card",
      status: "completed",
      reference: "MEM-2023-03-20",
    },
    {
      id: "PMT12350",
      customer: "Michael Davis",
      email: "michael.d@example.com",
      amount: 100.0,
      date: new Date("2023-03-22"),
      type: "tournament",
      category: "registration",
      paymentMethod: "paypal",
      status: "refunded",
      reference: "BKG-2023-03-22",
    },
    {
      id: "PMT12349",
      customer: "Jennifer Taylor",
      email: "jennifer.t@example.com",
      amount: 350.0,
      date: new Date("2023-03-25"),
      type: "turf",
      category: "booking",
      paymentMethod: "cash",
      status: "completed",
      reference: "TRN-2023-03-25",
    },
    {
      id: "PMT12348",
      customer: "Robert Anderson",
      email: "robert.a@example.com",
      amount: 1000.0,
      date: new Date("2023-03-27"),
      type: "tournament",
      category: "sponsorship",
      paymentMethod: "bank",
      status: "failed",
      reference: "SPT-2023-03-27",
    },
  ];

  // Filter and sort payments
  const getFilteredPayments = () => {
    return samplePayments
      .filter((payment) => {
        // Filter by tab
        if (activeTab !== "all" && payment.type !== activeTab) return false;

        // Filter by search query
        if (
          searchQuery &&
          !payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !payment.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !payment.reference.toLowerCase().includes(searchQuery.toLowerCase())
        )
          return false;

        // Filter by payment method
        if (
          paymentTypeFilter !== "all" &&
          payment.paymentMethod !== paymentTypeFilter
        )
          return false;

        // Filter by status
        if (statusFilter !== "all" && payment.status !== statusFilter)
          return false;

        // Filter by category
        if (categoryFilter !== "all" && payment.category !== categoryFilter)
          return false;

        return true;
      })
      .sort((a, b) => {
        const key = sortConfig.key;

        if (a[key] < b[key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
  };

  const filteredPayments = getFilteredPayments();

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, payment) => {
    if (payment.status !== "refunded") {
      return sum + payment.amount;
    }
    return sum;
  }, 0);

  const completedCount = filteredPayments.filter(
    (payment) => payment.status === "completed"
  ).length;

  const pendingCount = filteredPayments.filter(
    (payment) => payment.status === "pending"
  ).length;

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Expand/collapse row
  const toggleRowExpand = (id) => {
    setExpandedRows({
      ...expandedRows,
      [id]: !expandedRows[id],
    });
  };

  // Select/deselect payment for bulk actions
  const togglePaymentSelection = (id) => {
    if (selectedPayments.includes(id)) {
      setSelectedPayments(
        selectedPayments.filter((paymentId) => paymentId !== id)
      );
    } else {
      setSelectedPayments([...selectedPayments, id]);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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

  // Render payment method icon
  const renderPaymentMethodIcon = (method) => {
    switch (method) {
      case "card":
        return <FaCreditCard className="text-blue-500" />;
      case "cash":
        return <FaMoneyBillWave className="text-green-500" />;
      case "paypal":
        return <FaPaypal className="text-indigo-500" />;
      default:
        return null;
    }
  };

  // Render payment status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
            <FaExclamationTriangle className="mr-1" />
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center">
            <FaBan className="mr-1" />
            Failed
          </span>
        );
      case "refunded":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center">
            <FaTimes className="mr-1" />
            Refunded
          </span>
        );
      default:
        return null;
    }
  };

  // Render payment type icon
  const renderTypeIcon = (type) => {
    switch (type) {
      case "tournament":
        return <FaTrophy className="text-amber-500" />;
      case "turf":
        return <FaFutbol className="text-emerald-500" />;
      default:
        return null;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setPaymentTypeFilter("all");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  // Export payments
  const handleExport = () => {
    setIsExporting(true);
    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      alert("Payments exported successfully");
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Payment History</h1>
          <p className="text-gray-600">
            View and manage all payment transactions for tournaments and turf
            bookings.
          </p>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main content column */}
        <div className="flex-1 pr-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-gray-500 text-sm uppercase">Total Revenue</h3>
              <div className="flex items-end">
                <span className="text-3xl font-bold">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-gray-500 text-sm uppercase">
                Completed Payments
              </h3>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-green-600">
                  {completedCount}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {filteredPayments.length > 0
                    ? `${(
                      (completedCount / filteredPayments.length) *
                      100
                    ).toFixed(0)}%`
                    : "0%"}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-gray-500 text-sm uppercase">
                Pending Payments
              </h3>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="flex border-b">
              <button
                className={`px-4 py-3 text-sm font-medium mt-0 bg-transparent hover:bg-transparent ${activeTab === "all"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("all")}
              >
                All Payments
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex mt-0 bg-transparent hover:bg-transparent items-center ${activeTab === "tournament"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("tournament")}
              >
                <FaTrophy className="mr-2" /> Tournament Payments
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium bg-transparent mt-0  flex items-center hover:bg-transparent ${activeTab === "turf"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("turf")}
              >
                <FaFutbol className="mr-2" /> Turf Payments
              </button>
            </div>

            {/* Filters */}
            <div className="p-4">
              <div className="flex flex-wrap justify-between gap-2 mb-4">
                <div className="w-full sm:w-64 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer, ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  />
                  <FaSearch className="absolute left-3 top-5 text-gray-400" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start Date"
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End Date"
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />

                  <select
                    value={paymentTypeFilter}
                    onChange={(e) => setPaymentTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">All Methods</option>
                    <option value="card">Credit Card</option>
                    <option value="cash">Cash</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">All Categories</option>
                    <option value="registration">Registration</option>
                    <option value="booking">Booking</option>
                    <option value="sponsorship">Sponsorship</option>
                    <option value="merchandise">Merchandise</option>
                  </select>

                  <button
                    onClick={clearFilters}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md flex items-center"
                  >
                    <FaFilter className="mr-1" /> Clear
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">{filteredPayments.length}</span>{" "}
                  of{" "}
                  <span className="font-medium">{samplePayments.length}</span>{" "}
                  payments
                </div>
                <div>
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 flex items-center"
                  >
                    <FaFileExport className="mr-1" />
                    {isExporting ? "Exporting..." : "Export"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No payments found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID/Type
                      </th>
                      <th
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("customer")}
                      >
                        <div className="flex items-center">
                          Customer
                          {sortConfig.key === "customer" &&
                            (sortConfig.direction === "ascending" ? (
                              <FaSortAmountUp className="ml-1" />
                            ) : (
                              <FaSortAmountDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("date")}
                      >
                        <div className="flex items-center">
                          Date
                          {sortConfig.key === "date" &&
                            (sortConfig.direction === "ascending" ? (
                              <FaSortAmountUp className="ml-1" />
                            ) : (
                              <FaSortAmountDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("amount")}
                      >
                        <div className="flex items-center">
                          Amount
                          {sortConfig.key === "amount" &&
                            (sortConfig.direction === "ascending" ? (
                              <FaSortAmountUp className="ml-1" />
                            ) : (
                              <FaSortAmountDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedPayments.includes(payment.id)}
                            onChange={() => togglePaymentSelection(payment.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center">
                            {renderTypeIcon(payment.type)}
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.id}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {payment.type} - {payment.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.customer}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.email}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm text-gray-900">
                            {formatDate(payment.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.reference}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center text-sm text-gray-900">
                            {renderPaymentMethodIcon(payment.paymentMethod)}
                            <span className="ml-1 capitalize">
                              {payment.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {renderStatusBadge(payment.status)}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => toggleRowExpand(payment.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center bg-transparent hover:bg-transparent"
                          >
                            {expandedRows[payment.id] ? (
                              <>
                                <FaChevronUp className="mr-1" /> Hide
                              </>
                            ) : (
                              <>
                                <FaChevronDown className="mr-1" /> View
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-4 py-2 bg-gray-50 border-t text-right">
              Showing 10 of {filteredPayments.length} payments
            </div>
          </div>
        </div>

        {/* Right sidebar with analytics */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h2 className="font-semibold mb-4">Payment Distribution</h2>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              By Category
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Registration</span>
                  <span className="text-xs font-medium">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "35%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Booking</span>
                  <span className="text-xs font-medium">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "28%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Sponsorship</span>
                  <span className="text-xs font-medium">22%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: "22%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Merchandise</span>
                  <span className="text-xs font-medium">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full"
                    style={{ width: "15%" }}
                  ></div>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-700 mb-2 mt-6">
              By Payment Method
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Credit Card</span>
                  <span className="text-xs font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Cash</span>
                  <span className="text-xs font-medium">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Bank Transfer</span>
                  <span className="text-xs font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">PayPal</span>
                  <span className="text-xs font-medium">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: "10%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-1 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">New Payment Received</h3>
                    <p className="text-xs text-gray-600">
                      Sarah Johnson paid $150.00 for turf booking
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">5 min ago</span>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-1 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Pending Approval</h3>
                    <p className="text-xs text-gray-600">
                      Michelle Rodriguez registration for Elite Cup
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">1 hr ago</span>
                </div>
              </div>

              <div className="border-l-4 border-red-500 pl-4 py-1 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Payment Failed</h3>
                    <p className="text-xs text-gray-600">
                      Robert Anderson sponsorship for Champions League
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">2 hrs ago</span>
                </div>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 py-1 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Refund Issued</h3>
                    <p className="text-xs text-gray-600">
                      Michael Davis turf booking refunded due to weather
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">Yesterday</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm bg-transparent hover:bg-transparent">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
