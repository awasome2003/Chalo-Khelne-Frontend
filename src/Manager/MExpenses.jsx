import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  X,
  DollarSign,
  CreditCard,
  Receipt,
  TrendingUp,
  Calendar,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
} from "lucide-react";

const EVENT_TYPES = ["Tournament", "Training", "Facility", "Club", "Other"];
const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card"];
const PAYMENT_STATUSES = ["Pending", "Partial", "Paid", "Failed"];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Partial: "bg-orange-100 text-orange-700",
  Paid: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-700",
};

const statusIcons = {
  Pending: <Clock size={14} />,
  Partial: <AlertCircle size={14} />,
  Paid: <CheckCircle size={14} />,
  Failed: <X size={14} />,
};

export default function MExpenses() {
  const { auth } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Data
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterEventType, setFilterEventType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // UI
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses"); // expenses | analytics
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expensePayments, setExpensePayments] = useState([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  // Form state
  const [expenseForm, setExpenseForm] = useState({
    title: "", description: "", amount: "", category: "", eventType: "Club",
    eventName: "", vendor: "", expenseDate: new Date().toISOString().split("T")[0], notes: "",
  });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [paymentForm, setPaymentForm] = useState({
    expenseId: "", amount: "", paymentMode: "Cash",
    paymentDate: new Date().toISOString().split("T")[0], transactionId: "", notes: "",
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filterCategory, filterEventType, filterStatus, pagination.page]);

  // ===== API Calls =====

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pagination.page, limit: 20 });
      if (searchQuery) params.append("search", searchQuery);
      if (filterCategory) params.append("category", filterCategory);
      if (filterEventType) params.append("eventType", filterEventType);
      if (filterStatus) params.append("paymentStatus", filterStatus);

      const res = await axios.get(`/api/expenses?${params}`, { headers });
      setExpenses(res.data.expenses || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error("Fetch expenses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/expenses/categories", { headers });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/api/expenses/analytics", { headers });
      setAnalytics(res.data.analytics || null);
    } catch (err) {
      console.error("Fetch analytics error:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchExpenses();
  };

  // ===== Expense CRUD =====

  const handleSaveExpense = async () => {
    try {
      if (!expenseForm.title || !expenseForm.amount || !expenseForm.category || !expenseForm.expenseDate) {
        alert("Please fill title, amount, category, and date");
        return;
      }

      const payload = { ...expenseForm, amount: parseFloat(expenseForm.amount) };

      if (editingExpense) {
        await axios.put(`/api/expenses/update/${editingExpense._id}`, payload, { headers });
      } else {
        await axios.post("/api/expenses/add", payload, { headers });
      }

      setShowExpenseModal(false);
      resetExpenseForm();
      fetchExpenses();
      fetchAnalytics();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`/api/expenses/delete/${id}`, { headers });
      fetchExpenses();
      fetchAnalytics();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      title: expense.title,
      description: expense.description || "",
      amount: expense.amount.toString(),
      category: expense.category?._id || "",
      eventType: expense.eventType,
      eventName: expense.eventName || "",
      vendor: expense.vendor || "",
      expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split("T")[0] : "",
      notes: expense.notes || "",
    });
    setShowExpenseModal(true);
  };

  const resetExpenseForm = () => {
    setEditingExpense(null);
    setExpenseForm({
      title: "", description: "", amount: "", category: "", eventType: "Club",
      eventName: "", vendor: "", expenseDate: new Date().toISOString().split("T")[0], notes: "",
    });
  };

  // ===== Category =====

  const handleSaveCategory = async () => {
    try {
      if (!categoryForm.name) { alert("Category name is required"); return; }
      await axios.post("/api/expenses/categories/create", categoryForm, { headers });
      setShowCategoryModal(false);
      setCategoryForm({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await axios.delete(`/api/expenses/categories/${id}`, { headers });
      fetchCategories();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  // ===== Payment =====

  const openPaymentModal = (expense) => {
    setPaymentForm({
      expenseId: expense._id,
      amount: (expense.amount - expense.totalPaid).toString(),
      paymentMode: "Cash",
      paymentDate: new Date().toISOString().split("T")[0],
      transactionId: "",
      notes: "",
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async () => {
    try {
      if (!paymentForm.amount || !paymentForm.paymentMode) {
        alert("Amount and payment mode are required");
        return;
      }
      await axios.post("/api/expenses/payment", {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
      }, { headers });
      setShowPaymentModal(false);
      fetchExpenses();
      fetchAnalytics();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const viewPaymentHistory = async (expense) => {
    try {
      setSelectedExpense(expense);
      const res = await axios.get(`/api/expenses/payments/${expense._id}`, { headers });
      setExpensePayments(res.data.payments || []);
      setShowPaymentHistory(true);
    } catch (err) {
      alert("Error fetching payments");
    }
  };

  // ===== Render =====

  const formatCurrency = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expense Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your event expenses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 w-auto"
          >
            <Tag size={16} /> Categories
          </button>
          <button
            onClick={() => { resetExpenseForm(); setShowExpenseModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 w-auto"
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Receipt size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Expenses</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(analytics.totals.totalAmount)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{analytics.totals.count} expense records</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Paid</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(analytics.totals.totalPaid)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Outstanding</p>
                <p className="text-lg font-bold text-orange-700">
                  {formatCurrency((analytics.totals.totalAmount || 0) - (analytics.totals.totalPaid || 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BarChart3 size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Categories</p>
                <p className="text-lg font-bold text-gray-800">{analytics.byCategory?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {[
          { key: "expenses", label: "Expenses", icon: <FileText size={16} /> },
          { key: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all w-auto ${
              activeTab === tab.key ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== EXPENSES TAB ===== */}
      {activeTab === "expenses" && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap gap-3 items-center">
              <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  />
                </div>
              </form>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <select
                value={filterEventType}
                onChange={(e) => { setFilterEventType(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">All Event Types</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">All Statuses</option>
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400">Loading expenses...</div>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center">
                <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">No expenses found</h3>
                <p className="text-sm text-gray-400 mt-1">Add your first expense to start tracking</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Expense</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Event</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Paid</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expenses.map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800 text-sm">{expense.title}</div>
                          {expense.vendor && (
                            <div className="text-xs text-gray-400 mt-0.5">{expense.vendor}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            <Tag size={12} /> {expense.category?.name || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{expense.eventType}</div>
                          {expense.eventName && (
                            <div className="text-xs text-gray-400">{expense.eventName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-green-600 font-medium">
                          {formatCurrency(expense.totalPaid)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[expense.paymentStatus]}`}>
                            {statusIcons[expense.paymentStatus]} {expense.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(expense.expenseDate)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {expense.paymentStatus !== "Paid" && (
                              <button
                                onClick={() => openPaymentModal(expense)}
                                title="Record Payment"
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors w-auto"
                              >
                                <CreditCard size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => viewPaymentHistory(expense)}
                              title="Payment History"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-auto"
                            >
                              <DollarSign size={16} />
                            </button>
                            <button
                              onClick={() => openEditExpense(expense)}
                              title="Edit"
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors w-auto"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense._id)}
                              title="Delete"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors w-auto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 w-auto"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 w-auto"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {activeTab === "analytics" && analytics && (
        <div className="space-y-6">
          {/* By Category */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Tag size={20} className="text-blue-600" /> Expenses by Category
            </h3>
            {analytics.byCategory?.length > 0 ? (
              <div className="space-y-3">
                {analytics.byCategory.map((cat) => {
                  const pct = analytics.totals.totalAmount > 0 ? (cat.total / analytics.totals.totalAmount) * 100 : 0;
                  return (
                    <div key={cat._id} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700 truncate">{cat._id}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(pct, 5)}%` }}
                        >
                          <span className="text-[10px] font-bold text-white">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-28 text-right text-sm font-semibold text-gray-800">{formatCurrency(cat.total)}</div>
                      <div className="w-16 text-right text-xs text-gray-400">{cat.count} items</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No data yet</p>
            )}
          </div>

          {/* By Event Type */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-600" /> Expenses by Event Type
            </h3>
            {analytics.byEventType?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.byEventType.map((evt) => (
                  <div key={evt._id} className="border border-gray-100 rounded-lg p-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">{evt._id}</div>
                    <div className="text-xl font-bold text-gray-800">{formatCurrency(evt.total)}</div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>Paid: {formatCurrency(evt.paid)}</span>
                      <span>{evt.count} expenses</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No data yet</p>
            )}
          </div>

          {/* By Payment Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-green-600" /> By Payment Status
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.byStatus?.map((s) => (
                <div key={s._id} className="border border-gray-100 rounded-lg p-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${statusColors[s._id] || "bg-gray-100 text-gray-600"}`}>
                    {statusIcons[s._id]} {s._id}
                  </span>
                  <div className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(s.total)}</div>
                  <div className="text-xs text-gray-400">{s.count} expenses</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD/EDIT EXPENSE MODAL ===== */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{editingExpense ? "Edit Expense" : "Add Expense"}</h3>
              <button onClick={() => { setShowExpenseModal(false); resetExpenseForm(); }} className="text-gray-400 hover:text-gray-600 w-auto bg-transparent">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Shuttle cocks for tournament"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={expenseForm.expenseDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={expenseForm.eventType}
                    onChange={(e) => setExpenseForm({ ...expenseForm, eventType: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  value={expenseForm.eventName}
                  onChange={(e) => setExpenseForm({ ...expenseForm, eventName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., State Badminton Championship 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  value={expenseForm.vendor}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Decathlon, Local Sports Shop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowExpenseModal(false); resetExpenseForm(); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-auto">
                Cancel
              </button>
              <button onClick={handleSaveExpense} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-auto">
                {editingExpense ? "Update" : "Add Expense"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CATEGORY MODAL ===== */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Expense Categories</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600 w-auto bg-transparent">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* Add new */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="New category name..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
                <button onClick={handleSaveCategory} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 w-auto">
                  Add
                </button>
              </div>
              {/* List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No categories yet. Add one above.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat._id} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="text-red-400 hover:text-red-600 w-auto bg-transparent"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RECORD PAYMENT MODAL ===== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 w-auto bg-transparent">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min="0"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <input
                  type="text"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-auto">
                Cancel
              </button>
              <button onClick={handleRecordPayment} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 w-auto">
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PAYMENT HISTORY MODAL ===== */}
      {showPaymentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Payment History</h3>
                <p className="text-sm text-gray-500">{selectedExpense?.title}</p>
              </div>
              <button onClick={() => setShowPaymentHistory(false)} className="text-gray-400 hover:text-gray-600 w-auto bg-transparent">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Total:</span>{" "}
                  <span className="font-semibold">{formatCurrency(selectedExpense?.amount)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Paid:</span>{" "}
                  <span className="font-semibold text-green-600">{formatCurrency(selectedExpense?.totalPaid)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Remaining:</span>{" "}
                  <span className="font-semibold text-orange-600">
                    {formatCurrency((selectedExpense?.amount || 0) - (selectedExpense?.totalPaid || 0))}
                  </span>
                </div>
              </div>

              {/* Payments list */}
              {expensePayments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No payments recorded yet</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {expensePayments.map((p) => (
                    <div key={p._id} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-700">{formatCurrency(p.amount)}</div>
                        <div className="text-xs text-gray-400">
                          {p.paymentMode} • {formatDate(p.paymentDate)}
                          {p.transactionId && ` • ${p.transactionId}`}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "Paid" ? "bg-green-100 text-green-700" : p.status === "Failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
