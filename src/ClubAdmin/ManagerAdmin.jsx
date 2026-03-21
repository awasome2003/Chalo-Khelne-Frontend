import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaTrash,
  FaCheck,
  FaTimes,
  FaUserPlus,
  FaChartBar,
  FaUsers,
  FaCalendarAlt,
  FaIdCard,
  FaUndo,
  FaFileDownload,
  FaFilter,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const ManagerAdmin = () => {
  // State management
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newManager, setNewManager] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("managers");
  const [stats, setStats] = useState({
    activeManagers: 0,
    inactiveManagers: 0,
    totalManagers: 0,
    newManagersThisMonth: 0,
    avgResponseTime: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [activityPagination, setActivityPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [timeRange, setTimeRange] = useState("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  const [statusTrend, setStatusTrend] = useState([]);
  const [statusTrendLoading, setStatusTrendLoading] = useState(true);
  const [trendTimeRange, setTrendTimeRange] = useState("6");

  // Fetch all managers
  const fetchManagers = async () => {
    try {
      setLoading(true);

      // Get the club admin's ID from auth context
      const user = JSON.parse(localStorage.getItem("user"));
      const clubId = user?._id; // ClubAdmin's ID is used as clubId

      let url = `/api/manager/club-admin/managers`;
      
      // Add clubId parameter if available
      if (clubId) {
        url += `?clubId=${clubId}`;
      }

      const response = await axios.get(url);

      const managersData = Array.isArray(response.data) ? response.data : [];
      setManagers(managersData);
      applyFiltersAndSort(managersData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch managers. Please try again later.");
      console.error("Error fetching managers:", err);
      setManagers([]);
      setFilteredManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagerStatusTrend = async () => {
    try {
      setStatusTrendLoading(true);
      const response = await axios.get(
        `/api/manager/analytics/manager-status-trend`,
        {
          params: { months: trendTimeRange },
        }
      );

      setStatusTrend(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching manager status trend:", error);
      toast.error("Failed to load status trend data");
      setStatusTrend([]);
    } finally {
      setStatusTrendLoading(false);
    }
  };

  // Fetch manager statistics
  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const clubId = user?._id;

      let url = `/api/manager/analytics/manager-stats`;
      
      // Add clubId parameter if available
      if (clubId) {
        url += `?clubId=${clubId}`;
      }

      const statsResponse = await axios.get(url);

      setStats(
        statsResponse.data || {
          activeManagers: 0,
          inactiveManagers: 0,
          totalManagers: 0,
          newManagersThisMonth: 0,
          avgResponseTime: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch activity logs
  const fetchActivityLogs = async (page = 1) => {
    try {
      setActivityLoading(true);
      const response = await axios.get(
        `/api/manager/activity-log`,
        {
          params: {
            timeRange,
            page,
            limit: 10,
          },
        }
      );

      setRecentActivities(response.data.activities);
      setActivityPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to load activity data");
    } finally {
      setActivityLoading(false);
    }
  };

  // Apply filters and sorting to the managers list
  const applyFiltersAndSort = (data = managers) => {
    let filtered = [...data];

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((manager) => manager.isActive === isActive);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (manager) =>
          manager.name.toLowerCase().includes(query) ||
          manager.email.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredManagers(filtered);
  };

  // Log an activity
  const logActivity = async (managerId, type, description, metadata = {}) => {
    try {
      await axios.post(
        `/api/manager/activity-log`,
        {
          managerId,
          type,
          description,
          metadata,
        }
      );
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  // Initialize data fetching
  useEffect(() => {
    fetchManagers();
    fetchStatistics();
    fetchActivityLogs();
    fetchManagerStatusTrend();

    // Set up refresh interval (every 5 minutes)
    const interval = setInterval(() => {
      fetchManagers();
      fetchStatistics();
      fetchActivityLogs(activityPagination.currentPage);
      fetchManagerStatusTrend();
    }, 5 * 60 * 1000);

    setRefreshInterval(interval);

    // Clean up interval on component unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  useEffect(() => {
    fetchManagerStatusTrend();
  }, [trendTimeRange]);

  // Update activity logs when time range changes
  useEffect(() => {
    fetchActivityLogs(1); // Reset to first page when changing time range
  }, [timeRange]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, statusFilter, sortConfig]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewManager((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add a new manager
  const handleAddManager = async (e) => {
    e.preventDefault();

    if (!newManager.name || !newManager.email || !newManager.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsAdding(true);

      // Get the club admin's ID
      const user = JSON.parse(localStorage.getItem("user"));
      const clubId = user?._id;

      const managerData = {
        ...newManager,
      };

      // Add clubId if available
      if (clubId) {
        managerData.clubId = clubId;
      }

      const response = await axios.post(
        `/api/manager/managers`,
        managerData
      );

      toast.success(
        "Manager added successfully! Login credentials sent via email."
      );
      setNewManager({ name: "", email: "", password: "" });

      if (response.data && response.data._id) {
        await logActivity(
          response.data._id,
          "update",
          "Manager account created",
          { action: "create" }
        );
      }

      fetchManagers();
      fetchStatistics();
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to add manager";
      toast.error(errorMessage);
      console.error("Error adding manager:", err);
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle manager active status
  const toggleManagerStatus = async (id, currentStatus) => {
    try {
      await axios.put(
        `/api/manager/managers/${id}/activate`,
        {
          isActive: !currentStatus,
        }
      );

      toast.success(
        `Manager ${currentStatus ? "deactivated" : "activated"} successfully`
      );

      // Log the activity
      await logActivity(
        id,
        "status",
        `Manager status changed to ${currentStatus ? "inactive" : "active"}`,
        { newStatus: !currentStatus }
      );

      // Refresh data to ensure everything stays in sync
      fetchManagers();
      fetchStatistics();
    } catch (err) {
      toast.error("Failed to update manager status");
      console.error("Error toggling manager status:", err);
    }
  };

  // Delete a manager
  const deleteManager = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manager?")) {
      return;
    }

    try {
      await axios.delete(
        `/api/manager/managers/${id}`
      );
      toast.success("Manager deleted successfully");

      // Log the activity with admin ID since manager is deleted
      const adminId = localStorage.getItem("adminId"); // Assuming you store admin ID in localStorage
      if (adminId) {
        await logActivity(adminId, "update", `Manager account deleted`, {
          deletedManagerId: id,
        });
      }

      // Refresh data
      fetchManagers();
      fetchStatistics();
    } catch (err) {
      toast.error("Failed to delete manager");
      console.error("Error deleting manager:", err);
    }
  };

  // Generate a random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewManager((prev) => ({ ...prev, password }));
  };

  // Handle sort request
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Export managers data
  const exportData = async () => {
    setIsExporting(true);
    try {
      // In a real app, this might call an API endpoint
      const dataToExport = filteredManagers.map(
        ({ name, email, isActive }) => ({
          name,
          email,
          status: isActive ? "Active" : "Inactive",
        })
      );

      // Create CSV content
      const headers = ["Name", "Email", "Status"];
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          [row.name, row.email, row.status].join(",")
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `managers_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported successfully");

      // Log the activity
      const adminId = localStorage.getItem("adminId");
      if (adminId) {
        await logActivity(adminId, "export", `Exported manager data`, {
          count: dataToExport.length,
        });
      }
    } catch (err) {
      console.error("Error exporting data:", err);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchActivityLogs(page);
  };

  // Format time for display
  const formatTime = (date) => {
    if (!date) return "";

    const now = new Date();
    const timeDate = new Date(date);
    const diffMinutes = Math.floor((now - timeDate) / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return timeDate.toLocaleDateString();
  };

  // Refresh data manually
  const refreshData = () => {
    fetchManagers();
    fetchStatistics();
    fetchActivityLogs(activityPagination.currentPage);
    fetchManagerStatusTrend();
    toast.info("Data refreshed");
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">Club Manager Management</h1>
              <p className="text-gray-600">
                Add, activate/deactivate, or remove managers for your club.
              </p>
            </div>
            <button
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded"
              onClick={refreshData}
              title="Refresh data"
            >
              <FaUndo className="mr-2" /> Refresh
            </button>
          </div>

          {/* Dashboard stats grid - changed to 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 stat-card">
              <h3 className="text-gray-500 text-sm uppercase">
                Total Managers
              </h3>
              <div className="flex items-end">
                {statsLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <span className="text-3xl font-bold">
                      {stats.totalManagers}
                    </span>
                    <span className="text-sm text-green-500 ml-2">
                      +{stats.newManagersThisMonth} this month
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 stat-card">
              <h3 className="text-gray-500 text-sm uppercase">
                Active Managers
              </h3>
              <div className="flex items-end">
                {statsLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <span className="text-3xl font-bold">
                      {stats.activeManagers}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {stats.totalManagers > 0
                        ? `${Math.round(
                            (stats.activeManagers / stats.totalManagers) * 100
                          )}%`
                        : "0%"}{" "}
                      of total
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 stat-card">
              <h3 className="text-gray-500 text-sm uppercase">
                Inactive Managers
              </h3>
              <div className="flex items-end">
                {statsLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <span className="text-3xl font-bold">
                      {stats.inactiveManagers}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {stats.totalManagers > 0
                        ? `${Math.round(
                            (stats.inactiveManagers / stats.totalManagers) * 100
                          )}%`
                        : "0%"}{" "}
                      of total
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6 w-full">
            <div className="flex border-b overflow-x-auto">
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === "managers"
                    ? "border-b-2 border-blue-500 text-blue-600 bg-transparent hover:bg-gray-200"
                    : "text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("managers")}
              >
                <FaUsers className="mr-2" /> Managers
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === "analytics"
                    ? "border-b-2 border-blue-500 text-blue-600 bg-transparent hover:bg-gray-200"
                    : "text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                <FaChartBar className="mr-2" /> Analytics
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === "activity"
                    ? "border-b-2 border-blue-500 text-blue-600 bg-transparent hover:bg-gray-200"
                    : "text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("activity")}
              >
                <FaCalendarAlt className="mr-2" /> Recent Activity
              </button>
            </div>
          </div>

          {/* Tab Content - controlled width */}
          {activeTab === "managers" && (
            <div className="w-full max-w-6xl mx-auto">
              {/* Add Manager Form */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaUserPlus className="mr-2" /> Add New Manager
                </h2>

                <form onSubmit={handleAddManager}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newManager.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter manager name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newManager.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter manager email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="password"
                          value={newManager.password}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-l-md"
                          placeholder="Enter password"
                          required
                        />
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="bg-gray-200 px-2 rounded-r-md border-y border-r border-gray-300 bg-transparent hover:bg-gray-200 w-auto"
                          title="Generate random password"
                        >
                          🔄
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 w-auto"
                      disabled={isAdding}
                    >
                      {isAdding ? "Adding..." : "Add Manager"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Managers List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Managers List</h2>

                  <div className="flex space-x-2">
                    <button
                      onClick={exportData}
                      disabled={isExporting}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 flex items-center"
                    >
                      <FaFileDownload className="mr-1" />
                      {isExporting ? "Exporting..." : "Export"}
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
                  <div className="w-full md:w-1/3 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  </div>

                  <div className="flex space-x-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner"></div>
                    <p className="mt-2 text-gray-600">Loading managers...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={fetchManagers}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No managers found. Add your first manager above.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort("name")}
                          >
                            <div className="flex items-center">
                              Name
                              {sortConfig.key === "name" &&
                                (sortConfig.direction === "ascending" ? (
                                  <FaSortAmountUp className="ml-1" />
                                ) : (
                                  <FaSortAmountDown className="ml-1" />
                                ))}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort("email")}
                          >
                            <div className="flex items-center">
                              Email
                              {sortConfig.key === "email" &&
                                (sortConfig.direction === "ascending" ? (
                                  <FaSortAmountUp className="ml-1" />
                                ) : (
                                  <FaSortAmountDown className="ml-1" />
                                ))}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => requestSort("isActive")}
                          >
                            <div className="flex items-center">
                              Status
                              {sortConfig.key === "isActive" &&
                                (sortConfig.direction === "ascending" ? (
                                  <FaSortAmountUp className="ml-1" />
                                ) : (
                                  <FaSortAmountDown className="ml-1" />
                                ))}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredManagers.map((manager) => (
                          <tr key={manager._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {manager.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-500">
                                {manager.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  manager.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {manager.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    toggleManagerStatus(
                                      manager._id,
                                      manager.isActive
                                    )
                                  }
                                  className={`p-1 rounded-full ${
                                    manager.isActive
                                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                                      : "bg-green-100 text-green-600 hover:bg-green-200"
                                  }`}
                                  title={
                                    manager.isActive ? "Deactivate" : "Activate"
                                  }
                                >
                                  {manager.isActive ? <FaTimes /> : <FaCheck />}
                                </button>
                                <button
                                  onClick={() => deleteManager(manager._id)}
                                  className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 gap-6 w-full max-w-6xl mx-auto">
              {/* Status Trend Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Manager Status Trend
                  </h2>
                  <div>
                    <select
                      value={trendTimeRange}
                      onChange={(e) => setTrendTimeRange(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="3">Last 3 Months</option>
                      <option value="6">Last 6 Months</option>
                      <option value="12">Last 12 Months</option>
                    </select>
                  </div>
                </div>

                {statusTrendLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={statusTrend}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            value,
                            name === "active"
                              ? "Active Managers"
                              : "Inactive Managers",
                          ]}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="active"
                          stackId="1"
                          stroke="#4ade80"
                          fill="#4ade80"
                          name="Active"
                        />
                        <Area
                          type="monotone"
                          dataKey="inactive"
                          stackId="1"
                          stroke="#f87171"
                          fill="#f87171"
                          name="Inactive"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Current Status Summary */}
                {!statusTrendLoading && statusTrend.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Current Status Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xl font-bold">
                          {statusTrend[statusTrend.length - 1].active}
                        </div>
                        <div className="text-sm text-gray-500">Active</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xl font-bold">
                          {statusTrend[statusTrend.length - 1].inactive}
                        </div>
                        <div className="text-sm text-gray-500">Inactive</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xl font-bold">
                          {statusTrend[statusTrend.length - 1].total}
                        </div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Distribution Pie Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Current Manager Status Distribution
                </h2>
                {statsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Active", value: stats.activeManagers },
                            { name: "Inactive", value: stats.inactiveManagers },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          <Cell fill="#4ade80" />
                          <Cell fill="#f87171" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <div className="flex items-center space-x-3">
                  {recentActivities && recentActivities.length > 0 && (
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to clear all activities?"
                          )
                        ) {
                          try {
                            // Call the API to clear activities
                            await axios.delete(
                              `/api/manager/activity-log`,
                              { params: { timeRange } }
                            );

                            // Update the UI
                            setRecentActivities([]);
                            setActivityPagination({
                              ...activityPagination,
                              totalItems: 0,
                              totalPages: 1,
                              currentPage: 1,
                            });

                            toast.success("All activities cleared");
                          } catch (error) {
                            console.error("Error clearing activities:", error);
                            toast.error("Failed to clear activities");
                          }
                        }
                      }}
                      className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-md text-sm flex items-center"
                    >
                      <FaTrash className="mr-1 text-xs" />
                      Clear All
                    </button>
                  )}
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>

              {activityLoading ? (
                <div className="text-center py-8">
                  <div className="spinner"></div>
                  <p className="mt-2 text-gray-600">Loading activity data...</p>
                </div>
              ) : !recentActivities || recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activities to display.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{activity.manager}</h3>
                          <p className="text-gray-600">
                            {activity.description}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTime(activity.time)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            activity.type === "login"
                              ? "bg-blue-100 text-blue-800"
                              : activity.type === "booking"
                              ? "bg-green-100 text-green-800"
                              : activity.type === "status"
                              ? "bg-yellow-100 text-yellow-800"
                              : activity.type === "update"
                              ? "bg-indigo-100 text-indigo-800"
                              : activity.type === "cancel"
                              ? "bg-red-100 text-red-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!activityLoading &&
                recentActivities &&
                recentActivities.length > 0 &&
                activityPagination &&
                activityPagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center">
                      <button
                        className={`px-3 py-1 rounded-l border border-gray-300 text-gray-600 ${
                          activityPagination.currentPage === 1
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          handlePageChange(activityPagination.currentPage - 1)
                        }
                        disabled={activityPagination.currentPage === 1}
                      >
                        Previous
                      </button>

                      {/* Render page numbers */}
                      {activityPagination &&
                        [...Array(activityPagination.totalPages)].map(
                          (_, i) => {
                            const pageNum = i + 1;
                            // Only show current page, first, last, and pages around current page
                            if (
                              pageNum === 1 ||
                              pageNum === activityPagination.totalPages ||
                              (pageNum >= activityPagination.currentPage - 1 &&
                                pageNum <= activityPagination.currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-1 border-t border-b border-gray-300 ${
                                    activityPagination.currentPage === pageNum
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            } else if (
                              pageNum === activityPagination.currentPage - 2 ||
                              pageNum === activityPagination.currentPage + 2
                            ) {
                              return (
                                <span
                                  key={pageNum}
                                  className="px-1 py-1 border-t border-b border-gray-300 text-gray-600"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }
                        )}

                      <button
                        className={`px-3 py-1 rounded-r border border-gray-300 text-gray-600 ${
                          activityPagination.currentPage ===
                          activityPagination.totalPages
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          handlePageChange(activityPagination.currentPage + 1)
                        }
                        disabled={
                          activityPagination.currentPage ===
                          activityPagination.totalPages
                        }
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerAdmin;