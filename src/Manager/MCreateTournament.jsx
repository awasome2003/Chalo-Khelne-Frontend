import React, { useState, useContext, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Trophy,
  Users,
  Image as ImageIcon,
  Clock,
  Type,
  AlignLeft,
  DollarSign,
  Check,
  Lock,
  Shield,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  Award,
  Info,
  Settings,
} from "lucide-react";
import dayjs from "dayjs";
import { AuthContext } from "../context/AuthContext";
import {
  generateFormFields,
  validateRuleBookForm,
  buildSubmissionPayload,
} from "../utils/ruleBookFormEngine";

// ─── Section Icons Map ───
const SECTION_ICONS = {
  format: <Type className="w-5 h-5 text-blue-500" />,
  scoring: <Target className="w-5 h-5 text-emerald-500" />,
  participant: <Users className="w-5 h-5 text-purple-500" />,
  tieBreaker: <Zap className="w-5 h-5 text-amber-500" />,
  tournamentRules: <Award className="w-5 h-5 text-indigo-500" />,
};

// ─── Step definitions (static steps — dynamic ones inserted at runtime) ───
const STATIC_STEPS = [
  { id: "basic", label: "Basic Info", icon: <Trophy className="w-4 h-4" /> },
  { id: "sportConfig", label: "Sport Config", icon: <Settings className="w-4 h-4" /> },
  { id: "format", label: "Tournament Setup", icon: <Type className="w-4 h-4" /> },
  { id: "details", label: "Schedule & Details", icon: <Calendar className="w-4 h-4" /> },
];

/**
 * Unified Tournament Form — supports both create and edit mode.
 *
 * Props:
 * - showPopup: boolean
 * - setShowPopup: (bool) => void
 * - mode: "create" | "edit" (default: "create")
 * - initialData: tournament object (for edit mode)
 * - onSuccess: () => void (optional callback after save)
 */
/**
 * Maps raw tournament API data to form field values.
 */
function mapTournamentToForm(t, defaults, auth) {
  if (!t) return { ...defaults };
  const tType = (t.type || "").toLowerCase();
  const formats = [];
  if (tType.includes("group stage")) formats.push("group+knockout");
  if (tType === "knockout" && (t.knockoutFormat === "Singles" || t.knockoutFormat === "Doubles")) formats.push("singles-knockout");
  if (t.knockoutFormat === "Davis Cup" || t.knockoutFormat === "Teams Knockout") formats.push("davis-cup");
  if (formats.length === 0 && tType.includes("knockout")) formats.push("singles-knockout");

  return {
    ...defaults,
    title: t.title || "",
    hasGroupStage: tType.includes("group stage"),
    hasKnockout: tType.includes("knockout"),
    playingFormats: formats,
    sportsType: t.sportsType || "",
    tournamentLevel: t.tournamentLevel || "",
    description: t.description || "",
    organizerName: t.organizerName || "",
    cancellationPolicy: t.cancellationPolicy || "NO",
    eventLocation: Array.isArray(t.eventLocation) ? t.eventLocation.join(", ") : t.eventLocation || "",
    startDate: t.startDate ? t.startDate.split("T")[0] : "",
    endDate: t.endDate ? t.endDate.split("T")[0] : "",
    termsAndConditions: t.termsAndConditions || "",
    groupStageFormat: t.groupStageFormat || "Singles",
    knockoutFormat: t.knockoutFormat || "Singles",
    category: t.category || [{ name: "Open Category", fee: 0 }],
    selectedTime: t.selectedTime || { startTime: "10:00", endTime: "18:00" },
    numTeams: t.numTeams || "",
    playerNoValue: t.playerNoValue || "2",
    tournamentFee: t.tournamentFee || "0",
    qualifyPerGroup: t.qualifyPerGroup?.toString() || "2",
    managerId: t.managerId || [auth?._id || ""],
  };
}

