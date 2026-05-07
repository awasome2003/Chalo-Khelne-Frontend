import { useParams, useNavigate } from "react-router-dom";
import {
  Users, Grid3X3, Swords, Calendar, MapPin, Award, ArrowRight,
  Briefcase, Radio, Share2, LayoutGrid,
} from "lucide-react";
import useTournament from "./useTournament";
import Breadcrumbs from "./Breadcrumbs";
import TournamentStepper from "./TournamentStepper";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  getTournamentType, getGroupStageFormat, getKnockoutFormat, getQualifyPerGroup,
} from "../../utils/sportTrack";

const SIG = "#5E6AD2";

const fmtDate = (d) =>
  !d ? "TBD"
    : new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function TournamentOverviewPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { tournament, loading, error, title, sportsType, currentStage, categories } =
    useTournament(tournamentId);
  const [stats, setStats] = useState({ players: 0, groups: 0, matches: 0, completed: 0, courts: 0 });

  useEffect(() => {
    if (!tournamentId) return;
    (async () => {
      try {
        const bookingsRes = await axios.get(
          `/api/tournaments/getRegisteredPlayers?tournamentId=${tournamentId}`
        );
        const players = bookingsRes.data?.bookings?.length || 0;

        const groupsRes = await axios.get(
          `/api/tournaments/bookinggroups/tournament/${tournamentId}`
        );
        const groups = (groupsRes.data?.data || []).length;

        let matches = 0, completed = 0;
        if (groupsRes.data?.data?.[0]) {
          const matchRes = await axios.get(
            `/api/tournaments/matches/${tournamentId}/${groupsRes.data.data[0]._id}`
          );
          matches = matchRes.data?.matches?.length || 0;
          completed = (matchRes.data?.matches || []).filter(
            (m) => m.status === "COMPLETED" || m.status === "completed"
          ).length;
        }

        // Courts count drives the Courts quick-action tile description.
        // Active-only by default — matches what generators will use.
        let courts = 0;
        try {
          const courtsRes = await axios.get(`/api/tournaments/${tournamentId}/courts`);
          courts = (courtsRes.data?.courts || []).length;
        } catch {}

        setStats({ players, groups, matches, completed, courts });
      } catch {}
    })();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="p-6 max-w-[1320px] mx-auto">
        <div className="animate-pulse space-y-5">
          <div className="h-4 w-40 bg-neutral-200 rounded" />
          <div className="h-12 bg-neutral-100 rounded-2xl" />
          <div className="h-44 bg-neutral-100 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 bg-neutral-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-[1320px] mx-auto">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center">
          <p className="text-[14px] font-semibold text-neutral-900">Couldn't load tournament</p>
          <p className="text-[13px] text-neutral-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const isLive = ["group_stage", "qualifier_knockout", "knockout"].includes(currentStage);
  const isCompleted = currentStage === "completed";

  const quickActions = [
    { label: "Players", desc: `${stats.players} registered`, icon: Users, path: "players" },
    { label: "Groups", desc: `${stats.groups} groups`, icon: Grid3X3, path: "groups" },
    { label: "Knockout", desc: "Bracket view", icon: Swords, path: "knockout" },
    {
      label: "Courts",
      desc: stats.courts === 0 ? "Set up courts" : `${stats.courts} active`,
      icon: LayoutGrid,
      path: "courts",
    },
    { label: "Staff", desc: "Applications", icon: Briefcase, path: "staff" },
  ];

  const handleShare = () => {
    const link = `${window.location.origin}/tournament/${tournamentId}`;
    navigator.clipboard?.writeText(link).catch(() => {});
  };

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <Breadcrumbs tournamentName={title} />
      <TournamentStepper currentStage={currentStage} />

      <div className="bg-neutral-950 rounded-2xl overflow-hidden mb-5 relative">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px, 60px 60px",
          }}
        />
        <div className="relative p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 mb-2">
                {sportsType || "Tournament"}
              </p>
              <h1 className="text-[32px] leading-[1.05] font-semibold tracking-tight text-white">
                {title}
              </h1>
              <div className="flex items-center gap-4 mt-3 text-[12px] text-neutral-400 flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-mono tabular-nums">
                    {fmtDate(tournament?.startDate)} – {fmtDate(tournament?.endDate)}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {Array.isArray(tournament?.eventLocation)
                      ? tournament.eventLocation[0]
                      : tournament?.eventLocation || "TBD"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>{getTournamentType(tournament) || "—"}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isLive && (
                <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-70" />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Live
                </span>
              )}
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-white/10 text-neutral-300 border border-white/10">
                  Completed
                </span>
              )}
              {!isLive && !isCompleted && currentStage && (
                <span className="inline-flex items-center h-8 px-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-white/10 text-neutral-300 border border-white/10">
                  {currentStage.replace(/_/g, " ")}
                </span>
              )}
              <button
                onClick={handleShare}
                className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition border border-white/10"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              <button
                onClick={() => navigate(`/tournaments/${tournamentId}/knockout`)}
                className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-950 bg-white hover:bg-neutral-100 rounded-lg transition"
              >
                <Radio className="w-3.5 h-3.5" />
                Broadcast
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/10">
            {[
              { label: "Players", value: stats.players },
              { label: "Groups", value: stats.groups },
              { label: "Matches", value: stats.matches },
              { label: "Completed", value: stats.completed },
            ].map((s) => (
              <div key={s.label} className="bg-neutral-950 px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-1.5">
                  {s.label}
                </p>
                <p className="font-mono tabular-nums text-[24px] leading-none font-semibold text-white">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {categories.map((c) => (
            <span
              key={c._id || c.name}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium text-neutral-700 bg-neutral-100"
            >
              {c.name}
              {c.fee > 0 && (
                <span className="ml-1.5 font-mono tabular-nums text-neutral-500">
                  ₹{c.fee}
                </span>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => navigate(`/tournaments/${tournamentId}/${action.path}`)}
              className="bg-white border border-neutral-200 rounded-2xl p-4 text-left hover:border-neutral-300 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 inline-flex items-center justify-center">
                  <Icon className="w-4 h-4 text-neutral-700" />
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-700 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[14px] font-semibold text-neutral-900">{action.label}</p>
              <p className="text-[12px] text-neutral-500 mt-0.5">{action.desc}</p>
            </button>
          );
        })}
      </div>

      <section>
        <div className="mb-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-900">
            Tournament details
          </h2>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl">
          <dl className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:[&>div:nth-child(odd)]:border-r divide-neutral-100 md:border-neutral-100">
            <Detail label="Type" value={getTournamentType(tournament) || "—"} />
            <Detail
              label="Level"
              value={(() => {
                const sports = Array.isArray(tournament?.sports) ? tournament.sports : [];
                const levels = sports.map((s) => s?.tournamentLevel).filter(Boolean);
                const uniq = Array.from(new Set(levels));
                if (uniq.length === 0) return tournament?.tournamentLevel || "—";
                if (uniq.length === 1) return uniq[0];
                return "Mixed";
              })()}
              tooltip={(() => {
                const sports = Array.isArray(tournament?.sports) ? tournament.sports : [];
                const levels = sports.map((s) => s?.tournamentLevel).filter(Boolean);
                const uniq = Array.from(new Set(levels));
                if (uniq.length <= 1) return null;
                return sports
                  .map((s) => `${s?.sportName || "?"}: ${s?.tournamentLevel || "—"}`)
                  .join(" · ");
              })()}
            />
            <Detail label="Organizer" value={tournament?.organizerName || "—"} />
            <Detail
              label="Format"
              value={`${getGroupStageFormat(tournament)} → ${getKnockoutFormat(tournament)}`}
            />
            <Detail label="Qualify per group" value={getQualifyPerGroup(tournament)} mono />
            <Detail label="Fee" value={`₹${tournament?.tournamentFee || 0}`} mono />
          </dl>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value, mono = false, tooltip = null }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </dt>
      <dd
        className={`text-[13px] font-medium text-neutral-900 capitalize ${
          mono ? "font-mono tabular-nums" : ""
        } ${tooltip ? "underline decoration-dotted underline-offset-2 cursor-help" : ""}`}
        title={tooltip || undefined}
      >
        {value}
      </dd>
    </div>
  );
}
