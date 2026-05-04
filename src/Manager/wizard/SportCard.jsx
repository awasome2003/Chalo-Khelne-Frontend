import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Trash2, ChevronDown } from "lucide-react";
import { generateFormFields } from "../../utils/ruleBookFormEngine";
import TeamKnockoutFormatSelector from "../TeamKnockoutFormatSelector";
import Card from "./Card";
import FieldLabel from "./FieldLabel";
import NumberInput from "./NumberInput";
import Select from "./Select";
import ExpandableSection from "./ExpandableSection";
import OptionCard from "./OptionCard";
import DashedAddButton from "./DashedAddButton";
import SportNumberBadge from "./SportNumberBadge";
import {
  isTeamOnlySport,
  isIndividualOnlySport,
  isNestedSetSport,
  SPORT_SCORING_TYPES,
  slugifyForSport,
  getUnrankedDefaults,
} from "./sportClassification";

// ─── Section D body — Unranked custom-rules editable form ────────────────
function UnrankedCustomRules({ sport, onUpdate }) {
  const v = sport._ruleBookValues || {};
  const scoringType = sport.scoringType || SPORT_SCORING_TYPES[sport.sportName] || "sets";

  const setVal = (path, value) => {
    onUpdate({
      _ruleBookValues: { ...(sport._ruleBookValues || {}), [path]: value },
    });
  };
  const num = (path) => (e) => setVal(path, e.target.value === "" ? null : Number(e.target.value));

  if (scoringType === "single") {
    return (
      <div className="text-sm text-gray-500 italic px-1">
        Single-result scoring — no extra format fields needed.
      </div>
    );
  }

  if (scoringType === "innings") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Overs</FieldLabel>
          <NumberInput value={v["format.oversCount"] ?? 20} onChange={num("format.oversCount")} min={1} />
        </div>
        <div>
          <FieldLabel>Innings</FieldLabel>
          <NumberInput value={v["format.inningsCount"] ?? 2} onChange={num("format.inningsCount")} min={1} />
        </div>
      </div>
    );
  }

  if (scoringType === "time") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Halves</FieldLabel>
          <NumberInput value={v["format.halvesCount"] ?? 2} onChange={num("format.halvesCount")} min={1} />
        </div>
        <div>
          <FieldLabel>Half Duration (min)</FieldLabel>
          <NumberInput value={v["format.halvesDuration"] ?? 45} onChange={num("format.halvesDuration")} min={5} />
        </div>
      </div>
    );
  }

  // sets (and nestedSets variant for Tennis)
  const isNested = isNestedSetSport(sport.sportName);
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <FieldLabel>Total Sets</FieldLabel>
        <NumberInput value={v["format.totalSets"] ?? 3} onChange={num("format.totalSets")} min={1} />
      </div>
      {isNested ? (
        <>
          <div>
            <FieldLabel>Games Per Set</FieldLabel>
            <NumberInput value={v["format.gamesPerSet"] ?? 6} onChange={num("format.gamesPerSet")} min={1} />
          </div>
          <div>
            <FieldLabel>Points Per Game</FieldLabel>
            <NumberInput value={v["format.pointsPerGame"] ?? 4} onChange={num("format.pointsPerGame")} min={1} />
          </div>
        </>
      ) : (
        <div>
          <FieldLabel>Points Per Set</FieldLabel>
          <NumberInput value={v["format.pointsPerSet"] ?? 11} onChange={num("format.pointsPerSet")} min={1} />
        </div>
      )}
      <div>
        <FieldLabel>Win By Margin</FieldLabel>
        <NumberInput value={v["format.winByMargin"] ?? 2} onChange={num("format.winByMargin")} min={0} />
      </div>
    </div>
  );
}

