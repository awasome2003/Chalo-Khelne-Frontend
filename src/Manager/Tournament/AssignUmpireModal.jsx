import { useEffect, useState } from "react";
import { X, Check, Award, Loader2, AlertCircle } from "lucide-react";
import refereeApi from "../../features/referee/refereeApi";

/**
 * AssignUmpireModal — Phase 2: manager picks an accepted umpire and assigns them to a match.
 *
 * Pulls applicants via refereeApi.fetchTournamentApplicants(tournamentId, { includeAll: true }),
 * filters to status === "accepted", lets the manager pick one, and POSTs assign-match.
 *
 * Props:
 *   isOpen        — show/hide the modal
 *   onClose       — called on X / backdrop / Cancel
 *   matchId       — the match to assign the umpire to
 *   tournamentId  — source of applicants
 *   matchLabel    — optional display helper (e.g. "Round-of-16 • M3")
 *   onAssigned    — called after successful assign (parent refetches)
 */
export default function AssignUmpireModal({
  isOpen,
  onClose,
  matchId,
  tournamentId,
  matchLabel,
  onAssigned,
}) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !tournamentId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await refereeApi.fetchTournamentApplicants(tournamentId, {
          includeAll: true,
        });
        const accepted = (all || []).filter((a) => a.status === "accepted");
        if (!cancelled) setApplicants(accepted);
      } catch (e) {
        if (!cancelled)
          setError(
            e?.response?.data?.message ||
              e.message ||
              "Failed to load umpires."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, tournamentId]);

  // Reset selection + errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await refereeApi.assignUmpireToMatch({
        matchId,
        refereeUserId: selectedId,
      });
      onAssigned?.(result);
      onClose();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          "Assignment failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800">Assign Umpire</h3>
            {matchLabel && (
              <p className="text-xs text-gray-500 mt-0.5">{matchLabel}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading accepted umpires…</span>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-600">
                No accepted umpires yet
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ask umpires to apply and approve them in the Staff Applications
                tab first.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {applicants.map((a) => {
                const userId = a.referee?.userId;
                const name = a.referee?.name || "Unknown";
                const cert = a.referee?.certificationLevel;
                const exp = a.referee?.experience;
                const sports = Array.isArray(a.referee?.sports)
                  ? a.referee.sports.join(", ")
                  : "";
                const isSelected = selectedId === userId;
                return (
                  <li key={a.applicationId || userId}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(userId)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                        isSelected
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {cert || "Unranked"}
                            {exp ? ` • ${exp}y exp` : ""}
                            {sports ? ` • ${sports}` : ""}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedId || submitting}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Assigning…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
