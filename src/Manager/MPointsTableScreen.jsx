import { useState, useEffect } from "react";
import { FiStar, FiArrowLeft, FiUsers, FiTarget, FiAward, FiList } from "react-icons/fi";
import { FaTrophy, FaMedal } from "react-icons/fa";
import { MdOutlineEmojiEvents, MdWarning } from "react-icons/md";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import BulkScoreUploadModal from "./BulkScoreUploadModal";

const MPointsTableScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId, groupId } = useParams();

  // Get round information from navigation state (default to 1 for backward compatibility)
  const round = location.state?.round || 1;
  const isRound2 = round === 2;

  // State variables
  const [loading, setLoading] = useState(true);
  const [pointsData, setPointsData] = useState([]);
  const [showTopPlayersModal, setShowTopPlayersModal] = useState(false);
  const [topPlayersCount, setTopPlayersCount] = useState('');
  const [topPlayers, setTopPlayers] = useState([]);
  const [showTopPlayersList, setShowTopPlayersList] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [completedMatches, setCompletedMatches] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [playersAlreadySelected, setPlayersAlreadySelected] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    if (tournamentId && groupId) {
      fetchData();
      fetchTopPlayers();
    } else {
      setError("Tournament ID and Group ID are required");
      setLoading(false);
    }
  }, [tournamentId, groupId]);

  // Fetch match data and calculate points table
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch matches for the group - using correct API endpoint from PDF
      const matchesResponse = await axios.get(
        `/api/tournaments/matches/${tournamentId}/${groupId}`
      );

      // Handle response - check if we got matches even if success is false
      if (!matchesResponse.data.success && (!matchesResponse.data.matches || matchesResponse.data.matches.length === 0)) {
        console.log("No matches found for this group:", matchesResponse.data.message);
        // Still continue to show empty state
      }

      const fetchedMatches = matchesResponse.data.matches || [];
      setMatches(fetchedMatches);
      setTotalMatches(fetchedMatches.length);

      // Fetch scores for each match using correct endpoint from PDF
      const matchesWithScores = await Promise.all(
        fetchedMatches.map(async (match) => {
          try {
            const scoreResponse = await axios.get(
              `/api/tournaments/matches/${match._id}/scores`
            );

            // Handle array format response as per PDF specification
            if (Array.isArray(scoreResponse.data) && scoreResponse.data.length > 0) {
              const scores = scoreResponse.data; // Array of score objects
              return {
                ...match,
                scores: scores, // Store complete scores array
                // Extract latest/primary score for compatibility
                ...scores[0] // Spread first score object for backward compatibility
              };
            }
            return {
              ...match,
              scores: [] // Empty array if no scores
            };
          } catch (error) {
            console.log("Error fetching score for match:", match._id, error);
            return {
              ...match,
              scores: [] // Empty array on error
            };
          }
        })
      );

      // Count completed matches based on status and presence of scores
      const completedCount = matchesWithScores.filter(match =>
        match.status === 'COMPLETED' && match.scores && match.scores.length > 0
      ).length;
      setCompletedMatches(completedCount);

      calculatePointsTable(matchesWithScores);
    } catch (error) {
      console.error("Error fetching match data:", error);
      setError("Failed to fetch tournament data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing top players
  const fetchTopPlayers = async () => {
    try {
      // 1. Check for Top Players (Round 1 advancement)
      const topResponse = await axios.get(
        `/api/tournaments/topplayers/${tournamentId}/${groupId}`
      );

      if (topResponse.data.success && topResponse.data.data?.topPlayers?.length > 0) {
        setTopPlayers(topResponse.data.data.topPlayers);
        setShowTopPlayersList(true);
        setPlayersAlreadySelected(true);
        return; // Found them, no need to check further
      }

      // 2. Check for Super Players (Round 2 winners) if applicable
      if (isRound2) {
        const superResponse = await axios.get(
          `/api/tournaments/superplayers/${tournamentId}`
        );

        if (superResponse.data.success && superResponse.data.superPlayers?.length > 0) {
          // Check if any super players were selected from THIS group
          const selectedFromThisGroup = superResponse.data.superPlayers.filter(
            sp => sp.sourceGroupId === groupId
          );

          if (selectedFromThisGroup.length > 0) {
            setTopPlayers(selectedFromThisGroup.map(sp => ({
              ...sp,
              userName: sp.playerName || sp.userName // Map back for display compatibility
            })));
            setShowTopPlayersList(true);
            setPlayersAlreadySelected(true);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching top/super players:", error);
    }
  };

  // Calculate points table from matches - Enhanced for complete statistics
  const calculatePointsTable = (matchesWithScores) => {
    console.log('Calculating points table with matches:', matchesWithScores);
    const table = {};

    // Initialize players from matches
    matchesWithScores.forEach((match) => {
      const { player1, player2 } = match;

      // Ensure we have valid player data
      if (!player1?.playerId || !player2?.playerId) return;

      // Initialize player1 in table
      if (!table[player1.playerId]) {
        table[player1.playerId] = {
          playerId: player1.playerId,
          userName: player1.userName || player1.name || 'Unknown Player',
          played: 0,
          won: 0,
          lost: 0,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0,
          totalScore: 0,
          points: 0 // Tournament points (2 for win, 0 for loss)
        };
      }

      // Initialize player2 in table
      if (!table[player2.playerId]) {
        table[player2.playerId] = {
          playerId: player2.playerId,
          userName: player2.userName || player2.name || 'Unknown Player',
          played: 0,
          won: 0,
          lost: 0,
          setsWon: 0,
          setsLost: 0,
          gamesWon: 0,
          gamesLost: 0,
          totalScore: 0,
          points: 0 // Tournament points (2 for win, 0 for loss)
        };
      }
    });

    // Process completed matches only
    matchesWithScores.forEach((match) => {
      const { player1, player2, scores } = match;

      // Skip if no valid player data
      if (!player1?.playerId || !player2?.playerId) return;

      console.log('Processing match:', {
        matchId: match._id,
        status: match.status,
        scoresLength: scores?.length || 0,
        player1Name: player1.userName || player1.name,
        player2Name: player2.userName || player2.name
      });

      // Only process completed matches with scores
      if (match.status === "COMPLETED" && scores?.length > 0) {
        const score = scores[0]; // Get first/primary score
        console.log('Score data:', score);

        // Determine match winner from score data - handle both formats
        // Regular matches: score.winner = { playerId, name }
        // SuperMatch: score.winner = playerId string
        const winnerId = score.winner?.playerId || score.winner;
        console.log('Winner data:', { winnerId, original: score.winner });

        // Update match statistics
        table[player1.playerId].played += 1;
        table[player2.playerId].played += 1;

        // Track wins/losses and tournament points
        if (winnerId?.toString() === player1.playerId.toString()) {
          table[player1.playerId].won += 1;
          table[player1.playerId].points += 2; // Winner gets 2 points
          table[player2.playerId].lost += 1;
          // No points for loser (remains 0)
        } else if (winnerId?.toString() === player2.playerId.toString()) {
          table[player2.playerId].won += 1;
          table[player2.playerId].points += 2; // Winner gets 2 points
          table[player1.playerId].lost += 1;
          // No points for loser (remains 0)
        }

        // Enhanced statistics collection - handle both regular Match and Score model data
        // Priority: direct player data > Score model data > calculated from sets
        if (score.player1?.sets !== undefined && score.player2?.sets !== undefined) {
          // Use data from regular match (via getMatchScores)
          table[player1.playerId].gamesWon += score.player1.sets || 0;
          table[player1.playerId].gamesLost += score.player2.sets || 0;
          table[player2.playerId].gamesWon += score.player2.sets || 0;
          table[player2.playerId].gamesLost += score.player1.sets || 0;
        } else if (score.gamesWonA > 0 || score.gamesWonB > 0) {
          // Use backend calculated values
          table[player1.playerId].gamesWon += score.gamesWonA || 0;
          table[player1.playerId].gamesLost += score.gamesWonB || 0;
          table[player2.playerId].gamesWon += score.gamesWonB || 0;
          table[player2.playerId].gamesLost += score.gamesWonA || 0;
        } else {
          // Fallback: calculate games from set scores
          const sets = [score.setOne, score.setTwo, score.setThree].filter(Boolean);
          sets.forEach(setData => {
            if (Array.isArray(setData) && setData.length === 2) {
              const gamesA = parseInt(setData[0]) || 0;
              const gamesB = parseInt(setData[1]) || 0;
              table[player1.playerId].gamesWon += gamesA;
              table[player1.playerId].gamesLost += gamesB;
              table[player2.playerId].gamesWon += gamesB;
              table[player2.playerId].gamesLost += gamesA;
            }
          });
        }

        // Total scores - use backend values if available, otherwise estimate from games
        if (score.totalScoreA > 0 || score.totalScoreB > 0) {
          // Use backend calculated values
          table[player1.playerId].totalScore += score.totalScoreA || 0;
          table[player2.playerId].totalScore += score.totalScoreB || 0;
        } else {
          // Fallback: estimate total scores from this match's games (11 points per game)
          const sets = [score.setOne, score.setTwo, score.setThree].filter(Boolean);
          let matchScoreA = 0, matchScoreB = 0;
          sets.forEach(setData => {
            if (Array.isArray(setData) && setData.length === 2) {
              const gamesA = parseInt(setData[0]) || 0;
              const gamesB = parseInt(setData[1]) || 0;
              matchScoreA += gamesA * 11; // Assume 11 points per game won
              matchScoreB += gamesB * 11;
            }
          });
          table[player1.playerId].totalScore += matchScoreA;
          table[player2.playerId].totalScore += matchScoreB;
        }

        // Count sets won/lost from set scores
        const sets = [score.setOne, score.setTwo, score.setThree].filter(Boolean);
        sets.forEach(setData => {
          let setScoreA = 0, setScoreB = 0;

          // Handle different set score formats
          if (Array.isArray(setData) && setData.length === 2) {
            // Array format: [scoreA, scoreB]
            setScoreA = parseInt(setData[0]) || 0;
            setScoreB = parseInt(setData[1]) || 0;
          } else if (typeof setData === 'string' && setData.includes('-')) {
            // String format: "scoreA-scoreB"
            const [scoreA, scoreB] = setData.split('-').map(s => parseInt(s.trim()) || 0);
            setScoreA = scoreA;
            setScoreB = scoreB;
          }

          // Count set win/loss
          if (setScoreA > setScoreB) {
            table[player1.playerId].setsWon += 1;
            table[player2.playerId].setsLost += 1;
          } else if (setScoreB > setScoreA) {
            table[player2.playerId].setsWon += 1;
            table[player1.playerId].setsLost += 1;
          }
          // Ties are ignored (shouldn't happen in table tennis)
        });

        console.log('Updated player stats:', {
          player1: table[player1.playerId],
          player2: table[player2.playerId]
        });
      }
    });

    // Convert table to array and sort by comprehensive ranking rules
    const sortedData = Object.entries(table).map(([playerId, stats]) => ({
      playerId,
      ...stats
    })).sort((a, b) => {
      // Primary: Tournament points (2 points per match win)
      if (b.points !== a.points) return b.points - a.points;

      // Secondary: Matches won
      if (b.won !== a.won) return b.won - a.won;

      // Tertiary: Sets difference (won - lost)
      const setsA = a.setsWon - a.setsLost;
      const setsB = b.setsWon - b.setsLost;
      if (setsB !== setsA) return setsB - setsA;

      // Quaternary: Games difference (won - lost)
      const gamesA = a.gamesWon - a.gamesLost;
      const gamesB = b.gamesWon - b.gamesLost;
      if (gamesB !== gamesA) return gamesB - gamesA;

      // Quinary: Total scores difference
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;

      // Final: Alphabetical by name
      return a.userName.localeCompare(b.userName);
    });

    console.log('Final points table data:', sortedData);
    console.log(`Processed ${matchesWithScores.length} total matches`);
    console.log(`Completed matches with scores: ${matchesWithScores.filter(m => m.status === 'COMPLETED' && m.scores?.length > 0).length}`);

    setPointsData(sortedData);
  };

  // Bulk sync all tournament scores (for already played matches)
  const handleBulkSync = async () => {
    try {
      setSyncing(true);
      const response = await axios.post(
        `/api/tournaments/${tournamentId}/bulk-sync-scores`
      );

      if (response.data.success) {
        alert(`Bulk sync completed! ${response.data.summary.successfulSync} matches synced successfully.`);
        // Refresh the data after sync
        await fetchData();
      } else {
        alert('Failed to bulk sync scores');
      }
    } catch (error) {
      console.error('Error during bulk sync:', error);
      alert(`Failed to bulk sync: ${error.response?.data?.message || error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Check if all matches are completed
  const areAllMatchesCompleted = () => {
    return completedMatches === totalMatches && totalMatches > 0;
  };

  // Save players to database (conditional based on round)
  const saveTopPlayersToDatabase = async (selectedPlayers) => {
    try {
      if (isRound2) {
        // Round 2: Save to Super Players
        const superPlayersResponse = await axios.post(
          `/api/tournaments/superplayers/save`,
          {
            tournamentId: tournamentId,
            groupId: `super_players_${tournamentId}`, // Single groupId for all Super Players in this tournament
            groupName: "Super Players - Round 2 Winners",
            round: 2, // Mark as Round 2
            roundType: 'super_players',
            players: selectedPlayers.map((player) => ({
              playerId: player.playerId || player.userId, // Use proper playerId
              playerName: player.userName,
              category: player.category || 'Open',
              points: player.points,
              setsWon: player.setsWon,
              setsLost: player.setsLost,
              won: player.won,
              lost: player.lost,
              played: player.played,
              status: 'super_player', // Mark as Super Player
              sourceRound: 2,
              sourceGroupId: groupId
            }))
          }
        );

        if (superPlayersResponse.data.success) {
          alert(`Super Players selected successfully!\n\n${selectedPlayers.length} players from this group have been added to the Super Players section and are ready for the final knockout phase.`);
          setTopPlayers(selectedPlayers); // Still show them locally
          setShowTopPlayersList(true);
          setPlayersAlreadySelected(true); // Disable button immediately

          // Trigger page reload to show updated Super Players section
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          alert("Failed to save Super Players list");
        }
      } else {
        // Round 1: Save to Top Players
        const topPlayersResponse = await axios.post(
          `/api/tournaments/topplayers/save`,
          {
            tournamentId: tournamentId,
            groupId: groupId,
            topPlayers: selectedPlayers.map((player) => ({
              playerId: player.playerId,
              playerName: player.userName,
              userName: player.userName,
              points: player.points,
              setsWon: player.setsWon,
              setsLost: player.setsLost,
              won: player.won,
              lost: player.lost,
              played: player.played,
            })),
          }
        );

        if (topPlayersResponse.data.success) {
          alert(`Top Players selected successfully!\n\n${selectedPlayers.length} players from this group have been selected as Top Players.`);
          setTopPlayers(selectedPlayers);
          setShowTopPlayersList(true);
          setPlayersAlreadySelected(true); // Disable button immediately
        } else {
          alert("Failed to save Top Players list");
        }
      }
    } catch (error) {
      console.error("Error saving players:", error);

      // Handle duplicate player error with detailed message
      if (error.response?.data?.duplicatePlayers) {
        const duplicates = error.response.data.duplicatePlayers;
        const duplicateList = duplicates.map(p =>
          `• ${p.playerName} (already selected from ${p.existingGroup})`
        ).join('\n');

        alert(`❌ Cannot Select Players\n\nThe following players are already in the top players list:\n\n${duplicateList}\n\nPlease choose different players.`);
      } else if (error.response?.data?.message) {
        alert(`Failed to save players list:\n\n${error.response.data.message}`);
      } else {
        alert(`Failed to save players list: ${error.message}`);
      }
    }
  };

  // Save Super Players separately
  const saveSuperPlayersToDatabase = async (selectedSuperPlayers) => {
    try {
      const response = await axios.post(
        `/api/tournaments/superplayers/save`,
        {
          tournamentId,
          players: selectedSuperPlayers.map((player) => ({
            playerId: player.playerId || player.userId,
            playerName: player.userName,
            category: player.category || "Open",
            points: player.points,
            setsWon: player.setsWon,
            setsLost: player.setsLost,
            won: player.won,
            lost: player.lost,
            played: player.played,
            status: "super_player",
            sourceRound: 2,
            sourceGroupId: groupId
          }))
        }
      );

      if (response.data.success) {
        alert("Super Players saved successfully!\n\nThese players are now available for the knockout bracket.");
        setSuperPlayers(selectedSuperPlayers);

        // Reload for fresh data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert("Failed to save Super Players list");
      }
    } catch (error) {
      console.error("Error saving Super Players:", error);
      alert(`Failed to save Super Players list: ${error.message}`);
    }
  };

  const handleSelectSuperPlayers = async () => {
    if (!areAllMatchesCompleted()) {
      alert(`Cannot select Super Players until all matches are completed. 
           Completed: ${completedMatches}/${totalMatches}`);
      return;
    }

    const count = parseInt(superPlayersCount);
    if (count && count > 0 && count <= pointsData.length) {
      const selectedSuperPlayers = pointsData.slice(0, count);
      await saveSuperPlayersToDatabase(selectedSuperPlayers);
      setShowSuperPlayersModal(false);
      setSuperPlayersCount('');
    } else {
      alert(`Please enter a valid number between 1 and ${pointsData.length}`);
    }
  };

  // Handle top players modal submission
  const handleSelectTopPlayers = async () => {
    // Validate that all matches are completed
    if (!areAllMatchesCompleted()) {
      alert(`Cannot select top players until all matches are completed. 

Completed: ${completedMatches}/${totalMatches} matches

Please complete all group stage matches first.`);
      return;
    }

    const count = parseInt(topPlayersCount);
    if (count && count > 0 && count <= pointsData.length) {
      const selectedTopPlayers = pointsData.slice(0, count);
      await saveTopPlayersToDatabase(selectedTopPlayers);
      setShowTopPlayersModal(false);
      setTopPlayersCount('');
    } else {
      alert(`Please enter a valid number between 1 and ${pointsData.length}`);
    }
  };

  // Loading component
  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="bg-white shadow-md rounded-[16px] p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading points table...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="p-4 space-y-6">
        <div className="bg-white shadow-md rounded-[16px] p-8">
          <div className="text-center text-red-500">
            <FiTarget className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error Loading Data</p>
            <p>{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {isRound2 ? "Points Table - Round 2" : "Points Table - Round 1"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Match Progress: {completedMatches}/{totalMatches} completed
              {areAllMatchesCompleted() ? " ✅" : " ⏳"}
            </p>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="bg-white shadow-md rounded-[16px] p-6">
        {/* Top Players Section */}
        {showTopPlayersList && topPlayers.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaTrophy className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-blue-900">
                {isRound2 ? `${topPlayers.length} Super Players Selected` : `Top ${topPlayers.length} Qualified Players`}
              </h2>
            </div>
            <div className="grid gap-3">
              {topPlayers.map((player, index) => (
                <div
                  key={player.userName}
                  className="flex items-center gap-4 bg-white rounded-lg p-4 border border-blue-100 shadow-sm"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{player.userName}</h3>
                    <div className="flex gap-6 text-sm text-gray-600 mt-1">
                      <span>Points: <span className="font-medium text-blue-600">{player.points}</span></span>
                      <span>Won: <span className="font-medium">{player.won}</span></span>
                      <span>Sets: <span className="font-medium">{player.setsWon}-{player.setsLost}</span></span>
                    </div>
                  </div>
                  <FiStar className="w-5 h-5 text-yellow-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Points Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Rankings</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiUsers className="w-4 h-4" />
              {pointsData.length} Players
            </div>
          </div>

          {/* Table Header - Enhanced per DOCX Section 6.1 Requirements */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <div className="grid grid-cols-9 gap-2 font-semibold text-sm">
              <div className="col-span-2">Player</div>
              <div className="text-center">P</div>
              <div className="text-center">W</div>
              <div className="text-center">L</div>
              <div className="text-center">SW-SL</div>
              <div className="text-center">GW-GL</div>
              <div className="text-center">TS</div>
              <div className="text-center">Pts</div>
            </div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {pointsData.map((player, index) => (
              <div
                key={player.userName}
                className={`grid grid-cols-9 gap-2 p-4 rounded-lg border transition-all hover:shadow-md ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } ${index < 3 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                    }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{player.userName}</span>
                </div>
                <div className="text-center text-gray-700 text-sm">{player.played}</div>
                <div className="text-center font-medium text-green-600 text-sm">{player.won}</div>
                <div className="text-center font-medium text-red-600 text-sm">{player.lost}</div>
                <div className="text-center text-gray-700 text-sm">{player.setsWon}-{player.setsLost}</div>
                {/* DOCX Requirement 6.1: Games Won/Lost */}
                <div className="text-center text-purple-600 text-sm font-medium">{player.gamesWon || 0}-{player.gamesLost || 0}</div>
                {/* DOCX Requirement 6.1: Total Scores (cumulative points) */}
                <div className="text-center text-indigo-600 text-sm font-medium">{player.totalScore || 0}</div>
                <div className="text-center font-bold text-blue-600 text-sm">{player.points || 0}</div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {pointsData.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">No Match Results Yet</h3>
              <p className="text-gray-400 mb-4">Points table will appear once matches are completed and scores are synced.</p>
              {totalMatches > 0 && (
                <div className="text-sm text-blue-600">
                  {totalMatches} matches found, {completedMatches} completed
                  {completedMatches > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={handleBulkSync}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                      >
                        🔄 Sync Completed Matches
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Legend with Complete Tournament Statistics */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FaTrophy className="w-5 h-5 text-yellow-500" />
            Complete Tournament Statistics Guide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
            <div><span className="font-medium">P</span> - Matches Played</div>
            <div><span className="font-medium text-green-600">W</span> - Matches Won</div>
            <div><span className="font-medium text-red-600">L</span> - Matches Lost</div>
            <div><span className="font-medium">SW-SL</span> - Sets Won-Lost</div>
            <div><span className="font-medium text-purple-600">GW-GL</span> - Games Won-Lost</div>
            <div><span className="font-medium text-indigo-600">TS</span> - Total Points Scored</div>
            <div><span className="font-medium text-blue-600">Pts</span> - Tournament Points (2 per win)</div>
          </div>

          <div className="bg-blue-50 rounded border-l-4 border-blue-400 p-3">
            <div className="text-blue-900 font-medium mb-2 flex items-center gap-2">
              <FiTarget className="w-4 h-4" />
              Official Ranking System:
            </div>
            <div className="text-blue-800 text-xs space-y-1">
              <div><span className="font-bold text-blue-600">1.</span> <strong>Tournament Points</strong> - 2 points per match win</div>
              <div><span className="font-bold text-blue-600">2.</span> <strong>Matches Won</strong> - Head-to-head victories</div>
              <div><span className="font-bold text-blue-600">3.</span> <strong>Sets Difference</strong> - (Sets Won - Sets Lost)</div>
              <div><span className="font-bold text-blue-600">4.</span> <strong>Games Difference</strong> - (Games Won - Games Lost)</div>
              <div><span className="font-bold text-blue-600">5.</span> <strong>Total Points</strong> - Cumulative scoring from all games</div>
              <div><span className="font-bold text-blue-600">6.</span> <strong>Alphabetical</strong> - Final tiebreaker</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            ✨ All statistics are automatically calculated from live match data and synchronized in real-time
          </div>
        </div>

        {/* Match Completion Status & Select Top Players Button */}
        {pointsData.length > 0 && (
          <div className="mt-6 space-y-4">
            {/* Match Completion Status */}
            <div className={`p-4 rounded-lg border-2 ${playersAlreadySelected
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : areAllMatchesCompleted()
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
              <div className="flex items-center justify-center gap-2">
                {playersAlreadySelected ? (
                  <>
                    🎯 <span className="font-semibold">Players already selected for this group!</span>
                    {isRound2 ? " Super Players have been chosen." : " Top players have been chosen and saved."}
                  </>
                ) : areAllMatchesCompleted() ? (
                  <>
                    ✅ <span className="font-semibold">All matches completed!</span>
                    {isRound2 ? " Ready to select Super Players." : " Ready to select top players."}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div>
                      ⏳ <span className="font-semibold">{totalMatches - completedMatches} matches remaining.</span>
                      {isRound2 ? " Complete all matches to select Super Players." : " Complete all group stage matches to select top players."}
                    </div>
                    <button
                      className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-purple-500 hover:bg-purple-600 w-auto"
                      onClick={() => setShowBulkUpload(true)}
                    >
                      Bulk Score Upload ({totalMatches - completedMatches} matches)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Select Top Players Button */}
            <div className="text-center">
              <button
                onClick={() => setShowTopPlayersModal(true)}
                disabled={!areAllMatchesCompleted() || playersAlreadySelected}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto ${playersAlreadySelected
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : areAllMatchesCompleted()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                title={
                  playersAlreadySelected
                    ? 'Players have already been selected for this group'
                    : areAllMatchesCompleted()
                      ? ''
                      : 'Complete all matches first'
                }
              >
                <FaTrophy className="w-5 h-5" />
                {playersAlreadySelected
                  ? (isRound2 ? "Super Players Already Selected" : "Top Players Already Selected")
                  : (isRound2 ? "Select Super Players for Final Knockout" : "Select Top Players for Next Round")
                }
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Players Selection Modal */}
      {showTopPlayersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {isRound2 ? "Select Super Players" : "Select Top Players"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isRound2
                  ? "Choose how many top-ranked players from this group will become Super Players and proceed to the final knockout tournament"
                  : "Choose how many top-ranked players from this group should advance to Round 2 as potential Super Players"
                }
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                {!areAllMatchesCompleted() && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <div className="flex items-center gap-2">
                        <MdWarning className="w-4 h-4 text-amber-500" />
                        Complete all {totalMatches} matches first ({completedMatches} completed)
                      </div>
                    </p>
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of players (1-{pointsData.length})
                </label>
                <input
                  type="number"
                  min="1"
                  max={pointsData.length}
                  value={topPlayersCount}
                  onChange={(e) => setTopPlayersCount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of players"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTopPlayersModal(false);
                    setTopPlayersCount('');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSelectTopPlayers}
                  disabled={!topPlayersCount || parseInt(topPlayersCount) < 1 || parseInt(topPlayersCount) > pointsData.length || !areAllMatchesCompleted()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Score Upload Modal */}
      <BulkScoreUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onSuccess={() => fetchData()}
        matches={matches.filter(m => m.status !== 'COMPLETED' && m.status !== 'completed')}
        tournamentId={tournamentId}
        groupId={groupId}
        matchType="player"
        maxSets={5}
        setsToWin={3}
        title={`Bulk Score Upload — ${isRound2 ? 'Round 2' : 'Group Stage'}`}
      />
    </div>
  );
};

export default MPointsTableScreen;