// ─── Section D body — Ranked locked rules grid (read-only) ───────────────
// Renders engine-generated form sections with all inputs disabled. Source
// of truth is sport._ruleBookValues (seeded from engine defaults on fetch
// or from edit-loaded matchFormat via matchFormatToRuleBookValues).
function LockedRulesGrid({ ruleBook, ruleBookValues }) {
  const { sections } = generateFormFields(ruleBook);
  if (!sections.length) {
    return (
      <div className="text-sm text-gray-500 italic px-1">
        No rule sections to display.
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.id}>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            {section.title}
            {section.subtitle && (
              <span className="ml-2 text-gray-400 normal-case font-normal">({section.subtitle})</span>
            )}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.fields.map((field) => {
              const value = ruleBookValues[field.path] ?? field.defaultValue;
              return (
                <div key={field.path} className={field.type === "multiselect" ? "sm:col-span-2" : ""}>
                  <FieldLabel>{field.label}</FieldLabel>
                  <LockedFieldDisplay field={field} value={value} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LockedFieldDisplay({ field, value }) {
  if (field.type === "boolean") {
    return (
      <div className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700">
        {value ? "Yes" : "No"}
      </div>
    );
  }
  if (field.type === "multiselect" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 min-h-[44px]">
        {value.length > 0 ? (
          value.map((v) => (
            <span key={v} className="text-xs text-gray-600 bg-white border border-gray-200 rounded-full px-2 py-0.5">{v}</span>
          ))
        ) : (
          <span className="text-sm text-gray-400 italic">None</span>
        )}
      </div>
    );
  }
  return (
    <input
      type="text"
      value={value == null ? "" : String(value)}
      disabled
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 cursor-not-allowed"
    />
  );
}

// ─── Section D body — dispatcher ─────────────────────────────────────────
function SectionDBody({ sport, tournamentLevel, onUpdate }) {
  // For ranked levels, the lazy fetch effect early-returns when sportName is
  // empty (no URL to hit). Without this guard, Section D would sit on the
  // "Preparing…" placeholder forever — the user reports this as "not opening
  // at all". Show an explicit prompt instead.
  if (tournamentLevel !== "unranked" && !sport.sportName) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        Pick a sport above first — locked rules are looked up per sport + level.
      </div>
    );
  }
  if (tournamentLevel === "unranked") {
    return <UnrankedCustomRules sport={sport} onUpdate={onUpdate} />;
  }
  if (sport._loadingRuleBook) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-500">
        <span className="inline-block w-4 h-4 mr-2 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
        Loading {tournamentLevel} rules for {sport.sportName}…
      </div>
    );
  }
  if (sport._ruleBookFetchAttempted && !sport._ruleBook) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        No locked rule book exists for <strong className="font-semibold">{sport.sportName}</strong> at <strong className="font-semibold">{tournamentLevel}</strong> level. Match format will use defaults.
      </div>
    );
  }
  if (sport._ruleBook) {
    return <LockedRulesGrid ruleBook={sport._ruleBook} ruleBookValues={sport._ruleBookValues || {}} />;
  }
  // Transient — effect hasn't fired yet (≤1 frame).
  return (
    <div className="flex items-center justify-center py-6 text-sm text-gray-400">
      Preparing…
    </div>
  );
}

