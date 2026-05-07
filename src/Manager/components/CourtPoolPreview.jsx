import { LayoutGrid } from "lucide-react";

const SIG = "#5E6AD2";

/**
 * Read-only preview shown in match-generation modals when a tournament has
 * an active courts catalog. Replaces the legacy single "Court Number" text
 * input — the manager doesn't pick a court here; the server auto-distributes
 * matches round-robin across this pool.
 *
 * Renders nothing when `courts` is empty so the parent can render this
 * unconditionally; the parent decides which input to show by length-checking
 * the same array.
 *
 * Props:
 *   courts: [{ name, type? }, ...]   — the active pool (parent already filtered)
 *   startTime: "10:00"               — display only
 *   intervalMinutes: 30 | "30"       — display only
 */
export default function CourtPoolPreview({ courts = [], startTime, intervalMinutes }) {
  if (!Array.isArray(courts) || courts.length === 0) return null;

  const N = courts.length;
  const interval = parseInt(intervalMinutes, 10) || null;
  const displayStart = startTime || "the start time";
  const displayInterval = interval ? `${interval} minutes` : "the configured interval";

  return (
    <div
      className="rounded-lg border p-3.5 mt-1"
      style={{
        backgroundColor: "rgba(94,106,210,0.06)",
        borderColor: "rgba(94,106,210,0.20)",
      }}
    >
      <div className="flex items-start gap-2.5">
        <LayoutGrid className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: SIG }} />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-neutral-900">
            Auto-distribute across {N} {N === 1 ? "court" : "courts"}
          </p>
          <p className="text-[11px] text-neutral-600 mt-1.5 break-words">
            {courts.map((c) => c.name).join(" · ")}
          </p>
          <p className="text-[11px] text-neutral-500 mt-2">
            {N === 1
              ? `All matches run on this court starting at ${displayStart}, every ${displayInterval}.`
              : `Matches run in parallel — every court starts at ${displayStart} and runs every ${displayInterval}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
