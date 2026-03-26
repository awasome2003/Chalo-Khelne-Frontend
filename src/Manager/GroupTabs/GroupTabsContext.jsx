import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import groupTabsApi from "./groupTabsApi";

// ================================================
// CENTRALIZED STATE FOR THE ENTIRE GROUP TABS FLOW
// Eliminates 44 useState hooks scattered in one file
// ================================================

const GroupTabsContext = createContext(null);

export const useGroupTabs = () => {
  const ctx = useContext(GroupTabsContext);
  if (!ctx) throw new Error("useGroupTabs must be used within GroupTabsProvider");
  return ctx;
};

export function GroupTabsProvider({ tournamentId: propTournamentId, children }) {
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get("tournamentId") || propTournamentId;

  // ---- Core Data ----
  const [tournament, setTournament] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- Navigation ----
  const [activeTab, setActiveTab] = useState("League"); // League | Top Players | Knockout
  const [activeGroup, setActiveGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  // ---- Round 1 Matches ----
  const [matchesData, setMatchesData] = useState({});
  const [groupsWithMatches, setGroupsWithMatches] = useState(new Set());

  // ---- Round 2 ----
  const [round2Groups, setRound2Groups] = useState([]);
  const [activeRound2Group, setActiveRound2Group] = useState(null);
  const [round2MatchesData, setRound2MatchesData] = useState({});

  // ---- Knockout ----
  const [knockoutMatchesByRound, setKnockoutMatchesByRound] = useState({});

  // ---- Direct Knockout ----
  const [directKnockoutMatches, setDirectKnockoutMatches] = useState([]);
  const [availablePlayersForKnockout, setAvailablePlayersForKnockout] = useState([]);

  // ================================================
  // DATA FETCHING
  // ================================================

  const fetchTournamentData = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const res = await groupTabsApi.fetchTournament(tournamentId);
      if (res.data) {
        const t = res.data.tournament || res.data;
        setTournament(t);
      }
    } catch (err) {
      console.error("Error fetching tournament:", err.message);
    }
  }, [tournamentId]);

  const fetchGroups = useCallback(async () => {
    if (!tournamentId) return;
    try {
      setLoading(true);
      const res = await groupTabsApi.fetchGroups(tournamentId);
      if (res.data.success) {
        const round1Groups = (res.data.data || []).filter(
          (g) => !g.groupName?.toLowerCase().includes("round 2") && !g.isRound2
        );
        setGroups(round1Groups);
        if (round1Groups.length > 0 && !activeGroup) {
          setActiveGroup(round1Groups[0]._id);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  const fetchMatches = useCallback(async (groupId) => {
    const gId = groupId || activeGroup;
    if (!tournamentId || !gId) return;
    try {
      const res = await groupTabsApi.fetchGroupMatches(tournamentId, gId);
      if (res.data.success) {
        setMatchesData((prev) => ({ ...prev, [gId]: res.data.matches || [] }));
        if ((res.data.matches || []).length > 0) {
          setGroupsWithMatches((prev) => new Set([...prev, gId]));
        }
      }
    } catch {
      setMatchesData((prev) => ({ ...prev, [gId]: [] }));
    }
  }, [tournamentId, activeGroup]);

  const fetchRound2Groups = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const res = await groupTabsApi.fetchRound2Groups(tournamentId);
      if (res.data.success) {
        const r2 = (res.data.data || res.data.groups || []).filter(
          (g) => g.groupName?.toLowerCase().includes("round 2") || g.isRound2
        );
        setRound2Groups(r2);
        if (r2.length > 0 && !activeRound2Group) {
          setActiveRound2Group(r2[0]._id);
        }
        // Fetch matches for each R2 group
        for (const g of r2) {
          try {
            const mRes = await groupTabsApi.fetchGroupMatches(tournamentId, g._id);
            if (mRes.data.success) {
              setRound2MatchesData((prev) => ({ ...prev, [g._id]: mRes.data.matches || [] }));
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error("Error fetching Round 2 groups:", err.message);
    }
  }, [tournamentId]);

  const fetchKnockoutMatches = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const res = await groupTabsApi.fetchKnockoutMatches(tournamentId);
      if (res.data.success) {
        const matches = res.data.matches || [];
        const byRound = {};
        matches.forEach((m) => {
          const round = m.roundName || m.round || "round-1";
          if (!byRound[round]) byRound[round] = [];
          byRound[round].push(m);
        });
        setKnockoutMatchesByRound(byRound);
      }
    } catch {}
  }, [tournamentId]);

  const fetchAvailablePlayers = useCallback(async () => {
    if (!tournamentId) return;
    try {
      const res = await groupTabsApi.fetchAvailablePlayers(tournamentId);
      if (res.data.success) {
        setAvailablePlayersForKnockout(res.data.players || []);
      }
    } catch {}
  }, [tournamentId]);

  // ================================================
  // INITIAL LOAD
  // ================================================

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentData();
      fetchGroups();
      fetchKnockoutMatches();
      fetchRound2Groups();
    }
  }, [tournamentId]);

  useEffect(() => {
    if (activeGroup) fetchMatches(activeGroup);
  }, [activeGroup]);

  // ================================================
  // DERIVED STATE
  // ================================================

  const filteredGroups = groups.filter((g) => {
    if (!selectedCategory) return true;
    const gCat = (g.category || "").toLowerCase().trim().replace(/_/g, " ");
    const sCat = selectedCategory.toLowerCase().trim().replace(/_/g, " ");
    return gCat === sCat || gCat.includes(sCat) || sCat.includes(gCat);
  });

  const currentGroup = filteredGroups.find((g) => g._id === activeGroup) || filteredGroups[0];

  const filteredRound2Groups = (round2Groups || []).filter((g) => {
    if (!selectedCategory) return true;
    const gCat = (g.category || "").toLowerCase().trim().replace(/_/g, " ");
    const sCat = selectedCategory.toLowerCase().trim().replace(/_/g, " ");
    return gCat === sCat || gCat.includes(sCat) || sCat.includes(gCat);
  });

  const currentRound2Group =
    filteredRound2Groups.find((g) => g._id === activeRound2Group) || filteredRound2Groups[0];

  const getMatchFormat = () => {
    const groupData = groups.find((g) => g._id === activeGroup);
    const maxSets = groupData?.matchFormat?.totalSets || tournament?.matchFormat?.totalSets || 5;
    return { maxSets, setsToWin: Math.ceil(maxSets / 2) };
  };

  // ================================================
  // CONTEXT VALUE
  // ================================================

  const value = {
    // IDs
    tournamentId,

    // Core data
    tournament,
    groups,
    loading,
    error,

    // Navigation
    activeTab, setActiveTab,
    activeGroup, setActiveGroup,
    selectedCategory, setSelectedCategory,

    // Round 1
    matchesData, setMatchesData,
    groupsWithMatches,
    filteredGroups,
    currentGroup,

    // Round 2
    round2Groups,
    activeRound2Group, setActiveRound2Group,
    round2MatchesData,
    filteredRound2Groups,
    currentRound2Group,

    // Knockout
    knockoutMatchesByRound,

    // Direct Knockout
    directKnockoutMatches,
    availablePlayersForKnockout,

    // Derived
    getMatchFormat,

    // Actions
    fetchMatches,
    fetchGroups,
    fetchRound2Groups,
    fetchKnockoutMatches,
    fetchAvailablePlayers,
    fetchTournamentData,
  };

  return (
    <GroupTabsContext.Provider value={value}>
      {children}
    </GroupTabsContext.Provider>
  );
}

export default GroupTabsContext;
