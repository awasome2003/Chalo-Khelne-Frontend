import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Send,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  Archive,
  Filter,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const NEWS_TYPES = [
  "Tournament Announcement",
  "Sports News",
  "Club Updates",
  "Training Announcement",
];

const STATUS_COLORS = {
  Draft: "bg-amber-50 text-amber-700 border-amber-200",
  Published: "bg-green-50 text-green-700 border-green-200",
  Expired: "bg-gray-100 text-gray-500 border-gray-200",
  Archived: "bg-red-50 text-red-500 border-red-200",
};

const TYPE_COLORS = {
  "Tournament Announcement": "bg-blue-50 text-blue-700 border-blue-200",
  "Sports News": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Club Updates": "bg-purple-50 text-purple-700 border-purple-200",
  "Training Announcement": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const SPORTS_LIST = [
  "Badminton", "Table Tennis", "Tennis", "Cricket", "Football",
  "Basketball", "Volleyball", "Chess", "Carrom", "Pickleball",
  "Snooker", "Hockey", "Kabaddi", "Turf Games", "Cricket Nets",
];

const emptyForm = {
  title: "",
  body: "",
  type: "Tournament Announcement",
  sports: [],
  region: "",
  area: "",
  thumbnail: "",
  publishDate: "",
  expiryDate: "",
};

export default function MNews() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [activeFilter, setActiveFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const userName = localStorage.getItem("userName") || "Manager";

  const fetchNews = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (activeFilter) params.append("status", activeFilter);

      const res = await axios.get(`${API}/news?${params}`, { headers });
      setNewsList(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeFilter]);

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setModalMode("create");
    setShowModal(true);
  };

  const openEdit = (news) => {
    setForm({
      title: news.title || "",
      body: news.body || "",
      type: news.type || "Tournament Announcement",
      sports: news.sports || [],
      region: news.region || "",
      area: news.area || "",
      thumbnail: news.thumbnail || "",
      publishDate: news.publishDate
        ? new Date(news.publishDate).toISOString().slice(0, 16)
        : "",
      expiryDate: news.expiryDate
        ? new Date(news.expiryDate).toISOString().slice(0, 16)
        : "",
    });
    setEditingId(news._id);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        createdByModel: "Manager",
        createdByName: userName,
      };

      if (modalMode === "create") {
        await axios.post(`${API}/news/create`, payload, { headers });
      } else {
        await axios.put(`${API}/news/update/${editingId}`, payload, { headers });
      }

      setShowModal(false);
      fetchNews(pagination.page);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    setActionLoading(id);
    try {
      await axios.post(`${API}/news/publish/${id}`, {}, { headers });
      fetchNews(pagination.page);
    } catch (err) {
      console.error("Publish failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Archive this news article?")) return;
    setActionLoading(id);
    try {
      await axios.delete(`${API}/news/delete/${id}`, { headers });
      fetchNews(pagination.page);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSport = (sport) => {
    setForm((prev) => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter((s) => s !== sport)
        : [...prev.sports, sport],
    }));
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">
            News & Announcements
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish updates for your tournaments and events
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/15 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create News
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2">
        {["", "Draft", "Published", "Archived"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === f
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {/* News List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
        </div>
      ) : newsList.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <FileText className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-bold">No news articles yet</p>
          <button
            onClick={openCreate}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
          >
            Create First Article
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {newsList.map((news) => (
            <motion.div
              key={news._id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                        STATUS_COLORS[news.status]
                      }`}
                    >
                      {news.status}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                        TYPE_COLORS[news.type] || ""
                      }`}
                    >
                      {news.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {news.title}
                  </h3>

                  <p className="text-sm text-gray-500 line-clamp-1">
                    {news.body}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(news.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {news.viewCount || 0}
                    </span>
                    {news.sports?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {news.sports.join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(news)}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-all active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {news.status === "Draft" && (
                    <button
                      onClick={() => handlePublish(news._id)}
                      disabled={actionLoading === news._id}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(news._id)}
                    disabled={actionLoading === news._id}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => fetchNews(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-gray-400">
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => fetchNews(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-black italic uppercase tracking-tighter text-gray-900">
                  {modalMode === "create" ? "Create News" : "Edit News"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-130px)] space-y-5 custom-scrollbar">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="News headline..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                    maxLength={200}
                  />
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {NEWS_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, type: t }))}
                        className={`px-3 py-2 rounded-lg text-[11px] font-bold border transition-all ${
                          form.type === t
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Content
                  </label>
                  <textarea
                    value={form.body}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, body: e.target.value }))
                    }
                    placeholder="Write article content..."
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>

                {/* Sports */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Related Sports
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SPORTS_LIST.map((sport) => (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => toggleSport(sport)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${
                          form.sports.includes(sport)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region + Area */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Region
                    </label>
                    <input
                      type="text"
                      value={form.region}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, region: e.target.value }))
                      }
                      placeholder="e.g. Maharashtra"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-300 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Area
                    </label>
                    <input
                      type="text"
                      value={form.area}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, area: e.target.value }))
                      }
                      placeholder="e.g. Pune"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-300 transition-all"
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    value={form.thumbnail}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, thumbnail: e.target.value }))
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-300 transition-all"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      value={form.publishDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, publishDate: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-300 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      value={form.expiryDate}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, expiryDate: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-300 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title.trim() || !form.body.trim()}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/15 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : modalMode === "create" ? (
                    "Create"
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
