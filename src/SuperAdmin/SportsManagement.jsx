import { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Cog6ToothIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = import.meta.env.VITE_API_BASE_URL;

const CATEGORIES = ["Racquet", "Team", "Board", "Individual", "Custom"];
const SCORING_TYPES = [
  "sets-games-points",
  "innings-overs",
  "halves-goals",
  "quarters-points",
  "single-score",
  "custom",
];

const categoryColors = {
  Racquet: "bg-green-100 text-green-700",
  Team: "bg-blue-100 text-blue-700",
  Board: "bg-purple-100 text-purple-700",
  Individual: "bg-orange-100 text-orange-700",
  Custom: "bg-gray-100 text-gray-700",
};

const defaultFormData = {
  name: "",
  category: "Racquet",
  scoringType: "sets-games-points",
  matchFormat: {
    totalSets: null,
    gamesPerSet: null,
    pointsPerSet: null,
    pointsPerGame: null,
    winByMargin: null,
    maxPointsCap: null,
    deuceEnabled: false,
    deuceMinPoints: null,
    tiebreakEnabled: false,
    tiebreakPoints: null,
    decidingSetPoints: null,
    serviceRules: null,
    halvesCount: null,
    halvesDuration: null,
    quartersCount: null,
    quartersDuration: null,
    oversCount: null,
    inningsCount: null,
  },
  displayConfig: {
    icon: "default-sport",
    color: "#4CAF50",
    scoreLabel: "Score",
    setLabel: "Set",
    pointLabel: "Point",
  },
};

export default function SportsManagement() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [configSport, setConfigSport] = useState(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchSports();
  }, [filterCategory]);

  const fetchSports = async () => {
    setLoading(true);
    try {
      const params = filterCategory ? `?category=${filterCategory}` : "";
      const res = await axios.get(`${API}/sports${params}`);
      setSports(res.data.data || []);
    } catch (err) {
      console.error("Error fetching sports:", err);
      toast.error("Failed to load sports");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await axios.post(`${API}/sports/seed`);
      toast.success(res.data.message || "Sports seeded successfully!");
      fetchSports();
    } catch (err) {
      console.error("Seed error:", err);
      toast.error("Failed to seed sports");
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleActive = async (sport) => {
    try {
      await axios.put(`${API}/sports/${sport._id}`, {
        isActive: !sport.isActive,
      });
      toast.success(
        `${sport.name} ${sport.isActive ? "deactivated" : "activated"}`
      );
      fetchSports();
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Failed to update status");
    }
  };

  const openCreateModal = () => {
    setEditingSport(null);
    setFormData({ ...defaultFormData });
    setShowModal(true);
  };

  const openEditModal = (sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      category: sport.category,
      scoringType: sport.scoringType,
      matchFormat: { ...defaultFormData.matchFormat, ...sport.matchFormat },
      displayConfig: {
        ...defaultFormData.displayConfig,
        ...sport.displayConfig,
      },
    });
    setShowModal(true);
  };

  const openConfigModal = (sport) => {
    setConfigSport(sport);
    setFormData({
      ...formData,
      matchFormat: { ...defaultFormData.matchFormat, ...sport.matchFormat },
      displayConfig: {
        ...defaultFormData.displayConfig,
        ...sport.displayConfig,
      },
    });
    setShowConfigModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSport) {
        await axios.put(`${API}/sports/${editingSport._id}`, {
          name: formData.name,
          category: formData.category,
          scoringType: formData.scoringType,
          isActive: editingSport.isActive,
        });
        toast.success("Sport updated successfully!");
      } else {
        await axios.post(`${API}/sports`, {
          name: formData.name,
          category: formData.category,
          scoringType: formData.scoringType,
          matchFormat: formData.matchFormat,
          displayConfig: formData.displayConfig,
        });
        toast.success("Sport created successfully!");
      }
      setShowModal(false);
      fetchSports();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(
        err.response?.data?.message || "Failed to save sport"
      );
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/sports/${configSport._id}/config`, {
        matchFormat: formData.matchFormat,
        displayConfig: formData.displayConfig,
      });
      toast.success("Config updated successfully!");
      setShowConfigModal(false);
      fetchSports();
    } catch (err) {
      console.error("Config error:", err);
      toast.error("Failed to update config");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormatChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      matchFormat: {
        ...formData.matchFormat,
        [name]:
          type === "checkbox"
            ? checked
            : value === ""
            ? null
            : isNaN(value)
            ? value
            : Number(value),
      },
    });
  };

  const handleDisplayChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      displayConfig: { ...formData.displayConfig, [name]: value },
    });
  };

  const filteredSports = sports.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: sports.length,
    active: sports.filter((s) => s.isActive).length,
    inactive: sports.filter((s) => !s.isActive).length,
    presets: sports.filter((s) => s.isPreset).length,
  };

  const getFormatFields = () => {
    const st = formData.scoringType;
    if (st === "sets-games-points")
      return [
        "totalSets",
        "gamesPerSet",
        "pointsPerSet",
        "pointsPerGame",
        "winByMargin",
        "maxPointsCap",
        "deuceEnabled",
        "deuceMinPoints",
        "tiebreakEnabled",
        "tiebreakPoints",
        "decidingSetPoints",
        "serviceRules",
      ];
    if (st === "innings-overs") return ["inningsCount", "oversCount"];
    if (st === "halves-goals") return ["halvesCount", "halvesDuration"];
    if (st === "quarters-points")
      return ["quartersCount", "quartersDuration"];
    return [];
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Sports Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage sports types, scoring rules, and match formats
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-semibold text-sm hover:bg-amber-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <SparklesIcon className={`h-4 w-4 ${seeding ? "animate-spin" : ""}`} />
            {seeding ? "Seeding..." : "Seed Presets"}
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <PlusIcon className="h-4 w-4" />
            Add Sport
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sports", value: stats.total, color: "blue" },
          { label: "Active", value: stats.active, color: "green" },
          { label: "Inactive", value: stats.inactive, color: "red" },
          { label: "Presets", value: stats.presets, color: "purple" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100"
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold text-${stat.color}-600 mt-1`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchSports}
          className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
        >
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Sports Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : filteredSports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-lg font-semibold">No sports found</p>
          <p className="text-gray-300 text-sm mt-1">
            Click "Seed Presets" to add 15 default sports
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">
                    Sport
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">
                    Scoring Type
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">
                    Format
                  </th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSports.map((sport) => (
                  <tr
                    key={sport._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            backgroundColor:
                              sport.displayConfig?.color || "#4CAF50",
                          }}
                        >
                          {sport.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {sport.name}
                          </p>
                          <p className="text-xs text-gray-400">{sport.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                          categoryColors[sport.category] || categoryColors.Custom
                        }`}
                      >
                        {sport.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium">
                        {sport.scoringType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <FormatSummary sport={sport} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(sport)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all active:scale-95 ${
                          sport.isActive
                            ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                            : "bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700"
                        }`}
                      >
                        {sport.isActive ? (
                          <>
                            <CheckCircleIcon className="h-3.5 w-3.5" /> Active
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-3.5 w-3.5" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(sport)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Sport"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openConfigModal(sport)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Edit Config"
                        >
                          <Cog6ToothIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Sport Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-between">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">
                {editingSport ? "Edit Sport" : "Create Sport"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">
                  Sport Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold italic focus:border-blue-300 outline-none transition-all"
                  placeholder="e.g. Badminton"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold italic focus:border-blue-300 outline-none transition-all appearance-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">
                    Scoring Type
                  </label>
                  <select
                    name="scoringType"
                    value={formData.scoringType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold italic focus:border-blue-300 outline-none transition-all appearance-none"
                  >
                    {SCORING_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  {editingSport ? "Update Sport" : "Create Sport"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfigModal && configSport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">
                  {configSport.name} — Config
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Match format and display settings
                </p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={handleConfigSubmit}
              className="p-8 space-y-6 overflow-y-auto"
            >
              {/* Match Format */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest italic mb-4">
                  Match Format
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {getFormatFields().map((field) =>
                    field === "deuceEnabled" || field === "tiebreakEnabled" ? (
                      <label
                        key={field}
                        className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-all"
                      >
                        <input
                          type="checkbox"
                          name={field}
                          checked={formData.matchFormat[field] || false}
                          onChange={handleFormatChange}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-xs font-bold italic text-gray-600">
                          {field.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </label>
                    ) : field === "serviceRules" ? (
                      <div key={field} className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">
                          Service Rules
                        </label>
                        <select
                          name={field}
                          value={formData.matchFormat[field] || ""}
                          onChange={handleFormatChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold italic focus:border-blue-300 outline-none transition-all appearance-none"
                        >
                          <option value="">None</option>
                          <option value="rally">Rally</option>
                          <option value="alternate-2">Alternate (2)</option>
                          <option value="alternate-game">Alternate Game</option>
                          <option value="side-out">Side Out</option>
                          <option value="rotate">Rotate</option>
                        </select>
                      </div>
                    ) : (
                      <div key={field} className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">
                          {field.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <input
                          type="number"
                          name={field}
                          value={formData.matchFormat[field] ?? ""}
                          onChange={handleFormatChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold italic focus:border-blue-300 outline-none transition-all"
                          placeholder="—"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Display Config */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest italic mb-4">
                  Display Config
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">
                      Icon Name
                    </label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.displayConfig.icon}
                      onChange={handleDisplayChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold italic focus:border-blue-300 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        name="color"
                        value={formData.displayConfig.color}
                        onChange={handleDisplayChange}
                        className="w-10 h-10 rounded-lg border border-gray-100 cursor-pointer"
                      />
                      <input
                        type="text"
                        name="color"
                        value={formData.displayConfig.color}
                        onChange={handleDisplayChange}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold italic focus:border-blue-300 outline-none transition-all"
                      />
                    </div>
                  </div>
                  {["scoreLabel", "setLabel", "pointLabel"].map((field) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 italic">
                        {field.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={formData.displayConfig[field]}
                        onChange={handleDisplayChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold italic focus:border-blue-300 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-4 px-6 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20 active:scale-95"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function FormatSummary({ sport }) {
  const f = sport.matchFormat;
  const st = sport.scoringType;

  let summary = "";
  if (st === "sets-games-points") {
    if (f?.totalSets && f?.pointsPerSet)
      summary = `Best of ${f.totalSets}, ${f.pointsPerSet} pts`;
    else if (f?.totalSets && f?.gamesPerSet)
      summary = `Best of ${f.totalSets}, ${f.gamesPerSet} games`;
    else if (f?.totalSets) summary = `Best of ${f.totalSets}`;
    else summary = "—";
  } else if (st === "innings-overs") {
    summary = f?.oversCount ? `${f.oversCount} overs, ${f.inningsCount || 2} innings` : "—";
  } else if (st === "halves-goals") {
    summary = f?.halvesCount ? `${f.halvesCount} halves, ${f.halvesDuration}min` : "—";
  } else if (st === "quarters-points") {
    summary = f?.quartersCount
      ? `${f.quartersCount} quarters, ${f.quartersDuration}min`
      : "—";
  } else {
    summary = "Custom";
  }

  return <span className="text-xs text-gray-500">{summary}</span>;
}
