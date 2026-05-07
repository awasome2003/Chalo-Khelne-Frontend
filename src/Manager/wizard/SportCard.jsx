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

const SIG = "#5E6AD2";
const SIG_TINT = "rgba(94,106,210,0.08)";
const SIG_TINT_RING = "rgba(94,106,210,0.18)";

function UnrankedCustomRules({ sport, onUpdate }) {
  const v = sport._ruleBookValues || {};
  const scoringType = sport.scoringType || SPORT_SCORING_TYPES[sport.sportName] || "sets";

  const setVal = (path, value) => {
    onUpdate({
      _ruleBookValues: { ...(sport._ruleBookValues || {}), [path]: value },
    });
  };
  const num = (path) => (e) =>
    setVal(path, e.target.value === "" ? null : Number(e.target.value));

  if (scoringType === "single") {
    return (
      <div className="text-[12px] text-neutral-500 italic px-1">
        Single-result scoring — no extra format fields needed.
      </div>
    );
  }

  if (scoringType === "innings") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Overs</FieldLabel>
          <NumberInput
            value={v["format.oversCount"] ?? 20}
            onChange={num("format.oversCount")}
            min={1}
          />
        </div>
        <div>
          <FieldLabel>Innings</FieldLabel>
          <NumberInput
            value={v["format.inningsCount"] ?? 2}
            onChange={num("format.inningsCount")}
            min={1}
          />
        </div>
      </div>
    );
  }

  if (scoringType === "time") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Halves</FieldLabel>
          <NumberInput
            value={v["format.halvesCount"] ?? 2}
            onChange={num("format.halvesCount")}
            min={1}
          />
        </div>
        <div>
          <FieldLabel>Half duration (min)</FieldLabel>
          <NumberInput
            value={v["format.halvesDuration"] ?? 45}
            onChange={num("format.halvesDuration")}
            min={5}
          />
        </div>
      </div>
    );
  }

  const isNested = isNestedSetSport(sport.sportName);
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <FieldLabel>Total sets</FieldLabel>
        <NumberInput
          value={v["format.totalSets"] ?? 3}
          onChange={num("format.totalSets")}
          min={1}
        />
      </div>
      {isNested ? (
        <>
          <div>
            <FieldLabel>Games per set</FieldLabel>
            <NumberInput
              value={v["format.gamesPerSet"] ?? 6}
              onChange={num("format.gamesPerSet")}
              min={1}
            />
          </div>
          <div>
            <FieldLabel>Points per game</FieldLabel>
            <NumberInput
              value={v["format.pointsPerGame"] ?? 4}
              onChange={num("format.pointsPerGame")}
              min={1}
            />
          </div>
        </>
      ) : (
        <div>
          <FieldLabel>Points per set</FieldLabel>
          <NumberInput
            value={v["format.pointsPerSet"] ?? 11}
            onChange={num("format.pointsPerSet")}
            min={1}
          />
        </div>
      )}
      <div>
        <FieldLabel>Win by margin</FieldLabel>
        <NumberInput
          value={v["format.winByMargin"] ?? 2}
          onChange={num("format.winByMargin")}
          min={0}
        />
      </div>
    </div>
  );
}

