import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid3X3, Users, ArrowRight, AlertCircle } from "lucide-react";
import axios from "axios";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import TournamentStepper from "./TournamentStepper";

const SIG = "#5E6AD2";

export default function GroupListPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { title, currentStage } = useTournament(tournamentId);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchCounts, setMatchCounts] = useState({});

  useEffect(() => {
    if (!tournamentId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/tournaments/bookinggroups/tournament/${tournamentId}`
        );
        const allGroups = res.data?.data || [];
        setGroups(allGroups);

        const counts = {};
        for (const g of allGroups.slice(0, 20)) {
          try {
            const mRes = await axios.get(
              `/api/tournaments/matches/${tournamentId}/${g._id}`
            );
            const matches = mRes.data?.matches || [];
            counts[g._id] = {
              total: matches.length,
              completed: matches.filter(
                (m) => m.status === "COMPLETED" || m.status === "completed"
              ).length,
              inProgress: matches.filter(
                (m) => m.status === "IN_PROGRESS" || m.status === "in_progress"
              ).length,
            };
          } catch {
            counts[g._id] = { total: 0, completed: 0, inProgress: 0 };
          }
        }
        setMatchCounts(counts);
      } catch (err) {
        console.error("Error fetching groups:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="p-6 max-w-[1320px] mx-auto">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 bg-neutral-200 rounded" />
          <div className="h-12 bg-neutral-100 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-neutral-100 rounded-2xl" />
            ))}
          </div>
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
            Groups
          </p>
          <h1 className="text-[24px] leading-tight font-semibold tracking-tight text-neutral-950">
            {groups.length}
            <span className="text-[14px] font-medium text-neutral-500 ml-2">
              groups in this tournament
            </span>
          </h1>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl px-6 py-14 text-center">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 inline-flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5 text-neutral-400" />
          </div>
          <h3 className="text-[14px] font-semibold text-neutral-900">
            No groups created yet
          </h3>
          <p className="text-[13px] text-neutral-500 mt-1 max-w-md mx-auto mb-4">
            Head to the Players step to create groups from registered players.
          </p>
          <button
            onClick={() => navigate(`/tournaments/${tournamentId}/players`)}
            className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white rounded-lg transition active:scale-[0.98]"
            style={{ backgroundColor: SIG }}
          >
            Go to Players
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map((group, idx) => {
            const mc = matchCounts[group._id] || {
              total: 0,
              completed: 0,
              inProgress: 0,
            };
            const progress =
              mc.total > 0 ? Math.round((mc.completed / mc.total) * 100) : 0;
            const isRound2 =
              group.groupName?.toLowerCase().includes("round 2") || group.isRound2;
            const isDone = progress === 100 && mc.total > 0;

            return (
              <button
                key={group._id}
                onClick={() =>
                  navigate(`/tournaments/${tournamentId}/groups/${group._id}`)
                }
                className="bg-white border border-neutral-200 rounded-2xl p-4 text-left hover:border-neutral-300 transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg inline-flex items-center justify-center font-mono tabular-nums text-[12px] font-semibold ${
                        isRound2
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      {isRound2 ? "R2" : String.fromCharCode(65 + idx)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-neutral-900 truncate">
                        {group.groupName || `Group ${idx + 1}`}
                      </p>
                      {group.category && (
                        <p className="text-[11px] text-neutral-500 truncate">
                          {group.category}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-700 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mb-3">
                  <Users className="w-3 h-3" />
                  <span className="font-mono tabular-nums">
                    {group.players?.length || 0}
                  </span>
                  <span>players</span>
                </div>

                {mc.total > 0 ? (
                  <>
                    <div className="flex justify-between text-[10px] text-neutral-500 mb-1.5 font-mono tabular-nums">
                      <span>
                        {mc.completed}/{mc.total} matches
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: isDone ? "#10B981" : SIG,
                        }}
                      />
                    </div>
                    {mc.inProgress > 0 && (
                      <div className="text-[10px] font-medium text-emerald-700 mt-1.5 flex items-center gap-1.5">
                        <span className="relative flex w-1.5 h-1.5">
                          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />
                          <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </span>
                        <span className="font-mono tabular-nums">
                          {mc.inProgress}
                        </span>
                        <span>live</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[10px] text-neutral-400 bg-neutral-50 rounded-lg py-1.5 px-2 text-center">
                    No matches generated
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
