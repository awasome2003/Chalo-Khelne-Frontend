/**
 * RuleBook Form Engine
 *
 * Generates dynamic form field definitions from a SportRuleBook document.
 * Everything is data-driven — zero hardcoded sports. When a new sport is
 * added with its ruleBook, the form auto-adapts.
 */

// ─── Field Registry ───
// Maps every possible ruleBook field to its display metadata.
// Grouped by section so the UI can render grouped cards.

const FORMAT_FIELDS = {
  // Sets-based
  totalSets:        { label: "Total Sets",             type: "number",  min: 1,  max: 9,  step: 2 },
  pointsPerSet:     { label: "Points Per Set",         type: "number",  min: 1,  max: 50 },
  gamesPerSet:      { label: "Games Per Set",          type: "number",  min: 1,  max: 15 },
  pointsPerGame:    { label: "Points Per Game",        type: "number",  min: 1,  max: 50 },
  winByMargin:      { label: "Win By Margin",          type: "number",  min: 0,  max: 10 },
  maxPointsCap:     { label: "Max Points Cap",         type: "number",  min: 1,  max: 100 },
  deuceEnabled:     { label: "Deuce",                  type: "boolean" },
  tiebreakEnabled:  { label: "Tiebreak",               type: "boolean" },
  tiebreakPoints:   { label: "Tiebreak Points",        type: "number",  min: 1,  max: 20 },
  decidingSetPoints:{ label: "Deciding Set Points",    type: "number",  min: 1,  max: 50 },
  serviceAlternate: { label: "Service Alternate Every", type: "number", min: 1,  max: 10 },
  // Innings-based
  oversCount:       { label: "Overs",                  type: "number",  min: 1,  max: 50 },
  inningsCount:     { label: "Innings",                type: "number",  min: 1,  max: 4 },
  // Halves-based
  halvesCount:      { label: "Halves",                 type: "number",  min: 1,  max: 4 },
  halvesDuration:   { label: "Half Duration (min)",    type: "number",  min: 5,  max: 90 },
  // Quarters-based
  quartersCount:    { label: "Quarters",               type: "number",  min: 1,  max: 8 },
  quartersDuration: { label: "Quarter Duration (min)", type: "number",  min: 5,  max: 30 },
};

const SCORING_FIELDS = {
  "scoring.type":                { label: "Scoring Type",        type: "select", options: ["points", "runs", "goals", "frames", "result"] },
  "scoring.winCondition.type":   { label: "Win Condition",       type: "select", options: ["best-of-sets", "most-points", "most-runs", "most-goals", "best-of-frames", "single-result"] },
  "scoring.winCondition.value":  { label: "Win Condition Value", type: "number", min: 1, max: 20 },
  "scoring.winCondition.margin": { label: "Win Margin",          type: "number", min: 0, max: 10 },
};

const TIEBREAKER_FIELDS = {
  "tieBreaker.type":  { label: "Tie Breaker Type",  type: "select", options: ["none", "extra_time", "penalty", "golden_point", "super_over", "armageddon", "extra_frame"] },
  "tieBreaker.rules": { label: "Tie Breaker Rules", type: "text" },
};

const PARTICIPANT_FIELDS = {
  "participantConfig.type":           { label: "Participant Type",   type: "select", options: ["individual", "doubles", "team"] },
  "participantConfig.playersPerSide": { label: "Players Per Side",   type: "number", min: 1, max: 15 },
  "participantConfig.squadSize":      { label: "Squad Size",         type: "number", min: 1, max: 30 },
};

const TOURNAMENT_RULES_FIELDS = {
  "tournamentRules.pointsForWin":  { label: "Points for Win",  type: "number", min: 0, max: 10 },
  "tournamentRules.pointsForLoss": { label: "Points for Loss", type: "number", min: -5, max: 5 },
  "tournamentRules.pointsForDraw": { label: "Points for Draw", type: "number", min: 0, max: 10 },
  "tournamentRules.rankingCriteria": { label: "Ranking Criteria", type: "multiselect", options: [
    "points", "head-to-head", "set-ratio", "point-ratio", "game-ratio",
    "net-run-rate", "goal-difference", "goals-scored", "fair-play",
    "buchholz", "sonneborn-berger", "rating", "wins", "frame-difference"
  ]},
};

// ─── Helpers ───

