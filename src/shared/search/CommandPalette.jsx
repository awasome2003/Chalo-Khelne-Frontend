import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, X, Trophy, MapPin, Newspaper, Tag, Dumbbell, User as UserIcon,
  ArrowRight, AlertCircle, Loader2, Clock,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useCommandPalette } from "./CommandPaletteContext";
import { searchEntities } from "./searchApi";
import { getRecentItems, pushRecentItem } from "./recentItems";
import { getActionsForRole } from "./roleActions";

const SIG = "#5E6AD2";
const SIG_TINT = "rgba(94,106,210,0.08)";

// Defensive coercion — never let a non-string slip into a <p>. If the API
// regresses and returns an object for label/sublabel, render its JSON form
// instead of crashing the React tree.
const toText = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
};

const TYPE_META = {
  tournament: { icon: Trophy,    plural: "Tournaments" },
  turf:       { icon: MapPin,    plural: "Turfs" },
  trainer:    { icon: Dumbbell,  plural: "Trainers" },
  news:       { icon: Newspaper, plural: "News" },
  coupon:     { icon: Tag,       plural: "Coupons" },
  player:     { icon: UserIcon,  plural: "People" },
  action:     { icon: ArrowRight, plural: "Actions" },
};

export default function CommandPalette() {
  const { open, closePalette } = useCommandPalette();
  const { auth } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const role = auth?.role;
  const allActions = useMemo(() => getActionsForRole(role), [role]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceTimer = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setError(null);
    setActiveIndex(0);
    setRecent(getRecentItems());
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError(null);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimer.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const r = await searchEntities(trimmed, { signal: ctrl.signal });
        if (r === null) return;
        setResults(r);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          setError("Search isn't available for this account yet.");
        } else if (status >= 500) {
          setError("Search is temporarily unavailable. Try again in a moment.");
        } else {
          setError(err?.response?.data?.error || err?.message || "Search failed");
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(debounceTimer.current);
  }, [query, open]);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allActions
      .filter((a) => a.keywords.includes(q))
      .slice(0, 6);
  }, [query, allActions]);

  const flatItems = useMemo(() => {
    const items = [];

    if (!query.trim()) {
      if (recent.length > 0) {
        items.push({ kind: "header", label: "Recent" });
        recent.forEach((r) => items.push({ kind: "result", data: r }));
      }
      items.push({ kind: "header", label: "Quick actions" });
      allActions.forEach((a) =>
        items.push({ kind: "result", data: { ...a, type: "action" } })
      );
      return items;
    }

    if (filteredActions.length > 0) {
      items.push({ kind: "header", label: "Actions" });
      filteredActions.forEach((a) =>
        items.push({ kind: "result", data: { ...a, type: "action" } })
      );
    }

    const grouped = {};
    results.forEach((r) => {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    });
    Object.entries(grouped).forEach(([type, rows]) => {
      const meta = TYPE_META[type];
      items.push({ kind: "header", label: meta?.plural || type });
      rows.forEach((r) => items.push({ kind: "result", data: r }));
    });

    return items;
  }, [query, results, recent, allActions, filteredActions]);

  const selectableIndices = useMemo(
    () =>
      flatItems.reduce((acc, it, i) => {
        if (it.kind === "result") acc.push(i);
        return acc;
      }, []),
    [flatItems]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [flatItems.length, query]);

  const select = useCallback(
    (item) => {
      if (!item || !item.data) return;
      const data = item.data;
      pushRecentItem(data);
      closePalette();
      if (data.route) navigate(data.route);
    },
    [navigate, closePalette]
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) =>
          selectableIndices.length === 0 ? 0 : Math.min(i + 1, selectableIndices.length - 1)
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(Math.max(0, selectableIndices.length - 1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const idx = selectableIndices[activeIndex];
        if (idx == null) return;
        select(flatItems[idx]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, activeIndex, selectableIndices, flatItems, select, closePalette]);

  useEffect(() => {
    if (!listRef.current) return;
    const idx = selectableIndices[activeIndex];
    if (idx == null) return;
    const node = listRef.current.querySelector(`[data-index="${idx}"]`);
    if (node) node.scrollIntoView({ block: "nearest" });
  }, [activeIndex, selectableIndices]);

  if (!open) return null;

  const hasItems = flatItems.length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-neutral-950/40 backdrop-blur-sm"
      onClick={closePalette}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-[640px] bg-white rounded-2xl border border-neutral-200 shadow-[0_24px_64px_rgba(0,0,0,0.16)] overflow-hidden flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-12 border-b border-neutral-100 flex-shrink-0">
          <Search className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search venues, tournaments, players, news…"
            className="flex-1 h-full bg-transparent text-[14px] text-neutral-900 placeholder-neutral-400 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search query"
          />
          {loading && (
            <Loader2 className="w-3.5 h-3.5 text-neutral-400 animate-spin flex-shrink-0" />
          )}
          <button
            onClick={closePalette}
            className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto">
          {error ? (
            <ErrorView message={error} />
          ) : !hasItems ? (
            <EmptyView hasQuery={!!query.trim()} />
          ) : (
            flatItems.map((item, i) => {
              if (item.kind === "header") {
                return (
                  <div
                    key={`h-${i}-${item.label}`}
                    className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400 sticky top-0 bg-white z-[1]"
                  >
                    {item.label}
                  </div>
                );
              }
              const data = item.data;
              const meta = TYPE_META[data.type] || TYPE_META.action;
              const Icon = data.icon || meta.icon;
              const isActive = selectableIndices[activeIndex] === i;
              const fromRecent = data.type !== "action" && !query.trim();

              return (
                <button
                  key={`${data.type}-${data.id || data.label}-${i}`}
                  data-index={i}
                  onMouseEnter={() => {
                    const sel = selectableIndices.indexOf(i);
                    if (sel >= 0) setActiveIndex(sel);
                  }}
                  onClick={() => select(item)}
                  className="w-full flex items-center gap-3 px-4 h-11 text-left transition"
                  style={isActive ? { backgroundColor: SIG_TINT } : undefined}
                >
                  <div
                    className="w-7 h-7 rounded-md inline-flex items-center justify-center flex-shrink-0"
                    style={
                      isActive
                        ? { backgroundColor: "white", border: `1px solid ${SIG}` }
                        : { backgroundColor: "#F5F5F5" }
                    }
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: isActive ? SIG : "#525252" }}
                      strokeWidth={isActive ? 2.25 : 2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] truncate ${
                        isActive
                          ? "font-semibold text-neutral-950"
                          : "font-medium text-neutral-900"
                      }`}
                    >
                      {toText(data.label)}
                    </p>
                    {data.sublabel && toText(data.sublabel) && (
                      <p className="text-[11px] text-neutral-500 truncate">
                        {toText(data.sublabel)}
                      </p>
                    )}
                  </div>
                  {fromRecent && (
                    <Clock className="w-3 h-3 text-neutral-300 flex-shrink-0" />
                  )}
                  {isActive && (
                    <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-neutral-400 flex-shrink-0">
                      <kbd className="font-mono px-1 py-px bg-white border border-neutral-200 rounded text-neutral-500">
                        ↵
                      </kbd>
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        <Footer query={query} count={results.length} />
      </div>
    </div>
  );
}

function EmptyView({ hasQuery }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="w-10 h-10 rounded-xl bg-neutral-100 inline-flex items-center justify-center mb-3">
        <Search className="w-5 h-5 text-neutral-400" />
      </div>
      <p className="text-[14px] font-semibold text-neutral-900">
        {hasQuery ? "No matches found" : "Start typing to search"}
      </p>
      <p className="text-[12px] text-neutral-500 mt-1 max-w-sm mx-auto">
        {hasQuery
          ? "Try a different keyword, or check spelling."
          : "Find tournaments, venues, players, news, and more — across the whole platform."}
      </p>
    </div>
  );
}

function ErrorView({ message }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="w-10 h-10 rounded-xl bg-rose-50 inline-flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5 text-rose-600" />
      </div>
      <p className="text-[14px] font-semibold text-neutral-900">Search failed</p>
      <p className="text-[12px] text-neutral-500 mt-1 max-w-sm mx-auto">{message}</p>
    </div>
  );
}

function Footer({ query, count }) {
  return (
    <div className="border-t border-neutral-100 px-4 py-2 flex items-center justify-between text-[11px] text-neutral-500 bg-neutral-50/40 flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1">
          <kbd className="font-mono px-1 py-px bg-white border border-neutral-200 rounded">↑</kbd>
          <kbd className="font-mono px-1 py-px bg-white border border-neutral-200 rounded">↓</kbd>
          navigate
        </span>
        <span className="hidden sm:inline-flex items-center gap-1">
          <kbd className="font-mono px-1 py-px bg-white border border-neutral-200 rounded">↵</kbd>
          select
        </span>
        <span className="hidden sm:inline-flex items-center gap-1">
          <kbd className="font-mono px-1 py-px bg-white border border-neutral-200 rounded">esc</kbd>
          close
        </span>
      </div>
      {query.trim() && count > 0 && (
        <span className="font-mono tabular-nums">
          {count} {count === 1 ? "result" : "results"}
        </span>
      )}
    </div>
  );
}
