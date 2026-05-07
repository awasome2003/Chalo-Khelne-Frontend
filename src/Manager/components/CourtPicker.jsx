import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const SIG = "#5E6AD2";

/**
 * CourtPicker — inline per-match court reassignment dropdown.
 *
 * Usage on any match card:
 *   <CourtPicker
 *     matchId={match._id}
 *     current={match.courtNumber}            // string; may be missing
 *     courts={tournamentCourts}              // [{ name, isActive }] from parent
 *     disabled={isCompleted}                 // optional — locks completed matches
 *     onChange={(newName) => syncLocalState} // optional — patch parent's match list
 *   />
 *
 * Behavior:
 *  - Empty catalog (`courts` is empty) → renders a static read-only badge.
 *    The picker has nothing to pick from; manager goes to Courts page first.
 *  - Disabled (e.g. completed match) → static badge with no chevron.
 *  - Catalog populated → click trigger to open dropdown of ACTIVE courts
 *    (retired ones excluded per Q2). Currently-assigned court has a check.
 *    Picking a court fires PATCH /matches/:matchId/court with optimistic
 *    update — on success: silent (Q5). On error: rollback + toast.
 *  - Match cards are wrapped in clickable divs (open scoring modal); the
 *    trigger calls e.stopPropagation() to avoid double-action.
 *  - "TBD ▾" placeholder when current is missing/empty (Q3).
 */
export default function CourtPicker({
  matchId,
  current,
  courts = [],
  disabled = false,
  onChange,
}) {
  // Local optimistic value. Initialized from `current`, kept in sync when
  // the parent updates it (e.g. after a refetch).
  const [value, setValue] = useState(current || "");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setValue(current || "");
  }, [current]);

  // Click-outside handler — closes the dropdown when the user clicks elsewhere.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const activeCourts = (courts || []).filter((c) => c.isActive !== false);
  const hasCatalog = activeCourts.length > 0;

  // Static fallback — empty catalog OR disabled. Looks like the existing
  // `Court X` chip on match cards (no chevron, not clickable).
  if (!hasCatalog || disabled) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200"
        title={!hasCatalog ? "No courts in catalog" : "Match completed — court locked"}
      >
        Court {value || "TBD"}
      </span>
    );
  }

  const handlePick = async (courtName) => {
    if (busy) return;
    if (courtName === value) {
      setOpen(false);
      return;
    }

    const previous = value;
    setValue(courtName);   // optimistic
    setOpen(false);
    setBusy(true);
    try {
      await axios.patch(`/api/tournaments/matches/${matchId}/court`, {
        courtNumber: courtName,
      });
      // Q5: silent on success. Notify parent so it can patch its match-list state.
      if (typeof onChange === "function") onChange(courtName);
    } catch (err) {
      // Rollback + toast on failure.
      setValue(previous);
      const msg = err?.response?.data?.message || err?.message || "Failed to update court";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // prevent the wrapping match card's onClick
          if (busy) return;
          setOpen((v) => !v);
        }}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-400 hover:text-gray-900 transition w-auto"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        Court {value || "TBD"}
        {busy ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-60" />
        )}
      </button>

      {open && (
        <div
          role="listbox"
          // stopPropagation on the menu container too — prevents card click
          // when the user clicks inside the dropdown without picking an item.
          onClick={(e) => e.stopPropagation()}
          className="absolute z-30 left-0 mt-1 min-w-[160px] max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1"
        >
          {activeCourts.map((c) => {
            const selected = c.name === value;
            return (
              <button
                key={c._id || c.name}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePick(c.name);
                }}
                className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between gap-2 transition ${
                  selected
                    ? "bg-[rgba(94,106,210,0.08)] text-neutral-900"
                    : "hover:bg-gray-50 text-neutral-700"
                }`}
              >
                <span className="truncate">{c.name}</span>
                {selected && <Check className="w-3.5 h-3.5" style={{ color: SIG }} />}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}
