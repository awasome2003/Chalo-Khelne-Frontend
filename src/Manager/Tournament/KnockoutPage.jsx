import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Swords, Trophy, ChevronDown, ChevronUp, UserPlus, Shield, Radio, Crown,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import TournamentStepper from "./TournamentStepper";
import AssignUmpireModal from "./AssignUmpireModal";
import { readMatchResult } from "../../shared/utils/matchResultUtils";

const SIG = "#5E6AD2";

export default function KnockoutPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { title, currentStage } = useTournament(tournamentId);
  const [matchesByRound, setMatchesByRound] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRound, setExpandedRound] = useState(null);
  const [assignModalMatch, setAssignModalMatch] = useState(null);
  const [broadcast, setBroadcast] = useState(false);

  const refreshMatches = useCallback(async () => {
    if (!tournamentId) return;
    try {
      setLoading(true);
      let grouped = {};
      const res = await axios.get(
        `/api/tournaments/knockout-matches/${tournamentId}`
      );
      if (res.data.success) {
        const matches = res.data.matches || [];
        matches.forEach((m) => {
          const round = m.roundName || m.round || "round-1";
          if (!grouped[round]) grouped[round] = [];
          grouped[round].push(m);
        });
      }
      if (Object.keys(grouped).length === 0) {
        const dkRes = await axios.get(
          `/api/tournaments/direct-knockout/matches/${tournamentId}`
        );
        if (dkRes.data.success) {
          const matches = dkRes.data.matches || [];
          matches.forEach((m) => {
            const round = m.round || "round-1";
            if (!grouped[round]) grouped[round] = [];
            grouped[round].push(m);
          });
        }
      }
      setMatchesByRound(grouped);
      setExpandedRound(
        (prev) => prev || (Object.keys(grouped).length > 0 ? Object.keys(grouped)[0] : null)
      );
    } catch (err) {
      console.error("Error fetching knockout:", err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    refreshMatches();
  }, [refreshMatches]);

  useEffect(() => {
    if (!broadcast) return;
    const onKey = (e) => e.key === "Escape" && setBroadcast(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [broadcast]);

  const roundEntries = Object.entries(matchesByRound);
  const totalMatches = roundEntries.reduce((sum, [, m]) => sum + m.length, 0);
  const completedMatches = roundEntries.reduce(
    (sum, [, m]) =>
      sum +
      m.filter((x) => x.status === "COMPLETED" || x.status === "completed")
        .length,
    0
  );
  const liveMatches = roundEntries.reduce(
    (sum, [, m]) =>
      sum +
      m.filter(
        (x) =>
          x.status === "IN_PROGRESS" ||
          x.status === "in_progress" ||
          x.status === "in-progress"
      ).length,
    0
  );

  if (broadcast) {
    return (
      <BroadcastView
        title={title}
        roundEntries={roundEntries}
        totalMatches={totalMatches}
        completedMatches={completedMatches}
        liveMatches={liveMatches}
        onExit={() => setBroadcast(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-[1320px] mx-auto">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 bg-neutral-200 rounded" />
          <div className="h-12 bg-neutral-100 rounded-2xl" />
          <div className="h-32 bg-neutral-100 rounded-2xl" />
          <div className="h-32 bg-neutral-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <Breadcrumbs tournamentName={title} />
      <TournamentStepper currentStage={currentStage} />

      <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1.5">
            Knockout bracket
          </p>
          <h1 className="text-[24px] leading-tight font-semibold tracking-tight text-neutral-950">
            <span className="font-mono tabular-nums">{roundEntries.length}</span>
            <span className="text-[14px] font-medium text-neutral-500 ml-2">
              rounds ·{" "}
              <span className="font-mono tabular-nums text-neutral-700">
                {completedMatches}
              </span>
              {" / "}
              <span className="font-mono tabular-nums text-neutral-700">
                {totalMatches}
              </span>{" "}
              matches done
            </span>
          </h1>
        </div>
        {roundEntries.length > 0 && (
          <button
            onClick={() => setBroadcast(true)}
            className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-neutral-950 hover:bg-neutral-800 rounded-lg transition"
          >
            <Radio className="w-3.5 h-3.5" />
            Broadcast mode
          </button>
        )}
      </div>

      {roundEntries.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl px-6 py-14 text-center">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 inline-flex items-center justify-center mb-3">
            <Swords className="w-5 h-5 text-neutral-400" />
          </div>
          <h3 className="text-[14px] font-semibold text-neutral-900">
            No knockout matches yet
          </h3>
          <p className="text-[13px] text-neutral-500 mt-1 max-w-md mx-auto">
            Complete the group stage, then generate the knockout bracket from
            qualified players.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {roundEntries.map(([roundName, matches]) => {
            const isExpanded = expandedRound === roundName;
            const roundCompleted = matches.filter(
              (m) => m.status === "COMPLETED" || m.status === "completed"
            ).length;
            const allDone = roundCompleted === matches.length;
            const label =
              roundName.charAt(0).toUpperCase() +
              roundName.slice(1).replace(/-/g, " ");

            return (
              <div
                key={roundName}
                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedRound(isExpanded ? null : roundName)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg inline-flex items-center justify-center ${
                        allDone
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {allDone ? (
                        <Trophy className="w-4 h-4" />
                      ) : (
                        <Swords className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-neutral-900">
                        {label}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono tabular-nums">
                        {roundCompleted}/{matches.length} completed
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-neutral-100 p-3 space-y-2 bg-neutral-50/30">
                    {matches.map((match) => (
                      <KnockoutMatchRow
                        key={match._id}
                        match={match}
                        onScore={() =>
                          navigate(
                            `/tournament-management/match/${tournamentId}/${match._id}/score`,
                            {
                              state: {
                                backTo: `/tournaments/${tournamentId}/knockout`,
                              },
                            }
                          )
                        }
                        onAssign={(m) => setAssignModalMatch(m)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AssignUmpireModal
        isOpen={!!assignModalMatch}
        onClose={() => setAssignModalMatch(null)}
        matchId={assignModalMatch?._id}
        tournamentId={tournamentId}
        matchLabel={
          assignModalMatch
            ? `${
                assignModalMatch.roundName || assignModalMatch.round || "Match"
              } · M${assignModalMatch.matchNumber}`
            : ""
        }
        onAssigned={() => {
          refreshMatches();
          toast.success("Umpire assigned. Awaiting their response.");
        }}
      />
    </div>
  );
}

function KnockoutMatchRow({ match, onScore, onAssign }) {
  const p1 = match.player1?.playerName || match.player1?.userName || "TBD";
  const p2 = match.player2?.playerName || match.player2?.userName || "TBD";
  const isComp =
    match.status === "COMPLETED" || match.status === "completed";
  const isLive =
    match.status === "IN_PROGRESS" ||
    match.status === "in_progress" ||
    match.status === "in-progress";
  const umpireName = getUmpireName(match.referee);
  const result = isComp ? readMatchResult(match) : null;

  const winner = match.winner
    ? typeof match.winner === "object"
      ? match.winner.playerName || match.winner.userName
      : match.winner
    : null;
  const isP1Winner = winner === p1;
  const isP2Winner = winner === p2;

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden transition ${
        isLive ? "border-emerald-300" : "border-neutral-200"
      }`}
    >
      <button
        onClick={onScore}
        className="w-full px-4 py-3 hover:bg-neutral-50/60 transition"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono tabular-nums text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
            M{match.matchNumber}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              isComp
                ? "bg-neutral-100 text-neutral-600"
                : isLive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {isLive && (
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
            )}
            {isComp ? "Done" : isLive ? "Live" : "Pending"}
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <span
            className={`text-[13px] truncate inline-flex items-center gap-1.5 ${
              isP1Winner
                ? "font-semibold text-neutral-950"
                : isComp
                ? "text-neutral-500"
                : "font-medium text-neutral-900"
            }`}
          >
            {isP1Winner && (
              <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
            )}
            <span className="truncate">{p1}</span>
          </span>
          <span className="font-mono tabular-nums text-[14px] font-semibold text-neutral-900 px-2">
            {isComp && result?.completed
              ? `${result.player1Score}–${result.player2Score}`
              : isLive
              ? "·"
              : "vs"}
          </span>
          <span
            className={`text-[13px] truncate text-right inline-flex items-center justify-end gap-1.5 ${
              isP2Winner
                ? "font-semibold text-neutral-950"
                : isComp
                ? "text-neutral-500"
                : "font-medium text-neutral-900"
            }`}
          >
            <span className="truncate">{p2}</span>
            {isP2Winner && (
              <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
            )}
          </span>
        </div>
      </button>
      <div className="border-t border-neutral-100 px-3 py-2 flex items-center justify-between bg-neutral-50/40">
        {umpireName ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600">
            <Shield className="w-3 h-3" style={{ color: SIG }} />
            <span className="font-medium">Umpire</span>
            <span className="text-neutral-900">{umpireName}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Shield className="w-3 h-3 text-neutral-300" />
            <span>No umpire</span>
          </span>
        )}
        {!umpireName && !isComp && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssign?.(match);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold transition"
            style={{ color: SIG }}
          >
            <UserPlus className="w-3 h-3" />
            Assign
          </button>
        )}
      </div>
    </div>
  );
}

function BroadcastView({
  title,
  roundEntries,
  totalMatches,
  completedMatches,
  liveMatches,
  onExit,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white overflow-y-auto">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 30%, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative max-w-[1600px] mx-auto px-8 py-8">
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 mb-2">
              Broadcast · Live bracket
            </p>
            <h1 className="text-[44px] leading-[1] font-semibold tracking-tight">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {liveMatches > 0 && (
              <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
                  <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                </span>
                <span className="font-mono tabular-nums">{liveMatches}</span>{" "}
                live
              </span>
            )}
            <span className="font-mono tabular-nums h-9 inline-flex items-center px-3 rounded-lg text-[12px] font-semibold bg-white/5 border border-white/10 text-neutral-300">
              {completedMatches}/{totalMatches}
            </span>
            <button
              onClick={onExit}
              className="h-9 px-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-950 bg-white hover:bg-neutral-200 rounded-lg transition"
            >
              Exit broadcast
              <span className="font-mono text-[10px] text-neutral-500 border border-neutral-300 rounded px-1 py-px">
                Esc
              </span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {roundEntries.map(([roundName, matches]) => {
              const label =
                roundName.charAt(0).toUpperCase() +
                roundName.slice(1).replace(/-/g, " ");
              return (
                <div key={roundName} className="w-[300px] flex-shrink-0">
                  <div className="mb-3 pb-2 border-b border-white/10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                      {label}
                    </p>
                    <p className="font-mono tabular-nums text-[12px] text-neutral-400 mt-0.5">
                      {matches.length} matches
                    </p>
                  </div>
                  <div className="space-y-3">
                    {matches.map((m) => (
                      <BroadcastMatch key={m._id} match={m} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
          <span className="font-semibold uppercase tracking-[0.12em]">
            ChaloKhelne · Live
          </span>
          <span className="font-mono tabular-nums">
            {new Date().toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function BroadcastMatch({ match }) {
  const p1 = match.player1?.playerName || match.player1?.userName || "TBD";
  const p2 = match.player2?.playerName || match.player2?.userName || "TBD";
  const isComp = match.status === "COMPLETED" || match.status === "completed";
  const isLive =
    match.status === "IN_PROGRESS" ||
    match.status === "in_progress" ||
    match.status === "in-progress";
  const result = isComp ? readMatchResult(match) : null;
  const winner = match.winner
    ? typeof match.winner === "object"
      ? match.winner.playerName || match.winner.userName
      : match.winner
    : null;
  const isP1Winner = winner === p1;
  const isP2Winner = winner === p2;
  const muted = !isLive && !isComp;

  return (
    <div
      className={`relative bg-white/[0.03] border rounded-xl p-3 transition ${
        isLive
          ? "border-emerald-500/50 shadow-[0_0_24px_-8px_rgba(16,185,129,0.6)]"
          : "border-white/10"
      } ${muted ? "opacity-50" : ""}`}
    >
      {isLive && (
        <span className="absolute -top-2 left-3 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500 text-neutral-950">
          <span className="w-1 h-1 rounded-full bg-neutral-950" />
          Live
        </span>
      )}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`text-[14px] font-semibold truncate ${
            isP1Winner ? "text-white" : "text-neutral-300"
          }`}
        >
          {p1}
        </span>
        <span
          className={`font-mono tabular-nums text-[16px] font-semibold ${
            isP1Winner ? "text-white" : "text-neutral-400"
          }`}
        >
          {isComp && result?.completed ? result.player1Score : "—"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[14px] font-semibold truncate ${
            isP2Winner ? "text-white" : "text-neutral-300"
          }`}
        >
          {p2}
        </span>
        <span
          className={`font-mono tabular-nums text-[16px] font-semibold ${
            isP2Winner ? "text-white" : "text-neutral-400"
          }`}
        >
          {isComp && result?.completed ? result.player2Score : "—"}
        </span>
      </div>
    </div>
  );
}

const getUmpireName = (referee) => {
  if (!referee) return null;
  if (typeof referee === "string") return "Assigned";
  return referee.name || referee.userName || "Assigned";
};