function LockedRulesGrid({ ruleBook, ruleBookValues }) {
  const { sections } = generateFormFields(ruleBook);
  if (!sections.length) {
    return (
      <div className="text-[12px] text-neutral-500 italic px-1">
        No rule sections to display.
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.id}>
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-2">
            {section.title}
            {section.subtitle && (
              <span className="ml-2 text-neutral-400 normal-case font-normal tracking-normal">
                ({section.subtitle})
              </span>
            )}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.fields.map((field) => {
              const value = ruleBookValues[field.path] ?? field.defaultValue;
              return (
                <div
                  key={field.path}
                  className={field.type === "multiselect" ? "sm:col-span-2" : ""}
                >
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
      <div className="px-3 h-9 inline-flex items-center rounded-lg border border-neutral-200 bg-neutral-50 text-[13px] text-neutral-700 w-full">
        {value ? "Yes" : "No"}
      </div>
    );
  }
  if (field.type === "multiselect" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 min-h-[36px]">
        {value.length > 0 ? (
          value.map((v) => (
            <span
              key={v}
              className="text-[11px] text-neutral-700 bg-white border border-neutral-200 rounded-md px-1.5 py-0.5"
            >
              {v}
            </span>
          ))
        ) : (
          <span className="text-[12px] text-neutral-400 italic">None</span>
        )}
      </div>
    );
  }
  return (
    <input
      type="text"
      value={value == null ? "" : String(value)}
      disabled
      className="w-full h-9 px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-[13px] text-neutral-700 cursor-not-allowed"
    />
  );
}

function SectionDBody({ sport, tournamentLevel, onUpdate }) {
  if (tournamentLevel !== "unranked" && !sport.sportName) {
    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[12px] text-neutral-700">
        Pick a sport above first — locked rules are looked up per sport + level.
      </div>
    );
  }
  if (tournamentLevel === "unranked") {
    return <UnrankedCustomRules sport={sport} onUpdate={onUpdate} />;
  }
  if (sport._loadingRuleBook) {
    return (
      <div className="flex items-center justify-center py-6 text-[12px] text-neutral-500">
        <span
          className="inline-block w-3.5 h-3.5 mr-2 border-2 border-neutral-300 rounded-full animate-spin"
          style={{ borderTopColor: SIG }}
        />
        Loading {tournamentLevel} rules for {sport.sportName}…
      </div>
    );
  }
  if (sport._ruleBookFetchAttempted && !sport._ruleBook) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[12px] text-amber-800">
        No locked rule book exists for{" "}
        <strong className="font-semibold">{sport.sportName}</strong> at{" "}
        <strong className="font-semibold">{tournamentLevel}</strong> level. Match
        format will use defaults.
      </div>
    );
  }
  if (sport._ruleBook) {
    return (
      <LockedRulesGrid
        ruleBook={sport._ruleBook}
        ruleBookValues={sport._ruleBookValues || {}}
      />
    );
  }
  return (
    <div className="flex items-center justify-center py-6 text-[12px] text-neutral-400">
      Preparing…
    </div>
  );
}

