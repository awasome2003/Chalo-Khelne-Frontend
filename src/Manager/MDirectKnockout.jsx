import { toast } from "react-toastify";
import { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Trophy, Users, Swords, Clock, ChevronRight, Plus, X, Search,
  RotateCcw, Upload, Check, AlertCircle, Zap, Target, Crown, Trash2
} from "lucide-react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import BulkScoreUploadModal from "./BulkScoreUploadModal";

const DRAW_SIZES = [16, 32, 64];

export default function MDirectKnockout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const tournamentId = searchParams.get("tournamentId");

  // State
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchesByRound, setMatchesByRound] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("setup"); // bracket | setup | scoring

  // Setup state
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [drawSize, setDrawSize] = useState(16);
  const [searchQuery, setSearchQuery] = useState("");
  const [generating, setGenerating] = useState(false);

  // Scoring state
  const [activeMatch, setActiveMatch] = useState(null);
  const [p1Score, setP1Score] = useState("");
  const [p2Score, setP2Score] = useState("");
  const [scoringLoading, setScoringLoading] = useState(false);

  // Bulk upload
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Match Detail Modal
  const [detailMatch, setDetailMatch] = useState(null);

  // Fetch data
  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
      fetchMatches();
      fetchRegisteredPlayers();
    }
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      const res = await axios.get(`/api/tournaments/${tournamentId}`);
      if (res.data) setTournament(res.data.tournament || res.data);
    } catch { }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/tournaments/direct-knockout/${tournamentId}/matches`);
      if (res.data.success) {
        setMatches(res.data.matches || []);
        setMatchesByRound(res.data.matchesByRound || {});
      }
    } catch { } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredPlayers = async () => {
    try {
      const res = await axios.get(`/api/tournaments/bookings/tournament/${tournamentId}`);
      if (res.data?.success || res.data?.bookings) {
        const bookings = res.data.bookings || res.data.data || [];
        // Extract player info from confirmed bookings
        const players = bookings
          .filter((b) => b.status === "confirmed")
          .map((b) => ({
            playerId: b.userId?._id || b.userId,
            userName: b.userName || b.userId?.name || "Unknown",
            _id: b.userId?._id || b.userId,
            category: b.category,
          }));
        setRegisteredPlayers(players);
      }
    } catch { }
  };

  // Player selection
  const togglePlayer = (player) => {
    const id = player.playerId || player._id;
    if (selectedPlayers.find((p) => (p.playerId || p._id) === id)) {
      setSelectedPlayers((prev) => prev.filter((p) => (p.playerId || p._id) !== id));
    } else {
      if (selectedPlayers.length >= drawSize) {
        toast.info(`You can only select exactly ${drawSize} players for a ${drawSize}-draw. Remove a player first or change draw size.`);
        return;
      }
      setSelectedPlayers((prev) => [...prev, player]);
    }
  };

  const selectAll = () => {
    const filtered = getFilteredPlayers();
    if (selectedPlayers.length === filtered.length && filtered.length === drawSize) {
      setSelectedPlayers([]);
    } else if (filtered.length === drawSize) {
      setSelectedPlayers(filtered);
    } else if (filtered.length > drawSize) {
      toast.info(`Can only select exactly ${drawSize} players. ${filtered.length} available — adjust draw size or filter.`);
      setSelectedPlayers(filtered.slice(0, drawSize));
    } else {
      setSelectedPlayers(filtered);
    }
  };

  const getFilteredPlayers = () => {
    if (!searchQuery.trim()) return registeredPlayers;
    const q = searchQuery.toLowerCase();
    return registeredPlayers.filter(
      (p) =>
        (p.userName || p.playerName || p.name || "").toLowerCase().includes(q)
    );
  };

  // Generate bracket
  const handleGenerate = async () => {
    if (selectedPlayers.length < 2) {
      toast.warn("Select at least 2 players");
      return;
    }

    if (selectedPlayers.length !== drawSize) {
      toast.info(`You must select exactly ${drawSize} players for a ${drawSize}-draw. Currently selected: ${selectedPlayers.length}`);
      return;
    }

    setGenerating(true);
    try {
      const players = selectedPlayers.map((p) => ({
        playerId: p.playerId || p._id,
        userName: p.userName || p.playerName || p.name,
      }));

      const res = await axios.post("/api/tournaments/direct-knockout/standalone/create", {
        tournamentId,
        players,
        drawSize,
        schedule: {
          startDate: new Date().toISOString().split("T")[0],
          startTime: "10:00",
          intervalMinutes: 30,
          courtNumber: "1",
        },
      });

      if (res.data.success) {
        toast.info(`Bracket created! ${res.data.bracket.totalMatches} matches across ${res.data.bracket.totalRounds} rounds`);
        setActiveTab("bracket");
        fetchMatches();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Reset bracket
  const handleReset = async () => {
    if (!confirm("Reset entire bracket? All match data will be lost.")) return;
    try {
      await axios.delete(`/api/tournaments/direct-knockout/${tournamentId}/reset`);
      setMatches([]);
      setMatchesByRound({});
      toast.success("Bracket reset");
    } catch (err) {
      toast.error("Failed to reset");
    }
  };

  // Score a game
  const handleCompleteGame = async () => {
    if (!activeMatch || !p1Score || !p2Score) return;
    if (Number(p1Score) === Number(p2Score)) {
      toast.warn("Scores cannot be tied");
      return;
    }

    setScoringLoading(true);
    try {
      const res = await axios.post(
        `/api/tournaments/direct-knockout/matches/${activeMatch.matchId}/complete-game`,
        { player1Score: Number(p1Score), player2Score: Number(p2Score) }
      );

      if (res.data.success) {
        setP1Score("");
        setP2Score("");

        // Update activeMatch with fresh data from response
        const updatedMatch = res.data.match;
        setActiveMatch((prev) => ({
          ...prev,
          currentSet: updatedMatch.currentSet,
          currentGame: updatedMatch.currentGame,
          sets: updatedMatch.sets,
          status: updatedMatch.status,
          result: updatedMatch.result,
        }));

        if (updatedMatch.status === "COMPLETED") {
          toast.info(`Match complete! Winner: ${updatedMatch.result?.winner?.playerName}`);
        }
        fetchMatches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setScoringLoading(false);
    }
  };

  // Round display helpers
  const getRoundDisplayName = (roundName) => {
    const names = {
      "round-of-64": "Round of 64",
      "round-of-32": "Round of 32",
      "round-of-16": "Round of 16",
      "round-of-8": "Quarter-Finals",
      "quarter-final": "Quarter-Finals",
      "semi-final": "Semi-Finals",
      final: "Final",
    };
    return names[roundName] || roundName;
  };

  const getStatusBadge = (status) => {
    const styles = {
      SCHEDULED: "bg-orange-100 text-orange-600",
      IN_PROGRESS: "bg-yellow-100 text-yellow-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELLED: "bg-gray-100 text-gray-500",
    };
    return styles[status] || "bg-gray-100 text-gray-500";
  };

  // BYE handler
  const [byeLoading, setByeLoading] = useState(null);

  const handleGiveBye = async (match, byePlayerId, byePlayerName, winnerName) => {
    if (!confirm(`Give BYE to "${byePlayerName}"?\n\n"${winnerName}" will advance automatically.`)) return;

    setByeLoading(match.matchId);
    try {
      const res = await axios.post(
        `/api/tournaments/direct-knockout/matches/${match.matchId}/bye`,
        { byePlayerId }
      );
      if (res.data.success) {
        toast.info(res.data.message);
        fetchMatches();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setByeLoading(null);
    }
  };

  const hasBracket = matches.length > 0;
  const pendingMatches = matches.filter((m) => m.status !== "COMPLETED" && m.player1?.playerId && m.player2?.playerId);
  const completedCount = matches.filter((m) => m.status === "COMPLETED").length;
  const champion = matches.find((m) => m.round === "final" && m.status === "COMPLETED")?.result?.winner;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-orange-500" size={28} />
            Singles Knockout
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {tournament?.title || "Tournament"} • Direct Elimination Bracket
          </p>
        </div>
        <div className="flex gap-2">
          {hasBracket && (
            <>
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 w-auto"
              >
                <Upload size={16} />
                Bulk Score
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 border border-red-200 w-auto"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Champion Banner */}
      {champion && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-6 mb-6 text-white flex items-center gap-4">
          <Crown size={40} />
          <div>
            <p className="text-sm font-medium opacity-80">Tournament Champion</p>
            <h2 className="text-2xl font-bold">{champion.playerName}</h2>
          </div>
        </div>
      )}

      {/* Stats Row */}
      {hasBracket && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Total Matches</p>
            <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-orange-500">{matches.length - completedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500">Rounds</p>
            <p className="text-2xl font-bold text-emerald-600">{Object.keys(matchesByRound).length}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {["setup", "bracket", "scoring"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all w-auto ${activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab === "setup" && "Setup Draw"}
            {tab === "bracket" && "Bracket"}
            {tab === "scoring" && "Live Scoring"}
          </button>
        ))}
      </div>

      {/* TAB: Bracket View */}
      {activeTab === "bracket" && (
        <div>
          {!hasBracket ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <Swords size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Bracket Generated</h3>
              <p className="text-gray-400 mb-4">Go to "Setup Draw" to create the knockout bracket</p>
              <button
                onClick={() => setActiveTab("setup")}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-[#003d75] w-auto"
              >
                Setup Draw
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(matchesByRound).map(([roundName, roundMatches]) => (
                <div key={roundName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Round Header */}
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">{getRoundDisplayName(roundName)}</h3>
                    <span className="text-xs text-gray-500">
                      {roundMatches.filter((m) => m.status === "COMPLETED").length}/{roundMatches.length} completed
                    </span>
                  </div>

                  {/* Matches Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
                    {roundMatches.map((match) => (
                      <div
                        key={match._id}
                        className={`rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md ${match.status === "COMPLETED"
                            ? "border-green-200 bg-green-50/30"
                            : match.player1?.playerId && match.player2?.playerId
                              ? "border-orange-200 bg-orange-50/30"
                              : "border-gray-200 bg-gray-50/30 opacity-60"
                          }`}
                        onClick={() => setDetailMatch(match)}
                      >
                        {/* Match Number + Status */}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            M{match.matchNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(match.status)}`}>
                            {match.status}
                          </span>
                        </div>

                        {/* Player 1 */}
                        <div className={`flex justify-between items-center py-1.5 ${match.result?.winner?.playerName === match.player1?.playerName ? "font-bold" : ""
                          }`}>
                          <span className="text-sm text-gray-800 truncate flex-1">
                            {match.result?.winner?.playerName === match.player1?.playerName && "🏆 "}
                            {match.player1?.playerName || "TBD"}
                          </span>
                          <div className="flex items-center gap-1 ml-1">
                            {match.status === "COMPLETED" && (
                              <span className="text-sm font-bold text-gray-600">
                                {match.result?.finalScore?.player1Sets || 0}
                              </span>
                            )}
                            {match.status !== "COMPLETED" && match.player1?.playerId && match.player2?.playerId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGiveBye(match, match.player1.playerId?._id || match.player1.playerId, match.player1.playerName, match.player2.playerName);
                                }}
                                disabled={byeLoading === match.matchId}
                                className="text-[9px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded border border-red-200 w-auto"
                                title={`Give BYE to ${match.player1?.playerName}`}
                              >
                                {byeLoading === match.matchId ? "..." : "BYE"}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="h-px bg-gray-200 my-1" />

                        {/* Player 2 */}
                        <div className={`flex justify-between items-center py-1.5 ${match.result?.winner?.playerName === match.player2?.playerName ? "font-bold" : ""
                          }`}>
                          <span className="text-sm text-gray-800 truncate flex-1">
                            {match.result?.winner?.playerName === match.player2?.playerName && "🏆 "}
                            {match.player2?.playerName || "TBD"}
                          </span>
                          <div className="flex items-center gap-1 ml-1">
                            {match.status === "COMPLETED" && (
                              <span className="text-sm font-bold text-gray-600">
                                {match.result?.finalScore?.player2Sets || 0}
                              </span>
                            )}
                            {match.status !== "COMPLETED" && match.player1?.playerId && match.player2?.playerId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGiveBye(match, match.player2.playerId?._id || match.player2.playerId, match.player2.playerName, match.player1.playerName);
                                }}
                                disabled={byeLoading === match.matchId}
                                className="text-[9px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded border border-red-200 w-auto"
                                title={`Give BYE to ${match.player2?.playerName}`}
                              >
                                {byeLoading === match.matchId ? "..." : "BYE"}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* BYE Note */}
                        {match.notes?.includes("BYE") && (
                          <div className="mt-1 text-[9px] text-orange-600 bg-orange-50 rounded px-2 py-0.5 text-center font-medium">
                            {match.notes}
                          </div>
                        )}

                        {/* Court + Time */}
                        <div className="flex gap-2 mt-2 text-[10px] text-gray-400">
                          <span>Court {match.courtNumber || "TBD"}</span>
                          <span>•</span>
                          <span>{match.matchStartTime ? new Date(match.matchStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Setup Draw */}
      {activeTab === "setup" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={20} /> Setup Knockout Draw
          </h3>

          {/* Draw Size Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 mb-2 block">Draw Size</label>
            <div className="flex gap-2">
              {DRAW_SIZES.map((size) => {
                const tooSmall = selectedPlayers.length > size;
                return (
                  <button
                    key={size}
                    onClick={() => !tooSmall && setDrawSize(size)}
                    disabled={tooSmall}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all w-auto ${tooSmall
                        ? "bg-red-50 text-red-300 border-2 border-red-200 cursor-not-allowed"
                        : drawSize === size
                          ? "bg-orange-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {size} Draw
                    {tooSmall && (
                      <span className="block text-[9px] font-normal mt-0.5">
                        Max {size} players
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-1">
              <span className={selectedPlayers.length === drawSize ? "text-green-600 font-semibold" : "text-gray-400"}>
                {selectedPlayers.length}/{drawSize} players selected
              </span>
              {selectedPlayers.length !== drawSize && selectedPlayers.length > 0 && (
                <span className="text-orange-500 font-semibold">
                  {" "}— Need exactly {drawSize} players ({drawSize - selectedPlayers.length > 0 ? `${drawSize - selectedPlayers.length} more` : `remove ${selectedPlayers.length - drawSize}`})
                </span>
              )}
              {selectedPlayers.length === drawSize && " ✓ Ready to generate"}
            </p>
          </div>

          {/* Search + Select All */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              />
            </div>
            <button
              onClick={selectAll}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 w-auto"
            >
              {selectedPlayers.length === getFilteredPlayers().length ? "Deselect All" : "Select All"}
            </button>
          </div>

          {/* Player Grid */}
          <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-xl">
            {getFilteredPlayers().length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Users size={32} className="mx-auto mb-2" />
                <p>No registered players found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {getFilteredPlayers().map((player, idx) => {
                  const id = player.playerId || player._id;
                  const isSelected = selectedPlayers.some((p) => (p.playerId || p._id) === id);
                  const name = player.userName || player.playerName || player.name || `Player ${idx + 1}`;

                  return (
                    <div
                      key={id || idx}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? "bg-orange-50" : "hover:bg-gray-50"
                        }`}
                      onClick={() => togglePlayer(player)}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-orange-500 border-orange-500" : "border-gray-300"
                        }`}>
                        {isSelected && <Check size={14} color="white" />}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{name}</p>
                      </div>
                      {isSelected && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                          Seed {selectedPlayers.findIndex((p) => (p.playerId || p._id) === id) + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={selectedPlayers.length !== drawSize || generating}
            className="mt-6 w-full py-3 bg-gradient-to-r from-orange-500 to-[#0071d2] text-white rounded-xl font-bold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Zap size={18} />
                {selectedPlayers.length === drawSize
                  ? `Generate ${drawSize}-Draw Bracket (${selectedPlayers.length} players)`
                  : `Select exactly ${drawSize} players (${drawSize - selectedPlayers.length} more needed)`
                }
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB: Live Scoring */}
      {activeTab === "scoring" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Match List */}
          <div className="col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="font-bold text-gray-800 text-sm">Ready to Score</h4>
            </div>
            <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
              {pendingMatches.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  No matches ready to score
                </div>
              ) : (
                pendingMatches.map((match) => (
                  <div
                    key={match._id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${activeMatch?.matchId === match.matchId ? "bg-orange-50 border-l-4 border-l-orange-500" : "hover:bg-gray-50"
                      }`}
                    onClick={async () => {
                      // Fetch fresh match data
                      try {
                        const res = await axios.get(`/api/tournaments/direct-knockout/${tournamentId}/matches`);
                        if (res.data.success) {
                          const fresh = res.data.matches.find((m) => m.matchId === match.matchId);
                          setActiveMatch(fresh || match);
                        } else {
                          setActiveMatch(match);
                        }
                      } catch {
                        setActiveMatch(match);
                      }
                      setP1Score("");
                      setP2Score("");
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {getRoundDisplayName(match.round)} • M{match.matchNumber}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">
                      {match.player1?.playerName} vs {match.player2?.playerName}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scoring Panel */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            {!activeMatch ? (
              <div className="text-center py-12 text-gray-400">
                <Swords size={48} className="mx-auto mb-3" />
                <p>Select a match to start scoring</p>
              </div>
            ) : (() => {
              const mf = activeMatch.matchFormat || {};
              const maxSets = mf.maxSets || tournament?.matchFormat?.totalSets || 5;
              const setsToWin = mf.setsToWin || Math.ceil(maxSets / 2);
              const pointsToWin = mf.pointsToWinGame || null;
              const sets = activeMatch.sets || [];
              const p1Name = activeMatch.player1?.playerName || "Player 1";
              const p2Name = activeMatch.player2?.playerName || "Player 2";
              const gamesPerSet = mf.gamesToWin || 3;

              // Count set wins
              const p1SetsWon = sets.filter(s => s.winner?.playerName === p1Name).length;
              const p2SetsWon = sets.filter(s => s.winner?.playerName === p2Name).length;

              return (
                <div>
                  {/* Match Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-[#0059aa] px-6 py-4 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-orange-200 font-medium uppercase tracking-wider">
                          {getRoundDisplayName(activeMatch.round)} • Match {activeMatch.matchNumber}
                        </p>
                        <p className="text-sm text-orange-100 mt-0.5">
                          Best of {maxSets} sets • {gamesPerSet} games per set • {pointsToWin} points per game
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${activeMatch.status === "IN_PROGRESS" ? "bg-yellow-500 text-yellow-900" : "bg-orange-400/30 text-orange-100"
                          }`}>
                          {activeMatch.status === "IN_PROGRESS" ? "LIVE" : activeMatch.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scoreboard Table */}
                  <div className="px-6 pt-4">
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Header Row */}
                      <div className="grid bg-gray-50 border-b border-gray-200" style={{ gridTemplateColumns: `1fr repeat(${maxSets}, 56px) 60px` }}>
                        <div className="px-4 py-2.5 text-xs font-bold text-gray-500 uppercase">Player</div>
                        {Array.from({ length: maxSets }, (_, i) => (
                          <div key={i} className={`text-center py-2.5 text-xs font-bold border-l border-gray-200 ${(activeMatch.currentSet || 1) === i + 1 ? "bg-orange-50 text-orange-600" : "text-gray-400"
                            }`}>
                            S{i + 1}
                          </div>
                        ))}
                        <div className="text-center py-2.5 text-xs font-bold text-gray-700 border-l-2 border-gray-300 bg-gray-100">
                          SETS
                        </div>
                      </div>

                      {/* Player 1 Row */}
                      <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: `1fr repeat(${maxSets}, 56px) 60px` }}>
                        <div className="px-4 py-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
                            {p1Name[0]}
                          </div>
                          <span className="text-sm font-semibold text-gray-900 truncate">{p1Name}</span>
                        </div>
                        {Array.from({ length: maxSets }, (_, i) => {
                          const set = sets[i];
                          const isCurrentSet = (activeMatch.currentSet || 1) === i + 1 && activeMatch.status !== "COMPLETED";
                          const p1GamesWon = set ? (set.games || []).filter(g => g.winner?.playerName === p1Name).length : 0;
                          const isWinner = set?.winner?.playerName === p1Name;
                          const isLoser = set?.status === "COMPLETED" && !isWinner;

                          return (
                            <div key={i} className={`text-center py-3 text-sm font-bold border-l border-gray-200 ${isCurrentSet ? "bg-orange-50 text-orange-600 animate-pulse" :
                                isWinner ? "bg-green-50 text-green-700" :
                                  isLoser ? "text-red-400" :
                                    !set ? "text-gray-300" : "text-gray-600"
                              }`}>
                              {set ? p1GamesWon : "-"}
                            </div>
                          );
                        })}
                        <div className={`text-center py-3 text-lg font-black border-l-2 border-gray-300 ${p1SetsWon >= setsToWin ? "bg-green-100 text-green-700" : "text-gray-800"
                          }`}>
                          {p1SetsWon}
                        </div>
                      </div>

                      {/* Player 2 Row */}
                      <div className="grid" style={{ gridTemplateColumns: `1fr repeat(${maxSets}, 56px) 60px` }}>
                        <div className="px-4 py-3 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-700 flex-shrink-0">
                            {p2Name[0]}
                          </div>
                          <span className="text-sm font-semibold text-gray-900 truncate">{p2Name}</span>
                        </div>
                        {Array.from({ length: maxSets }, (_, i) => {
                          const set = sets[i];
                          const isCurrentSet = (activeMatch.currentSet || 1) === i + 1 && activeMatch.status !== "COMPLETED";
                          const p2GamesWon = set ? (set.games || []).filter(g => g.winner?.playerName === p2Name).length : 0;
                          const isWinner = set?.winner?.playerName === p2Name;
                          const isLoser = set?.status === "COMPLETED" && !isWinner;

                          return (
                            <div key={i} className={`text-center py-3 text-sm font-bold border-l border-gray-200 ${isCurrentSet ? "bg-orange-50 text-orange-700 animate-pulse" :
                                isWinner ? "bg-green-50 text-green-700" :
                                  isLoser ? "text-red-400" :
                                    !set ? "text-gray-300" : "text-gray-600"
                              }`}>
                              {set ? p2GamesWon : "-"}
                            </div>
                          );
                        })}
                        <div className={`text-center py-3 text-lg font-black border-l-2 border-gray-300 ${p2SetsWon >= setsToWin ? "bg-green-100 text-green-700" : "text-gray-800"
                          }`}>
                          {p2SetsWon}
                        </div>
                      </div>
                    </div>

                    {/* Current Set Detail — game scores */}
                    {sets.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Game Scores</h5>
                        <div className="flex flex-wrap gap-2">
                          {sets.map((set) => (
                            <div key={set.setNumber} className={`border rounded-lg px-3 py-2 text-center min-w-[80px] ${set.status === "COMPLETED"
                                ? set.winner?.playerName === p1Name ? "border-orange-200 bg-orange-50" : "border-orange-200 bg-orange-50"
                                : "border-gray-200 bg-gray-50"
                              }`}>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Set {set.setNumber}</p>
                              {set.games?.map((game) => (
                                <p key={game.gameNumber} className="text-xs font-mono font-bold text-gray-700">
                                  {game.finalScore?.player1 || 0} - {game.finalScore?.player2 || 0}
                                </p>
                              ))}
                              {set.winner && (
                                <p className={`text-[9px] font-bold mt-1 ${set.winner.playerName === p1Name ? "text-orange-500" : "text-orange-600"
                                  }`}>
                                  {set.winner.playerName?.split(" ")[0]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score Input */}
                  {activeMatch.status !== "COMPLETED" && (
                    <div className="px-6 py-4 border-t border-gray-100 mt-4 bg-gray-50">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                        Enter Game Score — Set {activeMatch.currentSet || 1}, Game {activeMatch.currentGame || 1}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-orange-500 uppercase mb-1 block">{p1Name.split(" ")[0]}</label>
                          <input
                            type="number"
                            min="0"
                            value={p1Score}
                            onChange={(e) => setP1Score(e.target.value)}
                            placeholder="0"
                            className="w-full text-center text-2xl font-bold py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
                          />
                        </div>
                        <div className="text-gray-400 font-bold text-lg pt-5">vs</div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-orange-600 uppercase mb-1 block">{p2Name.split(" ")[0]}</label>
                          <input
                            type="number"
                            min="0"
                            value={p2Score}
                            onChange={(e) => setP2Score(e.target.value)}
                            placeholder="0"
                            className="w-full text-center text-2xl font-bold py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
                          />
                        </div>
                        <button
                          onClick={handleCompleteGame}
                          disabled={!p1Score || !p2Score || scoringLoading}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 mt-5 w-auto"
                        >
                          {scoringLoading ? "..." : <><Check size={16} /> Save</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Match Complete Banner */}
                  {activeMatch.status === "COMPLETED" && activeMatch.result?.winner && (
                    <div className="mx-6 my-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white text-center">
                      <Crown size={24} className="mx-auto mb-1" />
                      <p className="text-sm font-medium opacity-80">Match Winner</p>
                      <p className="text-xl font-bold">{activeMatch.result.winner.playerName}</p>
                      <p className="text-sm opacity-80 mt-1">
                        {activeMatch.result.finalScore?.player1Sets} - {activeMatch.result.finalScore?.player2Sets}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Bulk Score Upload Modal */}
      <BulkScoreUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={() => fetchMatches()}
        matches={matches.filter((m) => m.status !== "COMPLETED" && m.player1?.playerId && m.player2?.playerId)}
        tournamentId={tournamentId}
        matchType="player"
        maxSets={tournament?.matchFormat?.totalSets || 5}
        setsToWin={Math.ceil((tournament?.matchFormat?.totalSets || 5) / 2)}
        title="Bulk Score Upload — Singles Knockout"
      />

      {/* Match Detail Modal */}
      {detailMatch && (() => {
        const dm = detailMatch;
        const mf = dm.matchFormat || {};
        const maxSetsD = mf.maxSets || 5;
        const setsToWinD = mf.setsToWin || 3;
        const gamesToWinD = mf.gamesToWin || 3;
        const pointsD = mf.pointsToWinGame || null;
        const setsD = dm.sets || [];
        const p1 = dm.player1?.playerName || "TBD";
        const p2 = dm.player2?.playerName || "TBD";
        const p1SW = setsD.filter(s => s.winner?.playerName === p1).length;
        const p2SW = setsD.filter(s => s.winner?.playerName === p2).length;
        const isCompleted = dm.status === "COMPLETED";
        const isBye = dm.notes?.includes("BYE");

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailMatch(null)}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className={`px-6 py-4 text-white ${isCompleted ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-orange-500 to-[#0059aa]"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium opacity-80 uppercase tracking-wider">
                      {getRoundDisplayName(dm.round)} • Match {dm.matchNumber}
                    </p>
                    <p className="text-lg font-bold mt-1">{p1} vs {p2}</p>
                    <p className="text-xs opacity-70 mt-0.5">
                      Best of {maxSetsD} sets • {gamesToWinD} games/set • {pointsD} pts/game
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isCompleted ? "bg-white/20" : dm.status === "IN_PROGRESS" ? "bg-yellow-500 text-yellow-900" : "bg-white/20"
                    }`}>
                      {isBye ? "BYE" : dm.status}
                    </span>
                    <button onClick={() => setDetailMatch(null)} className="text-white/80 hover:text-white w-auto">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-5">
                {/* Match Info Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Court</p>
                    <p className="text-lg font-bold text-gray-800">{dm.courtNumber || "TBD"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Time</p>
                    <p className="text-sm font-bold text-gray-800">
                      {dm.matchStartTime ? new Date(dm.matchStartTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "TBD"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Bracket</p>
                    <p className="text-lg font-bold text-gray-800">{dm.bracketPosition || "-"}</p>
                  </div>
                </div>

                {/* BYE Notice */}
                {isBye && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                    <p className="text-orange-700 font-semibold">{dm.notes}</p>
                  </div>
                )}

                {/* Winner Banner */}
                {isCompleted && dm.result?.winner && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Crown size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium">Winner</p>
                        <p className="font-bold text-green-800">{dm.result.winner.playerName}</p>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-green-700">
                      {dm.result.finalScore?.player1Sets} - {dm.result.finalScore?.player2Sets}
                    </div>
                  </div>
                )}

                {/* Scoreboard Table */}
                {setsD.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Scoreboard</h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Header */}
                      <div className="grid bg-gray-50 border-b border-gray-200" style={{ gridTemplateColumns: `1fr repeat(${maxSetsD}, 50px) 55px` }}>
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Player</div>
                        {Array.from({ length: maxSetsD }, (_, i) => (
                          <div key={i} className="text-center py-2 text-[10px] font-bold text-gray-400 border-l border-gray-200">S{i + 1}</div>
                        ))}
                        <div className="text-center py-2 text-[10px] font-bold text-gray-700 border-l-2 border-gray-300 bg-gray-100">SETS</div>
                      </div>
                      {/* Player 1 */}
                      <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: `1fr repeat(${maxSetsD}, 50px) 55px` }}>
                        <div className="px-3 py-2.5 text-sm font-semibold text-gray-900 truncate">{p1}</div>
                        {Array.from({ length: maxSetsD }, (_, i) => {
                          const set = setsD[i];
                          const gw = set ? (set.games || []).filter(g => g.winner?.playerName === p1).length : 0;
                          const won = set?.winner?.playerName === p1;
                          return (
                            <div key={i} className={`text-center py-2.5 text-sm font-bold border-l border-gray-200 ${won ? "bg-green-50 text-green-700" : set?.status === "COMPLETED" ? "text-red-400" : !set ? "text-gray-300" : "text-gray-600"}`}>
                              {set ? gw : "-"}
                            </div>
                          );
                        })}
                        <div className={`text-center py-2.5 text-lg font-black border-l-2 border-gray-300 ${p1SW >= setsToWinD ? "bg-green-100 text-green-700" : "text-gray-800"}`}>{p1SW}</div>
                      </div>
                      {/* Player 2 */}
                      <div className="grid" style={{ gridTemplateColumns: `1fr repeat(${maxSetsD}, 50px) 55px` }}>
                        <div className="px-3 py-2.5 text-sm font-semibold text-gray-900 truncate">{p2}</div>
                        {Array.from({ length: maxSetsD }, (_, i) => {
                          const set = setsD[i];
                          const gw = set ? (set.games || []).filter(g => g.winner?.playerName === p2).length : 0;
                          const won = set?.winner?.playerName === p2;
                          return (
                            <div key={i} className={`text-center py-2.5 text-sm font-bold border-l border-gray-200 ${won ? "bg-green-50 text-green-700" : set?.status === "COMPLETED" ? "text-red-400" : !set ? "text-gray-300" : "text-gray-600"}`}>
                              {set ? gw : "-"}
                            </div>
                          );
                        })}
                        <div className={`text-center py-2.5 text-lg font-black border-l-2 border-gray-300 ${p2SW >= setsToWinD ? "bg-green-100 text-green-700" : "text-gray-800"}`}>{p2SW}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Game-by-Game Scores */}
                {setsD.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Game Scores</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {setsD.map((set) => (
                        <div key={set.setNumber} className={`border rounded-xl p-3 ${
                          set.winner?.playerName === p1 ? "border-orange-200 bg-orange-50/50" : set.winner?.playerName === p2 ? "border-orange-200 bg-orange-50/50" : "border-gray-200 bg-gray-50"
                        }`}>
                          <p className="text-[10px] font-bold text-gray-400 uppercase text-center mb-2">Set {set.setNumber}</p>
                          <div className="space-y-1">
                            {(set.games || []).map((game) => {
                              const p1Won = game.winner?.playerName === p1;
                              return (
                                <div key={game.gameNumber} className="flex justify-center items-center gap-1 text-xs font-mono">
                                  <span className={`font-bold ${p1Won ? "text-green-700" : "text-red-400"}`}>{game.finalScore?.player1 ?? 0}</span>
                                  <span className="text-gray-300">-</span>
                                  <span className={`font-bold ${!p1Won ? "text-green-700" : "text-red-400"}`}>{game.finalScore?.player2 ?? 0}</span>
                                </div>
                              );
                            })}
                          </div>
                          {set.winner && (
                            <p className={`text-[9px] font-bold mt-2 text-center ${
                              set.winner.playerName === p1 ? "text-orange-500" : "text-orange-600"
                            }`}>
                              {set.winner.playerName?.split(" ")[0]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No scores yet */}
                {setsD.length === 0 && !isBye && (
                  <div className="text-center py-8 text-gray-400">
                    <Clock size={32} className="mx-auto mb-2" />
                    <p className="text-sm">No scores recorded yet</p>
                    <p className="text-xs mt-1">This match is {dm.status.toLowerCase()}</p>
                  </div>
                )}

                {/* Next Match Info */}
                {dm.nextMatchId && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Winner advances to</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{dm.nextMatchId.replace(`DK-${tournamentId}-`, "").replace("R", "Round ").replace("M", " Match ")}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 px-6 py-3 flex justify-between items-center bg-gray-50">
                {!isCompleted && dm.player1?.playerId && dm.player2?.playerId && (
                  <button
                    onClick={() => {
                      setDetailMatch(null);
                      setActiveMatch(dm);
                      setActiveTab("scoring");
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-[#003d75] w-auto flex items-center gap-2"
                  >
                    <Target size={14} /> Score This Match
                  </button>
                )}
                <button
                  onClick={() => setDetailMatch(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 w-auto ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