// ─── SportCard ───────────────────────────────────────────────────────────
export default function SportCard({
  sport,
  index,
  totalSports,
  sportsList,
  onUpdate,
  onRemove,
  onToggleExpand,
  // Sub-step 8 — keys are sport-relative paths sliced by the parent:
  //   "sportName", "tournamentLevel", "type", "categories",
  //   "categories[N].name", "ruleBook".
  // No global banner; each error renders inline at its target.
  errors = {},
  // Per-sport level — caller passes the 5-element FIXED_LEVELS array so
  // SportCard doesn't need its own copy.
  fixedLevels = ["district", "state", "national", "international", "unranked"],
}) {
  const [isSectionDOpen, setIsSectionDOpen] = useState(false);

  // Per-sport level read from the sport entry (replaces parent-supplied prop).
  const tournamentLevel = sport.tournamentLevel || "";

  const isTeam = isTeamOnlySport(sport.sportName);
  const isIndividual = isIndividualOnlySport(sport.sportName);

  // Selected Tournament Type card derivation from (type, knockoutFormat).
  const selectedTypeCard = (() => {
    const t = sport.type || "";
    const kf = sport.knockoutFormat || "";
    if (t === "knockout + group stage") return "groupKO";
    if (t === "knockout") {
      if (kf === "Davis Cup" || kf === "Teams Knockout") return "team";
      return "knockout";
    }
    return null;
  })();

  // ── Lazy rule-book fetch ────────────────────────────────────────────────
  // Fires when Section D first opens for this sport at the current
  // tournament level. One-shot guarded by _ruleBookFetchAttempted.
  useEffect(() => {
    if (!isSectionDOpen) return;
    if (!sport.sportName || !tournamentLevel) return;
    if (sport._loadingRuleBook) return;
    if (sport._ruleBookFetchAttempted) return;

    if (tournamentLevel === "unranked") {
      // No HTTP fetch for unranked. Seed defaults if values are empty;
      // preserve edit-loaded values otherwise (Q2b).
      const haveValues = Object.keys(sport._ruleBookValues || {}).length > 0;
      onUpdate({
        _ruleBookValues: haveValues ? sport._ruleBookValues : getUnrankedDefaults(sport.sportName),
        _ruleBookFetchAttempted: true,
      });
      return;
    }

    let cancelled = false;
    onUpdate({ _loadingRuleBook: true });

    axios
      .get(`/api/sport-rules/sport/${sport.sportName}/${tournamentLevel}`)
      .then((res) => {
        if (cancelled) return;
        const rb = res.data?.data || null;
        const { defaults } = rb ? generateFormFields(rb) : { defaults: {} };
        // Preserve user's saved overrides (edit mode) — only seed if empty.
        const existing = sport._ruleBookValues || {};
        const merged = Object.keys(existing).length > 0 ? existing : { ...defaults };
        onUpdate({
          _ruleBook: rb,
          _ruleBookValues: merged,
          _ruleBookErrors: {},
          _loadingRuleBook: false,
          _ruleBookFetchAttempted: true,
        });
      })
      .catch(() => {
        if (cancelled) return;
        onUpdate({
          _ruleBook: null,
          _loadingRuleBook: false,
          _ruleBookFetchAttempted: true,
        });
      });

    return () => {
      cancelled = true;
    };

    // _ruleBookFetchAttempted is intentionally NOT in this dep array.
    //
    // It is read inside as a one-shot guard against re-fetching after we've
    // already tried once for the current (sportName, tournamentLevel) pair.
    // If we listed it as a dep, the effect would re-fire as a no-op on
    // every parent rerender immediately after we set the flag, and each
    // user-driven dep change (sportName, tournamentLevel, isSectionDOpen)
    // would schedule TWO effect runs instead of one — first under the old
    // flag value, then again after the flag updates.
    //
    // The flag is treated as imperative state for "have we tried?" — not
    // reactive state. Cache invalidation is handled at the parent:
    //   - SportCard's onSportChange (below) resets the flag to false when
    //     the sport name changes.
    //   - The parent's level-invalidation useEffect resets the flag to
    //     false on every sport when tournamentLevel changes.
    // Both paths cause this effect to refire (via the legitimate deps) and
    // see _ruleBookFetchAttempted=false, which kicks off a fresh fetch.
    //
    // Do NOT add _ruleBookFetchAttempted, _ruleBook, _ruleBookValues, or
    // _loadingRuleBook to this dep array — doing so will cause infinite
    // re-fetch loops or double-fires on every fetch.
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSectionDOpen, sport.sportName, tournamentLevel]);

  // ── Sport change handler ───────────────────────────────────────────────
  // Picking a new sport may invalidate the current Tournament Type
  // selection (e.g. switching from racquet to team-only). Auto-correct
  // type/knockoutFormat to a value consistent with the new classification.
  const onSportChange = useCallback((newName) => {
    const isTeam2 = isTeamOnlySport(newName);
    const isIndiv2 = isIndividualOnlySport(newName);

    let newType = sport.type || "knockout + group stage";
    let newKnockoutFormat = sport.knockoutFormat || "Singles";
    let newGroupStageFormat = sport.groupStageFormat || "Singles";

    if (isTeam2) {
      newType = "knockout";
      newKnockoutFormat = "Teams Knockout";
      newGroupStageFormat = "Teams";
    } else if (
      isIndiv2 &&
      (newKnockoutFormat === "Davis Cup" || newKnockoutFormat === "Teams Knockout")
    ) {
      newType = "knockout";
      newKnockoutFormat = "Singles";
    }

    onUpdate({
      sportName: newName,
      sportSlug: slugifyForSport(newName),
      scoringType: SPORT_SCORING_TYPES[newName] || "sets",
      type: newType,
      knockoutFormat: newKnockoutFormat,
      groupStageFormat: newGroupStageFormat,
      // Invalidate rule book — different sport means different rules.
      _ruleBook: null,
      _ruleBookValues: {},
      _ruleBookErrors: {},
      _loadingRuleBook: false,
      _ruleBookFetchAttempted: false,
    });
  }, [sport.type, sport.knockoutFormat, sport.groupStageFormat, onUpdate]);

  // ── Level change handler ───────────────────────────────────────────────
  // Mirrors onSportChange's rule-book invalidation: a different level for
  // the same sport means a different rule book on Section D's next open.
  // Preserves _ruleBookValues so user edits survive level toggles (Section D
  // overlays engine defaults only when values are empty — see Sub-step 3 Q2b).
  const onLevelChange = useCallback((newLevel) => {
    onUpdate({
      tournamentLevel: newLevel,
      _ruleBook: null,
      _ruleBookErrors: {},
      _loadingRuleBook: false,
      _ruleBookFetchAttempted: false,
    });
  }, [onUpdate]);

  const selectTypeCard = useCallback((cardId) => {
    const koPreserve = (sport.knockoutFormat === "Davis Cup" || sport.knockoutFormat === "Teams Knockout")
      ? "Singles"
      : (sport.knockoutFormat || "Singles");

    if (cardId === "groupKO") {
      onUpdate({
        type: "knockout + group stage",
        knockoutFormat: koPreserve,
        groupStageFormat: sport.groupStageFormat || "Singles",
      });
    } else if (cardId === "knockout") {
      onUpdate({
        type: "knockout",
        knockoutFormat: koPreserve,
      });
    } else if (cardId === "team") {
      onUpdate({
        type: "knockout",
        knockoutFormat: isTeam ? "Teams Knockout" : "Davis Cup",
      });
    }
  }, [sport.knockoutFormat, sport.groupStageFormat, isTeam, onUpdate]);

  // ── Categories handlers ────────────────────────────────────────────────
  const addCategory = () => {
    onUpdate({ categories: [...(sport.categories || []), { name: "", fee: 0 }] });
  };
  const updateCategory = (i, field, value) => {
    onUpdate({
      categories: (sport.categories || []).map((c, idx) =>
        idx === i ? { ...c, [field]: field === "fee" ? Math.max(0, Number(value) || 0) : value } : c
      ),
    });
  };
  const removeCategory = (i) => {
    if ((sport.categories || []).length <= 1) return;
    onUpdate({ categories: (sport.categories || []).filter((_, idx) => idx !== i) });
  };

  const categoryCount = sport.categories?.length || 0;
  const accent = sport.sportName ? "border-l-emerald-500" : "border-l-gray-200";

  return (
    <Card
      className={`p-0 overflow-hidden border-l-4 ${accent}`}
      data-sport-index={index}
    >
      {/* HEADER — clickable to expand/collapse */}
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={!!sport._expanded}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-gray-50/50 transition-colors duration-100 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SportNumberBadge index={index + 1} />
          <span
            className={`text-sm font-semibold truncate ${
              sport.sportName ? "text-gray-900" : "text-gray-400 italic"
            }`}
          >
            {sport.sportName || "Select a sport"}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
            {categoryCount} {categoryCount === 1 ? "category" : "categories"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            role="button"
            tabIndex={totalSports === 1 ? -1 : 0}
            aria-label="Remove sport"
            aria-disabled={totalSports === 1}
            onClick={(e) => {
              e.stopPropagation();
              if (totalSports === 1) return;
              onRemove();
            }}
            onKeyDown={(e) => {
              if (totalSports === 1) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }
            }}
            className={`inline-flex p-1.5 rounded-lg transition-colors ${
              totalSports === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-150 ease-out ${
              sport._expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* BODY — display toggle (no Collapsible animation here).
          Collapsible measures scrollHeight when its open prop transitions and
          caps max-height to that snapshot for 150ms. When children grow
          synchronously inside that window (e.g. Tournament Type cards
          appearing after sport-pick, or the Davis Cup format list rendering),
          the cap clips them — observed as "+ Add Category and Sections C/D
          disappear after picking Cricket". Display toggle has no measurement,
          no cap. Trade-off: open/close snaps instead of animating. */}
      <div style={{ display: sport._expanded ? "block" : "none" }} aria-hidden={!sport._expanded}>
        <div className="px-6 pb-6 pt-2 space-y-6 border-t border-gray-100">
          {/* SECTION A — Sport Identity */}
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor={`sport-${sport._key}`} required>Sport</FieldLabel>
              <Select
                id={`sport-${sport._key}`}
                value={sport.sportName || ""}
                onChange={(e) => onSportChange(e.target.value)}
                placeholder="Select a sport"
                options={(sportsList || []).map((s) => ({ value: s.name, label: s.name }))}
                error={errors.sportName}
              />
            </div>

            {/* Tournament Level — per-sport segmented selector. Same 5
                options as the legacy tournament-wide field. Picking a level
                triggers Section D's lazy fetch on next open. */}
            <div data-field-sport-level={index}>
              <FieldLabel required>Tournament Level</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {fixedLevels.map((level) => {
                  const selected = tournamentLevel === level;
                  const hasError = !!errors.tournamentLevel;
                  const display = level === "unranked"
                    ? "Unranked"
                    : level.charAt(0).toUpperCase() + level.slice(1);
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onLevelChange(level)}
                      aria-pressed={selected}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-colors duration-150 ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
                          : hasError
                            ? "border-red-200 bg-red-50/30 text-gray-600 hover:border-red-300"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {display}
                    </button>
                  );
                })}
              </div>
              {errors.tournamentLevel && (
                <p className="text-xs text-red-500 mt-1.5">{errors.tournamentLevel}</p>
              )}
              {!errors.tournamentLevel && tournamentLevel === "unranked" && (
                <p className="text-xs text-gray-500 mt-1.5">Custom rules — define your match format below.</p>
              )}
            </div>

            {sport.sportName && (
              <div>
                <FieldLabel>Tournament Type</FieldLabel>
                {isTeam && (
                  <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
                    {sport.sportName} uses Team Knockout format.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {!isTeam && (
                    <OptionCard
                      icon="🏆"
                      title="Group Stage + Knockout"
                      description="Round-robin groups then elimination bracket"
                      selected={selectedTypeCard === "groupKO"}
                      onClick={() => selectTypeCard("groupKO")}
                    />
                  )}
                  {!isTeam && (
                    <OptionCard
                      icon="⚡"
                      title="Knockout Only"
                      description="Direct elimination bracket"
                      selected={selectedTypeCard === "knockout"}
                      onClick={() => selectTypeCard("knockout")}
                    />
                  )}
                  {!isIndividual && (
                    <OptionCard
                      icon="🛡"
                      title={isTeam ? "Teams Knockout" : "Team Knockout"}
                      description={
                        isTeam
                          ? "Team-vs-team elimination bracket"
                          : "Davis Cup singles + doubles format"
                      }
                      selected={selectedTypeCard === "team"}
                      onClick={() => selectTypeCard("team")}
                    />
                  )}
                </div>
                {errors.type && (
                  <p className="text-xs text-red-500 mt-2">{errors.type}</p>
                )}
              </div>
            )}
          </div>

          {/* SECTION B — Categories & Fees */}
          <div className="space-y-3">
            <FieldLabel>Categories &amp; Registration Fees</FieldLabel>
            <div className="space-y-2">
              {(sport.categories || []).map((cat, ci) => {
                const isFree = Number(cat.fee || 0) === 0;
                const nameError = errors[`categories[${ci}].name`];
                const nameErrClass = nameError
                  ? "border-red-200 border-l-4 border-l-red-500 bg-red-50/30"
                  : "border-gray-200 bg-white";
                return (
                  <div key={ci}>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={cat.name || ""}
                        onChange={(e) => updateCategory(ci, "name", e.target.value)}
                        placeholder="Category name"
                        aria-invalid={!!nameError || undefined}
                        className={`flex-1 px-4 py-2.5 rounded-xl border ${nameErrClass} text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-[border-color,background-color,border-left-width] duration-100 ease-out`}
                      />
                      <div className="relative w-28 flex-shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={cat.fee ?? 0}
                          onChange={(e) => updateCategory(ci, "fee", e.target.value)}
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-100"
                        />
                      </div>
                      {isFree && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5 flex-shrink-0">
                          Free
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeCategory(ci)}
                        disabled={(sport.categories || []).length <= 1}
                        aria-label="Remove category"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {nameError && (
                      <p className="text-xs text-red-500 mt-1">{nameError}</p>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.categories && (
              <p className="text-xs text-red-500">{errors.categories}</p>
            )}
            <DashedAddButton onClick={addCategory}>+ Add Category</DashedAddButton>
          </div>

          {/* SECTION C — Format Details. Plain conditional render (no
              Collapsible) for the same reason as the outer body — children
              grow synchronously (e.g. TeamKnockoutFormatSelector with its
              long list of format cards) and the scrollHeight cap clipped
              them mid-render. */}
          {!!(sport.sportName && selectedTypeCard) && (
            <div>
              {selectedTypeCard === "groupKO" && (
                <div className="space-y-4 pt-1">
                  <div>
                    <FieldLabel htmlFor={`gsformat-${sport._key}`}>Group Stage Format</FieldLabel>
                    <Select
                      id={`gsformat-${sport._key}`}
                      value={sport.groupStageFormat || "Singles"}
                      onChange={(e) => onUpdate({ groupStageFormat: e.target.value })}
                      options={["Singles", "Doubles"]}
                    />
                  </div>
                  <div className="pl-4 border-l-2 border-gray-100">
                    <FieldLabel htmlFor={`qpg-${sport._key}`}>Qualify Per Group</FieldLabel>
                    <Select
                      id={`qpg-${sport._key}`}
                      value={String(sport.qualifyPerGroup ?? 2)}
                      onChange={(e) => onUpdate({ qualifyPerGroup: Number(e.target.value) })}
                      options={[
                        { value: "1", label: "Top 1" },
                        { value: "2", label: "Top 2" },
                        { value: "3", label: "Top 3" },
                        { value: "4", label: "Top 4" },
                      ]}
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Top N players from each group advance to knockout.</p>
                  </div>
                  <div>
                    <FieldLabel htmlFor={`koformat-${sport._key}`}>Knockout Format</FieldLabel>
                    <Select
                      id={`koformat-${sport._key}`}
                      value={sport.knockoutFormat || "Singles"}
                      onChange={(e) => onUpdate({ knockoutFormat: e.target.value })}
                      options={["Singles", "Doubles"]}
                    />
                  </div>
                </div>
              )}

              {selectedTypeCard === "knockout" && (
                <div className="space-y-4 pt-1">
                  <div>
                    <FieldLabel htmlFor={`koformat-${sport._key}`}>Knockout Format</FieldLabel>
                    <Select
                      id={`koformat-${sport._key}`}
                      value={sport.knockoutFormat || "Singles"}
                      onChange={(e) => onUpdate({ knockoutFormat: e.target.value })}
                      options={["Singles", "Doubles"]}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor={`drawsize-${sport._key}`}>Draw Size</FieldLabel>
                    <Select
                      id={`drawsize-${sport._key}`}
                      value={sport.drawSize == null ? "" : String(sport.drawSize)}
                      onChange={(e) =>
                        onUpdate({ drawSize: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      options={[
                        { value: "", label: "Auto" },
                        { value: "16", label: "16" },
                        { value: "32", label: "32" },
                        { value: "64", label: "64" },
                      ]}
                    />
                  </div>
                </div>
              )}

              {selectedTypeCard === "team" && !isTeam && (
                <div className="pt-1">
                  <TeamKnockoutFormatSelector
                    value={sport.davisCupFormatId || ""}
                    onChange={(id) => onUpdate({ davisCupFormatId: id })}
                  />
                </div>
              )}

              {selectedTypeCard === "team" && isTeam && (
                <div className="pt-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-600">
                    Teams compete head-to-head in a single elimination bracket. No additional format selection needed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SECTION D — Rules & Match Format (always last, collapsible).
              Third state when tournamentLevel is empty: render a static
              non-interactive header (no chevron, no expand) — user must
              return to Step 1 to pick a level before rules can be configured. */}
          {!tournamentLevel ? (
            <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
              <span className="text-sm font-medium text-gray-500">
                Select a tournament level to configure rules
              </span>
            </div>
          ) : (
            <div>
              <ExpandableSection
                open={isSectionDOpen}
                onToggle={() => setIsSectionDOpen((o) => !o)}
                label={tournamentLevel === "unranked" ? "⚙️ Custom Match Format" : "📋 Sport Rules — Locked"}
                animate={false}
              >
                <SectionDBody sport={sport} tournamentLevel={tournamentLevel} onUpdate={onUpdate} />
              </ExpandableSection>
              {errors.ruleBook && (
                <p className="text-xs text-red-500 mt-1.5">{errors.ruleBook}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