/** Get a nested value from an object using dot-path (e.g. "scoring.type") */
function getNestedValue(obj, path) {
  return path.split(".").reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

/** Set a nested value on an object using dot-path */
export function setNestedValue(obj, path, value) {
  const result = { ...obj };
  const keys = path.split(".");
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = current[key] != null ? { ...current[key] } : {};
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

// ─── GAME STRUCTURE → FORMAT FIELDS ───

const STRUCTURE_FIELD_MAP = {
  sets:     ["totalSets", "pointsPerSet", "gamesPerSet", "pointsPerGame", "winByMargin", "maxPointsCap", "deuceEnabled", "tiebreakEnabled", "tiebreakPoints", "decidingSetPoints", "serviceAlternate"],
  innings:  ["oversCount", "inningsCount"],
  halves:   ["halvesCount", "halvesDuration"],
  quarters: ["quartersCount", "quartersDuration"],
  frames:   ["totalSets", "pointsPerSet", "winByMargin"],  // Snooker frames map to sets structure
  single:   [],  // Chess, etc. — no format fields needed
};

// ─── CORE ENGINE ───

/**
 * Generate all form field definitions from a ruleBook document.
 * Returns sections with fields pre-filled from ruleBook defaults.
 *
 * @param {Object} ruleBook - SportRuleBook document from DB
 * @returns {Object} { sections: [...], defaults: {...} }
 */
export function generateFormFields(ruleBook) {
  if (!ruleBook) return { sections: [], defaults: {} };

  const sections = [];
  const defaults = {};
  const gst = ruleBook.gameStructureType || "sets";

  // ── Section 1: Match Format (driven by gameStructureType) ──
  const formatKeys = STRUCTURE_FIELD_MAP[gst] || [];
  const formatFields = [];

  for (const key of formatKeys) {
    const meta = FORMAT_FIELDS[key];
    if (!meta) continue;

    const dbValue = ruleBook.format?.[key];
    // Show field if it has a non-null value in ruleBook, OR if it's a core field for this structure
    if (dbValue !== null && dbValue !== undefined) {
      formatFields.push({ key, path: `format.${key}`, ...meta, defaultValue: dbValue });
      defaults[`format.${key}`] = dbValue;
    } else if (meta.type === "boolean") {
      // Always include boolean toggles for the game structure, default to false
      formatFields.push({ key, path: `format.${key}`, ...meta, defaultValue: false });
      defaults[`format.${key}`] = false;
    }
  }

  if (formatFields.length > 0) {
    sections.push({
      id: "format",
      title: "Match Format",
      subtitle: gst.charAt(0).toUpperCase() + gst.slice(1) + "-based",
      icon: "format",
      fields: formatFields,
    });
  }

  // ── Section 2: Scoring ──
  const scoringFields = [];
  for (const [path, meta] of Object.entries(SCORING_FIELDS)) {
    const dbValue = getNestedValue(ruleBook, path);
    if (dbValue !== null && dbValue !== undefined) {
      scoringFields.push({ key: path, path, ...meta, defaultValue: dbValue });
      defaults[path] = dbValue;
    }
  }
  if (scoringFields.length > 0) {
    sections.push({ id: "scoring", title: "Scoring System", icon: "scoring", fields: scoringFields });
  }

  // ── Section 3: Participant Config ──
  const participantFields = [];
  for (const [path, meta] of Object.entries(PARTICIPANT_FIELDS)) {
    const dbValue = getNestedValue(ruleBook, path);
    if (dbValue !== null && dbValue !== undefined) {
      participantFields.push({ key: path, path, ...meta, defaultValue: dbValue });
      defaults[path] = dbValue;
    }
  }
  if (participantFields.length > 0) {
    sections.push({ id: "participant", title: "Participant Config", icon: "participant", fields: participantFields });
  }

  // ── Section 4: Tie Breaker ──
  const tbType = ruleBook.tieBreaker?.type;
  if (tbType && tbType !== "none") {
    const tbFields = [];
    for (const [path, meta] of Object.entries(TIEBREAKER_FIELDS)) {
      const dbValue = getNestedValue(ruleBook, path);
      if (dbValue !== null && dbValue !== undefined) {
        tbFields.push({ key: path, path, ...meta, defaultValue: dbValue });
        defaults[path] = dbValue;
      }
    }
    if (tbFields.length > 0) {
      sections.push({ id: "tieBreaker", title: "Tie Breaker", icon: "tieBreaker", fields: tbFields });
    }
  }

  // ── Section 5: Tournament Rules ──
  const trFields = [];
  for (const [path, meta] of Object.entries(TOURNAMENT_RULES_FIELDS)) {
    const dbValue = getNestedValue(ruleBook, path);
    if (dbValue !== null && dbValue !== undefined) {
      trFields.push({ key: path, path, ...meta, defaultValue: dbValue });
      defaults[path] = Array.isArray(dbValue) ? [...dbValue] : dbValue;
    }
  }
  if (trFields.length > 0) {
    sections.push({ id: "tournamentRules", title: "Tournament Rules", icon: "tournamentRules", fields: trFields });
  }

  return { sections, defaults };
}

// ─── VALIDATION ───

/**
 * Validate form values against the generated field definitions.
 *
 * @param {Object} values - Current form values (dot-path keys)
 * @param {Array} sections - Sections from generateFormFields()
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateRuleBookForm(values, sections) {
  const errors = {};

  for (const section of sections) {
    for (const field of section.fields) {
      const val = values[field.path];

      // Skip optional fields
      if (field.type === "boolean" || field.type === "multiselect" || field.type === "text") continue;

      // Required check for number/select
      if (val === null || val === undefined || val === "") {
        errors[field.path] = `${field.label} is required`;
        continue;
      }

      if (field.type === "number") {
        const num = Number(val);
        if (isNaN(num)) {
          errors[field.path] = `${field.label} must be a number`;
        } else if (field.min != null && num < field.min) {
          errors[field.path] = `Minimum value is ${field.min}`;
        } else if (field.max != null && num > field.max) {
          errors[field.path] = `Maximum value is ${field.max}`;
        }
      }

      if (field.type === "select" && field.options) {
        if (!field.options.includes(val)) {
          errors[field.path] = `Invalid value. Allowed: ${field.options.join(", ")}`;
        }
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ─── BUILD SUBMISSION PAYLOAD ───

/**
 * Convert flat dot-path values back into a nested object for API submission.
 *
 * @param {Object} values - Flat form values with dot-path keys
 * @param {Object} ruleBook - Original ruleBook for reference
 * @returns {Object} Nested object ready for backend
 */
export function buildSubmissionPayload(values, ruleBook) {
  const payload = {
    gameStructureType: ruleBook?.gameStructureType || "sets",
  };

  for (const [path, val] of Object.entries(values)) {
    const keys = path.split(".");
    let current = payload;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = val;
  }

  return payload;
}
