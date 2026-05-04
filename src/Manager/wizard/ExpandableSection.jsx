import React from "react";
import { ChevronDown } from "lucide-react";
import Collapsible from "./Collapsible";

// Smooth max-height + opacity transitions on show/hide.
// `variant="link"` renders a muted text link with a chevron (used for
// "+ Add description" / "+ Add terms" patterns). Default renders a full
// gray-50 card-style header.
//
// Sub-step 9 — body now uses <Collapsible> for ref-measured smooth
// transitions (no more "9999px → snap" jank).
//
// `animate={false}` — skips Collapsible and uses a plain display: none/block
// toggle. Used for Section D in SportCard, where content height is
// unpredictable (varies by sport scoring type and number of fields) and
// Collapsible's scrollHeight measurement on open can clip the visible region
// when fields render asynchronously after the measurement.
export default function ExpandableSection({
  open,
  onToggle,
  label,
  description,
  icon,
  variant = "default",
  animate = true,
  className = "",
  children,
}) {
  const chevron = (
    <ChevronDown
      className={`w-4 h-4 text-gray-400 transition-transform duration-150 ease-out ${open ? "rotate-180" : ""}`}
    />
  );

  const body = animate ? (
    <Collapsible open={open}>
      <div className="pt-3">{children}</div>
    </Collapsible>
  ) : (
    // Inline style display toggle (more deterministic than the `hidden` HTML
    // attribute, which some Tailwind preflight resets and browsers handle
    // inconsistently). No max-height, so content grows freely.
    <div className="pt-3" style={{ display: open ? "block" : "none" }} aria-hidden={!open}>
      {children}
    </div>
  );

  if (variant === "link") {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 transition-colors duration-100"
        >
          {label}
          {chevron}
        </button>
        {body}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl border border-gray-100 transition-colors duration-100"
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon && <span className="text-gray-500 flex-shrink-0">{icon}</span>}
          <span className="text-sm font-medium text-gray-700 text-left truncate">{label}</span>
          {description && <span className="text-xs text-gray-400 truncate">{description}</span>}
        </span>
        {chevron}
      </button>
      {body}
    </div>
  );
}