const MCreateTournament = ({ showPopup, setShowPopup, mode = "create", initialData = null, onSuccess }) => {
  const isEditMode = mode === "edit";
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { auth } = useContext(AuthContext);

  // Wizard step
  const [currentStep, setCurrentStep] = useState(0);

  // Sports & Rules state
  const [sportsList, setSportsList] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [ruleBook, setRuleBook] = useState(null);
  const [loadingRules, setLoadingRules] = useState(false);

  // RuleBook-driven dynamic form state
  const [ruleBookValues, setRuleBookValues] = useState({});
  const [ruleBookErrors, setRuleBookErrors] = useState({});

  const defaultFormData = {
    title: "",
    hasGroupStage: true,
    hasKnockout: false,
    sportsType: "",
    tournamentLevel: "",
    description: "",
    numTeams: "",
    playerNoValue: "2",
    organizerName: "",
    cancellationPolicy: "YES",
    eventLocation: "",
    tournamentFee: "0",
    managerId: [auth?._id || ""],
    category: [{ name: "Open Category", fee: 0 }],
    selectedTime: { startTime: "10:00", endTime: "18:00" },
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
    termsAndConditions: "",
    playingFormats: [], // array of: "group+knockout" | "singles-knockout" | "davis-cup"
    groupStageFormat: "Singles",
    knockoutFormat: "Singles",
    qualifyPerGroup: "2",
    drawSize: 16,
  };

  const [formData, setFormData] = useState(() => {
    if (isEditMode && initialData) {
      return mapTournamentToForm(initialData, defaultFormData, auth);
    }
    return { ...defaultFormData };
  });

  // Sync form when modal opens, initialData changes, or mode changes
  useEffect(() => {
    if (!showPopup) return; // Component returns null anyway when !showPopup

    if (isEditMode && initialData) {
      setFormData(mapTournamentToForm(initialData, defaultFormData, auth));
      setImage(initialData.tournamentLogo ? `/uploads/tournaments/${initialData.tournamentLogo}` : null);
    } else {
      setFormData({ ...defaultFormData });
      setImage(null);
    }
    setImageFile(null);
    setError("");
    setSuccess("");
    setCurrentStep(0);
    setUserChangedSport(null);
  }, [showPopup, isEditMode, initialData]);

  // Generate dynamic form sections from ruleBook
  const { sections: ruleBookSections, defaults: ruleBookDefaults } = useMemo(
    () => generateFormFields(ruleBook),
    [ruleBook]
  );

  // Build wizard steps — insert "Sport Config" only when ruleBook has sections
  const steps = useMemo(() => {
    const hasSportConfig = ruleBookSections.length > 0 || ruleBook;
    return STATIC_STEPS.filter((s) => {
      if (s.id === "sportConfig") return hasSportConfig;
      return true;
    });
  }, [ruleBookSections, ruleBook]);

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

  // Reset everything when popup opens in CREATE mode only
  // (Edit mode is handled by the useEffect above that uses mapTournamentToForm)
  useEffect(() => {
    if (showPopup && !isEditMode) {
      setFormData({ ...defaultFormData });
      setImage(null);
      setImageFile(null);
      setError("");
      setSuccess("");
      setRuleBook(null);
      setAvailableLevels([]);
      setRuleBookValues({});
      setRuleBookErrors({});
      setCurrentStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup]);

  // Track the sport that was set by the user manually (not by edit pre-fill)
  const [userChangedSport, setUserChangedSport] = useState(null);

  // When user manually changes sport, reset formats and fetch levels
  useEffect(() => {
    if (userChangedSport === null) return;
    const sport = userChangedSport;

    if (!sport) {
      setAvailableLevels([]);
      setRuleBook(null);
      setRuleBookValues({});
      setRuleBookErrors({});
      return;
    }

    const fetchLevels = async () => {
      try {
        const res = await axios.get(`/api/sport-rules/sport/${sport}/levels`);
        setAvailableLevels(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch levels:", err);
        setAvailableLevels([]);
      }
    };
    fetchLevels();

    const sportObj = sportsList.find((s) => s.name === sport);
    const isTeamSport = sportObj?.category === "Team";
    setFormData((prev) => ({
      ...prev,
      tournamentLevel: "",
      playingFormats: [],
      hasGroupStage: false,
      hasKnockout: false,
      groupStageFormat: isTeamSport ? "Teams" : "Singles",
      knockoutFormat: isTeamSport ? "Teams Knockout" : "Singles",
    }));
    setRuleBook(null);
    setRuleBookValues({});
    setRuleBookErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userChangedSport]);

  // Fetch levels when sportsType changes (including from edit pre-fill) — levels only, no format reset
  useEffect(() => {
    if (!formData.sportsType) return;
    const fetchLevels = async () => {
      try {
        const res = await axios.get(`/api/sport-rules/sport/${formData.sportsType}/levels`);
        setAvailableLevels(res.data.data || []);
      } catch {}
    };
    fetchLevels();
  }, [formData.sportsType]);

  // When sport+level selected, fetch ruleBook
  useEffect(() => {
    if (!formData.sportsType || !formData.tournamentLevel) {
      setRuleBook(null);
      setRuleBookValues({});
      setRuleBookErrors({});
      return;
    }

    const fetchRuleBook = async () => {
      setLoadingRules(true);
      try {
        const res = await axios.get(
          `/api/sport-rules/sport/${formData.sportsType}/${formData.tournamentLevel}`
        );
        setRuleBook(res.data.data || null);
      } catch (err) {
        console.error("Failed to fetch rule book:", err);
        setRuleBook(null);
      } finally {
        setLoadingRules(false);
      }
    };
    fetchRuleBook();
  }, [formData.sportsType, formData.tournamentLevel]);

  // Pre-fill ruleBook defaults
  useEffect(() => {
    if (ruleBookDefaults && Object.keys(ruleBookDefaults).length > 0) {
      setRuleBookValues({ ...ruleBookDefaults });
      setRuleBookErrors({});
    }
  }, [ruleBookDefaults]);

  // ── Handlers ──
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addCategory = () => {
    setFormData((prev) => ({
      ...prev,
      category: [...prev.category, { name: "", fee: 0 }],
    }));
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.category];
    updatedCategories[index][field] = field === "fee" ? Math.max(0, Number(value)) : value;
    setFormData((prev) => ({ ...prev, category: updatedCategories }));
  };

  const handleRuleBookFieldChange = useCallback((path, value) => {
    setRuleBookValues((prev) => ({ ...prev, [path]: value }));
    setRuleBookErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  const handleMultiSelectToggle = useCallback((path, option) => {
    setRuleBookValues((prev) => {
      const current = Array.isArray(prev[path]) ? [...prev[path]] : [];
      const idx = current.indexOf(option);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(option);
      return { ...prev, [path]: current };
    });
  }, []);

  // ── Step Validation ──
  const validateCurrentStep = () => {
    const stepId = steps[currentStep]?.id;
    setError("");

    if (stepId === "basic") {
      if (!formData.title.trim()) { setError("Tournament name is required"); return false; }
      if (!formData.sportsType) { setError("Please select a sport"); return false; }
      if (!formData.tournamentLevel) { setError("Please select a tournament level"); return false; }
      return true;
    }

    if (stepId === "sportConfig") {
      if (ruleBookSections.length > 0) {
        const { valid, errors } = validateRuleBookForm(ruleBookValues, ruleBookSections);
        if (!valid) {
          setRuleBookErrors(errors);
          setError("Please fix the configuration errors highlighted below");
          return false;
        }
        setRuleBookErrors({});
      }
      return true;
    }

    if (stepId === "format") {
      if (!formData.playingFormats || formData.playingFormats.length === 0) {
        setError("Select at least one playing format");
        return false;
      }
      return true;
    }

    if (stepId === "details") {
      if (!formData.eventLocation.trim()) { setError("Event location is required"); return false; }
      if (!formData.startDate || !formData.endDate) { setError("Start and end dates are required"); return false; }
      return true;
    }

    return true;
  };

  const goNext = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep((p) => p + 1);
      setError("");
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((p) => p - 1);
      setError("");
    }
  };

  const goToStep = (idx) => {
    // Only allow going back freely, forward requires validation
    if (idx < currentStep) {
      setCurrentStep(idx);
      setError("");
    } else if (idx === currentStep + 1) {
      goNext();
    }
  };

  // ── Submit ──
  const createTournament = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError("");

    try {
      // Determine type from selected formats
      const formats = formData.playingFormats || [];
      const hasGS = formats.includes("group+knockout");
      const hasKO = formats.includes("singles-knockout") || formats.includes("davis-cup") || hasGS;
      const tournamentType = hasGS && hasKO ? "knockout + group stage" : hasKO ? "knockout" : hasGS ? "group stage" : "";

      // If Davis Cup selected, ensure knockoutFormat is set
      if (formats.includes("davis-cup") && !formData.knockoutFormat?.includes("Davis")) {
        formData.knockoutFormat = "Davis Cup";
      }

      if (!formData.title || !tournamentType || !formData.sportsType) {
        setError("Title, Tournament Type, and Sport are required");
        setIsSubmitting(false);
        return;
      }

      const tournamentFormData = new FormData();

      if (imageFile) tournamentFormData.append("tournamentLogo", imageFile);

      tournamentFormData.append("title", formData.title.trim());
      tournamentFormData.append("type", tournamentType);
      tournamentFormData.append("sportsType", formData.sportsType);
      tournamentFormData.append("description", formData.description || "");
      tournamentFormData.append("organizerName", formData.organizerName || "");
      tournamentFormData.append("cancellationPolicy", formData.cancellationPolicy || "NO");
      tournamentFormData.append("termsAndConditions", formData.termsAndConditions || "");

      if (formData.tournamentLevel) {
        tournamentFormData.append("tournamentLevel", formData.tournamentLevel);
      }

      if (ruleBook && Object.keys(ruleBookValues).length > 0) {
        const payload = buildSubmissionPayload(ruleBookValues, ruleBook);
        tournamentFormData.append("matchFormatOverrides", JSON.stringify(payload));
      }

      if (formData.hasGroupStage) tournamentFormData.append("groupStageFormat", formData.groupStageFormat);
      if (formData.hasKnockout) tournamentFormData.append("knockoutFormat", formData.knockoutFormat);
      if (formData.hasGroupStage && formData.hasKnockout) {
        tournamentFormData.append("qualifyPerGroup", formData.qualifyPerGroup || "2");
      }
      // Draw size for standalone knockout
      if (formData.hasKnockout && !formData.hasGroupStage && formData.drawSize) {
        tournamentFormData.append("drawSize", formData.drawSize);
      }

      tournamentFormData.append("numTeams", formData.numTeams || "0");
      tournamentFormData.append("playerNoValue", formData.playerNoValue || "2");
      tournamentFormData.append("tournamentFee", formData.tournamentFee || "0");

      if (formData.startDate) tournamentFormData.append("startDate", formData.startDate);
      if (formData.endDate) tournamentFormData.append("endDate", formData.endDate);
      if (formData.selectedTime) tournamentFormData.append("selectedTime", JSON.stringify(formData.selectedTime));
      if (formData.category?.length) tournamentFormData.append("category", JSON.stringify(formData.category));
      if (formData.managerId?.length) tournamentFormData.append("managerId", JSON.stringify(formData.managerId));
      if (formData.eventLocation) tournamentFormData.append("eventLocation", formData.eventLocation);

      if (isEditMode && initialData?._id) {
        // EDIT MODE — update existing tournament
        await axios.put(`/api/tournaments/edit/${initialData._id}`, tournamentFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSuccess("Tournament updated successfully!");
      } else {
        // CREATE MODE — create new tournament
        await axios.post(`/api/tournaments/createTournament`, tournamentFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSuccess("Tournament created successfully!");
      }

      setTimeout(() => {
        setShowPopup(false);
        onSuccess?.();
        if (!isEditMode) window.location.href = "/mtournament-management";
      }, 1500);
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} tournament:`, error);
      setError(error.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} tournament`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Helpers ──
  const renderRuleValue = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return val;
  };

  const formatLabel = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

  // ── Dynamic Field Renderer ──
  const renderDynamicField = (field) => {
    const val = ruleBookValues[field.path];
    const hasError = ruleBookErrors[field.path];

    if (field.type === "boolean") {
      return (
        <div key={field.path} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
          <label className="text-sm font-semibold text-gray-700">{field.label}</label>
          <button
            type="button"
            onClick={() => handleRuleBookFieldChange(field.path, !val)}
            className={`relative w-12 h-6 rounded-full transition-colors ${val ? "bg-blue-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${val ? "translate-x-6" : ""}`} />
          </button>
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.path}>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
          <div className="relative">
            <select
              value={val || ""}
              onChange={(e) => handleRuleBookFieldChange(field.path, e.target.value)}
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer ${hasError ? "border-red-300 bg-red-50/50" : "border-gray-200"}`}
            >
              <option value="">Select</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt.replace(/[-_]/g, " ").replace(/^./, (s) => s.toUpperCase())}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {hasError && <p className="text-xs text-red-500 mt-1">{ruleBookErrors[field.path]}</p>}
        </div>
      );
    }

    if (field.type === "multiselect") {
      const selected = Array.isArray(val) ? val : [];
      return (
        <div key={field.path} className="col-span-full">
          <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((opt) => {
              const isActive = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleMultiSelectToggle(field.path, opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {opt.replace(/[-_]/g, " ").replace(/^./, (s) => s.toUpperCase())}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (field.type === "text") {
      return (
        <div key={field.path} className="col-span-full">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
          <input
            type="text"
            value={val || ""}
            onChange={(e) => handleRuleBookFieldChange(field.path, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        </div>
      );
    }

    // Number input
    return (
      <div key={field.path}>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {field.label}
          {field.defaultValue != null && (
            <span className="text-xs text-gray-400 font-normal ml-1">(default: {field.defaultValue})</span>
          )}
        </label>
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step || 1}
          value={val ?? ""}
          onChange={(e) => handleRuleBookFieldChange(field.path, e.target.value)}
          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${hasError ? "border-red-300 bg-red-50/50" : "border-gray-200"}`}
          placeholder={field.min != null && field.max != null ? `${field.min}–${field.max}` : ""}
        />
        {hasError && <p className="text-xs text-red-500 mt-1">{ruleBookErrors[field.path]}</p>}
      </div>
    );
  };

  if (!showPopup) return null;

  const selectedSportObj = sportsList.find((s) => s.name === formData.sportsType);
  const isTeamSport = selectedSportObj?.category === "Team";
  const activeStep = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // ═══════════════════════════════════════════
  //  STEP CONTENT RENDERERS
  // ═══════════════════════════════════════════

  const renderStepBasic = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Trophy className="w-5 h-5 text-blue-500" /> Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tournament Name</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="Ex: Summer Championship 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sport</label>
              <div className="relative">
                <select
                  name="sportsType"
                  value={formData.sportsType}
                  onChange={(e) => {
                    handleInputChange(e);
                    setUserChangedSport(e.target.value); // Trigger format reset only on manual change
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Sport</option>
                  {sportsList.map((sport) => (
                    <option key={sport._id} value={sport.name}>{sport.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tournament Level</label>
              <div className="relative">
                <select
                  name="tournamentLevel"
                  value={formData.tournamentLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">
                    {!formData.sportsType ? "Select sport first" : availableLevels.length === 0 ? "No levels available" : "Select Level"}
                  </option>
                  {availableLevels.map((level) => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organizer Name</label>
              <input
                type="text"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Organization or Person Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px] resize-y"
              placeholder="Describe your tournament..."
            />
          </div>
        </div>
      </div>

      {/* Right — Logo */}
      <div className="lg:col-span-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-500" /> Tournament Logo
          </h3>
          <div className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all relative flex flex-col items-center justify-center cursor-pointer group overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {image ? (
              <div className="relative w-full h-full">
                <img src={image} alt="Uploaded" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                  Change Logo
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-600">Click to upload logo</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ───────────────────────────────────
  //  STEP: SPORT CONFIG (dynamic)
  // ───────────────────────────────────
  const renderStepSportConfig = () => (
    <div className="space-y-6">
      {/* Locked Rules (read-only) */}
      {(loadingRules || ruleBook) && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" /> Sport Rules
              <span className="text-xs font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            </h3>
            {ruleBook && (
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {ruleBook.sportName} — {ruleBook.level}
              </span>
            )}
          </div>

          {loadingRules ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-sm text-gray-500">Loading rules...</span>
            </div>
          ) : ruleBook ? (
            <div className="space-y-4">
              {ruleBook.rules && Object.entries(ruleBook.rules).some(([k, v]) => v != null && k !== "_id") && (
                <div>
                  <h4 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Gameplay Rules</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(ruleBook.rules)
                      .filter(([k, v]) => v != null && k !== "_id")
                      .map(([key, val]) => (
                        <div key={key} className="bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatLabel(key)}</p>
                          <p className="text-sm font-semibold text-gray-800 mt-0.5">{renderRuleValue(val)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {ruleBook.equipment && Object.entries(ruleBook.equipment).some(([k, v]) => v != null && k !== "_id") && (
                <div>
                  <h4 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Equipment</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(ruleBook.equipment)
                      .filter(([k, v]) => v != null && k !== "_id")
                      .map(([key, val]) => (
                        <div key={key} className="bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatLabel(key)}</p>
                          <p className="text-sm font-semibold text-gray-800 mt-0.5">{renderRuleValue(val)}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {ruleBook.description && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-blue-800">{ruleBook.description}</p>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-800">
                  These rules are locked and will be automatically applied. They cannot be edited.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Dynamic RuleBook sections — 2-column layout for compact display */}
      {ruleBookSections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ruleBookSections.map((section) => {
            // Full-width for sections with multiselect or many fields
            const hasWideField = section.fields.some((f) => f.type === "multiselect" || f.type === "text");
            const isLargeSection = section.fields.length > 4;

            return (
              <div
                key={section.id}
                className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 ${
                  hasWideField || isLargeSection ? "lg:col-span-2" : ""
                }`}
              >
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    {SECTION_ICONS[section.id] || <Type className="w-5 h-5 text-gray-500" />}
                    {section.title}
                    {section.subtitle && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {section.subtitle}
                      </span>
                    )}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Configurable</span>
                </div>

                <div className={`grid gap-4 ${
                  isLargeSection
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2"
                }`}>
                  {section.fields.map((field) => renderDynamicField(field))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ruleBookSections.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-blue-800">
            Pre-configured from <strong>{ruleBook?.sportName} — {ruleBook?.level}</strong> rule book. Adjust values as needed.
          </p>
        </div>
      )}
    </div>
  );

  // ───────────────────────────────────
  //  STEP: TOURNAMENT SETUP
  // ───────────────────────────────────
  const renderStepFormat = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tournament Type & Format */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
          <Type className="w-5 h-5 text-orange-500" /> Tournament Format
        </h3>

        {/* Playing Format — multi-select cards */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Playing Format</label>
          <p className="text-xs text-gray-400 mb-3">Select one or more formats for this tournament</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: "group+knockout", label: "Group Stage + Knockout", desc: "Round-robin groups then elimination bracket", icon: Users, color: "blue",
                onSelect: (p) => ({ ...p, hasGroupStage: true, hasKnockout: true, groupStageFormat: isTeamSport ? "Teams" : p.groupStageFormat || "Singles", knockoutFormat: isTeamSport ? "Teams Knockout" : p.knockoutFormat || "Singles" }),
                onDeselect: (p) => ({ ...p, hasGroupStage: false }) },
              { key: "singles-knockout", label: "Singles Knockout", desc: "Direct elimination — 16/32/64 draw", icon: Trophy, color: "orange",
                onSelect: (p) => ({ ...p, hasKnockout: true }),
                onDeselect: (p) => ({ ...p }) },
              { key: "davis-cup", label: "Davis Cup", desc: "Team knockout — singles + doubles format", icon: Shield, color: "purple",
                onSelect: (p) => ({ ...p, hasKnockout: true }),
                onDeselect: (p) => ({ ...p }) },
            ].map((fmt) => {
              const isSelected = formData.playingFormats?.includes(fmt.key);
              const Icon = fmt.icon;
              const colors = { blue: { border: "border-blue-500", bg: "bg-blue-50", icon: "bg-blue-500" }, orange: { border: "border-orange-500", bg: "bg-orange-50", icon: "bg-orange-500" }, purple: { border: "border-purple-500", bg: "bg-purple-50", icon: "bg-purple-500" } };
              const c = colors[fmt.color];
              return (
                <div
                  key={fmt.key}
                  onClick={() => {
                    setFormData((p) => {
                      const current = p.playingFormats || [];
                      let next, updated;
                      if (current.includes(fmt.key)) {
                        next = current.filter((k) => k !== fmt.key);
                        updated = fmt.onDeselect(p);
                      } else {
                        next = [...current, fmt.key];
                        updated = fmt.onSelect(p);
                      }
                      // Recalculate hasGroupStage/hasKnockout from selected formats
                      const hasGS = next.includes("group+knockout");
                      const hasKO = next.length > 0;
                      return { ...updated, playingFormats: next, hasGroupStage: hasGS, hasKnockout: hasKO };
                    });
                  }}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? `${c.border} ${c.bg} shadow-sm` : "border-gray-200 bg-white hover:border-gray-300"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isSelected ? `${c.icon} text-white` : "bg-gray-100 text-gray-500"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">{fmt.label}</h4>
                  <p className="text-xs text-gray-500 mt-1">{fmt.desc}</p>
                  {isSelected && <FormatCheck color={fmt.color} />}
                </div>
              );
            })}
          </div>
          {(!formData.playingFormats || formData.playingFormats.length === 0) && (
            <p className="text-xs text-red-500 mt-2">Select at least one playing format</p>
          )}
          {formData.playingFormats?.length > 0 && (
            <div className="flex gap-1.5 mt-3">
              {formData.playingFormats.map((f) => (
                <span key={f} className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full capitalize">
                  {f.replace(/[+-]/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sub-format for Group+Knockout */}
        {formData.playingFormats?.includes("group+knockout") && !isTeamSport && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Group Stage Format</label>
              <select name="groupStageFormat" value={formData.groupStageFormat} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                <option value="Singles">Singles</option>
                <option value="Doubles">Doubles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Knockout Format</label>
              <select name="knockoutFormat" value={formData.knockoutFormat} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                <option value="Singles">Singles</option>
                <option value="Doubles">Doubles</option>
              </select>
            </div>
          </div>
        )}

        {/* Draw Size — Only for standalone knockout (no group stage) */}
        {formData.playingFormats?.includes("singles-knockout") && !formData.playingFormats?.includes("group+knockout") && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Draw Size</label>
            <p className="text-xs text-gray-400 mb-1.5">Number of slots in the elimination bracket</p>
            <div className="flex gap-2">
              {[16, 32, 64].map((size) => {
                const numPlayers = Number(formData.numTeams) || 0;
                const tooSmall = numPlayers > size;
                return (
                  <label
                    key={size}
                    className={`flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold ${
                      tooSmall
                        ? "border-red-200 bg-red-50 text-red-300 cursor-not-allowed"
                        : String(formData.drawSize) === String(size)
                        ? "border-purple-500 bg-purple-50 text-purple-700 cursor-pointer"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name="drawSize"
                      value={size}
                      checked={String(formData.drawSize) === String(size)}
                      onChange={(e) => !tooSmall && setFormData((p) => ({ ...p, drawSize: Number(e.target.value) }))}
                      disabled={tooSmall}
                      className="sr-only"
                    />
                    {size} Draw
                    {tooSmall && <span className="text-[9px] font-normal">Max {size} players</span>}
                  </label>
                );
              })}
            </div>
            {Number(formData.numTeams) > Number(formData.drawSize) && (
              <p className="text-xs text-red-500 mt-1">
                {formData.numTeams} players won't fit in a {formData.drawSize}-draw. Increase draw size.
              </p>
            )}
          </div>
        )}

        {/* Qualify Per Group */}
        {formData.hasGroupStage && formData.hasKnockout && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qualify Per Group</label>
            <p className="text-xs text-gray-400 mb-1.5">Top N players from each group advance to knockout</p>
            <select
              name="qualifyPerGroup"
              value={formData.qualifyPerGroup}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="1">Top 1</option>
              <option value="2">Top 2</option>
              <option value="3">Top 3</option>
              <option value="4">Top 4</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cancellation Policy</label>
          <select
            name="cancellationPolicy"
            value={formData.cancellationPolicy}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="YES">Allow Cancellation</option>
            <option value="NO">No Cancellation</option>
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" /> Categories
          </h3>
          <button
            type="button"
            onClick={addCategory}
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="space-y-3">
          {formData.category?.map((cat, idx) => (
            <div key={idx} className="flex gap-3 items-center group">
              <div className="flex-1">
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => handleCategoryChange(idx, "name", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Category Name (e.g. Under 18)"
                />
              </div>
              <div className="w-28 relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={cat.fee}
                  onChange={(e) => handleCategoryChange(idx, "fee", e.target.value)}
                  className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Fee"
                />
              </div>
              {formData.category.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, category: p.category.filter((_, i) => i !== idx) }))}
                  className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Terms & Conditions</label>
          <textarea
            name="termsAndConditions"
            value={formData.termsAndConditions}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[80px] resize-y"
            placeholder="Enter specific rules or terms..."
          />
        </div>
      </div>
    </div>
  );

  // ───────────────────────────────────
  //  STEP: SCHEDULE & DETAILS
  // ───────────────────────────────────
  const renderStepDetails = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Schedule */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
          <Calendar className="w-5 h-5 text-green-500" /> Schedule
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date Range</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-gray-500 pl-1">Start Date</span>
              <input
                type="date"
                name="startDate"
                min={new Date().toISOString().split("T")[0]}
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500 pl-1">End Date</span>
              <input
                type="date"
                name="endDate"
                min={formData.startDate || new Date().toISOString().split("T")[0]}
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Daily Schedule</label>
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <Clock className="w-5 h-5 text-gray-400" />
            <input
              type="time"
              value={formData.selectedTime?.startTime || ""}
              onChange={(e) => setFormData((p) => ({ ...p, selectedTime: { ...p.selectedTime, startTime: e.target.value } }))}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 p-0"
            />
            <span className="text-gray-400">-</span>
            <input
              type="time"
              value={formData.selectedTime?.endTime || ""}
              onChange={(e) => setFormData((p) => ({ ...p, selectedTime: { ...p.selectedTime, endTime: e.target.value } }))}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 p-0"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
          <MapPin className="w-5 h-5 text-red-500" /> Location
        </h3>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Venue Address</label>
          <input
            type="text"
            name="eventLocation"
            value={formData.eventLocation}
            onChange={(e) => setFormData((p) => ({ ...p, eventLocation: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm"
            placeholder="Enter full venue address"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tournament Fee</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              name="tournamentFee"
              min="0"
              value={formData.tournamentFee}
              onChange={handleInputChange}
              className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Numbers */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
          <Users className="w-5 h-5 text-blue-500" /> Participants
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Teams/Players</label>
          <input
            type="number"
            name="numTeams"
            min="2"
            value={formData.numTeams}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. 16"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Players Per Team</label>
          <input
            type="number"
            name="playerNoValue"
            min="1"
            value={formData.playerNoValue}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g. 2"
          />
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════
  //  RENDER ACTIVE STEP
  // ═══════════════════════════════════════════
  const renderActiveStep = () => {
    switch (activeStep?.id) {
      case "basic": return renderStepBasic();
      case "sportConfig": return renderStepSportConfig();
      case "format": return renderStepFormat();
      case "details": return renderStepDetails();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* ─── Header ─── */}
        <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 w-full">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{isEditMode ? "Edit Tournament" : "Create New Tournament"}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Step {currentStep + 1} of {steps.length} — {activeStep?.label}
            </p>
          </div>
          <button
            onClick={() => setShowPopup(false)}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ─── Step Progress Bar ─── */}
        <div className="px-8 py-3 bg-gray-50/80 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isDone = idx < currentStep;
              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => goToStep(idx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-500 text-white shadow-sm"
                        : isDone
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                        : "bg-white text-gray-400 border border-gray-200"
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      step.icon
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{idx + 1}</span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full ${idx < currentStep ? "bg-emerald-300" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ─── Scrollable Content ─── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 w-full">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in zoom-in-95 duration-300">
              <div className="w-24 h-24 bg-green-100/80 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Tournament Created!</h3>
              <p className="text-gray-600 text-lg">{success}</p>
            </div>
          ) : (
            <div className="p-8">
              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              )}

              {/* Active Step Content */}
              {renderActiveStep()}
            </div>
          )}
        </div>

        {/* ─── Footer Nav ─── */}
        {!success && (
          <div className="px-8 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
            <button
              type="button"
              onClick={currentStep === 0 ? () => setShowPopup(false) : goPrev}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              {currentStep === 0 ? (
                <>Cancel</>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" /> Back
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              {/* Step dots (mobile) */}
              <div className="flex gap-1.5 sm:hidden">
                {steps.map((_, idx) => (
                  <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? "bg-blue-500" : idx < currentStep ? "bg-emerald-400" : "bg-gray-300"}`} />
                ))}
              </div>

              {isLastStep ? (
                <button
                  type="button"
                  onClick={createTournament}
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-[#FF5B04] hover:bg-[#E04F00] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transform active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Tournament" : "Create Tournament")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-sm transform active:scale-95 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function FormatCheck({ color }) {
  const colors = { blue: "bg-blue-500", orange: "bg-orange-500", purple: "bg-purple-500" };
  return (
    <div className={`absolute top-3 right-3 w-5 h-5 ${colors[color] || colors.blue} rounded-full flex items-center justify-center`}>
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}

export default MCreateTournament;
