import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowUpRight, Calendar, ChevronRight,
  MapPin, Plus, Radio, RotateCw, Search, Trophy, Users,
} from "lucide-react";
import { getCategories } from "../utils/sportTrack";

const SIG = "#5E6AD2";

const fmtTime = (d) =>
  d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
const fmtDateLong = (d) =>
  d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
const sameDay = (a, b) => a.toDateString() === b.toDateString();

const MDashboard = () => {
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);
  const [tournaments, setTournaments] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const managerId = user?._id;
        if (!managerId) { setLoading(false); return; }
        const { data } = await axios.get(`/api/tournaments/manager/${managerId}`);
        if (cancelled) return;
        const list = data?.tournaments || [];
        const wl = [];
        list.forEach((t) =>
          (t.whitelist || []).forEach((emp) =>
            wl.push({ ...emp, tournamentTitle: t.title, tournamentId: t._id })
          )
        );
        setTournaments(list);
        setWhitelist(wl);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const liveNow = tournaments.filter((t) => {
    if (!t.startDate || !t.endDate) return false;
    const s = new Date(t.startDate);
    const e = new Date(t.endDate);
    return s <= now && now <= e;
  });
  const startingToday = tournaments.filter((t) =>
    t.startDate && sameDay(new Date(t.startDate), now)
  );
  const upcoming = [...tournaments]
    .filter((t) => t.startDate && new Date(t.startDate) > now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);
  const drafts = tournaments.filter((t) =>
    String(t.status || "").toLowerCase() === "draft"
  );

  const goTournaments = () => navigate("/mtournament-management");

  if (loading) return <Skeleton />;
  if (error) return <ErrorPanel message={error} />;

  return (
    <div className="p-6 max-w-[1320px] mx-auto">
      <Header now={now} onSearch={goTournaments} onCreate={goTournaments} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi label="Live now" value={liveNow.length} accent={liveNow.length > 0} pulse={liveNow.length > 0} />
        <Kpi label="Starting today" value={startingToday.length} />
        <Kpi label="Pending approvals" value={whitelist.length} />
        <Kpi label="Active tournaments" value={tournaments.length} />
      </div>

      <Section
        title="Now"
        subtitle={liveNow.length ? `${liveNow.length} live this moment` : "Nothing happening right now"}
        action={liveNow.length ? { label: "Open broadcast", onClick: goTournaments } : null}
      >
        {liveNow.length === 0 ? (
          <Empty
            icon={Radio}
            title="The Now strip is quiet"
            body="When a tournament or session is live under your management, it surfaces here in real time."
          />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {liveNow.slice(0, 4).map((t) => (
              <NowRow key={t._id} t={t} onOpen={goTournaments} />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Inbox" subtitle="Items that need a decision from you">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3">
          <InboxTile
            icon={Users}
            label="Whitelist requests"
            count={whitelist.length}
            cta="Review"
            onClick={goTournaments}
            disabled={whitelist.length === 0}
          />
          <InboxTile
            icon={Trophy}
            label="Tournaments to publish"
            count={drafts.length}
            cta="Publish"
            onClick={goTournaments}
            disabled={drafts.length === 0}
          />
          <InboxTile
            icon={AlertCircle}
            label="Refunds & disputes"
            count={0}
            cta="Open queue"
            disabled
          />
        </div>
      </Section>

      <Section
        title={startingToday.length ? "Today" : "Upcoming"}
        subtitle={
          startingToday.length
            ? `${startingToday.length} tournament${startingToday.length === 1 ? "" : "s"} starting today`
            : "Next 5 tournaments under your management"
        }
        action={tournaments.length ? { label: "View all", onClick: goTournaments } : null}
      >
        {(startingToday.length ? startingToday : upcoming).length === 0 ? (
          <Empty
            icon={Calendar}
            title="No tournaments scheduled"
            body="Create a tournament — your next five will appear here, ordered by start date."
          />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {(startingToday.length ? startingToday : upcoming).map((t) => (
              <TournamentRow key={t._id} t={t} onClick={goTournaments} />
            ))}
          </ul>
        )}
      </Section>

      {whitelist.length > 0 && (
        <Section
          title="Whitelisted players"
          subtitle={`${whitelist.length} total · showing ${Math.min(5, whitelist.length)}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-100">
                  <Th>Player</Th><Th>ID</Th><Th>Mobile</Th><Th>Tournament</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {whitelist.slice(0, 5).map((emp, i) => (
                  <tr key={i} className="hover:bg-neutral-50/60 transition">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 inline-flex items-center justify-center text-[11px] font-semibold text-neutral-700">
                          {(emp.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[13px] font-medium text-neutral-900">{emp.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-mono tabular-nums text-neutral-500">
                      {emp.employeeId || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-mono tabular-nums text-neutral-500">
                      {emp.mobile || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium text-neutral-700 bg-neutral-100">
                        {emp.tournamentTitle}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
};

export default MDashboard;

/* ────────────────────────────────────────────────────── */

const Header = ({ now, onSearch, onCreate }) => (
  <header className="flex items-end justify-between gap-4 flex-wrap mb-6">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1.5">
        Manager · {fmtTime(now)}
      </p>
      <h1 className="text-[28px] leading-[1.1] font-semibold tracking-tight text-neutral-950">
        {fmtDateLong(now)}
      </h1>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onSearch}
        className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition"
      >
        <Search className="w-3.5 h-3.5" />
        Search
        <span className="ml-1.5 font-mono text-[10px] text-neutral-400 border border-neutral-200 rounded px-1 py-px">
          ⌘K
        </span>
      </button>
      <button
        onClick={onCreate}
        className="h-8 px-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white rounded-lg transition active:scale-[0.98]"
        style={{ backgroundColor: SIG }}
      >
        <Plus className="w-3.5 h-3.5" />
        New tournament
      </button>
    </div>
  </header>
);

const Kpi = ({ label, value, accent = false, pulse = false }) => (
  <div className="bg-white border border-neutral-200 rounded-2xl p-4">
    <div className="flex items-start justify-between mb-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {label}
      </span>
      {pulse && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      )}
    </div>
    <div
      className="font-mono tabular-nums text-[28px] leading-none font-semibold"
      style={{ color: accent ? SIG : "#0A0A0A" }}
    >
      {value}
    </div>
  </div>
);

const Section = ({ title, subtitle, action, children }) => (
  <section className="mb-5">
    <div className="flex items-end justify-between mb-2.5">
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-900">
          {title}
        </h2>
        {subtitle && <p className="text-[12px] text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[12px] font-medium hover:underline"
          style={{ color: SIG }}
        >
          {action.label} →
        </button>
      )}
    </div>
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      {children}
    </div>
  </section>
);

const Empty = ({ icon: Icon, title, body }) => (
  <div className="px-6 py-10 text-center">
    <div className="w-10 h-10 rounded-xl bg-neutral-100 inline-flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-neutral-400" />
    </div>
    <h3 className="text-[14px] font-semibold text-neutral-900">{title}</h3>
    <p className="text-[13px] text-neutral-500 mt-1 max-w-md mx-auto">{body}</p>
  </div>
);

const NowRow = ({ t, onOpen }) => {
  const start = t.startDate ? new Date(t.startDate) : null;
  const end = t.endDate ? new Date(t.endDate) : null;
  const venue = t.eventLocation?.[0] || t.location || "";
  return (
    <li>
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50/60 transition text-left"
      >
        <span className="relative flex w-2 h-2 flex-shrink-0">
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />
          <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-neutral-900 truncate">{t.title}</p>
          <p className="text-[12px] text-neutral-500 mt-0.5">
            <span className="font-mono tabular-nums">
              {start && fmtTime(start)} – {end && fmtTime(end)}
            </span>
            {venue && <span> · {venue}</span>}
          </p>
        </div>
        <span
          className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded"
          style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#047857" }}
        >
          Live
        </span>
        <ArrowUpRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
      </button>
    </li>
  );
};

const InboxTile = ({ icon: Icon, label, count, cta, disabled = false, onClick }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className="text-left p-4 bg-neutral-50/60 border border-neutral-200 rounded-xl hover:bg-white hover:border-neutral-300 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-50/60 disabled:hover:border-neutral-200"
  >
    <div className="flex items-start justify-between mb-2.5">
      <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 inline-flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-neutral-700" />
      </div>
      <span className="font-mono tabular-nums text-[20px] leading-none font-semibold text-neutral-900">
        {count}
      </span>
    </div>
    <p className="text-[13px] font-medium text-neutral-900">{label}</p>
    <span
      className="text-[12px] font-medium mt-0.5 inline-flex items-center gap-0.5"
      style={{ color: disabled ? "#737373" : SIG }}
    >
      {cta}
      <ChevronRight className="w-3 h-3" />
    </span>
  </button>
);

const TournamentRow = ({ t, onClick }) => {
  const start = t.startDate ? new Date(t.startDate) : null;
  const cats = getCategories(t) || [];
  const fees = cats.map((c) => Number(c.fee) || 0).filter((n) => n > 0);
  const feeText = !fees.length
    ? "Free"
    : Math.min(...fees) === Math.max(...fees)
      ? `₹${Math.min(...fees)}`
      : `₹${Math.min(...fees)}–${Math.max(...fees)}`;
  const venue = t.eventLocation?.[0] || t.location || "";

  return (
    <li>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-neutral-50/60 transition text-left"
      >
        <div className="flex-shrink-0 w-11 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            {start ? start.toLocaleDateString("en-IN", { month: "short" }) : "—"}
          </p>
          <p className="font-mono tabular-nums text-[20px] leading-none font-semibold text-neutral-900 mt-0.5">
            {start ? start.getDate() : "—"}
          </p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-neutral-900 truncate">{t.title}</p>
          <p className="text-[12px] text-neutral-500 mt-0.5 inline-flex items-center gap-2">
            {start && <span className="font-mono tabular-nums">{fmtTime(start)}</span>}
            {venue && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {venue}
              </span>
            )}
          </p>
        </div>
        <span className="font-mono tabular-nums text-[12px] font-medium text-neutral-700 flex-shrink-0">
          {feeText}
        </span>
        <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
      </button>
    </li>
  );
};

const Th = ({ children }) => (
  <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
    {children}
  </th>
);

const Skeleton = () => (
  <div className="p-6 max-w-[1320px] mx-auto">
    <div className="animate-pulse space-y-5">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-neutral-200 rounded" />
        <div className="h-7 w-72 bg-neutral-200 rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-neutral-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-32 bg-neutral-100 rounded-2xl" />
      <div className="h-32 bg-neutral-100 rounded-2xl" />
    </div>
  </div>
);

const ErrorPanel = ({ message }) => (
  <div className="p-6 max-w-[1320px] mx-auto">
    <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center max-w-md mx-auto">
      <div className="w-10 h-10 rounded-xl bg-rose-50 inline-flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5 text-rose-600" />
      </div>
      <h3 className="text-[15px] font-semibold text-neutral-900">Couldn't load your dashboard</h3>
      <p className="text-[13px] text-neutral-500 mt-1 mb-4">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition"
      >
        <RotateCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  </div>
);
