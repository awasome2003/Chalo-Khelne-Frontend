import { toast } from "react-toastify";
// TournamentList.js
import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import {
  Edit2,
  Trash2,
  Share2,
  X,
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  Type,
  Image as ImageIcon,
  DollarSign,
  AlignLeft,
  CheckCircle,
  AlertCircle,
  QrCode,
  UserPlus,
  Lock,
  Shield,
  ChevronDown,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import MCreateTournament from "./MCreateTournament";

const TournamentList = ({ onTournamentSelect, selectedTournament }) => {
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState("Live"); // Live, Upcoming, History
  const [displayData, setDisplayData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Sports & Rules state (for edit modal)
  const [sportsList, setSportsList] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [sportRules, setSportRules] = useState(null);
  const [loadingRules, setLoadingRules] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const managerId = user?._id;

        if (!managerId) {
          setTournaments([]);
          return;
        }

        const response = await axios.get(`/api/tournaments/manager/${managerId}`);
        const data = response.data.tournaments || [];
        setTournaments(data);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      }
    };

    fetchTournaments();
  }, []);

  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournament) {
      onTournamentSelect(tournaments[0]._id);
    }
  }, [tournaments, selectedTournament, onTournamentSelect]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = tournaments.filter(tournament => {
      if (!tournament.startDate) return false;

      const start = new Date(tournament.startDate);
      start.setHours(0, 0, 0, 0);

      const end = tournament.endDate ? new Date(tournament.endDate) : new Date(tournament.startDate);
      end.setHours(23, 59, 59, 999);

      if (activeTab === "Live") {
        return start <= today && end >= today;
      } else if (activeTab === "Upcoming") {
        return start > today;
      } else if (activeTab === "History") {
        return end < today;
      }
      return false;
    });

    // Sorting logic
    filtered.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);

      if (activeTab === "Upcoming") {
        return dateA - dateB; // Show soonest upcoming first
      } else {
        return dateB - dateA; // Show most recent first (Live or History)
      }
    });

    setDisplayData(filtered);
  }, [activeTab, tournaments]);

  // Fetch active sports on mount
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await axios.get("/api/sports/active");
        setSportsList(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch sports:", err);
      }
    };
    fetchSports();
  }, []);

  // When sport changes in edit form, fetch available levels
  useEffect(() => {
    if (!editFormData.sportsType) {
      setAvailableLevels([]);
      setSportRules(null);
      return;
    }

    const fetchLevels = async () => {
      try {
        const res = await axios.get(`/api/sport-rules/sport/${editFormData.sportsType}/levels`);
        setAvailableLevels(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch levels:", err);
        setAvailableLevels([]);
      }
    };
    fetchLevels();
  }, [editFormData.sportsType]);

  // When both sport and level are selected, fetch locked rules
  useEffect(() => {
    if (!editFormData.sportsType || !editFormData.tournamentLevel) {
      setSportRules(null);
      return;
    }

    const fetchRules = async () => {
      setLoadingRules(true);
      try {
        const res = await axios.get(
          `/api/sport-rules/sport/${editFormData.sportsType}/${editFormData.tournamentLevel}`
        );
        setSportRules(res.data.data || null);
      } catch (err) {
        console.error("Failed to fetch rules:", err);
        setSportRules(null);
      } finally {
        setLoadingRules(false);
      }
    };
    fetchRules();
  }, [editFormData.sportsType, editFormData.tournamentLevel]);

  // Helper: render a rule value
  const renderRuleValue = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return val;
  };

  // Helper: format label from camelCase
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/tournaments/${id}`);
      setTournaments(tournaments.filter((tournament) => tournament._id !== id));
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast.error("Failed to delete tournament");
    }
  };

  const handleEditClick = async (tournamentId, e) => {
    e.stopPropagation();

    try {
      const response = await axios.get(`/api/tournaments/${tournamentId}`);
      const tournamentData = response.data.tournament;

      const tType = (tournamentData.type || "group stage").toLowerCase();
      const formData = {
        title: tournamentData.title || "",
        hasGroupStage: tType.includes("group stage"),
        hasKnockout: tType.includes("knockout"),
        sportsType: tournamentData.sportsType || "",
        description: tournamentData.description || "",
        organizerName: tournamentData.organizerName || "",
        cancellationPolicy: tournamentData.cancellationPolicy || "NO",
        eventLocation: Array.isArray(tournamentData.eventLocation)
          ? tournamentData.eventLocation.join(", ")
          : tournamentData.eventLocation || "",
        startDate: tournamentData.startDate ? tournamentData.startDate.split('T')[0] : "",
        endDate: tournamentData.endDate ? tournamentData.endDate.split('T')[0] : "",
        termsAndConditions: tournamentData.termsAndConditions || "",
        tournamentLevel: tournamentData.tournamentLevel || "",
        groupStageFormat: tournamentData.groupStageFormat || "Singles",
        knockoutFormat: tournamentData.knockoutFormat || "Singles",
        setsFormat: tournamentData.setFormat === 3 ? "bestOf3" :
          tournamentData.setFormat === 5 ? "bestOf5" :
            tournamentData.setFormat === 7 ? "bestOf7" : "",
        category: tournamentData.category || [{ name: "Open Category", fee: 0 }],
        selectedTime: tournamentData.selectedTime || { startTime: "10:00", endTime: "18:00" },
        numTeams: tournamentData.numTeams || "",
        playerNoValue: tournamentData.playerNoValue || "2",
        setNo: tournamentData.setNo || "3",
        tournamentFee: tournamentData.tournamentFee || "0",
        qualifyPerGroup: tournamentData.qualifyPerGroup?.toString() || "2"
      };

      setEditFormData(formData);
      setEditingTournament(tournamentData);

      if (tournamentData.tournamentLogo) {
        setEditImage(`/uploads/${tournamentData.tournamentLogo}`);
      } else {
        setEditImage(null);
      }

      setShowEditModal(true);
    } catch (error) {
      console.error("Error fetching tournament details:", error);
      toast.error("Failed to load tournament details");
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...editFormData.category];
    updatedCategories[index][field] = field === "fee" ? Math.max(0, Number(value)) : value;
    setEditFormData({ ...editFormData, category: updatedCategories });
  };

  const addCategory = () => {
    setEditFormData({
      ...editFormData,
      category: [...editFormData.category, { name: "", fee: 0 }],
    });
  };

  const handleTimeChange = (field, value) => {
    setEditFormData({
      ...editFormData,
      selectedTime: {
        ...editFormData.selectedTime,
        [field]: value,
      },
    });
  };

  const handleEditImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditImageFile(file);
      setEditImage(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Compute tournament type from checkboxes
      const tournamentType = editFormData.hasGroupStage && editFormData.hasKnockout
        ? "knockout + group stage"
        : editFormData.hasKnockout
          ? "knockout"
          : editFormData.hasGroupStage
            ? "group stage"
            : "";

      if (!editFormData.title || !tournamentType || !editFormData.sportsType) {
        setError("Title, Type, and Sports Type are required");
        setIsSubmitting(false);
        return;
      }

      const tournamentFormData = new FormData();

      if (editImageFile) {
        tournamentFormData.append("tournamentLogo", editImageFile);
      }

      tournamentFormData.append("title", editFormData.title.trim());
      tournamentFormData.append("type", tournamentType);
      tournamentFormData.append("sportsType", editFormData.sportsType);
      tournamentFormData.append("description", editFormData.description || "");
      tournamentFormData.append("organizerName", editFormData.organizerName || "");
      tournamentFormData.append("cancellationPolicy", editFormData.cancellationPolicy || "NO");
      tournamentFormData.append("termsAndConditions", editFormData.termsAndConditions || "");

      // Tournament level
      if (editFormData.tournamentLevel) {
        tournamentFormData.append("tournamentLevel", editFormData.tournamentLevel);
      }

      tournamentFormData.append("numTeams", editFormData.numTeams || "0");
      tournamentFormData.append("playerNoValue", editFormData.playerNoValue || "2");
      tournamentFormData.append("setNo", editFormData.setNo || "3");
      tournamentFormData.append("tournamentFee", editFormData.tournamentFee || "0");

      if (editFormData.setsFormat) {
        tournamentFormData.append("setsFormat", editFormData.setsFormat);
      }

      // Per-stage play formats
      if (editFormData.hasGroupStage) {
        tournamentFormData.append("groupStageFormat", editFormData.groupStageFormat);
      }
      if (editFormData.hasKnockout) {
        tournamentFormData.append("knockoutFormat", editFormData.knockoutFormat);
      }

      // Qualify per group (for combined tournaments)
      if (editFormData.hasGroupStage && editFormData.hasKnockout) {
        tournamentFormData.append("qualifyPerGroup", editFormData.qualifyPerGroup || "2");
      }

      if (editFormData.startDate)
        tournamentFormData.append("startDate", editFormData.startDate);
      if (editFormData.endDate)
        tournamentFormData.append("endDate", editFormData.endDate);

      if (editFormData.selectedTime) {
        tournamentFormData.append("selectedTime", JSON.stringify(editFormData.selectedTime));
      }

      if (editFormData.category && Array.isArray(editFormData.category)) {
        tournamentFormData.append("category", JSON.stringify(editFormData.category));
      }

      if (editFormData.eventLocation) {
        tournamentFormData.append("eventLocation", editFormData.eventLocation);
      }

      const response = await axios.put(
        `/api/tournaments/edit/${editingTournament._id}`,
        tournamentFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedTournaments = tournaments.map(tournament =>
        tournament._id === editingTournament._id
          ? { ...tournament, ...response.data.tournament }
          : tournament
      );
      setTournaments(updatedTournaments);

      setSuccess("Tournament updated successfully!");
      setTimeout(() => {
        setShowEditModal(false);
        setEditImage(null);
        setEditImageFile(null);
        setSuccess("");
      }, 1500);

    } catch (error) {
      console.error("Error updating tournament:", error);
      setError(error.response?.data?.message || "Failed to update tournament");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareClick = (tournament, e) => {
    e.stopPropagation();
    const shareLink = `${window.location.origin}/tournament/${tournament._id}`;
    navigator.clipboard.writeText(shareLink)
      .then(() => toast.info(`Tournament link copied to clipboard!\n\n${shareLink}`))
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.info(`Share this tournament link:\n\n${shareLink}`);
      });
  };

  // Flow chooser for combined tournaments
  const [showFlowChooser, setShowFlowChooser] = useState(false);
  const [flowChooserTournamentId, setFlowChooserTournamentId] = useState(null);

  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [qrCodeTournament, setQrCodeTournament] = useState(null);

  const handleQRCodeClick = (tournament, e) => {
    e.stopPropagation();
    setQrCodeTournament(tournament);
    setShowQRCodeModal(true);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `tournament_qr_${qrCodeTournament._id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h5 className="mb-4 text-xl font-bold text-gray-900 tracking-tight">Your Tournaments</h5>
        <div className="flex bg-gray-100/50 p-1 rounded-xl">
          {["Live", "Upcoming", "History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === tab
                ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {displayData.length > 0 ? (
          displayData.map((tournament) => (
            <div
              key={tournament._id}
              className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${selectedTournament === tournament._id
                ? "bg-orange-50/50 border-orange-200 shadow-md ring-1 ring-orange-100"
                : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              onClick={() => {
                onTournamentSelect(tournament._id);
                const t = tournament.type?.toLowerCase() || "";
                if (t.includes("group stage") && t.includes("knockout")) {
                  // Combined tournament: show flow chooser
                  setFlowChooserTournamentId(tournament._id);
                  setShowFlowChooser(true);
                } else if (t.includes("group stage")) {
                  navigate(`/tournament-management/group-stage?tournamentId=${tournament._id}`);
                } else if (t.includes("knockout")) {
                  // Check if it's Davis Cup / team knockout or singles knockout
                  const kf = (tournament.knockoutFormat || "").toLowerCase();
                  if (kf.includes("team") || kf.includes("davis")) {
                    navigate(`/tournament-management/team-knockouts?tournamentId=${tournament._id}`);
                  } else {
                    navigate(`/tournament-management/direct-knockout?tournamentId=${tournament._id}`);
                  }
                } else {
                  onTournamentSelect(tournament._id);
                }
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedTournament === tournament._id
                  ? "bg-orange-100 text-orange-600"
                  : "bg-gray-100 text-gray-500"
                  }`}>
                  {tournament.type === "knockout + group stage" ? "Group + Knockout" : tournament.type}
                </span>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {user?.isCorporate && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invite-employees?tournamentId=${tournament._id}`);
                        }}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Invite Employee"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={(e) => handleEditClick(tournament._id, e)}
                    className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleQRCodeClick(tournament, e)}
                    className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    title="QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleShareClick(tournament, e)}
                    className="p-1.5 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Are you sure you want to delete this tournament?")) {
                        handleDelete(tournament._id);
                      }
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className={`text-base font-bold mb-2 truncate ${selectedTournament === tournament._id
                ? "text-gray-900"
                : "text-gray-800"
                }`}>
                {tournament.title}
              </h3>

              <div className="space-y-1.5">
                <div className={`text-xs flex items-center gap-2 ${selectedTournament === tournament._id ? "text-gray-900/80" : "text-gray-500"}`}>
                  <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tournament.sportsType || "Sport"}</span>
                </div>
                {tournament.eventLocation && (
                  <div className="text-xs flex items-center gap-2 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{typeof tournament.eventLocation === "string" ? tournament.eventLocation : Array.isArray(tournament.eventLocation) ? tournament.eventLocation[0] : ""}</span>
                  </div>
                )}
                {tournament.startDate && (
                  <div className="text-xs flex items-center gap-2 text-gray-400">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {new Date(tournament.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {tournament.endDate && tournament.endDate !== tournament.startDate && ` – ${new Date(tournament.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                    </span>
                    {tournament.participants?.length > 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        <Users className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{tournament.participants.length} players</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Current Stage Badge */}
              {tournament.currentStage && tournament.currentStage !== "registration" && (
                <div className="mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide ${
                    tournament.currentStage === "group_stage"
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      : tournament.currentStage === "group_completed"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : tournament.currentStage === "knockout"
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : tournament.currentStage === "completed"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-gray-800 text-gray-500 border border-gray-700"
                  }`}>
                    {tournament.currentStage === "group_stage" ? "Group Stage"
                      : tournament.currentStage === "group_completed" ? "Groups Done"
                      : tournament.currentStage === "knockout" ? "Knockout"
                      : tournament.currentStage === "completed" ? "Completed"
                      : tournament.currentStage.replace(/_/g, " ")}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
              <Trophy className="w-7 h-7 text-orange-300" />
            </div>
            <p className="text-sm font-bold text-gray-700">No {activeTab.toLowerCase()} tournaments</p>
            <p className="text-xs text-gray-400 mt-1">{activeTab === "Live" ? "No tournaments are currently active" : activeTab === "Upcoming" ? "Create a tournament to see it here" : "Past tournaments will appear here"}</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCodeModal && qrCodeTournament && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="flex justify-end">
              <button onClick={() => setShowQRCodeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booking QR Code</h3>
              <p className="text-sm text-gray-500">{qrCodeTournament.title}</p>
            </div>

            <div className="flex justify-center mb-6 bg-white p-4 rounded-xl shadow-none border border-gray-200">
              <QRCodeCanvas
                id="qr-code-canvas"
                value={`intent://tournament/details/${qrCodeTournament._id}#Intent;scheme=chalokhelne;package=com.chalokhelne.app;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.chalokhelne.app;end`}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tactical Intent</p>
              <p className="text-[10px] text-mono text-gray-400 bg-gray-50 p-3 rounded-xl break-all border border-black/5 font-bold">
                chalokhelne://tournament/details/{qrCodeTournament._id}
              </p>
            </div>

            <button
              onClick={downloadQRCode}
              className="w-full py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* Flow Chooser Modal for Combined Tournaments */}
      {showFlowChooser && flowChooserTournamentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Choose Stage</h3>
              <button
                onClick={() => setShowFlowChooser(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              This tournament has both Group Stage and Knockout phases. Select which stage you want to manage.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowFlowChooser(false);
                  navigate(`/tournament-management/group-stage?tournamentId=${flowChooserTournamentId}`);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-orange-200 bg-orange-50/50 hover:bg-orange-100 hover:border-orange-400 transition-all group"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-gray-900">Group Stage</p>
                  <p className="text-xs text-orange-500/70">Manage groups, matches & player progression</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowFlowChooser(false);
                  navigate(`/tournament-management/team-knockouts?tournamentId=${flowChooserTournamentId}`);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-orange-200 bg-orange-50/50 hover:bg-orange-100 hover:border-orange-400 transition-all group"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-orange-900">Team Knockout</p>
                  <p className="text-xs text-orange-600/70">Manage team knockout brackets & finals</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowFlowChooser(false);
                  navigate(`/tournament-management/direct-knockout?tournamentId=${flowChooserTournamentId}`);
                }}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-400 transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-emerald-900">Singles Knockout</p>
                  <p className="text-xs text-emerald-600/70">Direct elimination bracket (16/32/64 draw)</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tournament — uses unified MCreateTournament in edit mode */}
      <MCreateTournament
        key={editingTournament?._id || "edit"}
        showPopup={showEditModal}
        setShowPopup={setShowEditModal}
        mode="edit"
        initialData={editingTournament}
        onSuccess={() => {
          // Refresh tournament list
          const fetchTournaments = async () => {
            try {
              const user = JSON.parse(localStorage.getItem("user"));
              const response = await axios.get(`/api/tournaments/manager/${user?._id}`);
              setTournaments(response.data.tournaments || []);
            } catch {}
          };
          fetchTournaments();
        }}
      />

      {/* Old edit modal removed — MCreateTournament mode="edit" handles it */}
    </div>
  );
};


export default TournamentList;
