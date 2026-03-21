import { useState, useEffect } from "react";
import axios from "axios";
import {
  ShieldCheckIcon,
  SparklesIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = import.meta.env.VITE_API_BASE_URL;

const LEVELS = ["district", "state", "national", "international"];

const levelColors = {
  district: "bg-emerald-100 text-emerald-700",
  state: "bg-blue-100 text-blue-700",
  national: "bg-purple-100 text-purple-700",
  international: "bg-amber-100 text-amber-700",
};

const levelBorder = {
  district: "border-emerald-200",
  state: "border-blue-200",
  national: "border-purple-200",
  international: "border-amber-200",
};

export default function SportRuleBooks() {
  const [ruleBooks, setRuleBooks] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [expandedSport, setExpandedSport] = useState(null);
  const [selectedRuleBook, setSelectedRuleBook] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesRes, sportsRes] = await Promise.all([
        axios.get(`${API}/sport-rules`),
        axios.get(`${API}/sports/active`),
      ]);
      setRuleBooks(rulesRes.data.data || []);
      setSports(sportsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load rule books");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      // Seed sports first, then rule books
      await axios.post(`${API}/sports/seed`);
      const res = await axios.post(`${API}/sport-rules/seed`);
      toast.success(res.data.message || "Rule books seeded successfully!");
      fetchData();
    } catch (err) {
      console.error("Seed error:", err);
      toast.error("Failed to seed rule books");
    } finally {
      setSeeding(false);
    }
  };

  // Group rule books by sport name
  const groupedBySport = ruleBooks.reduce((acc, rb) => {
    if (!acc[rb.sportName]) acc[rb.sportName] = [];
    acc[rb.sportName].push(rb);
    return acc;
  }, {});

  // Filter
  const filteredSportNames = Object.keys(groupedBySport)
    .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
    .filter((name) => !filterSport || name === filterSport)
    .sort();

  const stats = {
    total: ruleBooks.length,
    sports: Object.keys(groupedBySport).length,
    levels: LEVELS.reduce((acc, l) => {
      acc[l] = ruleBooks.filter((rb) => rb.level === l).length;
      return acc;
    }, {}),
  };

  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

  const renderValue = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "boolean")
      return (
        <span className={`text-xs font-bold ${val ? "text-green-600" : "text-gray-400"}`}>
          {val ? "Yes" : "No"}
        </span>
      );
    return <span className="text-sm font-semibold text-gray-800">{val}</span>;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Sport Rule Books
          </h1>
          <p className="text-gray-500 mt-1">
            Locked rules for each sport at every tournament level
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-semibold text-sm hover:bg-amber-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <SparklesIcon className={`h-4 w-4 ${seeding ? "animate-spin" : ""}`} />
            {seeding ? "Seeding..." : "Seed Rule Books"}
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
          >
            <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Rules</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sports</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.sports}</p>
        </div>
        {LEVELS.map((level) => (
          <div key={level} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{level}</p>
            <p className={`text-2xl font-bold mt-1 ${levelColors[level]?.split(" ")[1] || "text-gray-600"}`}>
              {stats.levels[level]}
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
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className="pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
          >
            <option value="">All Sports</option>
            {sports.map((s) => (
              <option key={s._id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all"
          >
            <option value="">All Levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : filteredSportNames.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BookOpenIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-semibold">No rule books found</p>
          <p className="text-gray-300 text-sm mt-1">
            Click "Seed Rule Books" to generate rules for all 15 sports
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSportNames.map((sportName) => {
            const sportRules = groupedBySport[sportName]
              .filter((rb) => !filterLevel || rb.level === filterLevel)
              .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level));

            if (sportRules.length === 0) return null;

            const isExpanded = expandedSport === sportName;

            return (
              <div
                key={sportName}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Sport Header - Clickable */}
                <button
                  onClick={() => setExpandedSport(isExpanded ? null : sportName)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-200">
                      {sportName.charAt(0)}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900">{sportName}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sportRules.length} level{sportRules.length !== 1 ? "s" : ""} configured
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Level badges */}
                    <div className="hidden sm:flex items-center gap-2">
                      {sportRules.map((rb) => (
                        <span
                          key={rb.level}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${levelColors[rb.level]}`}
                        >
                          {rb.level}
                        </span>
                      ))}
                    </div>
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content - Level Cards */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
                      {sportRules.map((rb) => (
                        <div
                          key={rb._id}
                          onClick={() => setSelectedRuleBook(rb)}
                          className={`rounded-xl border-2 ${levelBorder[rb.level]} p-4 cursor-pointer hover:shadow-md transition-all group`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${levelColors[rb.level]}`}>
                              {rb.level}
                            </span>
                            <LockClosedIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                          </div>

                          <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[2rem]">
                            {rb.description || "No description"}
                          </p>

                          {/* Quick stats */}
                          <div className="space-y-1.5">
                            {rb.format?.totalSets && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Sets</span>
                                <span className="font-semibold text-gray-700">{rb.format.totalSets}</span>
                              </div>
                            )}
                            {rb.format?.pointsPerSet && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Points/Set</span>
                                <span className="font-semibold text-gray-700">{rb.format.pointsPerSet}</span>
                              </div>
                            )}
                            {rb.format?.oversCount && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Overs</span>
                                <span className="font-semibold text-gray-700">{rb.format.oversCount}</span>
                              </div>
                            )}
                            {rb.format?.halvesCount && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Halves</span>
                                <span className="font-semibold text-gray-700">{rb.format.halvesCount}</span>
                              </div>
                            )}
                            {rb.format?.quartersCount && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Quarters</span>
                                <span className="font-semibold text-gray-700">{rb.format.quartersCount}</span>
                              </div>
                            )}
                            {rb.rules?.maxPlayersPerTeam && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Players</span>
                                <span className="font-semibold text-gray-700">{rb.rules.maxPlayersPerTeam}</span>
                              </div>
                            )}
                            {rb.rules?.umpiresCount != null && rb.rules.umpiresCount > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Umpires</span>
                                <span className="font-semibold text-gray-700">{rb.rules.umpiresCount}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                              View Full Rules →
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rule Book Detail Modal */}
      {selectedRuleBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">
                    {selectedRuleBook.sportName}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${levelColors[selectedRuleBook.level]}`}>
                    {selectedRuleBook.level}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <LockClosedIcon className="h-3 w-3" />
                  {selectedRuleBook.description || "Official locked rule book"}
                </p>
              </div>
              <button
                onClick={() => setSelectedRuleBook(null)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* Match Format Section */}
              <RuleSection
                title="Match Format"
                data={selectedRuleBook.format}
                formatLabel={formatLabel}
                renderValue={renderValue}
              />

              {/* Rules Section */}
              <RuleSection
                title="Rules & Officials"
                data={selectedRuleBook.rules}
                formatLabel={formatLabel}
                renderValue={renderValue}
              />

              {/* Equipment Section */}
              <RuleSection
                title="Equipment"
                data={selectedRuleBook.equipment}
                formatLabel={formatLabel}
                renderValue={renderValue}
              />

              {/* Lock Notice */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <ShieldCheckIcon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">
                    This rule book is locked and cannot be edited by managers.
                  </p>
                  <p className="text-[10px] text-amber-600 mt-1">
                    When a manager creates a tournament with {selectedRuleBook.sportName} at {selectedRuleBook.level} level,
                    these rules are automatically attached and enforced.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Reusable section for format/rules/equipment
function RuleSection({ title, data, formatLabel, renderValue }) {
  if (!data) return null;

  const entries = Object.entries(data).filter(
    ([k, v]) => v !== null && v !== undefined && k !== "_id"
  );

  if (entries.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest italic mb-3">
        {title}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.map(([key, val]) => (
          <div
            key={key}
            className="bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100"
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {formatLabel(key)}
            </p>
            <div className="mt-0.5">{renderValue(val)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