export default function SportCard({
  sport,
  index,
  totalSports,
  sportsList,
  onUpdate,
  onRemove,
  onToggleExpand,
  errors = {},
  fixedLevels = ["district", "state", "national", "international", "unranked"],
}) {
  const [isSectionDOpen, setIsSectionDOpen] = useState(false);

  const tournamentLevel = sport.tournamentLevel || "";
  const isTeam = isTeamOnlySport(sport.sportName);
  const isIndividual = isIndividualOnlySport(sport.sportName);

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

  useEffect(() => {
    if (!isSectionDOpen) return;
    if (!sport.sportName || !tournamentLevel) return;
    if (sport._loadingRuleBook) return;
    if (sport._ruleBookFetchAttempted) return;

    if (tournamentLevel === "unranked") {
      const haveValues = Object.keys(sport._ruleBookValues || {}).length > 0;
      onUpdate({
        _ruleBookValues: haveValues
          ? sport._ruleBookValues
          : getUnrankedDefaults(sport.sportName),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSectionDOpen, sport.sportName, tournamentLevel]);

  const onSportChange = useCallback(
    (newName) => {
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
        _ruleBook: null,
        _ruleBookValues: {},
        _ruleBookErrors: {},
        _loadingRuleBook: false,
        _ruleBookFetchAttempted: false,
      });
    },
    [sport.type, sport.knockoutFormat, sport.groupStageFormat, onUpdate]
  );

  const onLevelChange = useCallback(
    (newLevel) => {
      onUpdate({
        tournamentLevel: newLevel,
        _ruleBook: null,
        _ruleBookErrors: {},
        _loadingRuleBook: false,
        _ruleBookFetchAttempted: false,
      });
    },
    [onUpdate]
  );

  const selectTypeCard = useCallback(
    (cardId) => {
      const koPreserve =
        sport.knockoutFormat === "Davis Cup" ||
        sport.knockoutFormat === "Teams Knockout"
          ? "Singles"
          : sport.knockoutFormat || "Singles";

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
    },
    [sport.knockoutFormat, sport.groupStageFormat, isTeam, onUpdate]
  );

  const addCategory = () => {
    onUpdate({
      categories: [...(sport.categories || []), { name: "", fee: 0 }],
    });
  };
  const updateCategory = (i, field, value) => {
    onUpdate({
      categories: (sport.categories || []).map((c, idx) =>
        idx === i
          ? {
              ...c,
              [field]:
                field === "fee" ? Math.max(0, Number(value) || 0) : value,
            }
          : c
      ),
    });
  };
  const removeCategory = (i) => {
    if ((sport.categories || []).length <= 1) return;
    onUpdate({
      categories: (sport.categories || []).filter((_, idx) => idx !== i),
    });
  };

  const categoryCount = sport.categories?.length || 0;

  return (
    <Card
      className="p-0 overflow-hidden border-l-2"
      data-sport-index={index}
      style={{ borderLeftColor: sport.sportName ? SIG : "#E5E5E5" }}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={!!sport._expanded}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-neutral-50/60 transition text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SportNumberBadge index={index + 1} />
          <span
            className={`text-[13px] font-semibold truncate ${
              sport.sportName ? "text-neutral-950" : "text-neutral-400 italic"
            }`}
          >
            {sport.sportName || "Select a sport"}
          </span>
          <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 flex-shrink-0">
            {categoryCount}{" "}
            {categoryCount === 1 ? "category" : "categories"}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
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
            className={`inline-flex items-center justify-center h-7 w-7 rounded-md transition ${
              totalSports === 1
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform duration-150 ease-out ${
              sport._expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        style={{ display: sport._expanded ? "block" : "none" }}
        aria-hidden={!sport._expanded}
      >
        <div className="px-6 pb-6 pt-3 space-y-5 border-t border-neutral-100">
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor={`sport-${sport._key}`} required>
                Sport
              </FieldLabel>
              <Select
                id={`sport-${sport._key}`}
                value={sport.sportName || ""}
                onChange={(e) => onSportChange(e.target.value)}
                placeholder="Select a sport"
                options={(sportsList || []).map((s) => ({
                  value: s.name,
                  label: s.name,
                }))}
                error={errors.sportName}
              />
            </div>

            <div data-field-sport-level={index}>
              <FieldLabel required>Tournament level</FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {fixedLevels.map((level) => {
                  const selected = tournamentLevel === level;
                  const hasError = !!errors.tournamentLevel;
                  const display =
                    level === "unranked"
                      ? "Unranked"
                      : level.charAt(0).toUpperCase() + level.slice(1);
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => onLevelChange(level)}
                      aria-pressed={selected}
                      className={`h-8 px-2 rounded-lg text-[12px] font-medium border transition ${
                        selected
                          ? "border-transparent ring-2 text-neutral-950"
                          : hasError
                          ? "border-rose-200 bg-rose-50/40 text-neutral-700 hover:border-rose-300"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                      style={
                        selected
                          ? {
                              backgroundColor: SIG_TINT,
                              "--tw-ring-color": SIG,
                            }
                          : undefined
                      }
                    >
                      {display}
                    </button>
                  );
                })}
              </div>
              {errors.tournamentLevel && (
                <p className="text-[11px] text-rose-600 mt-1.5 font-medium">
                  {errors.tournamentLevel}
                </p>
              )}
              {!errors.tournamentLevel && tournamentLevel === "unranked" && (
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Custom rules — define your match format below.
                </p>
              )}
            </div>

            {sport.sportName && (
              <div>
                <FieldLabel>Tournament type</FieldLabel>
                {isTeam && (
                  <p className="text-[12px] text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 mb-2">
                    {sport.sportName} uses Team Knockout format.
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {!isTeam && (
                    <OptionCard
                      icon="🏆"
                      title="Group stage + knockout"
                      description="Round-robin groups then elimination bracket"
                      selected={selectedTypeCard === "groupKO"}
                      onClick={() => selectTypeCard("groupKO")}
                    />
                  )}
                  {!isTeam && (
                    <OptionCard
                      icon="⚡"
                      title="Knockout only"
                      description="Direct elimination bracket"
                      selected={selectedTypeCard === "knockout"}
                      onClick={() => selectTypeCard("knockout")}
                    />
                  )}
                  {!isIndividual && (
                    <OptionCard
                      icon="🛡"
                      title={isTeam ? "Teams knockout" : "Team knockout"}
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
                  <p className="text-[11px] text-rose-600 mt-1.5 font-medium">
                    {errors.type}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <FieldLabel>Categories &amp; registration fees</FieldLabel>
            <div className="space-y-2">
              {(sport.categories || []).map((cat, ci) => {
                const isFree = Number(cat.fee || 0) === 0;
                const nameError = errors[`categories[${ci}].name`];
                return (
                  <div key={ci}>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={cat.name || ""}
                        onChange={(e) =>
                          updateCategory(ci, "name", e.target.value)
                        }
                        placeholder="Category name"
                        aria-invalid={!!nameError || undefined}
                        className={`flex-1 h-9 px-3 rounded-lg border text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition ${
                          nameError
                            ? "border-rose-300 bg-rose-50/40"
                            : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                        style={{
                          "--tw-ring-color": nameError
                            ? "rgba(244,63,94,0.18)"
                            : SIG_TINT_RING,
                        }}
                        onFocus={(e) => {
                          if (!nameError)
                            e.currentTarget.style.borderColor = SIG;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "";
                        }}
                      />
                      <div className="relative w-24 flex-shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-[12px] pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={cat.fee ?? 0}
                          onChange={(e) =>
                            updateCategory(ci, "fee", e.target.value)
                          }
                          className="w-full h-9 pl-6 pr-2 rounded-lg border border-neutral-200 bg-white text-[13px] font-mono tabular-nums text-neutral-900 focus:outline-none focus:ring-2 transition"
                          style={{
                            "--tw-ring-color": SIG_TINT_RING,
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = SIG;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "";
                          }}
                        />
                      </div>
                      {isFree && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.5 flex-shrink-0">
                          Free
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeCategory(ci)}
                        disabled={(sport.categories || []).length <= 1}
                        aria-label="Remove category"
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {nameError && (
                      <p className="text-[11px] text-rose-600 mt-1 font-medium">
                        {nameError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {errors.categories && (
              <p className="text-[11px] text-rose-600 font-medium">
                {errors.categories}
              </p>
            )}
            <DashedAddButton onClick={addCategory}>
              Add category
            </DashedAddButton>
          </div>

          {!!(sport.sportName && selectedTypeCard) && (
            <div>
              {selectedTypeCard === "groupKO" && (
                <div className="space-y-3.5 pt-1">
                  <div>
                    <FieldLabel htmlFor={`gsformat-${sport._key}`}>
                      Group stage format
                    </FieldLabel>
                    <Select
                      id={`gsformat-${sport._key}`}
                      value={sport.groupStageFormat || "Singles"}
                      onChange={(e) =>
                        onUpdate({ groupStageFormat: e.target.value })
                      }
                      options={["Singles", "Doubles"]}
                    />
                  </div>
                  <div className="pl-3 border-l-2 border-neutral-100">
                    <FieldLabel htmlFor={`qpg-${sport._key}`}>
                      Qualify per group
                    </FieldLabel>
                    <Select
                      id={`qpg-${sport._key}`}
                      value={String(sport.qualifyPerGroup ?? 2)}
                      onChange={(e) =>
                        onUpdate({ qualifyPerGroup: Number(e.target.value) })
                      }
                      options={[
                        { value: "1", label: "Top 1" },
                        { value: "2", label: "Top 2" },
                        { value: "3", label: "Top 3" },
                        { value: "4", label: "Top 4" },
                      ]}
                    />
                    <p className="text-[11px] text-neutral-500 mt-1.5">
                      Top N players from each group advance to knockout.
                    </p>
                  </div>
                  <div>
                    <FieldLabel htmlFor={`koformat-${sport._key}`}>
                      Knockout format
                    </FieldLabel>
                    <Select
                      id={`koformat-${sport._key}`}
                      value={sport.knockoutFormat || "Singles"}
                      onChange={(e) =>
                        onUpdate({ knockoutFormat: e.target.value })
                      }
                      options={["Singles", "Doubles"]}
                    />
                  </div>
                </div>
              )}

              {selectedTypeCard === "knockout" && (
                <div className="space-y-3.5 pt-1">
                  <div>
                    <FieldLabel htmlFor={`koformat-${sport._key}`}>
                      Knockout format
                    </FieldLabel>
                    <Select
                      id={`koformat-${sport._key}`}
                      value={sport.knockoutFormat || "Singles"}
                      onChange={(e) =>
                        onUpdate({ knockoutFormat: e.target.value })
                      }
                      options={["Singles", "Doubles"]}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor={`drawsize-${sport._key}`}>
                      Draw size
                    </FieldLabel>
                    <Select
                      id={`drawsize-${sport._key}`}
                      value={sport.drawSize == null ? "" : String(sport.drawSize)}
                      onChange={(e) =>
                        onUpdate({
                          drawSize:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
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
                <div className="pt-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5">
                  <p className="text-[11px] text-neutral-700">
                    Teams compete head-to-head in a single elimination bracket.
                    No additional format selection needed.
                  </p>
                </div>
              )}
            </div>
          )}

          {!tournamentLevel ? (
            <div className="bg-neutral-50 px-3 h-9 inline-flex items-center w-full rounded-lg border border-neutral-200">
              <span className="text-[12px] font-medium text-neutral-500">
                Select a tournament level to configure rules
              </span>
            </div>
          ) : (
            <div>
              <ExpandableSection
                open={isSectionDOpen}
                onToggle={() => setIsSectionDOpen((o) => !o)}
                label={
                  tournamentLevel === "unranked"
                    ? "Custom match format"
                    : "Sport rules · Locked"
                }
                animate={false}
              >
                <SectionDBody
                  sport={sport}
                  tournamentLevel={tournamentLevel}
                  onUpdate={onUpdate}
                />
              </ExpandableSection>
              {errors.ruleBook && (
                <p className="text-[11px] text-rose-600 mt-1.5 font-medium">
                  {errors.ruleBook}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
