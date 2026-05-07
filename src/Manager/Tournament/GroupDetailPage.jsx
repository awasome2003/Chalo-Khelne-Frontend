import { toast } from "react-toastify";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Flag, Table, UserPlus, Shield } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import keys from "../../config/queryKeys";
import useTournament from "./useTournament";
import { useGroups, useGroupMatches, useStandings } from "./useGroups";
import Breadcrumbs from "./Breadcrumbs";
import AssignUmpireModal from "./AssignUmpireModal";
import { readMatchResult } from "../../shared/utils/matchResultUtils";

const SIG = "#5E6AD2";

export default function GroupDetailPage() {
  const { tournamentId, groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { title } = useTournament(tournamentId);

  const { data: allGroups = [] } = useGroups(tournamentId);
  const group = allGroups.find((g) => g._id === groupId);

  const { data: matches = [], isLoading: matchesLoading } = useGroupMatches(
    tournamentId,
    groupId
  );
  const [showStandings, setShowStandings] = useState(false);
  const [assignModalMatch, setAssignModalMatch] = useState(null);
  const { data: standings, refetch: refetchStandings } = useStandings(
    tournamentId,
    groupId,
    showStandings
  );

  const generateMutation = useMutation({
    mutationFn: (schedule) =>
      axios.post("/api/tournaments/matches/generate-group", {
        tournamentId,
        groupId,
        ...schedule,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.groupMatches(tournamentId, groupId),
      });
      toast.success("Matches generated.");
    },
    onError: (err) => toast.error(err.response?.data?.message || err.message),
  });

  const handleGenerate = () => {
    const court = prompt("Court number:", "1");
    const slotStr = prompt("Slot duration (mins):", "30");
    const matchStr = prompt("Match duration (mins):", "20");
    const time = prompt("Start time (HH:MM):", "10:00");
    if (!court || !time) return;
    const slot = parseInt(slotStr, 10);
    const match = parseInt(matchStr, 10);
    if (!Number.isFinite(slot) || slot < 1 || !Number.isFinite(match) || match < 1) {
      toast.error("Slot and match durations must be positive integers.");
      return;
    }
    if (match > slot) {
      toast.error("Match duration cannot exceed slot duration.");
      return;
    }
    generateMutation.mutate({
      courtNumber: court,
      slotDurationMinutes: slot,
      matchDurationMinutes: match,
      startTime: time,
    });
  };

  const completedCount = matches.filter(
    (m) => m.status === "COMPLETED" || m.status === "completed"
  ).length;
  const liveCount = matches.filter(
    (m) => m.status === "IN_PROGRESS" || m.status === "in_progress"
  ).length;

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <Breadcrumbs tournamentName={title} groupName={group?.groupName} />

      <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => navigate(`/tournaments/${tournamentId}/groups`)}
            className="h-8 w-8 inline-flex items-center justify-center bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg transition flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-700" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-0.5">
              Group
            </p>
            <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-neutral-950 truncate">
              {group?.groupName || "Group"}
            </h1>
            <p className="text-[12px] text-neutral-500 mt-1 inline-flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <span className="font-mono tabular-nums">
                  {group?.players?.length || 0}
                </span>
                <span>players</span>
              </span>
              <span className="text-neutral-300">·</span>
              <span className="inline-flex items-center gap-1">
                <span className="font-mono tabular-nums">{matches.length}</span>
                <span>matches</span>
              </span>
              <span className="text-neutral-300">·</span>
              <span className="inline-flex items-center gap-1">
                <span className="font-mono tabular-nums text-emerald-700">
                  {completedCount}
                </span>
                <span>done</span>
              </span>
              {liveCount > 0 && (
                <>
                  <span className="text-neutral-300">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />
                      <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="font-mono tabular-nums text-emerald-700">
                      {liveCount}
                    </span>
                    <span className="text-emerald-700">live</span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {matches.length === 0 && (
            <button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white rounded-lg transition disabled:opacity-50 active:scale-[0.98]"
              style={{ backgroundColor: SIG }}
            >
              <Flag className="w-3.5 h-3.5" />
              {generateMutation.isPending ? "Generating…" : "Generate matches"}
            </button>
          )}
          <button
            onClick={() => {
              setShowStandings(!showStandings);
              if (!showStandings) refetchStandings();
            }}
            className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition"
          >
            <Table className="w-3.5 h-3.5" />
            {showStandings ? "Hide" : "Show"} standings
          </button>
          <button
            onClick={() =>
              navigate(
                `/tournament-management/group-stage/${tournamentId}/${groupId}/points-table`,
                { state: { tournamentId, groupId, round: 1 } }
              )
            }
            className="h-8 px-3 inline-flex items-center text-[12px] font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition"
          >
            Full points table
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-4 mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-3">
          Players
        </p>
        <div className="flex flex-wrap gap-1.5">
          {group?.players?.map((p, i) => (
            <span
              key={p._id || i}
              className="inline-flex items-center gap-1.5 px-2 py-1 bg-neutral-50 border border-neutral-200 text-[12px] text-neutral-800 rounded-md"
            >
              <span className="font-mono tabular-nums text-[10px] text-neutral-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-medium">
                {p.userId?.name || p.userName || `Player ${i + 1}`}
              </span>
            </span>
          ))}
        </div>
      </div>

      {showStandings && standings && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-900">
              {standings.groupName} · Standings
            </p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-100">
                <Th className="w-10">#</Th>
                <Th>Player</Th>
                <Th className="text-center">P</Th>
                <Th className="text-center">W</Th>
                <Th className="text-center">L</Th>
                <Th className="text-right">Pts</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {standings.standings?.map((s) => (
                <tr
                  key={s.playerId}
                  className={`hover:bg-neutral-50/60 transition ${
                    s.qualified ? "bg-emerald-50/40" : ""
                  }`}
                >
                  <td className="px-4 py-2.5 font-mono tabular-nums text-[12px] text-neutral-500">
                    {s.rank}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-neutral-900">
                        {s.playerName}
                      </span>
                      {s.qualified && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                          Q
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono tabular-nums text-[12px] text-neutral-700">
                    {s.played}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono tabular-nums text-[12px] text-emerald-700">
                    {s.won}
                  </td>
                  <td className="px-4 py-2.5 text-center font-mono tabular-nums text-[12px] text-rose-600">
                    {s.lost}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[14px] font-semibold text-neutral-900">
                    {s.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {matchesLoading ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-[13px] text-neutral-400">
          Loading matches…
        </div>
      ) : matches.length > 0 ? (
        <section>
          <div className="flex items-end justify-between mb-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-900">
              Matches
              <span className="ml-2 font-mono tabular-nums text-neutral-500">
                {matches.length}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matches.map((match, idx) => (
              <MatchCard
                key={match._id || idx}
                match={match}
                onScore={() =>
                  navigate(
                    `/tournament-management/match/${tournamentId}/${match._id}/score`,
                    {
                      state: {
                        backTo: `/tournaments/${tournamentId}/groups/${groupId}`,
                      },
                    }
                  )
                }
                onAssign={() => setAssignModalMatch(match)}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl px-6 py-14 text-center">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 inline-flex items-center justify-center mb-3">
            <Flag className="w-5 h-5 text-neutral-400" />
          </div>
          <h3 className="text-[14px] font-semibold text-neutral-900">
            No matches generated yet
          </h3>
          <p className="text-[13px] text-neutral-500 mt-1">
            Use “Generate matches” above to create the round-robin schedule.
          </p>
        </div>
      )}

      <AssignUmpireModal
        isOpen={!!assignModalMatch}
        onClose={() => setAssignModalMatch(null)}
        matchId={assignModalMatch?._id}
        tournamentId={tournamentId}
        matchLabel={
          assignModalMatch
            ? `M${assignModalMatch.matchNumber} · ${
                assignModalMatch.player1?.userName || "P1"
              } vs ${assignModalMatch.player2?.userName || "P2"}`
            : ""
        }
        onAssigned={() => {
          queryClient.invalidateQueries({
            queryKey: keys.groupMatches(tournamentId, groupId),
          });
          toast.success("Umpire assigned. Awaiting their response.");
        }}
      />
    </div>
  );
}

function MatchCard({ match, onScore, onAssign }) {
  const isComp =
    match.status === "COMPLETED" || match.status === "completed";
  const isLive =
    match.status === "IN_PROGRESS" || match.status === "in_progress";
  const result = isComp ? readMatchResult(match) : null;
  const umpireName = match.referee?.name;

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition ${
        isComp
          ? "border-emerald-200"
          : isLive
          ? "border-emerald-300"
          : "border-neutral-200"
      }`}
    >
      <button
        onClick={onScore}
        className="w-full p-4 text-left hover:bg-neutral-50/60 transition"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-mono tabular-nums text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
            M{match.matchNumber}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              isComp
                ? "bg-emerald-50 text-emerald-700"
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
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-neutral-900 truncate">
            {match.player1?.userName || "P1"}
          </span>
          {result?.completed ? (
            <span className="font-mono tabular-nums text-[14px] font-semibold text-neutral-900 px-2">
              {result.player1Score}–{result.player2Score}
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300 px-2">
              vs
            </span>
          )}
          <span className="text-[13px] font-semibold text-neutral-900 truncate text-right">
            {match.player2?.userName || "P2"}
          </span>
        </div>
      </button>
      <div className="border-t border-neutral-100 px-3 py-2 flex items-center justify-between bg-neutral-50/40">
        {umpireName ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-600">
              <Shield className="w-3 h-3" style={{ color: SIG }} />
              <span className="font-medium">Umpire</span>
              <span className="text-neutral-900">{umpireName}</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400">
              Assigned
            </span>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
              <Shield className="w-3 h-3 text-neutral-300" />
              <span>No umpire</span>
            </span>
            {!isComp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign?.();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold transition"
                style={{ color: SIG }}
              >
                <UserPlus className="w-3 h-3" />
                Assign
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400 ${className}`}
    >
      {children}
    </th>
  );
}
