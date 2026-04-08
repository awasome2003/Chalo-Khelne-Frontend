import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { FaMedal } from "react-icons/fa";
import {
  FiFlag,
  FiTable,
  FiX,
  FiEdit2,
  FiCheck,
  FiInfo,
  FiPlus,
  FiUpload,
  FiTrash2
} from "react-icons/fi";
import sports_tennis from "../assets/sports_tennis.png";
import medal from "../assets/medal.png";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import BulkScoreUploadModal from "./BulkScoreUploadModal";
import BulkResultUploadModal from "./BulkResultUploadModal";

export default function Tournament({
  tournamentId: propTournamentId,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get tournamentId from URL parameters or props
  const tournamentId = searchParams.get('tournamentId') || propTournamentId;

  // 🎯 TOURNAMENT DATA STATE
  const [tournament, setTournament] = useState(null);

  const [activeSubGroupTab, setactiveSubGroupTab] = useState("League");
  const [activeGroup, setActiveGroup] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(""); // Add this line
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courtNumber, setCourtNumber] = useState("");
  const [matchInterval, setMatchInterval] = useState("");
  const [startTime, setStartTime] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [matchesData, setMatchesData] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);

  // State to track if matches have been generated
  const [matchesGenerated, setMatchesGenerated] = useState(false);
  // State to track if any matches are currently in progress
  const [hasMatchesInProgress, setHasMatchesInProgress] = useState(false);

  // Standings data per group
  const [standingsData, setStandingsData] = useState({});
  const [showStandings, setShowStandings] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);

  // Round 2 Top Players groups
  const [round2Groups, setRound2Groups] = useState([]);
  const [activeRound2Group, setActiveRound2Group] = useState(null);
  const [round2MatchesData, setRound2MatchesData] = useState({});

  // Knockout matches
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [knockoutMatchesByRound, setKnockoutMatchesByRound] = useState({});

  // 🔥 DIRECT KNOCKOUT - The new beast!
  const [tournamentMode, setTournamentMode] = useState("round2-plus-knockout");
  const [directKnockoutMatches, setDirectKnockoutMatches] = useState([]);
  const [selectedPlayersForKnockout, setSelectedPlayersForKnockout] = useState([]);
  const [validationStatus, setValidationStatus] = useState({ isValid: false, message: "" });
  const [availablePlayersForKnockout, setAvailablePlayersForKnockout] = useState([]);

  // 🏆 DIRECT KNOCKOUT SCHEDULE MODAL - Enhanced scheduling
  const [isDirectKnockoutScheduleModalOpen, setIsDirectKnockoutScheduleModalOpen] = useState(false);
  const [directKnockoutSchedule, setDirectKnockoutSchedule] = useState({
    courtNumber: "",
    startDate: "",
    startTime: "",
    intervalMinutes: 30,
    estimatedDuration: 45
  });
  const [isCreatingKnockout, setIsCreatingKnockout] = useState(false);

  // 🚀 GROUP-SPECIFIC MATCH FORMAT CONFIGURATION
  const [groupMatchFormat, setGroupMatchFormat] = useState({
    totalSets: 5,
    totalGames: 5,
    pointsToWinGame: 11,
    marginToWin: 2,
    deuceRule: true
  });
  const [isUpdatingFormat, setIsUpdatingFormat] = useState(false);

  const [groupsWithMatches, setGroupsWithMatches] = useState(new Set());

  // State for edit group modal
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [currentEditGroup, setCurrentEditGroup] = useState(null);

  // State for groups without matches (available for player movement)
  const [groupsWithoutMatches, setGroupsWithoutMatches] = useState([]);

  // State for player movement
  const [selectedPlayerForMovement, setSelectedPlayerForMovement] = useState(null);
  const [destinationGroupId, setDestinationGroupId] = useState('');

  // Bulk Score Upload state
  const [bulkScoreModal, setBulkScoreModal] = useState({ open: false, matches: [], groupId: null, title: "" });
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  const handleEditGroup = async (group) => {
    // Set the current group to be edited
    setCurrentEditGroup(group);

    // \ud83c\udfaf Initialize match format based on group's existing format or tournament's setFormat
    try {
      // First, try to get group's existing match format
      const groupFormatResponse = await axios.get(
        `/api/tournaments/bookinggroups/${group._id}/match-format`
      );

      if (groupFormatResponse.data.success && groupFormatResponse.data.matchFormat) {
        setGroupMatchFormat(groupFormatResponse.data.matchFormat);
      } else {
        // Fallback to tournament's setFormat
        if (tournament && tournament.setFormat) {
          const defaultFormat = convertSetFormatToMatchFormat(tournament.setFormat);
          setGroupMatchFormat(defaultFormat);
        }
      }
    } catch (error) {
      // If no group format exists, use tournament's setFormat
      if (tournament && tournament.setFormat) {
        const defaultFormat = convertSetFormatToMatchFormat(tournament.setFormat);
        setGroupMatchFormat(defaultFormat);
      }
    }

    // Open the edit group modal
    setIsEditGroupModalOpen(true);
  };

  // Function to handle group update
  const handleUpdateGroup = async (updatedGroupData) => {
    try {
      // The backend expects an array of USER IDs (not subdocument IDs)
      // Extract the actual player IDs from each player object
      const playerIds = updatedGroupData.players.map(player => {
        // For player objects from the database, we need the playerId field
        // which corresponds to the User ID in the Booking collection
        // The playerId field may be an ObjectId object { $oid: "..." } or a string
        const playerIdValue = player.playerId;
        // If playerId is an ObjectId object with $oid, extract the value
        if (playerIdValue && typeof playerIdValue === 'object' && playerIdValue.$oid) {
          return playerIdValue.$oid;
        }
        // Otherwise, use the playerId directly or fallback to other fields
        return typeof player.playerId === 'object'
          ? player.playerId.$oid
          : player.playerId;
      }).filter(id => id); // Filter out any undefined/null values


      // Call API to update the group
      const response = await axios.put(`/api/tournaments/bookinggroups/${updatedGroupData._id}`, {
        groupName: updatedGroupData.groupName,
        players: playerIds,
        category: updatedGroupData.category || 'Open Category'  // Include category to satisfy backend validation
      });

      if (response.data.success) {
        // Update the groups state with the updated group
        setGroups(prevGroups =>
          prevGroups.map(g => g._id === updatedGroupData._id ? response.data.data : g)
        );

        // Close the modal
        setIsEditGroupModalOpen(false);
        setCurrentEditGroup(null);

        toast.info('Group updated successfully!');
      } else {
        toast.info('Failed to update group: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error updating group:', error);
      toast.info('Error updating group: ' + error.message);
    }
  };

  const fetchMatches = async () => {
    if (!tournamentId || !activeGroup) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `/api/tournaments/matches/${tournamentId}/${activeGroup}`
      );

      if (response.data.success) {
        // Check if matches have been generated
        if (response.data.matches && response.data.matches.length > 0) {
          setMatchesGenerated(true);
          // Add this group to the groupsWithMatches set
          setGroupsWithMatches(prev => new Set([...prev, activeGroup]));
        } else {
          setMatchesGenerated(false);
          // Remove this group from the groupsWithMatches set if no matches exist
          setGroupsWithMatches(prev => {
            const newSet = new Set(prev);
            newSet.delete(activeGroup);
            return newSet;
          });
        }

        // Enrich matches with score data and live state if available
        let hasInProgress = false;
        const matchesWithScores = await Promise.all(
          response.data.matches.map(async (match) => {
            // Validate match data
            if (!match._id) {
              return { ...match, hasScores: false, status: 'pending' };
            }

            try {
              // PRIMARY: Use the live-state endpoint (this is what scoreboard uses)
              const liveStateResponse = await fetch(
                `/api/tournaments/matches/${match._id}/live-state?autoInit=false`
              );

              if (liveStateResponse.ok) {
                const liveData = await liveStateResponse.json();
                if (liveData.success && liveData.match) {
                  const liveMatch = liveData.match;

                  // Check if match has completed sets or is in progress
                  if (liveMatch.status === 'COMPLETED' && liveMatch.result?.winner) {
                    return {
                      ...match,
                      hasScores: true,
                      isLiveMatch: true,
                      liveMatchData: liveMatch,
                      winner: liveMatch.result.winner.playerName,
                      status: 'completed'
                    };
                  } else if (liveMatch.status === 'IN_PROGRESS') {
                    hasInProgress = true;
                    return {
                      ...match,
                      hasScores: true,
                      isLiveMatch: true,
                      liveMatchData: liveMatch,
                      status: 'in_progress'
                    };
                  } else if (liveMatch.sets && liveMatch.sets.length > 0) {
                    // Check if there are any completed sets
                    const hasCompletedSets = liveMatch.sets.some(set => set.status === 'COMPLETED');
                    if (hasCompletedSets) {
                      hasInProgress = true;
                      return {
                        ...match,
                        hasScores: true,
                        isLiveMatch: true,
                        liveMatchData: liveMatch,
                        status: 'in_progress'
                      };
                    }
                  }
                }
              }

              // SECONDARY: Try the array scores endpoint (now fixed with route reordering)
              const scoresArrayResponse = await fetch(
                `/api/tournaments/matches/${match._id}/scores`
              );

              if (scoresArrayResponse.ok) {
                const scoresArray = await scoresArrayResponse.json();
                if (Array.isArray(scoresArray) && scoresArray.length > 0) {
                  const latestScore = scoresArray[0]; // Most recent score
                  if (!latestScore.winner) {
                    hasInProgress = true;
                  }
                  return {
                    ...match,
                    hasScores: true,
                    currentScore: latestScore,
                    winner: latestScore.winner?.name || latestScore.winner?.userId?.name || latestScore.winner,
                    status: latestScore.winner ? 'completed' : 'in_progress'
                  };
                }
              }

              // TERTIARY: Fallback to single score endpoint
              const scoreResponse = await fetch(
                `/api/tournaments/scores/${match._id}`
              );

              if (scoreResponse.ok) {
                const scoreData = await scoreResponse.json();
                if (scoreData.score) {
                  if (!scoreData.score.winner) {
                    hasInProgress = true;
                  }
                  return {
                    ...match,
                    hasScores: true,
                    currentScore: scoreData.score,
                    winner: scoreData.score.winner?.name || scoreData.score.winner?.userId?.name || scoreData.score.winner,
                    status: scoreData.score.winner ? 'completed' : 'in_progress'
                  };
                }
              }

              return { ...match, hasScores: false, status: 'pending' };
            } catch (error) {
              // Add debug information
              if (error.message.includes('404')) {
              }
              return { ...match, hasScores: false, status: 'pending' };
            }
          })
        );

        setMatchesData(prev => ({
          ...prev,
          [activeGroup]: matchesWithScores,
        }));

        // Update the hasMatchesInProgress state
        setHasMatchesInProgress(hasInProgress);
      } else {
        setMatchesData(prev => ({ ...prev, [activeGroup]: [] }));
        setMatchesGenerated(false);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err.message);
      setMatchesData(prev => ({ ...prev, [activeGroup]: [] }));
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FETCH TOURNAMENT MODE - Detect Direct Knockout capability
  const fetchTournamentMode = async () => {
    try {
      const response = await axios.get(
        `/api/tournaments/${tournamentId}`
      );

      if (response.data.success && response.data.tournament) {
        const mode = response.data.tournament.roundTwoMode || "round2-plus-knockout";
        setTournamentMode(mode);
      }
    } catch (error) {
      console.error("Error fetching tournament mode:", error);
      setTournamentMode("round2-plus-knockout"); // Default fallback
    }
  };

  // 🚀 FETCH AVAILABLE PLAYERS FOR DIRECT KNOCKOUT
  const fetchAvailablePlayersForKnockout = async () => {
    try {
      // Get all players from Round 1 groups who can participate in Direct Knockout
      const allPlayers = [];

      for (const group of groups) {
        if (group.players && group.players.length > 0) {
          // Add players with their group context
          const groupPlayers = group.players.map(player => ({
            ...player,
            sourceGroup: group.groupName || `Group ${groups.indexOf(group) + 1}`,
            sourceGroupId: group._id
          }));
          allPlayers.push(...groupPlayers);
        }
      }

      setAvailablePlayersForKnockout(allPlayers);
    } catch (error) {
      console.error("Error fetching available players:", error);
      setAvailablePlayersForKnockout([]);
    }
  };

  // 🎯 FETCH TOURNAMENT DATA
  const fetchTournamentData = async () => {
    try {
      const response = await axios.get(`/api/tournaments/${tournamentId}`);
      if (response.data.success && response.data.tournament) {
        setTournament(response.data.tournament);
        return response.data.tournament;
      }
    } catch (error) {
      console.error("Error fetching tournament:", error);
    }
    return null;
  };

  // 🔄 CONVERT setFormat TO MATCH FORMAT CONFIGURATION
  const convertSetFormatToMatchFormat = (setFormat) => {
    const formatMap = {
      'bestOf3': { totalSets: 3, setsToWin: 2 },
      'bestOf5': { totalSets: 5, setsToWin: 3 },
      'bestOf7': { totalSets: 7, setsToWin: 4 },
      '3': { totalSets: 3, setsToWin: 2 },
      '5': { totalSets: 5, setsToWin: 3 },
      '7': { totalSets: 7, setsToWin: 4 }
    };

    const format = formatMap[setFormat] || formatMap[String(setFormat)] || formatMap['bestOf5'];

    return {
      totalSets: format.totalSets,
      setsToWin: format.setsToWin,
      totalGames: 5, // Default games per set
      gamesToWin: 3,
      pointsToWinGame: 11,
      marginToWin: 2,
      deuceRule: true
    };
  };

  // 🚀 UPDATE GROUP MATCH FORMAT
  const updateGroupMatchFormat = async (groupId, newFormat) => {
    try {
      setIsUpdatingFormat(true);
      const response = await axios.put(
        `/api/tournaments/bookinggroups/${groupId}/match-format`,
        { matchFormat: newFormat }
      );

      if (response.data.success) {
        return { success: true, message: "Match format updated successfully!" };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating group match format:", error);
      return { success: false, message: error.message || "Failed to update match format" };
    } finally {
      setIsUpdatingFormat(false);
    }
  };

  // 💎 POWER-OF-2 VALIDATION - Real-time validation
  const validateSelectedPlayers = async (selectedPlayers) => {
    const count = selectedPlayers.length;

    if (count === 0) {
      setValidationStatus({ isValid: false, message: "Select players for Direct Knockout" });
      return;
    }

    try {
      const response = await axios.post(
        `/api/tournaments/direct-knockout/validate-players`,
        {
          tournamentId,
          selectedPlayers: selectedPlayers.map(p => ({ playerId: p.playerId || p._id, userName: p.userName }))
        }
      );

      if (response.data.success) {
        setValidationStatus({
          isValid: true,
          message: `✅ Valid! ${count} players → ${response.data.rounds} rounds tournament`
        });
      } else {
        setValidationStatus({
          isValid: false,
          message: response.data.message || "Invalid player selection"
        });
      }
    } catch (error) {
      const validSizes = [4, 8, 16, 32];
      const isPowerOfTwo = count > 0 && (count & (count - 1)) === 0;

      if (!isPowerOfTwo) {
        setValidationStatus({
          isValid: false,
          message: `❌ Must be power of 2. Valid: ${validSizes.join(", ")} players`
        });
      } else {
        setValidationStatus({
          isValid: false,
          message: error.response?.data?.message || "Validation error"
        });
      }
    }
  };

  useEffect(() => {
    // Reset the hasMatchesInProgress state when component mounts
    setHasMatchesInProgress(false);

    const fetchGroups = async () => {
      try {
        setLoading(true);

        // 🎯 Fetch tournament data first
        await fetchTournamentData();

        // Fetch groups - only Round 1 league groups (Round 2 is handled in Top Players section)
        const response = await axios.get(
          `/api/tournaments/bookinggroups/tournament/${tournamentId}`
        );

        const groupsArray = response?.data?.data;

        if (Array.isArray(groupsArray)) {
          // Only show Round 1 groups in the Groups/League tab
          const round1Groups = groupsArray.filter(group => !group.round || group.round === 1);
          setGroups(round1Groups);

          // 🎯 Initialize selectedCategory if not set
          if (round1Groups.length > 0 && !selectedCategory) {
            // Priority: 1. First category from tournament, 2. Category of first group
            const tournamentCats = tournament?.category || (response.data.tournament?.category);
            if (tournamentCats && tournamentCats.length > 0) {
              setSelectedCategory(tournamentCats[0].name);
            } else if (round1Groups[0].category) {
              setSelectedCategory(round1Groups[0].category);
            }
          }

          // Use the filtered groups for initial active group
          const filteredForInitial = selectedCategory
            ? round1Groups.filter(g => g.category === selectedCategory)
            : round1Groups;

          if (filteredForInitial.length > 0) {
            setActiveGroup(filteredForInitial[0]._id);

            // Check if matches have already been generated for this group
            try {
              const matchesResponse = await axios.get(
                `/api/tournaments/matches/${tournamentId}/${filteredForInitial[0]._id}`
              );

              if (matchesResponse.data.success && matchesResponse.data.matches && matchesResponse.data.matches.length > 0) {
                setMatchesGenerated(true);
                // Add this group to the groupsWithMatches set
                setGroupsWithMatches(prev => new Set([...prev, filteredForInitial[0]._id]));
              } else {
                setMatchesGenerated(false);
                setGroupsWithMatches(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(filteredForInitial[0]._id);
                  return newSet;
                });
              }
            } catch (err) {
              setMatchesGenerated(false);
              setGroupsWithMatches(prev => {
                const newSet = new Set(prev);
                newSet.delete(filteredForInitial[0]._id);
                return newSet;
              });
            }
          }
        } else {
          console.error('Expected array but got:', response.data);
          setError('Invalid data format received from server');
          setGroups([]);
        }

      } catch (err) {
        console.error('Error fetching groups:', err);
        setError(err.message);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
    fetchRound2Groups();
    fetchKnockoutMatches();
    fetchTournamentMode(); // 🔥 Detect tournament mode
  }, [tournamentId]);

  // 🎯 Secondary useEffect to fetch available players after groups are loaded
  useEffect(() => {
    if (groups.length > 0) {
      fetchAvailablePlayersForKnockout();
    }
  }, [groups]);


  // Fetch Round 2 groups (Top Players groups)
  const fetchRound2Groups = async () => {
    try {
      const response = await axios.get(
        `/api/tournaments/bookinggroups/tournament/${tournamentId}`
      );

      const groupsArray = response?.data?.data;

      if (Array.isArray(groupsArray)) {
        // Only show Round 2 groups in Top Players section (handle both number and string)
        const round2GroupsFiltered = groupsArray.filter(group => group.round == 2 || group.groupName?.startsWith("Round 2"));
        setRound2Groups(round2GroupsFiltered);
        if (round2GroupsFiltered.length > 0 && !activeRound2Group) {
          setActiveRound2Group(round2GroupsFiltered[0]._id);
        }

        // Fetch matches for each Round 2 group
        if (round2GroupsFiltered.length > 0) {
          fetchRound2Matches(round2GroupsFiltered);
        }
      }
    } catch (err) {
      console.error('Error fetching Round 2 groups:', err);
      setRound2Groups([]);
    }
  };

  // Fetch knockout matches - SuperMatch objects support live-state integration
  const fetchKnockoutMatches = async () => {
    try {

      // Fetch both SuperMatch knockout matches AND Direct Knockout matches
      const [superMatchResponse, directKnockoutResponse] = await Promise.all([
        // SuperMatch knockout matches (traditional flow)
        axios.get(`/api/tournaments/knockout/matches/${tournamentId}`)
          .catch(err => ({ data: { success: false, matches: [] } })),

        // Direct Knockout matches (new beast system!)
        axios.get(`/api/tournaments/direct-knockout/${tournamentId}/matches`)
          .catch(err => ({ data: { success: false, matches: [] } }))
      ]);

      let allMatches = [];

      let hasInProgress = false;
      // Process SuperMatch knockout matches
      if (superMatchResponse.data.success && superMatchResponse.data.matches?.length > 0) {

        const enrichedSuperMatches = await Promise.all(
          superMatchResponse.data.matches.map(async (match) => {
            // Validate match data
            if (!match._id) {
              return { ...match, hasScores: false, status: 'scheduled', type: 'super-knockout' };
            }

            let normalizedStatus = match.status;
            let enrichedMatch = { ...match, type: 'super-knockout' };

            try {
              // If match is in-progress, get live state for current score/set/game data
              if (match.status === 'in-progress') {
                hasInProgress = true;
                const liveStateResponse = await fetch(
                  `/api/tournaments/matches/${match._id}/live-state?autoInit=false`
                );

                if (liveStateResponse.ok) {
                  const liveData = await liveStateResponse.json();
                  if (liveData.success && liveData.match) {
                    const liveMatch = liveData.match;

                    enrichedMatch = {
                      ...match,
                      currentSet: liveMatch.currentSet || 1,
                      currentGame: liveMatch.currentGame || 1,
                      liveScore: liveMatch.liveScore || { player1Points: 0, player2Points: 0 },
                      sets: liveMatch.sets || [],
                      hasScores: true,
                      isLiveMatch: true,
                      status: 'in-progress',
                      type: 'super-knockout'
                    };
                  }
                }
              } else if (match.status === 'completed' && match.winner?.playerName) {
                normalizedStatus = 'completed';
                enrichedMatch = {
                  ...match,
                  status: normalizedStatus,
                  hasScores: true,
                  winner: match.winner.playerName,
                  type: 'super-knockout'
                };
              } else {
                normalizedStatus = match.status || 'scheduled';
                enrichedMatch = {
                  ...match,
                  status: normalizedStatus,
                  hasScores: false,
                  type: 'super-knockout'
                };
              }
            } catch (error) {
              enrichedMatch = {
                ...match,
                status: normalizedStatus,
                hasScores: !!match.winner?.playerName || !!match.score?.setScores,
                winner: match.winner?.playerName,
                type: 'super-knockout'
              };
            }

            return enrichedMatch;
          })
        );

        allMatches = [...allMatches, ...enrichedSuperMatches];
      }

      // Process Direct Knockout matches
      if (directKnockoutResponse.data.success && directKnockoutResponse.data.matches?.length > 0) {

        const enrichedDirectMatches = directKnockoutResponse.data.matches.map(match => {
          const status = match.status?.toLowerCase() === 'scheduled' ? 'scheduled' :
            match.status?.toLowerCase() === 'in_progress' ? 'in-progress' :
              match.status?.toLowerCase() === 'completed' ? 'completed' : 'scheduled';

          // Check if match is in progress
          if (status === 'in-progress') {
            hasInProgress = true;
          }

          return {
            ...match,
            _id: match._id || match.matchId, // Ensure _id for compatibility
            status,
            hasScores: match.status === 'COMPLETED' || !!match.result?.winner?.playerId,
            type: 'direct-knockout',
            player1: match.player1,
            player2: match.player2,
            round: match.round,
            roundNumber: match.roundNumber, // Add this!
            court: match.courtNumber,
            startTime: match.matchStartTime,
            winner: match.result?.winner?.playerName
          };
        });

        allMatches = [...allMatches, ...enrichedDirectMatches];
      }


      // Re-organize all matches by rounds
      const matchesByRound = {};
      allMatches.forEach(match => {
        const roundKey = match.round;
        if (!matchesByRound[roundKey]) {
          matchesByRound[roundKey] = [];
        }
        matchesByRound[roundKey].push(match);
      });

      // Sort matches within each round by match number if available
      Object.keys(matchesByRound).forEach(round => {
        matchesByRound[round].sort((a, b) => {
          const aMatchNum = a.matchNumber || 0;
          const bMatchNum = b.matchNumber || 0;
          return aMatchNum - bMatchNum;
        });
      });

      setKnockoutMatches(allMatches);
      setKnockoutMatchesByRound(matchesByRound);

      // If we found knockout matches, set matchesGenerated to true
      if (allMatches.length > 0) {
        setMatchesGenerated(true);
      }

      // Update the hasMatchesInProgress state
      if (hasInProgress) {
        setHasMatchesInProgress(true);
      }


    } catch (err) {
      console.error('Error fetching knockout matches:', err);
      setKnockoutMatches([]);
      setKnockoutMatchesByRound({});
    }
  };

  // Fetch matches for Round 2 groups - IDENTICAL logic to Round 1
  const fetchRound2Matches = async (groups) => {
    const matchesDataTemp = {};

    for (const group of groups) {
      try {
        // Use the correct endpoint structure for Round 2 matches
        const response = await axios.get(
          `/api/tournaments/matches/${tournamentId}/${group._id}`
        );

        if (response.data.success && response.data.matches) {
          // Enrich matches with score data EXACTLY like Round 1
          let hasInProgress = false;
          const matchesWithScores = await Promise.all(
            response.data.matches.map(async (match) => {
              // Validate match data
              if (!match._id) {
                return { ...match, hasScores: false, status: 'pending' };
              }

              try {
                // PRIMARY: Use the live-state endpoint (same as Round 1 and scoreboard)
                const liveStateResponse = await fetch(
                  `/api/tournaments/matches/${match._id}/live-state?autoInit=false`
                );
                if (liveStateResponse.ok) {
                  const liveData = await liveStateResponse.json();
                  if (liveData.success && liveData.match) {
                    const liveMatch = liveData.match;
                    if (liveMatch.status === 'IN_PROGRESS') {
                      hasInProgress = true;
                    } else if (liveMatch.sets && liveMatch.sets.length > 0) {
                      // Check if there are any completed sets
                      const hasCompletedSets = liveMatch.sets.some(set => set.status === 'COMPLETED');
                      if (!hasCompletedSets) {
                        hasInProgress = true;
                      }
                    }
                    return {
                      ...match,
                      isLiveMatch: true,
                      hasScores: true,
                      liveMatchData: liveMatch,
                      status: liveMatch.status || match.status,
                      currentSet: liveMatch.currentSet || 1,
                      currentGame: liveMatch.currentGame || 1,
                      liveScore: liveMatch.liveScore || { player1Points: 0, player2Points: 0 },
                      result: liveMatch.result || null,
                      sets: liveMatch.sets || []
                    };
                  }
                }

                // SECONDARY: Try the array scores endpoint
                const scoresArrayResponse = await fetch(
                  `/api/tournaments/matches/${match._id}/scores`
                );
                if (scoresArrayResponse.ok) {
                  const scoresArray = await scoresArrayResponse.json();
                  if (Array.isArray(scoresArray) && scoresArray.length > 0) {
                    const latestScore = scoresArray[0]; // Most recent score
                    if (!latestScore.winner) {
                      hasInProgress = true;
                    }
                    return {
                      ...match,
                      hasScores: true,
                      currentScore: latestScore,
                      winner: latestScore.winner?.name || latestScore.winner?.userId?.name || latestScore.winner,
                      status: latestScore.winner ? 'completed' : 'in_progress'
                    };
                  }
                }

                // TERTIARY: Fallback to single score endpoint
                const scoreResponse = await fetch(
                  `/api/tournaments/scores/${match._id}`
                );
                if (scoreResponse.ok) {
                  const scoreData = await scoreResponse.json();
                  if (scoreData.score) {
                    if (!scoreData.score.winner) {
                      hasInProgress = true;
                    }
                    return {
                      ...match,
                      hasScores: true,
                      currentScore: scoreData.score,
                      winner: scoreData.score.winner?.name || scoreData.score.winner?.userId?.name || scoreData.score.winner,
                      status: scoreData.score.winner ? 'completed' : 'in_progress'
                    };
                  }
                }

                return { ...match, hasScores: false, status: 'pending' };
              } catch (error) {
                return { ...match, hasScores: false, status: 'pending' };
              }
            })
          );

          matchesDataTemp[group._id] = matchesWithScores;
        } else {
          matchesDataTemp[group._id] = [];
        }

        // Update the hasMatchesInProgress state if we found in-progress matches
        const anyInProgress = (matchesDataTemp[group._id] || []).some(m => m.status === 'IN_PROGRESS' || m.status === 'in_progress');
        if (anyInProgress) {
          setHasMatchesInProgress(true);
        }
      } catch (err) {
        console.error(`Error fetching matches for Round 2 group ${group._id}:`, err);
        matchesDataTemp[group._id] = [];
      }
    }

    setRound2MatchesData(matchesDataTemp);

    // Check if any group has matches and set matchesGenerated to true
    const hasMatches = Object.values(matchesDataTemp).some(matches => matches && matches.length > 0);
    if (hasMatches) {
      setMatchesGenerated(true);
    }
  };


  // Fetch matches whenever activeGroup changes
  useEffect(() => {
    if (activeGroup && tournamentId) {
      fetchMatches();
    }
  }, [activeGroup, tournamentId]);

  // Auto-refresh when user returns from scoreboard (page regains focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && tournamentId) {
        // Reset the hasMatchesInProgress state before refreshing
        setHasMatchesInProgress(false);
        // Refresh Round 1 matches
        if (activeGroup) {
          fetchMatches();
        }
        // Refresh Round 2 matches
        if (round2Groups.length > 0) {
          fetchRound2Groups();
        }
        // Refresh Knockout matches
        fetchKnockoutMatches();
      }
    };

    const handleFocusRefresh = () => {
      if (tournamentId) {
        // Reset the hasMatchesInProgress state before refreshing
        setHasMatchesInProgress(false);
        // Refresh Round 1 matches
        if (activeGroup) {
          fetchMatches();
        }
        // Refresh Round 2 matches
        if (round2Groups.length > 0) {
          fetchRound2Groups();
        }
        // Refresh Knockout matches
        fetchKnockoutMatches();
      }
    };

    // Listen for visibility changes and focus events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocusRefresh);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocusRefresh);
    };
  }, [activeGroup, tournamentId, round2Groups.length]);


  const openModal = (match) => {
    setSelectedMatch(match);
    setIsPopupOpen(true);
  };

  const closeModal = () => {
    setIsPopupOpen(false);
    setSelectedMatch(null);
  };

  // Refresh current modal data when matches are updated
  useEffect(() => {
    if (selectedMatch && isPopupOpen) {

      // Find updated match data from Round 1 matches
      const updatedMatch = matchesData[activeGroup]?.find(match =>
        match._id === selectedMatch._id
      );

      // If not found in Round 1, check Round 2 matches
      const updatedRound2Match = !updatedMatch && activeRound2Group ?
        round2MatchesData[activeRound2Group]?.find(match =>
          match._id === selectedMatch._id
        ) : null;

      // If not found in Round 1 or Round 2, check Knockout matches
      const updatedKnockoutMatch = !updatedMatch && !updatedRound2Match ?
        knockoutMatches.find(match => match._id === selectedMatch._id) : null;

      // Update modal with fresh data
      const refreshedMatch = updatedMatch || updatedRound2Match || updatedKnockoutMatch;
      if (refreshedMatch) {
        setSelectedMatch(refreshedMatch);
      }
    }
  }, [matchesData, round2MatchesData, knockoutMatches, selectedMatch?._id, isPopupOpen, activeGroup, activeRound2Group]);


  // Effect to check matches when active group changes
  useEffect(() => {
    const checkMatchesForActiveGroup = async () => {
      if (!tournamentId || !activeGroup) return;

      try {
        const matchesResponse = await axios.get(
          `/api/tournaments/matches/${tournamentId}/${activeGroup}`
        );

        if (matchesResponse.data.success && matchesResponse.data.matches && matchesResponse.data.matches.length > 0) {
          // Add this group to the groupsWithMatches set
          setGroupsWithMatches(prev => new Set([...prev, activeGroup]));
        } else {
          // Remove this group from the groupsWithMatches set if no matches exist
          setGroupsWithMatches(prev => {
            const newSet = new Set(prev);
            newSet.delete(activeGroup);
            return newSet;
          });
        }
      } catch (err) {
        // Remove this group from the groupsWithMatches set if there was an error
        setGroupsWithMatches(prev => {
          const newSet = new Set(prev);
          newSet.delete(activeGroup);
          return newSet;
        });
      }
    };

    checkMatchesForActiveGroup();
  }, [activeGroup, tournamentId]);

  // Effect to fetch groups without matches on component load
  useEffect(() => {
    const fetchGroupsWithoutMatches = async () => {
      if (!tournamentId) return;

      try {
        const response = await axios.get(`/api/tournaments/groups-without-matches/${tournamentId}`);

        if (response.data.success) {

          // Store the groups without matches in state
          setGroupsWithoutMatches(response.data.data.groupsWithoutMatches || []);
        } else {
          console.error('Failed to fetch groups without matches:', response.data.message);
          setGroupsWithoutMatches([]);
        }
      } catch (error) {
        console.error('Error fetching groups without matches:', error);
        setGroupsWithoutMatches([]);
      }
    };

    fetchGroupsWithoutMatches();
  }, [tournamentId]);

  // Generate matches for Round 2 (Top Players)
  // Store which group the generate button was clicked for
  const [pendingRound2GroupId, setPendingRound2GroupId] = useState(null);

  const handleGenerateRound2Matches = async () => {
    if (!courtNumber || !matchInterval || !startTime) {
      toast.warn("Please fill all match settings.");
      return;
    }

    const targetGroupId = pendingRound2GroupId || activeRound2Group;
    if (!targetGroupId) {
      toast.warn("No Round 2 group selected");
      return;
    }

    const activeGroupData = round2Groups.find((g) => g._id === targetGroupId);
    if (!activeGroupData || !activeGroupData.players?.length) {
      toast.warn("No top players found in this group");
      return;
    }
    const players = activeGroupData.players;

    const addMinutes = (time, minutes) => {
      const [h, m] = time.split(":").map(Number);
      let total = h * 60 + m + parseInt(minutes, 10);
      const hh = Math.floor(total / 60) % 24;
      const mm = total % 60;
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    };

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let currentTime = startTime;
    const newMatches = [];

    // Round-robin generation for top players
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        newMatches.push({
          matchNumber: newMatches.length + 1,
          player1: { playerId: players[i].playerId, userName: players[i].userName },
          player2: { playerId: players[j].playerId, userName: players[j].userName },
          referee: null,
          courtNumber: String(courtNumber),
          startTime: new Date(`${today}T${currentTime}:00`).toISOString(),
        });
        currentTime = addMinutes(currentTime, matchInterval);
      }
    }

    try {
      const res = await axios.post(
        `/api/tournaments/matches/create`,
        { tournamentId, groupId: targetGroupId, matches: newMatches }
      );
      setRound2MatchesData(prev => ({ ...prev, [targetGroupId]: res.data.matches }));
      setMatchesGenerated(true);
      setIsModalOpen(false);
      toast.info("Round 2 matches generated successfully!");
      fetchRound2Groups();
    } catch (err) {
      console.error("Error generating Round 2 matches:", err);
      toast.error("Error generating Round 2 matches: " + (err.response?.data?.message || err.message));
    }
  };

  // Fetch standings for the active group
  const fetchStandings = async (groupId) => {
    try {
      const res = await axios.get(`/api/tournaments/standings/${tournamentId}/${groupId}`);
      if (res.data.success) {
        setStandingsData(prev => ({ ...prev, [groupId]: res.data.data }));
      }
    } catch (err) {
      console.error("Error fetching standings:", err);
    }
  };

  // Transition from group stage to knockout
  const handleTransitionToKnockout = async () => {
    if (!window.confirm("Are you sure? This will finalize group standings and select qualified players for knockout.")) return;
    setTransitionLoading(true);
    try {
      const res = await axios.post(`/api/tournaments/matches/transition-to-knockout`, { tournamentId });
      if (res.data.success) {
        toast.info(`${res.data.message}\n\nNext: Go to Knockout tab to generate the bracket.`);
        // Refresh tournament data
        const tournRes = await axios.get(`/api/tournaments/${tournamentId}`);
        setTournament(tournRes.data.data || tournRes.data);
      }
    } catch (err) {
      toast.info(err?.response?.data?.message || "Failed to transition to knockout.");
    } finally {
      setTransitionLoading(false);
    }
  };

  // frontend (React) - handleGenerateMatches for Round 1 (auto round-robin)
  const handleGenerateMatches = async () => {
    if (!courtNumber || !matchInterval || !startTime) {
      toast.warn("Please fill all match settings.");
      return;
    }

    const activeGroupData = groups.find((g) => g._id === activeGroup);
    if (!activeGroupData || !activeGroupData.players?.length) {
      toast.warn("No players found in this group");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await axios.post(
        `/api/tournaments/matches/generate-group`,
        {
          tournamentId,
          groupId: activeGroup,
          courtNumber: String(courtNumber),
          startTime: `${today}T${startTime}:00`,
          intervalMinutes: parseInt(matchInterval, 10),
        }
      );

      setMatchesData(prev => ({ ...prev, [activeGroup]: res.data.matches }));
      setMatchesGenerated(true);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error generating matches:", err?.response?.data || err);
      toast.info(err?.response?.data?.message || "Failed to generate matches. See console for details.");
    }
  };

  // utils/dateTimeFormatter.js
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const MatchformatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // 12-hour format with AM/PM
    });
  };

  // 🔄 INITIATE NEXT ROUND - Collect winners and setup scheduling
  const handleInitiateNextRound = (roundMatches) => {
    try {
      // 1. Collect winners from completed matches
      const winners = roundMatches
        .filter(m => m.status === 'completed' && m.result?.winner?.playerId)
        .map(m => ({
          playerId: m.result.winner.playerId,
          userName: m.result.winner.playerName
        }));

      if (winners.length < 2) {
        toast.info("At least 2 winners are required to generate the next round.");
        return;
      }

      // Check for power of 2 (if required by system)
      const count = winners.length;
      const isPowerOf2 = count > 0 && (count & (count - 1)) === 0;
      if (!isPowerOf2) {
        toast.info(`Next round requires a power of 2 number of winners (current: ${count}). Please ensure all matches are completed correctly.`);
        return;
      }

      // 2. Set selection for the next round
      setSelectedPlayersForKnockout(winners);
      setValidationStatus({
        isValid: true,
        message: `✅ Ready for next round with ${count} winners!`
      });

      // 3. Open schedule modal
      setIsDirectKnockoutScheduleModalOpen(true);

    } catch (error) {
      console.error("Error initiating next round:", error);
      toast.error("Failed to prepare next round. Check console for details.");
    }
  };

  // 🏆 DIRECT KNOCKOUT TOURNAMENT CREATION - The main event!
  const handleCreateDirectKnockoutTournament = async () => {
    try {
      setIsCreatingKnockout(true);

      // Validate inputs
      if (!directKnockoutSchedule.courtNumber || !directKnockoutSchedule.startDate || !directKnockoutSchedule.startTime) {
        toast.warn("Please fill in all required fields (Court Number, Start Date, Start Time)");
        return;
      }

      if (selectedPlayersForKnockout.length === 0 || !validationStatus.isValid) {
        toast.warn("Please select a valid number of players (power of 2)");
        return;
      }

      // Create the start datetime
      const startDateTime = new Date(`${directKnockoutSchedule.startDate}T${directKnockoutSchedule.startTime}`);

      // Prepare the API payload
      const payload = {
        tournamentId,
        selectedPlayers: selectedPlayersForKnockout,
        schedule: {
          courtNumber: directKnockoutSchedule.courtNumber,
          startTime: startDateTime.toISOString(),
          intervalMinutes: directKnockoutSchedule.intervalMinutes,
          estimatedDuration: directKnockoutSchedule.estimatedDuration
        }
      };


      // Call the backend API
      const response = await axios.post(
        `/api/tournaments/direct-knockout/create-matches`,
        payload
      );

      if (response.data.success) {
        toast.info(`🏆 Direct Knockout Tournament Created Successfully!\n\n` +
          `• ${response.data.bracket.playerCount} players\n` +
          `• ${response.data.bracket.totalRounds} rounds\n` +
          `• ${response.data.bracket.totalMatches} matches\n` +
          `• Starting at ${directKnockoutSchedule.startTime} on ${directKnockoutSchedule.startDate}`);

        // Update the tournament mode in state
        setTournamentMode("direct-knockout");

        // Store the created matches
        setDirectKnockoutMatches(response.data.matches);
        setMatchesGenerated(true);

        // Reset form and close modal
        setSelectedPlayersForKnockout([]);
        setDirectKnockoutSchedule({
          courtNumber: "",
          startDate: "",
          startTime: "",
          intervalMinutes: 30,
          estimatedDuration: 45
        });
        setIsDirectKnockoutScheduleModalOpen(false);

        // Refresh knockout matches data to show in Knockout tab
        await fetchKnockoutMatches();

        // Switch to Knockout tab to show the results
        setactiveSubGroupTab("Knockout");
      } else {
        throw new Error(response.data.message || "Failed to create Direct Knockout Tournament");
      }

    } catch (error) {
      console.error("Error creating Direct Knockout Tournament:", error);
      toast.info(`Failed to create Direct Knockout Tournament:\n${error.response?.data?.message || error.message}`);
    } finally {
      setIsCreatingKnockout(false);
    }
  };

  // No dummy knockout data needed - using real knockoutMatches and knockoutMatchesByRound

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleStartMatch = () => {
    if (!selectedMatch) return;

    // Close modal first to prevent stale data issues
    closeModal();

    // Determine match type based on the match data
    let matchType = 'Group Stage';
    if (selectedMatch.round && ['pre-quarter', 'quarter-final', 'semi-final', 'final'].includes(selectedMatch.round)) {
      // SuperMatch knockout matches
      matchType = 'Knockout';
    } else if (selectedMatch.matchType && (selectedMatch.matchType === 'qualifier_knockout' || selectedMatch.matchType === 'main_knockout')) {
      // Knockout matches from KnockoutMatch model
      matchType = 'Knockout';
    } else if (selectedMatch.roundName || (selectedMatch.round && typeof selectedMatch.round === 'string')) {
      // Knockout matches have roundName or round property like 'quarter-final', 'semi-final', etc.
      matchType = 'Knockout';
    } else if (selectedMatch.groupId && round2Groups.some(g => g._id === selectedMatch.groupId)) {
      // Round 2 matches
      matchType = 'Round 2';
    }

    // Build player names with doubles partner if applicable
    const isDoubles = selectedMatch.matchType === "doubles";
    const pAName = (selectedMatch.player1?.userName || selectedMatch.player1?.playerName || 'Player A') +
      (isDoubles && selectedMatch.player1?.partner?.userName ? ` & ${selectedMatch.player1.partner.userName}` : '');
    const pBName = (selectedMatch.player2?.userName || selectedMatch.player2?.playerName || 'Player B') +
      (isDoubles && selectedMatch.player2?.partner?.userName ? ` & ${selectedMatch.player2.partner.userName}` : '');

    navigate(`/tournament-management/group-stage/${tournamentId}/scoreboard`, {
      state: {
        matchId: selectedMatch._id,
        playerAName: pAName,
        playerBName: pBName,
        playerAId: selectedMatch.player1?.playerId || selectedMatch.player1?._id,
        playerBId: selectedMatch.player2?.playerId || selectedMatch.player2?._id,
        tournamentId: selectedMatch.tournamentId || tournamentId,
        groupId: selectedMatch.groupId || activeGroup || activeRound2Group,
        matchNumber: selectedMatch.matchNumber,
        courtNumber: selectedMatch.courtNumber,
        startTime: selectedMatch.startTime || selectedMatch.matchStartTime,
        matchType: matchType,
        round: selectedMatch.round || null, // Important for knockout matches
        setCount: selectedMatch.setCount || 3,
        // Additional data for scoring context - let scoreboard load live state
        currentSetNumber: selectedMatch.currentSet || 1,
        completedSets: selectedMatch.sets || [],
        liveScore: selectedMatch.liveScore || {
          player1Points: 0,
          player2Points: 0
        }
      },
    });
  };



  // Bulk Score Upload Helpers
  const getMatchFormat = () => {
    const groupData = groups.find(g => g._id === activeGroup);
    const maxSets = groupData?.matchFormat?.totalSets || tournament?.matchFormat?.totalSets || 5;
    return { maxSets, setsToWin: Math.ceil(maxSets / 2) };
  };

  const openBulkScoreModal = (matchesArr, gId, titleStr) => {
    const pending = matchesArr.filter(m => m.status !== 'completed' && m.status !== 'COMPLETED');
    if (pending.length === 0) {
      toast.warn("No pending matches to score. All matches are already completed.");
      return;
    }
    setBulkScoreModal({ open: true, matches: pending, groupId: gId, title: titleStr || "Bulk Score Upload" });
  };

  if (!tournamentId) {
    return (
      <div className="p-4 text-center text-red-500">
        <h2>Error: No Tournament Selected</h2>
        <p>Please select a tournament to view its details.</p>
        <button
          onClick={() => navigate('/mtournament-management')}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
        >
          Back to Tournament Management
        </button>
      </div>
    );
  }

  if (loading) return <div className="p-4 text-center">Loading groups...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!Array.isArray(groups)) return <div className="p-4 text-center">Invalid groups data</div>;
  if (groups.length === 0) return <div className="p-4 text-center">No groups found</div>;

  // 🎯 Derive filtered groups based on category for rendering
  const filteredGroups = groups.filter(group => {
    if (!selectedCategory) return true;
    const gCat = (group.category || "").toLowerCase().trim().replace(/_/g, " ");
    const sCat = (selectedCategory || "").toLowerCase().trim().replace(/_/g, " ");
    return gCat === sCat || gCat.includes(sCat) || sCat.includes(gCat);
  });

  const currentGroup = filteredGroups.find(group => group._id === activeGroup) || filteredGroups[0];

  const filteredRound2Groups = (round2Groups || []).filter(group => {
    if (!selectedCategory) return true;
    const gCat = (group.category || "").toLowerCase().trim().replace(/_/g, " ");
    const sCat = (selectedCategory || "").toLowerCase().trim().replace(/_/g, " ");
    // "all" category matches everything
    if (gCat === "all") return true;
    return gCat === sCat || gCat.includes(sCat) || sCat.includes(gCat);
  });

  const currentRound2Group = filteredRound2Groups.find(g => g._id === activeRound2Group) || filteredRound2Groups[0];

  return (
    <div className="mt-6 bg-white p-4 rounded-[16px] shadow">


      {/* 🔹 Sub-Group Tabs */}
      <div className="flex space-x-2 mb-[20px]">
        {['League', 'Top Players', 'Knockout'].map((tab) => (
          <button
            key={tab}
            onClick={() => setactiveSubGroupTab(tab)}
            className={`px-[24px] py-[8px] rounded-full text-sm font-[400] w-auto transition lg:text-[18px] sm:text-[16px] ${activeSubGroupTab === tab
              ? 'text-gray-900'
              : 'text-gray-900 hover:text-black'
              }`}
            style={{
              border:
                activeSubGroupTab === tab
                  ? '1px solid #F97316'
                  : '1px solid #EDEAEB',
              backgroundColor:
                activeSubGroupTab === tab ? 'transparent' : '#EDEAEB',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🎯 Category Selection Tabs - GLOBAL FILTER */}
      {tournament?.category && tournament.category.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 p-3 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-full text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
            Filter by Category
          </div>
          {tournament.category.map((cat) => {
            const newCat = cat.name;
            return (
              <button
                key={cat._id || cat.name}
                onClick={() => {
                  setSelectedCategory(newCat);

                  // 🎯 Update active groups based on new category
                  const firstInCat = groups.find(g => {
                    const gCat = (g.category || "").toLowerCase().trim().replace(/_/g, " ");
                    const nCat = (newCat || "").toLowerCase().trim().replace(/_/g, " ");
                    return gCat === nCat || gCat.includes(nCat) || nCat.includes(gCat);
                  });

                  if (firstInCat) {
                    setActiveGroup(firstInCat._id);
                    fetchMatches(firstInCat._id);
                  } else {
                    setActiveGroup(null);
                  }

                  const firstRound2InCat = round2Groups.find(g => {
                    const gCat = (g.category || "").toLowerCase().trim().replace(/_/g, " ");
                    const nCat = (newCat || "").toLowerCase().trim().replace(/_/g, " ");
                    return gCat === nCat || gCat.includes(nCat) || nCat.includes(gCat);
                  });

                  if (firstRound2InCat) {
                    setActiveRound2Group(firstRound2InCat._id);
                  } else {
                    setActiveRound2Group(null);
                  }
                }}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform ${selectedCategory && (selectedCategory.toLowerCase().trim() === cat.name.toLowerCase().trim())
                  ? "bg-[#F97316] text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-[#F97316]"
                  }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 🔹 Group or Player/Knockout Content */}
      {activeSubGroupTab === "League" && (
        <div>
          {/* Group Selection Tabs */}
          <div className="flex space-x-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {filteredGroups.map((group, index) => (
              <button
                key={group._id}
                onClick={async () => {
                  setActiveGroup(group._id);  // update active group
                  await fetchMatches(group._id); // fetch matches for this group
                }}
                className={`px-4 py-2 text-sm w-auto font-semibold rounded-lg transition-all groupstabs whitespace-nowrap ${activeGroup === group._id
                  ? "bg-[#F97316] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {group.groupName || `Group ${index + 1}`}
              </button>
            ))}
          </div>

          {/* Group Content */}
          {currentGroup ? (
            <div className="w-full p-4 bg-white rounded-2xl">
              <div className="flex justify-between items-center mb-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-[18px] md:text-[18px] font-[500] text-orange-500">
                    {currentGroup.groupName ||
                      `Group ${groups.indexOf(currentGroup) + 1}`}
                  </h2>
                </div>
                {groupsWithMatches.has(currentGroup._id) ? (
                  <div className="relative group">
                    <button
                      className="text-gray-400 cursor-not-allowed"
                      disabled
                      title="You can only edit groups if matches haven't been generated"
                    >
                      <FiEdit2 />
                    </button>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg py-2 px-3 bottom-full right-0 mb-2 w-56 z-50 shadow-lg text-center leading-tight whitespace-normal">
                      You can only edit groups if matches haven't been generated
                    </div>
                  </div>
                ) : (
                  <button
                    className="text-orange-500 hover:text-orange-700 cursor-pointer"
                    onClick={() => handleEditGroup(currentGroup)}
                    title="Edit Group"
                  >
                    <FiEdit2 />
                  </button>
                )}
              </div>

              {/* List of Players */}
              <ol className="list-decimal pl-5 space-y-2 text-lg mb-4">
                {currentGroup.players?.map((player, index) => (
                  <li key={player._id || index}>
                    {player.userId?.name || player.userName || `Player ${index + 1}`}
                  </li>
                ))}
              </ol>

              <div className="grid grid-cols-2 gap-2">
                {(!matchesData[activeGroup] || matchesData[activeGroup]?.length === 0) && (
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition active:scale-[0.97]"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <FiFlag className="w-4 h-4" />
                    Generate Matches
                  </button>
                )}

                <button
                  className="py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-orange-500 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition"
                  onClick={() => {
                    if (showStandings && standingsData[activeGroup]) {
                      setShowStandings(false);
                    } else {
                      fetchStandings(activeGroup);
                      setShowStandings(true);
                    }
                  }}
                >
                  <FiTable />
                  {showStandings && standingsData[activeGroup] ? "Hide Standings" : "Standings"}
                </button>

                {/* Navigate to full points table */}
                <button
                  className="w-full py-2 rounded-full md:text-[16px] sm:text-[14px] font-[400] flex items-center justify-center gap-3 text-gray-600 bg-white hover:bg-gray-50"
                  style={{ border: "1px solid #E5E7EB" }}
                  onClick={() =>
                    navigate(`/tournament-management/group-stage/${tournamentId}/${activeGroup}/points-table`, {
                      state: { tournamentId, groupId: activeGroup, round: 1 }
                    })
                  }
                >
                  Points Table (Full View)
                </button>

                {/* Bulk Score Upload Button - shown when matches exist */}
                {matchesData[activeGroup]?.length > 0 && matchesData[activeGroup].some(
                  m => m.status !== 'completed' && m.status !== 'COMPLETED'
                ) && (
                  <>
                    <button
                      className="w-full py-2 rounded-full md:text-[16px] sm:text-[14px] font-[500] flex items-center justify-center gap-3 text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md"
                      onClick={() => openBulkScoreModal(
                        matchesData[activeGroup] || [],
                        activeGroup,
                        `Bulk Score Upload — ${currentGroup?.groupName || 'Group'}`
                      )}
                    >
                      <FiCheck />
                      Bulk Score Upload
                    </button>
                    <button
                      className="w-full py-2 rounded-full md:text-[16px] sm:text-[14px] font-[500] flex items-center justify-center gap-3 text-orange-600 border-2 border-orange-300 bg-orange-50 hover:bg-orange-100"
                      onClick={() => setShowCsvUpload(true)}
                    >
                      <FiUpload />
                      Upload CSV/Excel
                    </button>
                  </>
                )}

                {/* Delete All Matches for this Group */}
                {matchesData[activeGroup]?.length > 0 && (
                  <button
                    className="w-full py-2 rounded-full md:text-[16px] sm:text-[14px] font-[400] flex items-center justify-center gap-3 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 mt-2"
                    onClick={() => {
                      if (window.confirm(`Delete ALL ${matchesData[activeGroup]?.length || 0} matches from this group? This cannot be undone.`)) {
                        axios.delete(`/api/tournaments/matches/${tournamentId}/${activeGroup}/all`)
                          .then((res) => {
                            toast.info(res.data.message || "Matches deleted");
                            fetchMatches();
                          })
                          .catch((err) => toast.error("Failed to delete: " + (err.response?.data?.message || err.message)));
                      }
                    }}
                  >
                    <FiTrash2 />
                    Delete All Matches ({matchesData[activeGroup]?.length || 0})
                  </button>
                )}

              </div>

              {/* Inline Standings Table */}
              {showStandings && standingsData[activeGroup] && (
                <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5">
                    <h6 className="text-white text-sm font-bold">
                      {standingsData[activeGroup].groupName} — Standings
                    </h6>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Player</th>
                          <th className="px-3 py-2 text-center">P</th>
                          <th className="px-3 py-2 text-center">W</th>
                          <th className="px-3 py-2 text-center">L</th>
                          <th className="px-3 py-2 text-center">Sets +/-</th>
                          <th className="px-3 py-2 text-center">Pts +/-</th>
                          <th className="px-3 py-2 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standingsData[activeGroup].standings.map((p, idx) => (
                          <tr key={p.playerId} className={`border-t border-gray-100 ${
                            p.qualified ? "bg-green-50" : ""
                          } ${idx < (tournament?.qualifyPerGroup || 2) ? "font-semibold" : ""}`}>
                            <td className="px-3 py-2 text-gray-500">{p.rank}</td>
                            <td className="px-3 py-2 text-gray-900 flex items-center gap-1.5">
                              {p.playerName}
                              {p.qualified && (
                                <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">Q</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-600">{p.played}</td>
                            <td className="px-3 py-2 text-center text-green-600 font-medium">{p.won}</td>
                            <td className="px-3 py-2 text-center text-red-500">{p.lost}</td>
                            <td className="px-3 py-2 text-center text-gray-600">
                              {p.setsWon}-{p.setsLost}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-600">
                              {p.pointsScored}-{p.pointsConceded}
                            </td>
                            <td className="px-3 py-2 text-center font-bold text-orange-600">{p.totalPoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Transition to Knockout Button — only for combined tournaments */}
              {tournament?.type === "knockout + group stage" &&
                tournament?.currentStage !== "knockout" &&
                tournament?.currentStage !== "completed" && (
                <div className="mt-4">
                  <button
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleTransitionToKnockout}
                    disabled={transitionLoading}
                  >
                    {transitionLoading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <FiFlag />
                        Transition to Knockout
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-1">
                    All group matches must be completed. Top {tournament?.qualifyPerGroup || 2} per group will qualify.
                  </p>
                </div>
              )}

              {/* Matches Display */}
              <div>
                {matchesData[activeGroup]?.length > 0 && (
                  <div className="mt-6">
                    <h5 className="mb-3 text-lg font-semibold text-orange-500">
                      Matches -{" "}
                      {currentGroup.groupName ||
                        `Group ${groups.indexOf(currentGroup) + 1}`}
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchesData[activeGroup].map((match, index) => (
                        <div
                          key={index}
                          className={`shadow-md rounded-lg p-4 cursor-pointer ${(match.status === 'completed' || match.status === 'COMPLETED') ? 'bg-green-50 border-l-4 border-green-500' :
                            (match.status === 'in_progress' || match.status === 'IN_PROGRESS') ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                              'bg-[#F5F7FA]'
                            }`}
                          onClick={(e) => {
                            e.stopPropagation(); // prevent parent click
                            openModal(match);    // ✅ open with match data
                          }}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <span className="bg-orange-100 text-orange-600 rounded-full text-[12px] font-[500] px-2 py-1">
                                R1 - M{match.matchNumber}
                              </span>
                              <span className="bg-gray-200 text-gray-700 rounded-full text-[12px] font-[400] px-2 py-1">
                                Court {match.courtNumber || 'TBD'}
                              </span>
                              {(match.status === 'completed' || match.status === 'COMPLETED') && (
                                <span className="bg-green-500 text-white md:text-[12px] sm:text-[10px] px-2 py-1 rounded-full text-xs">
                                  Completed
                                </span>
                              )}
                              {(match.status === 'in_progress' || match.status === 'IN_PROGRESS') && (
                                <span className="bg-yellow-500 text-white md:text-[12px] sm:text-[10px] px-2 py-1 rounded-full text-xs">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(match);
                                }} className="text-gray-500 hover:bg-transparent focus:outline-none w-auto bg-transparent">
                                <FiEdit2 />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Delete match M${match.matchNumber}?`)) {
                                    axios.delete(`/api/tournaments/matches/${match._id}`)
                                      .then(() => fetchMatches())
                                      .catch((err) => toast.info("Delete failed: " + (err.response?.data?.message || err.message)));
                                  }
                                }} className="text-red-400 hover:text-red-600 hover:bg-transparent focus:outline-none w-auto bg-transparent">
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <p className="text-center md:text-[16px] sm:text-[14px] text-gray-900 font-[400] matchtime">
                            {formatDate(match.startTime)} • {MatchformatTime(match.startTime)}
                          </p>

                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                {match.player1?.playerId?.profileImage ? (
                                  <img
                                    src={`/uploads/profiles/${match.player1.playerId.profileImage}`}
                                    alt={match.player1?.userName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                                    {match.player1?.userName?.charAt(0) || '?'}
                                  </div>
                                )}
                                <span className={`font-[500] text-[14px] ${match.winner?.playerId?.toString() === match.player1?.playerId?.toString() ||
                                  match.winner?.playerName === match.player1?.userName ? 'text-green-600' : 'text-orange-500'
                                  }`}>
                                  {match.player1?.userName}
                                  {match.matchType === "doubles" && match.player1?.partner?.userName && (
                                    <span className="text-gray-400 font-normal"> & {match.player1.partner.userName}</span>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="text-gray-900 text-[14px] font-[400] my-1 flex items-center gap-2">
                              VS
                              {(match.status === 'completed' || match.status === 'COMPLETED') && match.result?.finalScore && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {match.result.finalScore.player1Sets}-{match.result.finalScore.player2Sets}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {match.player2?.playerId?.profileImage ? (
                                  <img
                                    src={`/uploads/profiles/${match.player2.playerId.profileImage}`}
                                    alt={match.player2?.userName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                                    {match.player2?.userName?.charAt(0) || '?'}
                                  </div>
                                )}
                                <span className={`font-[500] text-[14px] ${match.winner?.playerId?.toString() === match.player2?.playerId?.toString() ||
                                  match.winner?.playerName === match.player2?.userName ? 'text-green-600' : 'text-orange-500'
                                  }`}>
                                  {match.player2?.userName}
                                  {match.matchType === "doubles" && match.player2?.partner?.userName && (
                                    <span className="text-gray-400 font-normal"> & {match.player2.partner.userName}</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Live Score Display for League */}
                          {(match.status === 'in_progress' || match.status === 'IN_PROGRESS') && match.liveScore && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="text-center">
                                <div className="text-sm text-yellow-700 font-medium mb-1 flex items-center justify-center gap-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                  Live Score - Round 1
                                </div>
                                <div className="text-lg font-bold text-gray-800">
                                  {match.liveScore.player1Points || 0} - {match.liveScore.player2Points || 0}
                                </div>
                                <div className="text-xs text-yellow-600 mt-1">
                                  Set {match.currentSet || 1}, Game {match.currentGame || 1}
                                </div>
                                <div className="text-xs text-orange-500 mt-1 bg-orange-50 px-2 py-1 rounded">
                                  Group standings impact
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Legacy Score Format with Group Context */}
                          {(match.status === 'completed' || match.status === 'COMPLETED') && match.currentScore && !match.result && (
                            <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                              <div className="text-center">
                                <div className="text-sm text-green-700 font-medium mb-1">Round 1 Complete</div>
                                <div className="text-xs space-y-1">
                                  {match.currentScore.setOne && (
                                    <div>Set 1: {Array.isArray(match.currentScore.setOne) ? `${match.currentScore.setOne[0]}-${match.currentScore.setOne[1]}` : match.currentScore.setOne}</div>
                                  )}
                                  {match.currentScore.setTwo && (
                                    <div>Set 2: {Array.isArray(match.currentScore.setTwo) ? `${match.currentScore.setTwo[0]}-${match.currentScore.setTwo[1]}` : match.currentScore.setTwo}</div>
                                  )}
                                  {match.currentScore.setThree && (
                                    <div>Set 3: {Array.isArray(match.currentScore.setThree) ? `${match.currentScore.setThree[0]}-${match.currentScore.setThree[1]}` : match.currentScore.setThree}</div>
                                  )}
                                </div>
                                {match.winner && (
                                  <div className="text-xs text-green-600 mt-1 font-semibold">
                                    Winner: {typeof match.winner === 'object' ? (match.winner.playerName || match.winner.name || match.winner.userName || 'Unknown') : match.winner}
                                  </div>
                                )}
                                <div className="text-xs text-orange-500 mt-1 bg-orange-50 px-2 py-1 rounded">
                                  Points updated in group standings
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mt-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiInfo className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-600 font-semibold text-lg text-center">
                No groups found for {selectedCategory || "this category"}
              </p>
              <p className="text-gray-400 text-sm mt-1 text-center max-w-sm">
                To get started, go to the <strong>Registered Players</strong> tab and create groups for this category.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Top Players Content (Round 2 Groups) */}
      {activeSubGroupTab === "Top Players" && (
        <div>
          {filteredRound2Groups.length > 0 ? (
            <>
              {/* Group Selection Tabs - Exact same as League */}
              <div className="flex space-x-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                {filteredRound2Groups.map((group, index) => (
                  <button
                    key={group._id}
                    onClick={async () => {
                      setActiveRound2Group(group._id);
                    }}
                    className={`px-4 py-2 text-sm w-auto font-semibold rounded-lg transition-all whitespace-nowrap ${activeRound2Group === group._id
                      ? "bg-[#F97316] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {group.groupName || `Round 2 Group ${index + 1}`}
                  </button>
                ))}
              </div>

              {/* Group Content - Exact same structure as League */}
              {currentRound2Group && (
                <div className="w-full p-4 bg-white rounded-2xl">
                  <div className="flex justify-between items-center mb-0">
                    <div className="flex items-center gap-3">
                      <h2 className="text-[18px] md:text-[18px] font-[500] text-orange-500">
                        {currentRound2Group.groupName || `Round 2 Group ${round2Groups.indexOf(currentRound2Group) + 1}`}
                      </h2>
                    </div>
                    <FiEdit2 />
                  </div>

                  {/* Player List */}
                  <div className="space-y-1.5 mb-5">
                    {currentRound2Group.players?.map((player, index) => (
                      <div key={player._id || index} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 hover:bg-orange-50/50 transition">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
                        <span className="text-sm font-medium text-gray-800">{player.userName || player.playerName || `Player ${index + 1}`}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons - Compact grid */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {(!round2MatchesData[activeRound2Group] || round2MatchesData[activeRound2Group]?.length === 0) && (
                      <button
                        className="bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition active:scale-[0.97]"
                        onClick={() => {
                          setPendingRound2GroupId(activeRound2Group);
                          setIsModalOpen(true);
                        }}
                      >
                        <FiFlag className="w-4 h-4" />
                        Generate Matches
                      </button>
                    )}

                    <button
                      className="py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-orange-500 bg-orange-50 border border-orange-200 hover:bg-orange-100 transition"
                      onClick={() =>
                        navigate(`/tournament-management/group-stage/${tournamentId}/${activeRound2Group}/points-table`, {
                          state: { tournamentId, groupId: activeRound2Group, round: 2 }
                        })
                      }
                    >
                      <FiTable className="w-4 h-4" />
                      Points Table
                    </button>

                    {round2MatchesData[activeRound2Group]?.length > 0 && round2MatchesData[activeRound2Group].some(
                      m => m.status !== 'completed' && m.status !== 'COMPLETED'
                    ) && (
                      <button
                        className="py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white bg-emerald-500 hover:bg-emerald-600 transition"
                        onClick={() => openBulkScoreModal(
                          round2MatchesData[activeRound2Group] || [],
                          activeRound2Group,
                          `Bulk Score Upload — ${currentRound2Group?.groupName || 'Round 2 Group'}`
                        )}
                      >
                        <FiCheck className="w-4 h-4" />
                        Bulk Upload
                      </button>
                    )}

                    {round2MatchesData[activeRound2Group]?.length > 0 && (
                      <button
                        className="py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition"
                        onClick={() => {
                          if (window.confirm(`Delete ALL ${round2MatchesData[activeRound2Group]?.length || 0} matches? This cannot be undone.`)) {
                            axios.delete(`/api/tournaments/matches/${tournamentId}/${activeRound2Group}/all`)
                              .then((res) => { toast.info(res.data.message || "Matches deleted"); fetchRound2Groups(); })
                              .catch((err) => toast.error("Failed to delete: " + (err.response?.data?.message || err.message)));
                          }
                        }}
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete ({round2MatchesData[activeRound2Group]?.length || 0})
                      </button>
                    )}
                  </div>

                  {/* Matches Grid */}
                  <div>
                    {round2MatchesData[activeRound2Group]?.length > 0 && (
                      <div>
                        <h5 className="mb-3 text-sm font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                          Matches — {currentRound2Group.groupName || `Group ${round2Groups.indexOf(currentRound2Group) + 1}`}
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {round2MatchesData[activeRound2Group].map((match, index) => (
                            <div
                              key={index}
                              className={`rounded-2xl p-4 cursor-pointer border transition-all hover:shadow-md ${
                                match.status === 'COMPLETED' ? 'bg-emerald-50/50 border-emerald-200' :
                                match.status === 'IN_PROGRESS' ? 'bg-amber-50/50 border-amber-200' :
                                'bg-white border-gray-100 hover:border-orange-200'
                              }`}
                              onClick={(e) => { e.stopPropagation(); openModal(match); }}
                            >
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="bg-orange-100 text-orange-700 rounded-lg text-[10px] font-bold px-2 py-0.5">
                                    R2-M{match.matchNumber}
                                  </span>
                                  <span className="bg-gray-100 text-gray-600 rounded-lg text-[10px] font-medium px-2 py-0.5">
                                    Court {match.courtNumber || 'TBD'}
                                  </span>
                                  {match.status === 'COMPLETED' && (
                                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">Done</span>
                                  )}
                                  {match.status === 'IN_PROGRESS' && (
                                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                                      <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span> Live
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openModal(match);
                                    }}
                                    className="text-gray-500 hover:bg-transparent focus:outline-none w-auto bg-transparent"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`Delete match M${match.matchNumber}?`)) {
                                        axios.delete(`/api/tournaments/matches/${match._id}`)
                                          .then(() => fetchRound2Groups())
                                          .catch((err) => toast.info("Delete failed: " + (err.response?.data?.message || err.message)));
                                      }
                                    }}
                                    className="text-red-400 hover:text-red-600 hover:bg-transparent focus:outline-none w-auto bg-transparent"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              <p className="text-center text-xs text-gray-400 mb-3">
                                {formatDate(match.startTime)} • {MatchformatTime(match.startTime)}
                              </p>

                              <div className="space-y-2">
                                {/* Player 1 */}
                                <div className="flex items-center gap-2.5">
                                  {match.player1?.playerId?.profileImage ? (
                                    <img src={`/uploads/profiles/${match.player1.playerId.profileImage}`} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                                      {(match.player1?.userName || match.player1?.name || '?').charAt(0)}
                                    </div>
                                  )}
                                  <span className={`text-sm font-semibold ${match.winner?.playerId?.toString() === match.player1?.playerId?.toString() || match.winner?.playerName === (match.player1?.userName || match.player1?.name) ? 'text-emerald-600' : 'text-gray-800'}`}>
                                    {match.player1?.userName || match.player1?.name || 'Player 1'}
                                  </span>
                                  {(match.winner?.playerId?.toString() === match.player1?.playerId?.toString() || match.winner?.playerName === (match.player1?.userName || match.player1?.name)) && match.status === 'COMPLETED' && (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">W</span>
                                  )}
                                </div>

                                {/* VS + Score */}
                                <div className="flex items-center gap-2 pl-10">
                                  <span className="text-[10px] font-bold text-gray-300 uppercase">vs</span>
                                  {match.status === 'COMPLETED' && match.result?.finalScore && (
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                      {match.result.finalScore.player1Sets} - {match.result.finalScore.player2Sets}
                                    </span>
                                  )}
                                </div>

                                {/* Player 2 */}
                                <div className="flex items-center gap-2.5">
                                  {match.player2?.playerId?.profileImage ? (
                                    <img src={`/uploads/profiles/${match.player2.playerId.profileImage}`} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                                      {(match.player2?.userName || match.player2?.name || '?').charAt(0)}
                                    </div>
                                  )}
                                  <span className={`text-sm font-semibold ${match.winner?.playerId?.toString() === match.player2?.playerId?.toString() || match.winner?.playerName === (match.player2?.userName || match.player2?.name) ? 'text-emerald-600' : 'text-gray-800'}`}>
                                    {match.player2?.userName || match.player2?.name || 'Player 2'}
                                  </span>
                                  {(match.winner?.playerId?.toString() === match.player2?.playerId?.toString() || match.winner?.playerName === (match.player2?.userName || match.player2?.name)) && match.status === 'COMPLETED' && (
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">W</span>
                                  )}
                                </div>
                              </div>

                              {/* Enhanced Live Score Display for Top Players (Round 2) */}
                              {match.status === 'IN_PROGRESS' && match.liveScore && (
                                <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <div className="text-center">
                                    <div className="text-sm text-yellow-700 font-medium mb-1 flex items-center justify-center gap-2">
                                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                      Live Score - Round 2
                                    </div>
                                    <div className="text-lg font-bold text-gray-800">
                                      {match.liveScore.player1Points || 0} - {match.liveScore.player2Points || 0}
                                    </div>
                                    <div className="text-xs text-yellow-600 mt-1">
                                      Set {match.currentSet || 1}, Game {match.currentGame || 1}
                                    </div>
                                    <div className="text-xs text-emerald-600 mt-1 bg-emerald-50 px-2 py-1 rounded">
                                      Top Players championship impact
                                    </div>
                                  </div>
                                </div>
                              )}


                              {/* Legacy Score Format with Round 2 Context */}
                              {match.status === 'COMPLETED' && match.currentScore && !match.result && (
                                <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                                  <div className="text-center">
                                    <div className="text-sm text-green-700 font-medium mb-1">Round 2 Complete</div>
                                    <div className="text-xs space-y-1">
                                      {match.currentScore.setOne && (
                                        <div>Set 1: {Array.isArray(match.currentScore.setOne) ? `${match.currentScore.setOne[0]}-${match.currentScore.setOne[1]}` : match.currentScore.setOne}</div>
                                      )}
                                      {match.currentScore.setTwo && (
                                        <div>Set 2: {Array.isArray(match.currentScore.setTwo) ? `${match.currentScore.setTwo[0]}-${match.currentScore.setTwo[1]}` : match.currentScore.setTwo}</div>
                                      )}
                                      {match.currentScore.setThree && (
                                        <div>Set 3: {Array.isArray(match.currentScore.setThree) ? `${match.currentScore.setThree[0]}-${match.currentScore.setThree[1]}` : match.currentScore.setThree}</div>
                                      )}
                                    </div>
                                    {match.winner && (
                                      <div className="text-xs text-green-600 mt-1 font-semibold">
                                        Winner: {typeof match.winner === 'object' ? (match.winner.playerName || match.winner.name || match.winner.userName || 'Unknown') : match.winner}
                                      </div>
                                    )}
                                    <div className="text-xs text-emerald-600 mt-1 bg-emerald-50 px-2 py-1 rounded">
                                      Top Players standings updated
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // No Round 2 groups yet - keeping the helpful message
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mt-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiInfo className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-600 font-semibold text-lg text-center">
                No Round 2 groups found for {selectedCategory || "this category"}
              </p>
              <p className="text-gray-400 text-sm mt-1 text-center max-w-sm">
                Round 2 groups appear here after Top Players are selected.
                Go to <strong>Registered Players → Top Players</strong> to proceed.
              </p>
            </div>
          )}

          {/* 🔥 DIRECT KNOCKOUT MODE - When no Round 2 groups but tournament supports Direct Knockout */}
          {round2Groups.length === 0 && tournamentMode === "direct-knockout" && availablePlayersForKnockout.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-orange-50 to-orange-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <FaMedal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">🔥 Direct Knockout Mode</h3>
                  <p className="text-sm text-emerald-700">Skip Round 2 groups - Go straight to knockout bracket!</p>
                </div>
              </div>

              {/* Player Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-emerald-800 mb-3">
                  Select Players for Direct Knockout ({selectedPlayersForKnockout.length} selected)
                </h4>

                {/* Enhanced Validation Status */}
                <div className={`p-4 rounded-lg mb-4 border-2 transition-all duration-300 ${validationStatus.isValid
                  ? "bg-green-50 border-green-300 text-green-800 shadow-sm"
                  : selectedPlayersForKnockout.length === 0
                    ? "bg-orange-50 border-orange-200 text-orange-600"
                    : "bg-red-50 border-red-300 text-red-800 shadow-sm"
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {validationStatus.isValid ? (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : selectedPlayersForKnockout.length === 0 ? (
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="text-sm font-semibold">
                      {validationStatus.isValid
                        ? "✅ Valid Tournament Setup"
                        : selectedPlayersForKnockout.length === 0
                          ? "💡 Getting Started"
                          : "⚠️ Invalid Player Count"}
                    </div>
                  </div>
                  <div className="text-sm">{validationStatus.message || "Select players to create your Direct Knockout tournament"}</div>
                  {selectedPlayersForKnockout.length > 0 && (
                    <div className="text-xs mt-2 space-y-1">
                      <div>Valid tournament sizes: 4, 8, 16, 32 players (power of 2)</div>
                      {validationStatus.isValid && (
                        <div className="bg-white bg-opacity-60 p-2 rounded text-xs">
                          <strong>Tournament Preview:</strong> {Math.log2(selectedPlayersForKnockout.length)} rounds • {selectedPlayersForKnockout.length - 1} total matches • Winner determined in {Math.log2(selectedPlayersForKnockout.length)} stages
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Available Players Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                  {availablePlayersForKnockout
                    .filter(player => {
                      // Filter players by source category if available
                      const sourceGroup = groups.find(g => g._id === player.sourceGroupId);
                      if (!selectedCategory || !sourceGroup) return !selectedCategory || !!sourceGroup;

                      const gCat = (sourceGroup.category || "").toLowerCase().trim().replace(/_/g, " ");
                      const sCat = (selectedCategory || "").toLowerCase().trim().replace(/_/g, " ");
                      return gCat === sCat || gCat.includes(sCat) || sCat.includes(gCat);
                    })
                    .map((player, index) => {
                      const isSelected = selectedPlayersForKnockout.some(p =>
                        (p.playerId || p._id) === (player.playerId || player._id)
                      );

                      return (
                        <div
                          key={player._id || index}
                          onClick={() => {
                            let newSelection;
                            if (isSelected) {
                              // Remove player
                              newSelection = selectedPlayersForKnockout.filter(p =>
                                (p.playerId || p._id) !== (player.playerId || player._id)
                              );
                            } else {
                              // Add player
                              newSelection = [...selectedPlayersForKnockout, player];
                            }
                            setSelectedPlayersForKnockout(newSelection);
                            validateSelectedPlayers(newSelection);
                          }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${isSelected
                            ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                            : "border-gray-200 bg-white hover:border-emerald-300"
                            }`}
                        >
                          <div className="text-sm font-medium">{player.userName}</div>
                          <div className="text-xs text-gray-500">{player.sourceGroup}</div>
                          {isSelected && (
                            <div className="text-xs text-emerald-600 font-medium mt-1">✓ Selected</div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Quick Selection Buttons */}
              <div className="flex gap-2 mb-6">
                {[4, 8, 16, 32].map(count => (
                  <button
                    key={count}
                    onClick={() => {
                      if (availablePlayersForKnockout.length >= count) {
                        const newSelection = availablePlayersForKnockout.slice(0, count);
                        setSelectedPlayersForKnockout(newSelection);
                        validateSelectedPlayers(newSelection);
                      }
                    }}
                    disabled={availablePlayersForKnockout.length < count}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${availablePlayersForKnockout.length >= count
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    Select {count}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSelectedPlayersForKnockout([]);
                    setValidationStatus({ isValid: false, message: "Select players for Direct Knockout" });
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white hover:bg-gray-600"
                >
                  Clear All
                </button>
              </div>

              {/* Create Direct Knockout Button */}
              <button
                onClick={() => setIsDirectKnockoutScheduleModalOpen(true)}
                disabled={!validationStatus.isValid}
                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-3 ${validationStatus.isValid
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                <FaMedal className="w-5 h-5" />
                Create Direct Knockout Tournament
                {validationStatus.isValid && selectedPlayersForKnockout.length > 0 && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                    {Math.log2(selectedPlayersForKnockout.length)} Rounds
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Knockout Content */}
      {
        activeSubGroupTab === "Knockout" && (
          <div className="w-full p-4 bg-white rounded-2xl">
            {Object.keys(knockoutMatchesByRound).length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <FiFlag size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Knockout Matches</h3>
                <p className="text-gray-500 mb-4">Generate knockout matches from the Super Players section to see brackets here.</p>
              </div>
            ) : (
              <>
              {/* Delete All Knockout Matches */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Knockout Bracket</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Object.values(knockoutMatchesByRound).flat().length} total matches across {Object.keys(knockoutMatchesByRound).length} rounds
                  </p>
                </div>
                <button
                  onClick={() => {
                    const totalMatches = Object.values(knockoutMatchesByRound).flat().length;
                    if (!window.confirm(`Delete ALL ${totalMatches} knockout matches? This cannot be undone.`)) return;
                    axios.delete(`/api/tournaments/knockout/${tournamentId}/all`)
                      .then((res) => {
                        toast.success(res.data.message || "Knockout matches deleted");
                        fetchKnockoutMatches();
                      })
                      .catch((err) => toast.error(err.response?.data?.message || "Failed to delete knockout matches"));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition flex items-center gap-2 w-auto"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                  Delete All Knockout
                </button>
              </div>
              {Object.entries(knockoutMatchesByRound).map(([roundName, matches], roundIndex) => (
                <div key={roundName} className="mb-6">
                  <div
                    className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${openIndex === roundIndex ? "bg-orange-500" : "bg-gray-100"
                      }`}
                    onClick={() => toggleAccordion(roundIndex)}
                  >
                    <h2
                      className={`md:text-[18px] text-[16px] font-[600] mb-0 ${openIndex === roundIndex ? "text-white" : "text-gray-900"
                        }`}
                    >
                      {roundName.charAt(0).toUpperCase() + roundName.slice(1).replace('-', ' ')} ({matches.length} matches)
                    </h2>
                    {/* Bulk Score Upload for this knockout round */}
                    {matches.some(m => m.status !== 'completed' && m.status !== 'COMPLETED') && (
                      <button
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 mr-8 w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          openBulkScoreModal(matches, null, `Bulk Score Upload — ${roundName.charAt(0).toUpperCase() + roundName.slice(1).replace('-', ' ')}`);
                        }}
                      >
                        Bulk Upload
                      </button>
                    )}
                    <span
                      className={`transform transition-transform duration-300 ${openIndex === roundIndex ? "rotate-180 text-white" : "text-gray-900"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                        <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                      </svg>
                    </span>
                  </div>

                  <div
                    className={`overflow-scroll transition-all duration-300 ${openIndex === roundIndex
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    <div className="space-y-4 mt-6">
                      {matches.map((match) => {
                        const isP1Winner = (match.winner?.playerId?.toString() === match.player1?.playerId?.toString()) ||
                          (match.winner?.playerName === match.player1?.playerName && match.player1?.playerName);
                        const isP2Winner = (match.winner?.playerId?.toString() === match.player2?.playerId?.toString()) ||
                          (match.winner?.playerName === match.player2?.playerName && match.player2?.playerName);
                        const isCompleted = match.status === 'completed' || match.status === 'COMPLETED';
                        const isInProgress = match.status === 'in-progress' || match.status === 'IN_PROGRESS';

                        return (
                          <div
                            key={match._id}
                            className={`relative bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden ${isCompleted ? 'border-l-4 border-l-green-500' : isInProgress ? 'border-l-4 border-l-yellow-500' : ''}`}
                            onClick={() => openModal(match)}
                          >
                            <div className="flex flex-col lg:flex-row items-center gap-6">
                              {/* Left: Match Branding */}
                              <div className="flex-shrink-0 w-full lg:w-44 border-b lg:border-b-0 lg:border-r border-gray-100 pb-4 lg:pb-0 flex flex-col items-center lg:items-start pr-2">
                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                  <span className="bg-[#F97316]/10 text-[#F97316] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                                    {(match.roundName || match.round || "Knockout").replace('-', ' ')}
                                  </span>
                                  <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                                    M{match.matchNumber}
                                  </span>
                                </div>
                                <div className="text-xl font-black text-gray-800 leading-tight">
                                  {MatchformatTime(match.matchStartTime || match.startTime)}
                                </div>
                                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-bold">
                                  <FiFlag size={12} className="text-[#F97316]" /> COURT {match.courtNumber || 'TBD'}
                                </div>
                              </div>

                              {/* Center: The Matchup */}
                              <div className="flex-1 flex items-center justify-between w-full px-4 sm:px-10">
                                {/* Player 1 */}
                                <div className={`flex flex-col items-center text-center flex-1 transition-all duration-500 ${isP1Winner ? 'scale-110' : isCompleted ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                                  <div className="relative">
                                    {match.player1.playerId?.profileImage ? (
                                      <img
                                        src={`/uploads/profiles/${match.player1.playerId.profileImage}`}
                                        alt={match.player1.playerName}
                                        className={`w-16 h-16 rounded-full object-cover border-4 transition-all ${isP1Winner ? 'border-green-400 shadow-xl' : 'border-gray-100'}`}
                                      />
                                    ) : (
                                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black border-4 transition-all ${isP1Winner ? 'border-green-400 bg-green-500 shadow-xl' : 'border-gray-100 bg-[#F97316]'}`}>
                                        {match.player1.playerName?.charAt(0) || '?'}
                                      </div>
                                    )}
                                    {isP1Winner && (
                                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-1 shadow-lg ring-2 ring-white">
                                        <FaMedal size={14} />
                                      </div>
                                    )}
                                  </div>
                                  <div className={`mt-3 font-black text-sm uppercase tracking-tighter ${isP1Winner ? 'text-green-700' : 'text-gray-900'}`}>
                                    {match.player1.playerName}
                                  </div>
                                  {match.player1.seed && <div className="text-[10px] text-[#F97316] font-bold">SEED #{match.player1.seed}</div>}
                                </div>

                                {/* VS DIVIDER */}
                                <div className="flex flex-col items-center px-4 min-w-[80px]">
                                  <div className="text-[11px] font-black text-gray-300 italic mb-2 tracking-[0.2em]">VS</div>
                                  {isCompleted ? (
                                    <div className="bg-gray-900 text-white px-4 py-1.5 rounded-xl font-mono text-xl font-bold tracking-widest shadow-2xl transform rotate-1 transition-transform group-hover:rotate-0">
                                      {match.result?.finalScore ? `${match.result.finalScore.player1Sets}-${match.result.finalScore.player2Sets}` :
                                        (match.score ? `${match.score.player1Sets}-${match.score.player2Sets}` :
                                          (match.currentScore?.setOne ? `${match.currentScore.setOne[0]}-${match.currentScore.setOne[1]}` : '0-0'))
                                      }
                                    </div>
                                  ) : isInProgress ? (
                                    <div className="flex flex-col items-center animate-pulse">
                                      <div className="text-yellow-600 font-black text-lg">
                                        {match.liveScore?.player1Points || 0} : {match.liveScore?.player2Points || 0}
                                      </div>
                                      <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Live Now</div>
                                    </div>
                                  ) : (
                                    <div className="w-16 h-1 bg-gray-100 rounded-full"></div>
                                  )}
                                </div>

                                {/* Player 2 */}
                                <div className={`flex flex-col items-center text-center flex-1 transition-all duration-500 ${isP2Winner ? 'scale-110' : isCompleted ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                                  <div className="relative">
                                    {match.player2.playerId?.profileImage ? (
                                      <img
                                        src={`/uploads/profiles/${match.player2.playerId.profileImage}`}
                                        alt={match.player2.playerName}
                                        className={`w-16 h-16 rounded-full object-cover border-4 transition-all ${isP2Winner ? 'border-green-400 shadow-xl' : 'border-gray-100'}`}
                                      />
                                    ) : (
                                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black border-4 transition-all ${isP2Winner ? 'border-green-400 bg-green-500 shadow-xl' : 'border-gray-100 bg-[#F97316]'}`}>
                                        {match.player2.playerName?.charAt(0) || '?'}
                                      </div>
                                    )}
                                    {isP2Winner && (
                                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-1 shadow-lg ring-2 ring-white">
                                        <FaMedal size={14} />
                                      </div>
                                    )}
                                  </div>
                                  <div className={`mt-3 font-black text-sm uppercase tracking-tighter ${isP2Winner ? 'text-green-700' : 'text-gray-900'}`}>
                                    {match.player2.playerName}
                                  </div>
                                  {match.player2.seed && <div className="text-[10px] text-[#F97316] font-bold">SEED #{match.player2.seed}</div>}
                                </div>
                              </div>

                              {/* Right: Actions */}
                              <div className="flex-shrink-0 flex flex-row lg:flex-col items-center gap-3 lg:border-l border-gray-100 lg:pl-6 w-full lg:w-auto justify-center lg:justify-start pt-4 lg:pt-0">
                                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'bg-green-100 text-green-700' : isInProgress ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                  {match.status?.toUpperCase()}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(match);
                                  }}
                                  className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                  title="Edit Match"
                                >
                                  <FiEdit2 size={18} />
                                </button>
                              </div>
                            </div>

                            {/* Progression Indicator for Completed Matches */}
                            {isCompleted && (
                              <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-gray-50 border-dashed opacity-80 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                                  <FiCheck className="text-green-600" size={14} />
                                  <span className="text-[11px] font-black text-green-700 uppercase tracking-widest">
                                    {(isP1Winner ? match.player1.playerName : match.player2.playerName)} Advances
                                  </span>
                                </div>
                                <div className="w-8 h-[1px] bg-gray-200"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Stage Ready</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Table View End */}

                  {/* Next Round Action Button */}
                  {(() => {
                    // Only show button if this is the highest round created so far
                    const currentMaxRound = Math.max(...knockoutMatches.map(m => m.roundNumber || 0), 0);
                    const isLatestRound = matches[0]?.roundNumber === currentMaxRound;
                    const allCompleted = matches.every(m => m.status === 'completed' || m.status === 'COMPLETED');

                    if (isLatestRound && allCompleted) {
                      const winnersCount = matches.length; // Winners = count of matches in knockout

                      if (winnersCount >= 2) {
                        return (
                          <div className="mt-8 flex flex-col items-center p-6 bg-orange-50 border-2 border-dashed border-orange-200 rounded-xl">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg text-white">
                              <FiFlag className="text-xl" />
                            </div>
                            <h4 className="text-gray-900 font-bold text-lg mb-1">Round Complete!</h4>
                            <p className="text-orange-600 text-sm mb-6 text-center">
                              All {matches.length} matches finished. {winnersCount} winners are ready for the next stage.
                            </p>
                            <button
                              onClick={() => handleInitiateNextRound(matches)}
                              className="bg-[#F97316] text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                            >
                              <FiPlus className="text-xl" />
                              Generate Next Round Matches
                            </button>
                          </div>
                        );
                      } else if (winnersCount === 1) {
                        // Finale!
                        return (
                          <div className="mt-8 flex flex-col items-center p-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl">
                            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-xl text-white transform rotate-12">
                              <FiTable className="text-2xl" />
                            </div>
                            <h4 className="text-orange-900 font-black text-2xl mb-1">🏆 Tournament Complete!</h4>
                            <p className="text-orange-700 font-medium mb-4">
                              Winner: <span className="font-bold text-orange-900">{matches[0].winner || matches[0].result?.winner?.playerName}</span>
                            </p>
                            <div className="flex gap-4">
                              <button
                                onClick={() => navigate(`/tournament-management/group-stage/${tournamentId}/leaderboard`)}
                                className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-orange-600 transition"
                              >
                                View Final Rankings
                              </button>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              ))}
              </>
            )
            }
          </div >
        )
      }

      {/* 🔹 Modal for Match Generation */}
      {
        isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white w-96 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Match Settings</h3>
                <FiX
                  className="cursor-pointer"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Court Number
                </label>
                <input
                  type="text"
                  className="w-full border p-2 mt-1"
                  value={courtNumber}
                  onChange={(e) => setCourtNumber(e.target.value)}
                />

                <label className="block text-sm font-medium text-gray-700 mt-3">
                  Match Interval (minutes)
                </label>
                <input
                  type="number"
                  className="w-full border p-2 mt-1"
                  value={matchInterval}
                  onChange={(e) => setMatchInterval(e.target.value)}
                />

                <label className="block text-sm font-medium text-gray-700 mt-3">
                  Match Start Time
                </label>
                <input
                  type="time"
                  className="w-full border p-2 mt-1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <button
                className="mt-4 w-full bg-orange-500 text-white py-2 rounded-full text-sm font-medium"
                onClick={() => {
                  // Check which tab is active to determine which generation function to use
                  if (activeSubGroupTab === "Top Players") {
                    handleGenerateRound2Matches();
                  } else {
                    handleGenerateMatches();
                  }
                }}
              >
                {activeSubGroupTab === "Top Players" ? "Generate Round 2 Matches" : "Generate Matches"}
              </button>
            </div>
          </div>
        )
      }

      {/* 🏆 DIRECT KNOCKOUT SCHEDULE MODAL - Enhanced scheduling interface */}
      {
        isDirectKnockoutScheduleModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-lg mx-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Create Direct Knockout Tournament</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Schedule matches for {selectedPlayersForKnockout.length} players • {Math.log2(selectedPlayersForKnockout.length)} rounds
                  </p>
                </div>
                <FiX
                  className="cursor-pointer text-gray-500 hover:text-gray-700 text-xl"
                  onClick={() => setIsDirectKnockoutScheduleModalOpen(false)}
                />
              </div>

              <div className="space-y-6">
                {/* Tournament Overview */}
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-2">Tournament Overview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Players:</span>
                      <span className="font-medium ml-2">{selectedPlayersForKnockout.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rounds:</span>
                      <span className="font-medium ml-2">{Math.log2(selectedPlayersForKnockout.length)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Matches:</span>
                      <span className="font-medium ml-2">{selectedPlayersForKnockout.length - 1}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Estimated Duration:</span>
                      <span className="font-medium ml-2">
                        {((selectedPlayersForKnockout.length - 1) * directKnockoutSchedule.intervalMinutes / 60).toFixed(1)} hours
                      </span>
                    </div>
                  </div>
                </div>

                {/* Schedule Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Court & Date */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Court Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Court 1, Main Court"
                        value={directKnockoutSchedule.courtNumber}
                        onChange={(e) => setDirectKnockoutSchedule(prev => ({
                          ...prev,
                          courtNumber: e.target.value
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={directKnockoutSchedule.startDate}
                        onChange={(e) => setDirectKnockoutSchedule(prev => ({
                          ...prev,
                          startDate: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  {/* Time & Intervals */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={directKnockoutSchedule.startTime}
                        onChange={(e) => setDirectKnockoutSchedule(prev => ({
                          ...prev,
                          startTime: e.target.value
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Match Interval (minutes)
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        value={directKnockoutSchedule.intervalMinutes}
                        onChange={(e) => setDirectKnockoutSchedule(prev => ({
                          ...prev,
                          intervalMinutes: parseInt(e.target.value)
                        }))}
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Time between match start times</p>
                    </div>
                  </div>
                </div>

                {/* Match Duration Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Match Duration (minutes)
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    value={directKnockoutSchedule.estimatedDuration}
                    onChange={(e) => setDirectKnockoutSchedule(prev => ({
                      ...prev,
                      estimatedDuration: parseInt(e.target.value)
                    }))}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={75}>75 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Expected duration for each match</p>
                </div>

                {/* Selected Players Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Players ({selectedPlayersForKnockout.length})
                  </label>
                  <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3 border">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedPlayersForKnockout.map((player, index) => (
                        <div key={player.playerId} className="text-sm text-gray-700 truncate">
                          {index + 1}. {player.userName}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                  onClick={() => setIsDirectKnockoutScheduleModalOpen(false)}
                  disabled={isCreatingKnockout}
                >
                  Cancel
                </button>
                <button
                  className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${isCreatingKnockout || !directKnockoutSchedule.courtNumber || !directKnockoutSchedule.startDate || !directKnockoutSchedule.startTime
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                  onClick={handleCreateDirectKnockoutTournament}
                  disabled={isCreatingKnockout || !directKnockoutSchedule.courtNumber || !directKnockoutSchedule.startDate || !directKnockoutSchedule.startTime}
                >
                  {isCreatingKnockout ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaMedal className="w-4 h-4" />
                      Create Tournament
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Popup Modal */}
      {
        isPopupOpen && selectedMatch && (
          <div
            className="fixed top-[35px] left-0 w-full h-full bg-black bg-opacity-10 flex justify-center items-center"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-lg bg-[#fff] p-6 rounded-lg w-full max-w-[1400px] md:w-[95vw] max-h-[80vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-2xl bg-transparent text-gray-600 hover:bg-transparent w-auto"
                onClick={closeModal}
              >
                <FiX />
              </button>
              <div className="flex justify-between">
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 rounded-full border w-auto bg-[#E6E5E8] text-gray-900 md:text-[16px] sm:text-[14px] font-[400]">
                    Match {selectedMatch.matchNumber}
                  </button>
                  <button className="px-3 py-2 rounded-full border w-auto bg-[#E6E5E8] text-gray-900 md:text-[16px] sm:text-[14px] font-[400]">
                    Court {selectedMatch.courtNumber || "Court TBD"}
                  </button>
                </div>
                <button className="bg-transparent hover:bg-transparent w-auto text-black p-0">
                  <FiEdit2 />
                </button>
              </div>
              <div className="oponentmatches">
                <div className="oponent1">
                  <div className="flex w-full justify-between items-center">
                    <div className="bg-[#F5F7FA] rounded-lg w-1/2 flex flex-col opponet1match">
                      <div className="flex items-start mb-2 gap-[10px]">
                        <img
                          src="https://via.placeholder.com/50"
                          alt="Player"
                          className="rounded-full w-[52px] h-[52px] mr-2"
                        />
                        <div className="flex flex-col">
                          <h2 className="text-orange-500 font-[600] md:text-[18px] sm:text-[14px] player1name">
                            {selectedMatch.player1?.userName || selectedMatch.player1?.playerName || 'Player 1'}
                          </h2>
                          <p>Win: 00 Lose: 00 Draw: 00 Total: 00</p>
                          <div className="text-gray-900 md:text-[16px] sm:text-[14px] items-start achievement font-[400]">
                            <div className="mt-2 flex items-start flex-row gap-[8px]">
                              <img src={medal} />
                              <div>
                                <p>Achievement</p>
                                <p>State level Player</p>
                                <p>3x District Champion- 2 Gold, </p>
                                <p>1 Silver</p>
                              </div>
                            </div>
                            <p className="mt-2 flex items-center gap-[8px]">
                              <img src={sports_tennis} /> FC Table Tennis Academy
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-900 font-[600] text-gray-900 mx-4">
                      VS
                    </div>
                    <div className="bg-[#F5F7FA] rounded-lg w-1/2 flex flex-col opponet1match">
                      <div className="flex items-start mb-2 gap-[10px]">
                        <img
                          src="https://via.placeholder.com/50"
                          alt="Player"
                          className="rounded-full w-[52px] h-[52px] mr-2"
                        />
                        <div className="flex flex-col">
                          <h2 className="text-orange-500 font-[600] md:text-[18px] sm:text-[14px] player1name">
                            {selectedMatch.player2?.userName || selectedMatch.player2?.playerName || 'Player 2'}
                          </h2>
                          <p>Win: 00 Lose: 00 Draw: 00 Total: 00</p>
                          <div className="text-gray-900 md:text-[16px] sm:text-[14px] items-start achievement font-[400]">
                            <div className="mt-2 flex items-start flex-row gap-[8px]">
                              <img src={medal} />
                              <div>
                                <p>Achievement</p>
                                <p>State level Player</p>
                                <p>3x District Champion- 2 Gold, </p>
                                <p>1 Silver</p>
                              </div>
                            </div>
                            <p className="mt-2 flex items-center gap-[8px]">
                              <img src={sports_tennis} /> FC Table Tennis Academy
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="oponent1">
                <div className="bg-gray-100 w-full p-4 rounded-lg mb-4">
                  <h3 className="text-gray-700 font-semibold mb-2">
                    Match Details
                  </h3>
                  <div className="flex justify-between md:text-[16px] sm:text-[14px] font-[400]">
                    <p>
                      Tournament Name:
                      <strong>{selectedMatch.tournamentId?.title || selectedMatch.tournament?.title || 'Tournament'}</strong>
                    </p>
                    <p>
                      Date: <strong>{formatDate(selectedMatch.startTime || selectedMatch.matchStartTime)}</strong>
                    </p>
                    <p>
                      {selectedMatch.round || selectedMatch.roundName ? 'Round Type:' : 'Elimination Type:'}
                      <strong>
                        {selectedMatch.round
                          ? selectedMatch.round.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : selectedMatch.roundName
                            ? selectedMatch.roundName
                            : selectedMatch.tournamentId?.type || selectedMatch.tournament?.type || 'Single Elimination'
                        }
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Universal Player Scorecard Section - Works for League, Top Players & Knockout */}
                {(selectedMatch.hasScores || selectedMatch.status === 'in-progress' || selectedMatch.status === 'IN_PROGRESS' || selectedMatch.status === 'completed' || selectedMatch.status === 'COMPLETED') && (
                  <div className="bg-white border border-gray-200 w-full p-4 rounded-lg mb-4">
                    <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
                      <span className="bg-orange-100 p-2 rounded-lg">🏓</span>
                      Player Scorecard
                      {/* Match Type Indicator */}
                      <span className={`text-xs px-2 py-1 rounded-full ${selectedMatch.nextMatchId ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'
                        }`}>
                        {selectedMatch.nextMatchId ? 'Knockout' : activeSubGroupTab || 'League'}
                      </span>
                    </h3>

                    {/* Live Status Dashboard - Universal for all match types */}
                    {(selectedMatch.status === 'in-progress' || selectedMatch.status === 'IN_PROGRESS') && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span className="text-yellow-700 font-semibold text-sm">LIVE MATCH</span>
                          </div>
                          <div className="text-xs text-yellow-600">
                            Set {selectedMatch.currentSet || selectedMatch.liveMatchData?.currentSet || 1},
                            Game {selectedMatch.currentGame || selectedMatch.liveMatchData?.currentGame || 1}
                            {!selectedMatch.nextMatchId && (
                              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 rounded">
                                Group Match
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <p className="text-orange-500 font-semibold text-sm mb-1">
                              {selectedMatch.player1?.userName || selectedMatch.player1?.playerName || 'Player 1'}
                            </p>
                            <div className="bg-white rounded-lg py-2 px-3 border">
                              <span className="text-2xl font-bold text-gray-800">
                                {selectedMatch.liveScore?.player1Points || selectedMatch.liveMatchData?.liveScore?.player1Points || 0}
                              </span>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="bg-white rounded-lg py-2 px-3 border">
                              <span className="text-sm text-gray-600 block">Current Score</span>
                              <span className="text-lg font-bold text-gray-800">VS</span>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-orange-500 font-semibold text-sm mb-1">
                              {selectedMatch.player2?.userName || selectedMatch.player2?.playerName || 'Player 2'}
                            </p>
                            <div className="bg-white rounded-lg py-2 px-3 border">
                              <span className="text-2xl font-bold text-gray-800">
                                {selectedMatch.liveScore?.player2Points || selectedMatch.liveMatchData?.liveScore?.player2Points || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Group Context for League/Top Players */}
                        {!selectedMatch.nextMatchId && (
                          <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                            <div className="text-center text-sm">
                              <span className="text-orange-600 font-medium">
                                {activeSubGroupTab === "Top Players" ? "Round 2" : "Round 1"} Group Match
                              </span>
                              <span className="text-orange-500 ml-2">
                                • Points affect group standings
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Match Completed Status */}
                    {(selectedMatch.status === 'completed' || selectedMatch.status === 'COMPLETED') && selectedMatch.winner && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg mb-4">
                        <div className="text-center">
                          <div className="bg-green-500 text-white px-4 py-2 rounded-full inline-flex items-center gap-2 mb-3">
                            <FaMedal className="text-yellow-300" />
                            <span className="font-semibold">
                              Winner: {typeof selectedMatch.winner === 'object' ?
                                (selectedMatch.winner?.playerName || selectedMatch.winner?.name) :
                                selectedMatch.winner}
                            </span>
                          </div>
                          {selectedMatch.score && (
                            <div className="text-sm text-green-700">
                              Final Score: {selectedMatch.score.player1Sets || 0} - {selectedMatch.score.player2Sets || 0} Sets
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Universal Set-wise Summary - Works for all match types */}
                    {(selectedMatch.sets || selectedMatch.liveMatchData?.sets) && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                          <span>📊</span> Set-wise Progress
                          {!selectedMatch.nextMatchId && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                              Group Points: Win=3, Lose=0
                            </span>
                          )}
                        </h4>
                        <div className="space-y-3">
                          {(selectedMatch.sets || selectedMatch.liveMatchData?.sets || []).map((set, index) => {
                            // Universal game counting - works for both SuperMatch and regular Match
                            const player1Games = set.games?.filter(game => {
                              const gameWinnerName = game.winner?.playerName || game.winner?.userName;
                              const player1Name = selectedMatch.player1?.playerName || selectedMatch.player1?.userName;
                              return gameWinnerName === player1Name ||
                                game.winner?.playerId?.toString() === selectedMatch.player1?.playerId?.toString();
                            }).length || 0;

                            const player2Games = set.games?.filter(game => {
                              const gameWinnerName = game.winner?.playerName || game.winner?.userName;
                              const player2Name = selectedMatch.player2?.playerName || selectedMatch.player2?.userName;
                              return gameWinnerName === player2Name ||
                                game.winner?.playerId?.toString() === selectedMatch.player2?.playerId?.toString();
                            }).length || 0;

                            // Determine set winner
                            const setWinnerName = set.winner?.playerName || set.winner?.userName;
                            const player1Name = selectedMatch.player1?.playerName || selectedMatch.player1?.userName;
                            const player2Name = selectedMatch.player2?.playerName || selectedMatch.player2?.userName;

                            const setWinner = setWinnerName ||
                              (player1Games > player2Games ? player1Name :
                                player2Games > player1Games ? player2Name : null);

                            return (
                              <div key={index} className="bg-white p-3 rounded border">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-sm">Set {set.setNumber || index + 1}</span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${set.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                      }`}>
                                      {set.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                                    </span>
                                    {!selectedMatch.nextMatchId && setWinner && (
                                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                                        +3 pts
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-center">
                                    <div className={`font-semibold ${setWinner === player1Name ? 'text-green-600' : 'text-gray-600'}`}>
                                      {player1Name || 'Player 1'}
                                    </div>
                                    <div className="bg-gray-100 rounded py-1 mt-1">
                                      {player1Games} games
                                    </div>
                                  </div>

                                  <div className="text-center text-gray-500">
                                    VS
                                  </div>

                                  <div className="text-center">
                                    <div className={`font-semibold ${setWinner === player2Name ? 'text-green-600' : 'text-gray-600'}`}>
                                      {player2Name || 'Player 2'}
                                    </div>
                                    <div className="bg-gray-100 rounded py-1 mt-1">
                                      {player2Games} games
                                    </div>
                                  </div>
                                </div>

                                {setWinner && (
                                  <div className="mt-2 text-center">
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      Set Winner: {setWinner}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Universal Game-by-Game Breakdown */}
                    {(selectedMatch.sets || selectedMatch.liveMatchData?.sets) && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                          <span>🎯</span> Game-by-Game Breakdown
                          {!selectedMatch.nextMatchId && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              Group Match History
                            </span>
                          )}
                        </h4>
                        <div className="space-y-4">
                          {(selectedMatch.sets || selectedMatch.liveMatchData?.sets || []).map((set, setIndex) => (
                            <div key={setIndex} className="bg-white p-3 rounded border">
                              <h5 className="font-semibold text-sm mb-3 text-gray-700 flex items-center justify-between">
                                <span>Set {set.setNumber || setIndex + 1} Games</span>
                                {!selectedMatch.nextMatchId && (
                                  <span className="text-xs text-orange-500">
                                    Affects {activeSubGroupTab === "Top Players" ? "Round 2" : "Round 1"} standings
                                  </span>
                                )}
                              </h5>

                              {set.games && set.games.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {set.games.map((game, gameIndex) => {
                                    const gameWinnerName = game.winner?.playerName || game.winner?.userName;
                                    const player1Name = selectedMatch.player1?.playerName || selectedMatch.player1?.userName;
                                    const player2Name = selectedMatch.player2?.playerName || selectedMatch.player2?.userName;

                                    return (
                                      <div key={gameIndex} className={`p-2 rounded text-center text-xs border ${game.status === 'COMPLETED' ? 'bg-gray-50 border-gray-200' : 'bg-yellow-50 border-yellow-200'
                                        }`}>
                                        <div className="font-semibold mb-1">Game {game.gameNumber || gameIndex + 1}</div>
                                        <div className="text-sm font-bold">
                                          {game.finalScore?.player1 || 0} - {game.finalScore?.player2 || 0}
                                        </div>
                                        {gameWinnerName && (
                                          <div className={`text-xs mt-1 font-semibold ${gameWinnerName === player1Name ? 'text-orange-500' :
                                            gameWinnerName === player2Name ? 'text-green-600' : 'text-gray-600'
                                            }`}>
                                            {gameWinnerName}
                                          </div>
                                        )}
                                        {game.status !== 'COMPLETED' && (
                                          <div className="text-xs text-yellow-600 mt-1 flex items-center justify-center gap-1">
                                            <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></div>
                                            Live
                                          </div>
                                        )}
                                        {game.endTime && (
                                          <div className="text-xs text-gray-400 mt-1">
                                            {new Date(game.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-center text-gray-500 text-sm py-4">
                                  <div className="text-gray-400 mb-2">⏱️</div>
                                  Set not started yet
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback for matches without detailed data */}
                    {!selectedMatch.sets && !selectedMatch.liveMatchData?.sets && selectedMatch.hasScores && (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-gray-600 mb-2">Basic Score Information</div>
                        {selectedMatch.currentScore && (
                          <div className="space-y-2 text-sm">
                            {selectedMatch.currentScore.setOne && (
                              <div>Set 1: {Array.isArray(selectedMatch.currentScore.setOne) ?
                                `${selectedMatch.currentScore.setOne[0]}-${selectedMatch.currentScore.setOne[1]}` :
                                selectedMatch.currentScore.setOne}
                              </div>
                            )}
                            {selectedMatch.currentScore.setTwo && (
                              <div>Set 2: {Array.isArray(selectedMatch.currentScore.setTwo) ?
                                `${selectedMatch.currentScore.setTwo[0]}-${selectedMatch.currentScore.setTwo[1]}` :
                                selectedMatch.currentScore.setTwo}
                              </div>
                            )}
                            {selectedMatch.currentScore.setThree && (
                              <div>Set 3: {Array.isArray(selectedMatch.currentScore.setThree) ?
                                `${selectedMatch.currentScore.setThree[0]}-${selectedMatch.currentScore.setThree[1]}` :
                                selectedMatch.currentScore.setThree}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>

              <div className="flex justify-end w-full items-center mt-4 gap-[7px]">
                <button
                  onClick={handleStartMatch}
                  className={`px-6 py-2 w-auto rounded-lg ${(selectedMatch?.status === 'completed' || selectedMatch?.status === 'COMPLETED')
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : (selectedMatch?.status === 'in_progress' || selectedMatch?.status === 'IN_PROGRESS' ||
                      selectedMatch?.status === 'in-progress' || selectedMatch?.status === 'IN-PROGRESS' ||
                      (selectedMatch?.liveScore && (selectedMatch.liveScore.player1Points > 0 || selectedMatch.liveScore.player2Points > 0)) ||
                      (selectedMatch?.currentScore && (selectedMatch.currentScore.setOne || selectedMatch.currentScore.setTwo || selectedMatch.currentScore.setThree)) ||
                      (selectedMatch?.liveMatchData?.liveScore && (selectedMatch.liveMatchData.liveScore.player1Points > 0 || selectedMatch.liveMatchData.liveScore.player2Points > 0)))
                      ? 'bg-orange-500 text-white hover:bg-orange-500'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  disabled={selectedMatch?.status === 'completed' || selectedMatch?.status === 'COMPLETED'}
                >
                  {(selectedMatch?.status === 'completed' || selectedMatch?.status === 'COMPLETED')
                    ? 'Match Complete'
                    : (selectedMatch?.status === 'in_progress' || selectedMatch?.status === 'IN_PROGRESS' ||
                      selectedMatch?.status === 'in-progress' || selectedMatch?.status === 'IN-PROGRESS' ||
                      (selectedMatch?.liveScore && (selectedMatch.liveScore.player1Points > 0 || selectedMatch.liveScore.player2Points > 0)) ||
                      (selectedMatch?.currentScore && (selectedMatch.currentScore.setOne || selectedMatch.currentScore.setTwo || selectedMatch.currentScore.setThree)) ||
                      (selectedMatch?.liveMatchData?.liveScore && (selectedMatch.liveMatchData.liveScore.player1Points > 0 || selectedMatch.liveMatchData.liveScore.player2Points > 0)))
                      ? 'Resume Match'
                      : 'Start Match'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* \ud83d\ude80 ENHANCED EDIT GROUP MODAL - With Match Format Configuration */}
      {
        isEditGroupModalOpen && currentEditGroup && (
          <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-[80%] mt-[90px] transform transition-all duration-300 animate-slideUp">
              {/* 🎯 PREMIUM HEADER with Gradient */}
              <div className="relative bg-gradient-to-r from-orange-500 via-emerald-600 to-rose-600 rounded-t-3xl p-6 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
                </div>

                <div className="relative flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <FiEdit2 className="text-white text-xl" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Edit Group</h2>
                        <p className="text-orange-100 text-sm mt-1">Manage group details and match format settings</p>
                      </div>
                    </div>

                    {/* Group Name Badge */}
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <FiFlag className="text-white" />
                      <span className="text-white font-semibold">{currentEditGroup.groupName || 'Unnamed Group'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsEditGroupModalOpen(false);
                      setCurrentEditGroup(null);
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              {/* 📊 MAIN CONTENT AREA */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* 👥 LEFT COLUMN - Group Details */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-gradient-to-r from-orange-500 to-emerald-500">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FiEdit2 className="text-white text-lg" />
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-emerald-600 bg-clip-text text-transparent">
                        Group Details
                      </h3>
                    </div>

                    {/* Group Name Input */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                        Group Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={currentEditGroup.groupName || ''}
                          onChange={(e) => {
                            setCurrentEditGroup(prev => ({
                              ...prev,
                              groupName: e.target.value
                            }));
                          }}
                          className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 text-gray-800 font-medium placeholder-gray-400 hover:border-gray-300"
                          placeholder="Enter group name (e.g., Group A)"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <FiEdit2 size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Category Input */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        Category
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={currentEditGroup.category || ''}
                          onChange={(e) => {
                            setCurrentEditGroup(prev => ({
                              ...prev,
                              category: e.target.value
                            }));
                          }}
                          className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 text-gray-800 font-medium placeholder-gray-400 hover:border-gray-300"
                          placeholder="Enter category (e.g., Open, Men's Singles)"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <FiFlag size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Players List */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Players
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-md">
                          {currentEditGroup.players?.length || 0} Players
                        </span>
                      </label>

                      <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-orange-50/30 custom-scrollbar">
                        {currentEditGroup.players && currentEditGroup.players.length > 0 ? (
                          <ul className="space-y-3">
                            {currentEditGroup.players.map((player, index) => (
                              <li
                                key={player._id || index}
                                className="group bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3 flex-1">
                                    {/* Player Avatar */}
                                    <div className="relative">
                                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-emerald-600 flex items-center justify-center font-bold text-white text-base shadow-lg ring-2 ring-white">
                                        {(player.userId?.name || player.userName || `P${index + 1}`).charAt(0).toUpperCase()}
                                      </div>
                                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                    </div>

                                    {/* Player Info */}
                                    <div className="flex-1">
                                      <span className="font-semibold text-gray-800 block">
                                        {player.userId?.name || player.userName || `Player ${index + 1}`}
                                      </span>
                                      <span className="text-xs text-gray-500">Player #{index + 1}</span>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    {/* Move Player Button */}
                                    <button
                                      onClick={() => {
                                        setSelectedPlayerForMovement(player);
                                        const availableGroups = groupsWithoutMatches.filter(
                                          g => g._id !== currentEditGroup._id
                                        );
                                        if (availableGroups.length > 0) {
                                          setDestinationGroupId(availableGroups[0]._id);
                                        }
                                      }}
                                      className="p-2.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                                      title="Move player to another group"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>

                                    {/* Remove Player Button */}
                                    <button
                                      onClick={() => {
                                        setCurrentEditGroup(prev => ({
                                          ...prev,
                                          players: prev.players.filter((_, i) => i !== index)
                                        }));
                                      }}
                                      className="p-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                                      title="Remove player from group"
                                    >
                                      <FiX size={18} />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FiEdit2 className="text-gray-400 text-2xl" />
                            </div>
                            <p className="text-gray-500 font-medium">No players in this group</p>
                            <p className="text-gray-400 text-sm mt-1">Add players to get started</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ⚙️ RIGHT COLUMN - Match Format Configuration */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-gradient-to-r from-green-500 to-emerald-500">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FiTable className="text-white text-lg" />
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Match Format Settings
                      </h3>
                    </div>

                    {/* Tournament Default & Current Config Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tournament Default Info */}
                      {tournament && tournament.setFormat && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-50 border-2 border-orange-200 rounded-xl p-4 shadow-sm">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/30 rounded-full -mr-12 -mt-12"></div>
                          <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                                <FiFlag className="text-white text-xs" />
                              </div>
                              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Tournament Default</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1.5 bg-white rounded-lg shadow-sm font-bold text-orange-600 text-base">
                                {tournament.setFormat === 'bestOf3' && 'Best of 3 Sets'}
                                {tournament.setFormat === 'bestOf5' && 'Best of 5 Sets'}
                                {tournament.setFormat === 'bestOf7' && 'Best of 7 Sets'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Current Configuration Display */}
                      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-amber-50 border-2 border-emerald-200 rounded-xl p-4 shadow-sm">
                        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          Current Configuration
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-emerald-100">
                            <div className="text-orange-500 font-bold text-[10px] uppercase">Sets</div>
                            <div className="text-gray-900 text-xl font-black leading-tight">{groupMatchFormat.totalSets || 5}</div>
                            <div className="text-[9px] font-medium text-orange-500">First to {Math.ceil((groupMatchFormat.totalSets || 5) / 2)}</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 text-center shadow-sm border border-green-100">
                            <div className="text-green-600 font-bold text-[10px] uppercase">Games</div>
                            <div className="text-green-900 text-xl font-black leading-tight">{groupMatchFormat.totalGames || 5}</div>
                            <div className="text-[9px] font-medium text-green-500">First to {Math.ceil((groupMatchFormat.totalGames || 5) / 2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sets & Games side-by-side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sets Configuration */}
                      <div className="bg-gradient-to-br from-orange-50 to-cyan-50 rounded-xl p-4 border-2 border-orange-100">
                        <label className="block text-xs font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                          Sets per Match
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[3, 5, 7].map(sets => (
                            <button
                              key={sets}
                              onClick={() => setGroupMatchFormat(prev => ({
                                ...prev,
                                totalSets: sets,
                                setsToWin: Math.ceil(sets / 2)
                              }))}
                              className={`group relative p-2.5 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${groupMatchFormat.totalSets === sets
                                ? 'border-orange-500 bg-gradient-to-br from-orange-500 to-orange-500 text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                                }`}
                            >
                              <div className="text-center">
                                <div className={`text-xl font-black leading-tight ${groupMatchFormat.totalSets === sets ? 'text-white' : 'text-orange-500'}`}>
                                  {sets}
                                </div>
                                <div className="text-[10px] font-bold opacity-80">{sets} Sets</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Games Configuration */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
                        <label className="block text-xs font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Games per Set
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[3, 5, 7].map(games => (
                            <button
                              key={games}
                              onClick={() => setGroupMatchFormat(prev => ({
                                ...prev,
                                totalGames: games,
                                gamesToWin: Math.ceil(games / 2)
                              }))}
                              className={`group relative p-2.5 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${groupMatchFormat.totalGames === games
                                ? 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                                }`}
                            >
                              <div className="text-center">
                                <div className={`text-xl font-black leading-tight ${groupMatchFormat.totalGames === games ? 'text-white' : 'text-green-600'}`}>
                                  {games}
                                </div>
                                <div className="text-[10px] font-bold opacity-80">{games} Games</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview - More Compact */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-100 via-rose-100 to-orange-100 border-2 border-emerald-300 rounded-xl p-4 shadow-lg">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-300/30 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                            <span className="text-base">📊</span>
                            <span>Live Preview</span>
                          </h4>
                        </div>
                        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-emerald-200">
                          <div className="flex items-center justify-center gap-6">
                            <div className="text-xl font-black text-gray-900">
                              <span className="text-orange-500">{groupMatchFormat.totalSets || 5}</span>
                              <span className="text-gray-400 mx-1">sets</span>
                              <span className="text-gray-400">×</span>
                              <span className="text-green-600 ml-1">{groupMatchFormat.totalGames || 5}</span>
                              <span className="text-gray-400 ml-1">games</span>
                            </div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div className="flex gap-2">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 font-bold uppercase">To Win Match</span>
                                <span className="text-xs font-black text-orange-600">{Math.ceil((groupMatchFormat.totalSets || 5) / 2)} Sets</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 font-bold uppercase">To Win Set</span>
                                <span className="text-xs font-black text-green-700">{Math.ceil((groupMatchFormat.totalGames || 5) / 2)} Games</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🚀 ACTION BUTTONS - Premium Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-orange-50/30 border-t-2 border-gray-200 rounded-b-3xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Note:</span>
                    <span>Match format changes apply to future matches</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsEditGroupModalOpen(false);
                        setCurrentEditGroup(null);
                      }}
                      className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 font-semibold text-gray-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        // Update group details
                        await handleUpdateGroup(currentEditGroup);

                        // Update match format
                        const formatResult = await updateGroupMatchFormat(currentEditGroup._id, groupMatchFormat);
                        if (formatResult.success) {
                          toast.info(`✅ Group updated successfully!\n\nMatch Format:\n• ${groupMatchFormat.totalSets} Sets (first to ${Math.ceil(groupMatchFormat.totalSets / 2)} wins match)\n• ${groupMatchFormat.totalGames} Games per set (first to ${Math.ceil(groupMatchFormat.totalGames / 2)} wins set)\n• ${groupMatchFormat.pointsToWinGame} points per game`);
                        }
                      }}
                      disabled={isUpdatingFormat}
                      className={`px-8 py-3 rounded-xl text-white font-bold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${isUpdatingFormat
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 via-emerald-600 to-rose-600 hover:from-gray-700 hover:via-emerald-700 hover:to-pink-700 shadow-xl hover:shadow-2xl'
                        }`}
                    >
                      {isUpdatingFormat ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          <span>Update Group & Format</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Player Movement Modal */}
      {
        selectedPlayerForMovement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-[scaleIn_0.2s_ease-out]">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Move Player
                </h2>
                <button
                  onClick={() => {
                    setSelectedPlayerForMovement(null);
                    setDestinationGroupId('');
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  Moving player:
                  <span className="ml-1 font-semibold text-gray-900">
                    {selectedPlayerForMovement.userId?.name ||
                      selectedPlayerForMovement.userName}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination Group
                  </label>
                  <select
                    value={destinationGroupId}
                    onChange={(e) => setDestinationGroupId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select a group</option>
                    {groupsWithoutMatches
                      .filter(group => group._id !== currentEditGroup?._id)
                      .map(group => (
                        <option key={group._id} value={group._id}>
                          {group.groupName ||
                            `Group ${groupsWithoutMatches.indexOf(group) + 1}`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t">
                <button
                  onClick={() => {
                    setSelectedPlayerForMovement(null);
                    setDestinationGroupId('');
                  }}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!destinationGroupId) {
                      toast.info('Please select a destination group');
                      return;
                    }

                    try {
                      const destinationGroup = groupsWithoutMatches.find(
                        g => g._id === destinationGroupId
                      );
                      if (!destinationGroup) throw new Error('Destination group not found');

                      const updatedDestinationPlayers = [
                        ...destinationGroup.players,
                        selectedPlayerForMovement,
                      ];

                      const updateDestinationResponse = await axios.put(
                        `/api/tournaments/bookinggroups/${destinationGroup._id}`,
                        {
                          groupName: destinationGroup.groupName,
                          players: updatedDestinationPlayers
                            .map(p => p.playerId || p._id || p.id || p.bookingId)
                            .filter(Boolean),
                          category: destinationGroup.category || 'Open Category',
                        }
                      );

                      if (!updateDestinationResponse.data.success) {
                        throw new Error(updateDestinationResponse.data.message);
                      }

                      const updatedCurrentPlayers = currentEditGroup.players.filter(
                        p =>
                          !(
                            p._id && selectedPlayerForMovement._id
                              ? p._id.toString() ===
                              selectedPlayerForMovement._id.toString()
                              : p.playerId.toString() ===
                              selectedPlayerForMovement.playerId.toString()
                          )
                      );

                      const updatedCurrentGroup = {
                        ...currentEditGroup,
                        players: updatedCurrentPlayers,
                      };

                      const updateCurrentResponse = await axios.put(
                        `/api/tournaments/bookinggroups/${currentEditGroup._id}`,
                        {
                          groupName: updatedCurrentGroup.groupName,
                          players: updatedCurrentGroup.players
                            .map(p => p.playerId || p._id || p.id || p.bookingId)
                            .filter(Boolean),
                          category: updatedCurrentGroup.category || 'Open Category',
                        }
                      );

                      if (!updateCurrentResponse.data.success) {
                        throw new Error(updateCurrentResponse.data.message);
                      }

                      setCurrentEditGroup(updatedCurrentGroup);

                      setGroups(prev =>
                        prev.map(g =>
                          g._id === currentEditGroup._id
                            ? updatedCurrentGroup
                            : g._id === destinationGroup._id
                              ? updateDestinationResponse.data.data
                              : g
                        )
                      );

                      setGroupsWithoutMatches(prev =>
                        prev.map(g =>
                          g._id === currentEditGroup._id
                            ? updatedCurrentGroup
                            : g._id === destinationGroup._id
                              ? updateDestinationResponse.data.data
                              : g
                        )
                      );

                      setSelectedPlayerForMovement(null);
                      setDestinationGroupId('');
                      toast.info('Player moved successfully!');
                    } catch (error) {
                      console.error('Error moving player:', error);
                      toast.info('Error moving player: ' + error.message);
                    }
                  }}
                  disabled={!destinationGroupId}
                  className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Move Player
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Bulk Score Upload Modal (Reusable) */}
      <BulkScoreUploadModal
        isOpen={bulkScoreModal.open}
        onClose={() => setBulkScoreModal({ open: false, matches: [], groupId: null, title: "" })}
        onSuccess={() => {
          fetchMatches();
          if (round2Groups.length > 0) fetchRound2Groups();
          fetchKnockoutMatches();
        }}
        matches={bulkScoreModal.matches}
        tournamentId={tournamentId}
        groupId={bulkScoreModal.groupId}
        matchType="player"
        maxSets={getMatchFormat().maxSets}
        setsToWin={getMatchFormat().setsToWin}
        title={bulkScoreModal.title}
      />

      {/* Bulk Result Upload Modal (CSV/Excel) */}
      <BulkResultUploadModal
        isOpen={showCsvUpload}
        onClose={() => setShowCsvUpload(false)}
        onSuccess={() => {
          fetchMatches();
          if (round2Groups.length > 0) fetchRound2Groups();
          fetchKnockoutMatches();
        }}
        tournamentId={tournamentId}
        matchType="player"
        title="Bulk Result Upload (CSV/Excel)"
      />
    </div >
  );
}