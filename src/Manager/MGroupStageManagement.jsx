import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaMedal, FaTrophy } from "react-icons/fa";
import { ChevronDown, Check } from 'lucide-react';
import { FiPlus, FiX, FiLock, FiCheck, FiTrash, FiAlertTriangle, FiInfo } from "react-icons/fi";
import { MdRocket, MdSportsKabaddi, MdFlashOn } from "react-icons/md";
import { GiTrophyCup, GiLaurelCrown } from "react-icons/gi";
import { BiTrophy } from "react-icons/bi";
import axios from "axios";
import GroupsTab from "./MGrouptabs";
import { useNavigate, useSearchParams } from "react-router-dom";

const GroupStageManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  // Tournament and tab states
  const [tournament, setTournament] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Registered Players"); // Default to Registered Players
  const [selectedSubTab, setSelectedSubTab] = useState("Registered Players");
  const [selectedRegisterPlayerCategory, setSelectedRegisterPlayerCategory] = useState('all');
  const [selectedTopPlayerCategory, setSelectedTopPlayerCategory] = useState('Open');
  const [selectedSuperPlayerCategory, setSelectedSuperPlayerCategory] = useState('Open');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("random");
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [superPlayers, setSuperPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]); // For group creation
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Pagination and search states
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState([]);

  // Player status tracking
  const [playerGroups, setPlayerGroups] = useState({}); // Maps playerId to { category: groupName }
  const [seededPlayers, setSeededPlayers] = useState([]); // Array of seeded player IDs

  // Knockout tournament states
  const [showKnockoutModal, setShowKnockoutModal] = useState(false);
  const [knockoutGenerated, setKnockoutGenerated] = useState(false);
  const [knockoutSettings, setKnockoutSettings] = useState({
    courtNumber: 1,
    matchStartTime: '',
    intervalMinutes: 30
  });

  // Group creation states
  const [modalStep, setModalStep] = useState(0);
  const [numGroups, setNumGroups] = useState(0);
  const [groupNames, setGroupNames] = useState([]);
  const [groupPlayers, setGroupPlayers] = useState({});
  const [playersInGroups, setPlayersInGroups] = useState([]);

  // Delete warning modal
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  // Seeding confirmation modal
  const [showSeedingModal, setShowSeedingModal] = useState(false);
  const [playerToSeed, setPlayerToSeed] = useState(null);

  // Round 2 progression states
  const [showRound2Modal, setShowRound2Modal] = useState(false);
  const [round2Option, setRound2Option] = useState(null); // 'knockout' or 'group_stage'
  const [round2Groups, setRound2Groups] = useState([]);
  const [round2Progress, setRound2Progress] = useState(null); // Track Round 2 state
  const [isRound2Mode, setIsRound2Mode] = useState(false); // Track if we're creating Round 2 groups
  const [anyMatchesGenerated, setAnyMatchesGenerated] = useState(false);

  // Round 2 player selection
  const [selectedRound2Players, setSelectedRound2Players] = useState([]);

  // 🔥 DIRECT KNOCKOUT MODAL STATES - SEQUENTIAL FLOW
  const [showDirectKnockoutPlayerModal, setShowDirectKnockoutPlayerModal] = useState(false);
  const [showDirectKnockoutScheduleModal, setShowDirectKnockoutScheduleModal] = useState(false);
  const [selectedDirectKnockoutPlayers, setSelectedDirectKnockoutPlayers] = useState([]);
  const [knockoutSchedule, setKnockoutSchedule] = useState({
    startDate: '',
    startTime: '',
    courtNumber: 1,
    intervalMinutes: 30
  });

  // Draw Method State (Global vs Local Rules)
  const [drawMethod, setDrawMethod] = useState("global"); // 'global' or 'local'

  // Transform tournament categories to dropdown format
  const categories = [
    { value: 'all', label: 'All Categories' },
    ...(tournament?.category?.map(cat => ({
      value: cat.name.toLowerCase().replace(/\s+/g, '_'),
      label: cat.name
    })) || [
        { value: 'open', label: 'Open' }
      ])
  ];

  // Show error if no tournamentId
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

  // Fetch tournament data
  useEffect(() => {
    if (tournamentId) {
      axios
        .get(`/api/tournaments/${tournamentId}`)
        .then((response) => {
          if (response.data.success && response.data.tournament) {
            setTournament(response.data.tournament);
            // Check if knockout was already generated
            const stage = response.data.tournament.currentStage;
            if (stage === "knockout" || stage === "completed") {
              setKnockoutGenerated(true);
            }
            // Set default category to first category if available
            if (response.data.tournament.category && response.data.tournament.category.length > 0) {
              // Default to 'all' to show all players initially
              setSelectedRegisterPlayerCategory('all');
              setSelectedTopPlayerCategory(response.data.tournament.category[0].name);
              setSelectedSuperPlayerCategory(response.data.tournament.category[0].name);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching tournament:", error);
        });
    }
  }, [tournamentId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if any matches have been generated for the entire tournament
  const checkAnyMatchesGenerated = async () => {
    try {
      if (!tournamentId) return;

      const response = await axios.get(`/api/tournaments/direct-knockout/${tournamentId}/matches`);
      if (response.data.success && response.data.matches.length > 0) {
        setAnyMatchesGenerated(true);
        return;
      }

      // Check traditional matches
      const response2 = await axios.get(`/api/tournaments/${tournamentId}/debug-matches`);
      if (response2.data.matches && response2.data.matches.length > 0) {
        setAnyMatchesGenerated(true);
      }
    } catch (error) {
      console.error("Error checking matches:", error);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      checkAnyMatchesGenerated();
    }
  }, [tournamentId]);

  // Fetch top players for the tournament
  const fetchTopPlayers = async () => {
    try {
      const response = await axios.get(
        `/api/tournaments/topplayers/${tournamentId}`
      );
      if (response.data.success && response.data.topPlayers) {
        setTopPlayers(response.data.topPlayers);
      }
    } catch (error) {
      setTopPlayers([]);
    }
  };

  // Fetch super players from database (using existing endpoint)
  const fetchSuperPlayers = async () => {
    try {
      const response = await axios.get(
        `/api/tournaments/superplayers/${tournamentId}`
      );
      if (response.data.success && response.data.superPlayers) {
        setSuperPlayers(response.data.superPlayers);
      }
    } catch (error) {
      setSuperPlayers([]);
    }
  };

  // Generate knockout matches
  const generateKnockoutMatches = async () => {
    try {

      // Validate settings
      if (!knockoutSettings.matchStartTime) {
        toast.warn("Please select a match start time");
        return;
      }

      if (!knockoutSettings.courtNumber || knockoutSettings.courtNumber < 1) {
        toast.warn("Please enter a valid court number");
        return;
      }

      if (!knockoutSettings.intervalMinutes || knockoutSettings.intervalMinutes < 5) {
        toast.warn("Please enter a valid interval (minimum 5 minutes)");
        return;
      }

      const response = await axios.post(
        `/api/tournaments/knockout/generate`,
        {
          tournamentId,
          courtNumber: knockoutSettings.courtNumber,
          matchStartTime: knockoutSettings.matchStartTime,
          intervalMinutes: knockoutSettings.intervalMinutes
        }
      );

      if (response.data.success) {
        toast.info(
          `🏆 Knockout Tournament Generated!\n\n` +
          `${response.data.message}\n` +
          `Bracket: ${response.data.bracket.totalPlayers} players, ${response.data.bracket.totalRounds} rounds\n\n` +
          `Starting at: ${new Date(knockoutSettings.matchStartTime).toLocaleString()}\n` +
          `Court: ${knockoutSettings.courtNumber}\n` +
          `Match Interval: ${knockoutSettings.intervalMinutes} minutes`
        );

        setShowKnockoutModal(false);
        setKnockoutGenerated(true);

        // Navigate to knockout view
        // navigate(`/tournament-management/group-stage/${tournamentId}/knockout`, {
        //   state: {
        //     tournamentId,
        //     stage: 'knockout',
        //     superPlayers: true
        //   }
        // });
      } else {
        toast.error("Failed to generate knockout matches");
      }
    } catch (error) {
      console.error("Error generating knockout matches:", error);
      toast.info(`Failed to generate knockout matches: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    if (tournamentId) {

      axios
        .get(
          `/api/tournaments/bookings/tournament/${tournamentId}`
        )
        .then((response) => {

          if (response.data.success && response.data.bookings.length > 0) {

            const players = response.data.bookings.map((booking) => ({
              id: booking._id,           // Booking ID
              userId: booking.userId?._id || booking.userId,    // Extract _id from userId object
              name: booking.userName || booking.name,
              bookingDate: booking.bookingDate,
              categories: booking.selectedCategories || [], // Add categories here
              image: `https://i.pravatar.cc/50?img=${Math.floor(
                Math.random() * 70
              )}`,
            }));

            setRegisteredPlayers(players);
            setFilteredPlayers(players);
          } else {
            setRegisteredPlayers([]);
            setFilteredPlayers([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching registered players:", error);
        });

      // Fetch existing groups and player assignments
      axios
        .get(`/api/tournaments/bookinggroups/tournament/${tournamentId}`)
        .then((response) => {

          const groupsArray = response?.data?.data;
          if (Array.isArray(groupsArray) && groupsArray.length > 0) {

            const playerGroupMapping = {};
            groupsArray.forEach((group, groupIndex) => {


              if (group.players && Array.isArray(group.players)) {

                // Get normalized category for this group
                const categoryKey = group.category ? group.category.toLowerCase().replace(/\s+/g, '_') : 'open';

                group.players.forEach((player, playerIndex) => {

                  // The key field is playerId which contains the User ID
                  const playerId = player.playerId;
                  const playerName = player.userName;

                  // Map by User ID (playerId in group = userId from booking)
                  if (playerId) {
                    const pidStr = playerId.toString();
                    if (!playerGroupMapping[pidStr]) {
                      playerGroupMapping[pidStr] = {};
                    }
                    playerGroupMapping[pidStr][categoryKey] = group.groupName || group.name || `Group ${group._id}`;
                  }

                  // Also map by name as fallback
                  if (playerName) {
                    const normalizedName = playerName.toLowerCase().trim();
                    const nameKey = `name_${normalizedName}`;
                    if (!playerGroupMapping[nameKey]) {
                      playerGroupMapping[nameKey] = {};
                    }
                    playerGroupMapping[nameKey][categoryKey] = group.groupName || group.name || `Group ${group._id}`;
                  }
                });
              }
            });
            setPlayerGroups(playerGroupMapping);
          }
        })
        .catch((error) => {
        });

      // Fetch top players and super players
      fetchTopPlayers();
      fetchSuperPlayers();
    }
  }, [tournamentId]);

  // Filter players based on search term and category
  useEffect(() => {
    let filtered = registeredPlayers;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedRegisterPlayerCategory && selectedRegisterPlayerCategory !== 'all') {
      filtered = filtered.filter(player => {
        // If player has no categories assigned, show them for all category filters
        // This handles legacy bookings and bookings without category selection
        if (!player.categories || player.categories.length === 0) return true;

        // Otherwise, check if player has the selected category
        return player.categories.some(cat => {
          const categoryValue = cat.name.toLowerCase().replace(/\s+/g, '_');
          return categoryValue === selectedRegisterPlayerCategory ||
            cat.name.toLowerCase().includes(selectedRegisterPlayerCategory.toLowerCase().replace(/_/g, ' '));
        });
      });
    }

    setFilteredPlayers(filtered);
    setCurrentPage(1); // Reset to first page when searching or filtering
  }, [searchTerm, registeredPlayers, selectedRegisterPlayerCategory]);

  // Calculate pagination - use different data source based on Round 2 mode
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = isRound2Mode
    ? topPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer)
    : filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil((isRound2Mode ? topPlayers.length : filteredPlayers.length) / playersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Selection functions for group creation - handle both Round 1 and Round 2 modes
  const handleSelectAll = (checked) => {
    if (isRound2Mode) {
      // Round 2 mode: select Top Players
      if (checked) {
        setSelectedRound2Players([...topPlayers]);
      } else {
        setSelectedRound2Players([]);
      }
    } else {
      // Round 1 mode: select regular players
      if (checked) {
        const availablePlayers = currentPlayers.filter(player => {
          const userGroups = playerGroups[player.userId];
          const nameGroups = playerGroups[`name_${player.name.toLowerCase().trim()}`];

          // Check if in group for CURRENT category
          const isLocked = selectedRegisterPlayerCategory !== 'all' && (
            (userGroups && userGroups[selectedRegisterPlayerCategory]) ||
            (nameGroups && nameGroups[selectedRegisterPlayerCategory])
          );

          return !isLocked;
        });
        const allPlayerIds = availablePlayers.map(player => player.id);
        const newSelected = [...new Set([...selectedPlayers, ...allPlayerIds])];
        setSelectedPlayers(newSelected);
      } else {
        const currentPlayerIds = currentPlayers.map(player => player.id);
        setSelectedPlayers(prev => prev.filter(id => !currentPlayerIds.includes(id)));
      }
    }
  };

  const togglePlayerSelection = (playerId) => {
    if (isRound2Mode) {
      // Round 2 mode: toggle Top Player selection
      const player = topPlayers.find(p => p.playerId === playerId);
      if (player) {
        setSelectedRound2Players(prev => {
          const isSelected = prev.find(p => p.playerId === playerId);
          if (isSelected) {
            return prev.filter(p => p.playerId !== playerId);
          } else {
            return [...prev, player];
          }
        });
      }
    } else {
      // Round 1 mode: toggle regular player selection
      setSelectedPlayers(prev => {
        if (prev.includes(playerId)) {
          return prev.filter(id => id !== playerId);
        } else {
          return [...prev, playerId];
        }
      });
    }
  };

  // Show seeding confirmation modal
  const showSeedingConfirmation = (player) => {
    // Only allow seeding if player is not already in a group
    const userGroups = playerGroups[player.userId];
    const nameGroups = playerGroups[`name_${player.name.toLowerCase().trim()}`];

    // Check if in group for CURRENT category
    const inUserGroup = userGroups && userGroups[selectedRegisterPlayerCategory];
    const inNameGroup = nameGroups && nameGroups[selectedRegisterPlayerCategory];

    if (inUserGroup || inNameGroup) {
      toast.warn("Cannot seed players who are already assigned to groups in this category.");
      return;
    }

    setPlayerToSeed(player);
    setShowSeedingModal(true);
  };

  // Confirm seeding a player
  const confirmSeedPlayer = async () => {
    if (!playerToSeed) return;

    try {
      const isCurrentlySeeded = seededPlayers.includes(playerToSeed.id);

      if (isCurrentlySeeded) {
        // Remove from seeded players
        setSeededPlayers(prev => prev.filter(id => id !== playerToSeed.id));
        localStorage.setItem(`seeded_${tournamentId}`, JSON.stringify(seededPlayers.filter(id => id !== playerToSeed.id)));
      } else {
        // Add to seeded players
        const newSeededPlayers = [...seededPlayers, playerToSeed.id];
        setSeededPlayers(newSeededPlayers);
        localStorage.setItem(`seeded_${tournamentId}`, JSON.stringify(newSeededPlayers));

        // Save to Top Players via API (only for regular players, not Super Players)
        try {
          // Only save to Top Players if this is a regular registered player
          // Don't save to Top Players if player is already a Super Player
          const isFromSuperPlayers = superPlayers.some(sp =>
            sp.playerId === playerToSeed.userId ||
            sp.playerName === playerToSeed.name ||
            sp.userName === playerToSeed.name
          );

          if (!isFromSuperPlayers) {
            await axios.post(`/api/tournaments/topplayers/save`, {
              tournamentId: tournamentId,
              groupId: `seeded_${selectedRegisterPlayerCategory}`, // Use category as group
              players: [{
                playerId: playerToSeed.userId,
                playerName: playerToSeed.name,
                category: selectedRegisterPlayerCategory
              }]
            });

            // Refresh top players list
            fetchTopPlayers();
          } else {
          }
        } catch (error) {
          console.error("Error saving to Top Players:", error);
          // Continue with local storage even if API fails
        }
      }

      setShowSeedingModal(false);
      setPlayerToSeed(null);
    } catch (error) {
      console.error("Error seeding player:", error);
      toast.error("Failed to seed player. Please try again.");
    }
  };

  // Show delete warning modal
  const showDeleteGroupsWarning = () => {
    setShowDeleteWarning(true);
  };

  // Actually delete all groups
  const confirmDeleteAllGroups = async () => {
    if (!tournamentId) return;

    setShowDeleteWarning(false);

    try {
      const response = await axios.get(
        `/api/tournaments/bookinggroups/tournament/${tournamentId}`
      );

      if (response.data.success && response.data.data.length > 0) {
        // Delete each group
        const deletePromises = response.data.data.map(group =>
          axios.delete(`/api/tournaments/bookinggroups/${group._id}`)
        );

        await Promise.all(deletePromises);

        // Clear the mapping
        setPlayerGroups({});

        toast.info(`Successfully deleted ${response.data.data.length} groups. Players are now available for new group creation.`);

        // Refresh the page to update UI
        window.location.reload();
      } else {
        toast.warn("No groups found to delete");
      }
    } catch (error) {
      console.error("Error deleting groups:", error);
      toast.error("Failed to delete groups. Please try again.");
    }
  };

  // Load seeded players from localStorage on component mount
  useEffect(() => {
    const savedSeeded = localStorage.getItem(`seeded_${tournamentId}`);
    if (savedSeeded) {
      try {
        setSeededPlayers(JSON.parse(savedSeeded));
      } catch (error) {
        console.error("Error parsing saved seeded players:", error);
      }
    }

    // Check Round 2 progress status
    checkRound2Progress();
  }, [tournamentId]);

  // Check if Round 2 has been initiated
  const checkRound2Progress = async () => {
    try {
      const response = await axios.get(
        `/api/tournaments/round2/status/${tournamentId}`
      );
      if (response.data.success) {
        setRound2Progress(response.data.status);
        if (response.data.status?.option === 'group_stage') {
          // Load Round 2 groups if they exist
          fetchRound2Groups();
        }
      }
    } catch (error) {
    }
  };

  // Fetch Round 2 groups
  const fetchRound2Groups = async () => {
    try {
      const response = await axios.get(
        `/api/tournaments/round2/groups/${tournamentId}`
      );
      if (response.data.success) {
        setRound2Groups(response.data.groups);
      }
    } catch (error) {
      console.error("Error fetching Round 2 groups:", error);
    }
  };

  // Initiate Round 2 progression
  const initiateRound2 = () => {
    if (topPlayers.length < 2) {
      toast.warn("Need at least 2 Top Players to proceed to Round 2");
      return;
    }
    setShowRound2Modal(true);
  };

  // Reset Round 2 progress
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const confirmResetRound2 = async () => {
    setResetting(true);
    try {
      const response = await axios.post(
        `/api/tournaments/round2/reset`,
        { tournamentId }
      );

      if (response.data.success) {
        setRound2Progress(null);
        setIsRound2Mode(false);
        setSelectedRound2Players([]);
        setRound2Option(null);
        setShowResetModal(false);

        const d = response.data.deleted || {};
        toast.info(`Round 2 has been reset.\n\nDeleted:\n• ${d.groups || 0} groups\n• ${d.matches || 0} group matches\n• ${d.knockoutMatches || 0} knockout matches`);
      }
    } catch (error) {
      console.error("Error resetting Round 2:", error);
      toast.error("Failed to reset Round 2 progress.");
    } finally {
      setResetting(false);
    }
  };

  // Handle Round 2 option selection
  // 🔥 HANDLE DIRECT KNOCKOUT PLAYER SELECTION
  const handleDirectKnockoutPlayerSelection = () => {
    const count = selectedDirectKnockoutPlayers.length;
    const validSizes = [4, 8, 16, 32, 64, 128];

    if (count < 3) {
      toast.warn(`Minimum 3 players required for knockout. Currently selected: ${count}`);
      return;
    }

    if (count > 128) {
      toast.warn(`Maximum 128 players supported for knockout. Currently selected: ${count}`);
      return;
    }

    // Close player selection modal and open schedule modal
    setShowDirectKnockoutPlayerModal(false);
    setShowDirectKnockoutScheduleModal(true);
  };

  // 🔥 HANDLE DIRECT KNOCKOUT MATCH CREATION
  const handleDirectKnockoutCreation = async () => {
    try {
      if (!knockoutSchedule.startDate || !knockoutSchedule.startTime) {
        toast.warn("Please fill in start date and time");
        return;
      }

      // First initiate Round 2 (stage update) — only now, not earlier
      await axios.post(
        `/api/tournaments/round2/initiate`,
        {
          tournamentId,
          option: 'knockout',
          topPlayers: topPlayers.map(player => ({
            playerId: player.playerId,
            playerName: player.playerName,
            category: player.category
          }))
        }
      );

      // Validate player count is power of 2
      const validationResponse = await axios.post(
        `/api/tournaments/direct-knockout/validate-players`,
        {
          tournamentId,
          selectedPlayers: selectedDirectKnockoutPlayers.map(player => ({
            playerId: player.playerId || player._id,
            userName: player.userName || player.name
          }))
        }
      );

      if (!validationResponse.data.success) {
        toast.info(validationResponse.data.message);
        return;
      }

      // Create the matches
      const matchResponse = await axios.post(
        `/api/tournaments/direct-knockout/create-matches`,
        {
          tournamentId,
          selectedPlayers: selectedDirectKnockoutPlayers.map(player => ({
            playerId: player.playerId || player._id,
            userName: player.userName || player.name
          })),
          schedule: {
            startDate: knockoutSchedule.startDate,
            startTime: knockoutSchedule.startTime,
            courtNumber: knockoutSchedule.courtNumber,
            intervalMinutes: knockoutSchedule.intervalMinutes
          },
          drawMethod, // 'global' or 'local'
          // For Local Rules, we might need to send specific seed info if available
          // We'll rely on backend to use topPlayers data or what's sent here
          seededPlayers: seededPlayers // Send list of seeded player IDs for reference
        }
      );

      if (matchResponse.data.success) {
        setShowDirectKnockoutScheduleModal(false);
        setRound2Progress({ option: 'knockout', status: 'matches_created' });
        toast.info(`Direct Knockout matches created successfully! ${matchResponse.data.bracket.totalMatches} matches scheduled.`);

        // Switch to Groups tab to see the matches in Knockout sub-tab
        setSelectedTab("Groups");
      } else {
        toast.error("Failed to create knockout matches");
      }
    } catch (error) {
      console.error("Error creating Direct Knockout matches:", error);
      toast.info(`Failed to create matches: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRound2Option = async (option) => {
    try {
      setRound2Option(option);
      setShowRound2Modal(false);

      if (option === 'knockout') {
        // Don't call initiate API yet — wait until user completes the full flow
        // Just open the player selection modal
        setShowDirectKnockoutPlayerModal(true);
      } else {
        // For group_stage, initiate immediately (it only updates stage config)
        const response = await axios.post(
          `/api/tournaments/round2/initiate`,
          {
            tournamentId,
            option,
            topPlayers: topPlayers.map(player => ({
              playerId: player.playerId,
              playerName: player.playerName,
              category: player.category
            }))
          }
        );

        if (response.data.success) {
          setRound2Progress({ option, status: 'initiated' });
          setIsRound2Mode(true);
          setSelectedTab("Registered Players");
          setSelectedSubTab("Registered Players");
        }
      }
    } catch (error) {
      console.error("Error initiating Round 2:", error);
      toast.error("Failed to initiate Round 2. Please try again.");
    }
  };


  // Group creation handlers
  const handleCreateGroupClick = () => {
    if (!tournamentId) {
      toast.warn("No tournament selected");
      return;
    }

    // Check selection based on mode
    if (isRound2Mode) {
      if (selectedRound2Players.length === 0) {
        toast.warn("Please select Top Players first for Round 2");
        return;
      }
    } else {
      if (selectedRegisterPlayerCategory === 'all') {
        toast.warn("Please select a specific category (e.g., Open, Under 12) from the dropdown before creating groups. You cannot create groups under 'All Categories'.");
        return;
      }
      if (selectedPlayers.length === 0) {
        toast.warn("Please select players first");
        return;
      }
      // Warn if user tries to create group with players from mixed categories without explicit intent?
      // For now, we assume if they are in the list, they are valid.
    }

    setModalStep(1);
  };

  const handleNextStep = () => {
    if (modalStep === 1 && numGroups > 0) {
      // Step 1 → 2: Initialize group names
      const names = Array.from({ length: numGroups }, (_, i) => `Group ${String.fromCharCode(65 + i)}`);
      setGroupNames(names);
      setModalStep(2);
    } else if (modalStep === 2) {
      // Step 2 → 3: Move to player distribution
      setModalStep(3);
    } else if (modalStep === 3) {
      // Step 3 → 4: Validation before confirmation
      const allFilled = groupNames.every(
        (name) => groupPlayers[name] !== "" && !isNaN(groupPlayers[name])
      );
      const totalPlayers = groupNames.reduce(
        (sum, name) => sum + (parseInt(groupPlayers[name]) || 0),
        0
      );

      if (!allFilled) {
        toast.warn("Please fill in the number of players for each group.");
        return;
      }
      const expectedTotal = isRound2Mode ? selectedRound2Players.length : selectedPlayers.length;
      if (totalPlayers !== expectedTotal) {
        toast.info(
          `Total players in groups (${totalPlayers}) must equal selected players (${expectedTotal}).`
        );
        return;
      }
      setModalStep(4);
    } else if (modalStep === 4) {
      // Step 4: Create groups
      handleCreateGroups();
    }
  };

  const handleCreateGroups = async () => {
    // Use selectedRound2Players for Round 2, selectedPlayers for Round 1
    const sourcePlayersList = isRound2Mode ? [...selectedRound2Players] : [...selectedPlayers];

    let playersToDistribute;
    if (isRound2Mode) {
      // For Round 2: Create player objects with proper structure for booking group
      playersToDistribute = sourcePlayersList.map(player => ({
        playerId: player.playerId, // This should be the User ID from Top Players
        userName: player.playerName,
        bookingDate: new Date(),
        joinedAt: new Date()
      }));
    } else {
      // For Round 1: Use booking IDs directly (existing functionality)
      playersToDistribute = [...selectedPlayers]; // Copy array of booking IDs
    }

    const groupsData = groupNames.map((name) => {
      const count = parseInt(groupPlayers[name]) || 0;
      const playersForGroup = playersToDistribute.splice(0, count);

      return {
        tournamentId: tournamentId,
        groupName: isRound2Mode ? `Round 2 ${name}` : name,
        players: playersForGroup,
        category: selectedRegisterPlayerCategory,
        round: isRound2Mode ? 2 : 1,
        roundType: isRound2Mode ? 'qualifier' : 'group_stage'
      };
    });

    try {
      await Promise.all(
        groupsData.map((g) =>
          axios.post(`/api/tournaments/bookinggroups/create`, g)
        )
      );

      setModalStep(5); // Success step

      // Clear appropriate state based on mode
      if (isRound2Mode) {
        setIsRound2Mode(false);
        setRound2Progress({ option: 'group_stage', status: 'groups_created' });

        // Navigate to MGrouptabs after Round 2 groups are created
        setTimeout(() => {
          setActiveTab("Groups"); // Switch to Groups tab to see the Round 2 groups
        }, 2000);
      } else {
        setSelectedPlayers([]); // Clear selection for Round 1

        // Refresh the group data for Round 1
        setTimeout(() => {
          window.location.reload(); // Simple refresh to update UI
        }, 2000);
      }

    } catch (error) {
      console.error("Error creating groups:", error);
      toast.error("Failed to create groups. Please try again.");
    }
  };

  const resetModal = () => {
    setModalStep(0);
    setNumGroups(0);
    setGroupNames([]);
    setGroupPlayers({});
    setIsRound2Mode(false); // Clear Round 2 mode when modal closes
    setSelectedRound2Players([]); // Clear Round 2 player selection
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/mtournament-management')}
            className="p-2 rounded-xl hover:bg-gray-100 transition w-auto"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{tournament?.title || "Tournament Management"}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Group Stage · {tournament?.sportsType || "Sport"}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            { key: "Players", tab: "Registered Players", sub: "Registered Players", label: "All Players" },
            { key: "Top", tab: "Registered Players", sub: "Top Players", label: "Round 2 Qualifiers" },
            { key: "Super", tab: "Registered Players", sub: "Super Players", label: "Super Players" },
            { key: "Groups", tab: "Groups", sub: "", label: "Groups" },
          ].map((item) => {
            const isActive = (selectedTab === item.tab && selectedSubTab === item.sub) || (item.tab === "Groups" && selectedTab === "Groups");
            return (
              <button
                key={item.key}
                onClick={() => { setSelectedTab(item.tab); setSelectedSubTab(item.sub); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all w-auto ${
                  isActive
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Players Tab Content */}
        {selectedTab === "Registered Players" && (
          <>
            <div>

              {/* Sub-tab Content */}
              {selectedSubTab === "Registered Players" && (
                <div className="p-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {isRound2Mode ? "Top Players Selection for Round 2" : "Registered Players"}
                    </h3>

                    {/* Round 2 Guide */}
                    {isRound2Mode && (
                      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
                        <h4 className="text-green-700 font-semibold mb-2 flex items-center gap-2">
                          <GiTrophyCup className="w-4 h-4" /> Round 2 Group Stage Setup
                        </h4>
                        <p className="text-sm text-green-600 mb-2">
                          You're now setting up Round 2 with <strong>{topPlayers.length} Top Players</strong> from Round 1.
                        </p>
                        <ul className="text-xs text-green-600 space-y-1">
                          <li>• <strong>Select Top Players</strong> using checkboxes to include them in Round 2</li>
                          <li>• <strong>Create Groups</strong> using the same workflow as Round 1</li>
                          <li>• <strong>Winners</strong> from Round 2 will become Super Players for final knockouts</li>
                          <li>• <strong>Minimum 2 players</strong> required, recommended 4-8 for balanced groups</li>
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                      {/* Search Bar */}
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder={isRound2Mode ? "Search Top Players..." : "Search players by name..."}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>

                      {/* Category Dropdown */}
                      <div className="relative w-full lg:w-64">
                        <div className="relative">
                          <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400"
                          >
                            <span className="block truncate">
                              {categories.find(cat => cat.value === selectedRegisterPlayerCategory)?.label || 'Select Category'}
                            </span>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <ChevronDown className="h-4 w-4 text-gray-600" />
                            </span>
                          </button>

                          {isOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                              <ul className="py-1">
                                {categories.map((category) => (
                                  <li key={category.value}>
                                    <button
                                      onClick={() => {
                                        setSelectedRegisterPlayerCategory(category.value);
                                        setIsOpen(false);
                                      }}
                                      className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center justify-between transition-colors duration-150"
                                    >
                                      <span>{category.label}</span>
                                      {selectedRegisterPlayerCategory === category.value && (
                                        <Check className="h-4 w-4 text-orange-500" />
                                      )}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Create Groups Button */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateGroupClick}
                          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          <FiPlus /> Create Groups
                        </button>

                        {/* Delete Groups Button - For Testing */}
                        <button
                          onClick={showDeleteGroupsWarning}
                          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                          title="Delete all groups (for testing)"
                        >
                          <FiTrash />  Clear Groups
                        </button>
                      </div>
                    </div>

                    {/* Player Count and Status Info */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-600">
                        {isRound2Mode ? (
                          `Showing ${topPlayers.length} Top Players available for Round 2`
                        ) : (
                          <>
                            Showing {currentPlayers.length} of {filteredPlayers.length} players
                            {searchTerm && ` (filtered from ${registeredPlayers.length} total)`}
                          </>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>
                          {isRound2Mode ? selectedRound2Players.length : selectedPlayers.length} selected
                        </span>
                        {!isRound2Mode && (
                          <>
                            <span>{Object.values(playerGroups).filter(g => g && g[selectedRegisterPlayerCategory]).length} in groups</span>
                            <span>{seededPlayers.length} seeded</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Players Table */}
                  <div className="overflow-hidden">
                    {(isRound2Mode ? topPlayers.length : filteredPlayers.length) > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full bg-white border border-gray-300 rounded-lg">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left">
                                  <input
                                    type="checkbox"
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    checked={
                                      isRound2Mode
                                        ? (currentPlayers.length > 0 && currentPlayers.every(player =>
                                          selectedRound2Players.find(p => p.playerId === player.playerId)))
                                        : (currentPlayers.filter(player => {
                                          const uGroups = playerGroups[player.userId];
                                          const nGroups = playerGroups[`name_${player.name.toLowerCase().trim()}`];
                                          return !(uGroups && uGroups[selectedRegisterPlayerCategory]) && !(nGroups && nGroups[selectedRegisterPlayerCategory]);
                                        }).length > 0 &&
                                          currentPlayers.filter(player => {
                                            const uGroups = playerGroups[player.userId];
                                            const nGroups = playerGroups[`name_${player.name.toLowerCase().trim()}`];
                                            return !(uGroups && uGroups[selectedRegisterPlayerCategory]) && !(nGroups && nGroups[selectedRegisterPlayerCategory]);
                                          }).every(player => selectedPlayers.includes(player.id)))
                                    }
                                    className="rounded text-orange-500 focus:ring-orange-500"
                                  />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Avatar</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Player Name</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                  {isRound2Mode ? "Points" : "Categories"}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                                  {isRound2Mode ? "Type" : "Seed Player"}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {currentPlayers.map((player, index) => {
                                if (isRound2Mode) {
                                  // Round 2 mode: handle Top Players
                                  const isSelected = selectedRound2Players.find(p => p.playerId === player.playerId);
                                  const isSeeded = player.groupId?.includes('seeded');

                                  return (
                                    <tr key={player._id || index} className="hover:bg-gray-50">
                                      <td className="px-4 py-3">
                                        <input
                                          type="checkbox"
                                          checked={!!isSelected}
                                          onChange={() => togglePlayerSelection(player.playerId)}
                                          className="rounded text-orange-500 focus:ring-orange-500"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <img
                                          src={`https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`}
                                          alt={player.playerName || 'Player Avatar'}
                                          className="w-10 h-10 rounded-full"
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">
                                          {player.playerName || 'Unknown Player'}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {player.points || 0} points
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                          <FaStar className="mr-1" /> Top Player
                                        </span>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600">
                                          {isSeeded ? 'Seeded' : 'Round 1 Qualifier'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                } else {
                                  // Round 1 mode: handle Regular Players
                                  const userGroups = playerGroups[player.userId];
                                  const nameGroups = playerGroups[`name_${player.name.toLowerCase().trim()}`];
                                  const isInGroup = selectedRegisterPlayerCategory !== 'all' && (
                                    (userGroups && userGroups[selectedRegisterPlayerCategory]) ||
                                    (nameGroups && nameGroups[selectedRegisterPlayerCategory])
                                  );

                                  const isSeeded = seededPlayers.includes(player.id);
                                  const isLocked = !!isInGroup;

                                  return (
                                    <tr key={player.id || index} className={`hover:bg-gray-50 ${isLocked ? 'bg-gray-25' : ''}`}>
                                      <td className="px-4 py-3">
                                        <input
                                          type="checkbox"
                                          checked={selectedPlayers.includes(player.id)}
                                          onChange={() => togglePlayerSelection(player.id)}
                                          disabled={isLocked}
                                          className={`rounded text-orange-500 focus:ring-orange-500 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <img
                                          src={player.image}
                                          alt={player.name || 'Player Avatar'}
                                          className={`w-10 h-10 rounded-full ${isLocked ? 'opacity-75' : ''}`}
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className={`font-medium ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                                          {player.name || 'Unknown Player'}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {player.categories && player.categories.length > 0
                                          ? player.categories.map(cat => cat.name).join(", ")
                                          : 'N/A'
                                        }
                                      </td>
                                      <td className="px-4 py-3">
                                        {isInGroup ? (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <FiLock className="mr-1" /> {isInGroup}
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <FiCheck className="mr-1" /> Available
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => showSeedingConfirmation(player)}
                                          disabled={isLocked}
                                          className={`p-2 rounded-full transition-colors ${isLocked
                                            ? 'text-gray-700 cursor-not-allowed'
                                            : isSeeded
                                              ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                                              : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
                                            }`}
                                          title={
                                            isLocked
                                              ? 'Cannot seed player already in group'
                                              : isSeeded
                                                ? 'Remove seeded status - Click to unstar'
                                                : 'Mark as seeded player - Click to add to Top Players'
                                          }
                                        >
                                          {isSeeded ? <FaStar /> : <FaRegStar />}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                }
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-6 px-4">
                            <div className="text-sm text-gray-600">
                              Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>

                              {/* Page numbers */}
                              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                if (pageNum > totalPages) return null;

                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-2 text-sm border rounded-md ${currentPage === pageNum
                                      ? 'bg-orange-500 text-white border-orange-500'
                                      : 'border-gray-300 hover:bg-gray-50'
                                      }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}

                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 bg-white border border-gray-300 rounded-lg">
                        <div className="text-gray-500">
                          {searchTerm ? (
                            <>
                              <p className="text-lg font-medium">No players found</p>
                              <p className="text-sm mt-1">Try adjusting your search term</p>
                            </>
                          ) : (
                            <>
                              <p className="text-lg font-medium">No registered players</p>
                              <p className="text-sm mt-1">No players have registered for this tournament yet.</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Top Players Sub-tab */}
              {selectedSubTab === "Top Players" && (
                <div className="p-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Top Players</h3>

                    <div className="flex flex-col lg:flex-row gap-4 mb-4">
                      {/* Category Dropdown */}
                      <div className="relative w-full lg:w-64">
                        <div className="relative">
                          <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:border-gray-400"
                          >
                            <span className="block truncate">
                              {categories.find(cat => cat.value === selectedTopPlayerCategory.toLowerCase())?.label || 'Select Category'}
                            </span>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <ChevronDown className="h-4 w-4 text-gray-600" />
                            </span>
                          </button>

                          {isOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                              <ul className="py-1">
                                {categories.map((category) => (
                                  <li key={category.value}>
                                    <button
                                      onClick={() => {
                                        setSelectedTopPlayerCategory(category.label);
                                        setIsOpen(false);
                                      }}
                                      className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center justify-between transition-colors duration-150"
                                    >
                                      <span>{category.label}</span>
                                      {selectedTopPlayerCategory === category.label && (
                                        <Check className="h-4 w-4 text-orange-500" />
                                      )}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Top Players Info and Round 2 Controls */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-600">
                        Total Top Players: {topPlayers.length}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-orange-500">
                          <FiInfo className="inline mr-1" />
                          Includes seeded players and round 1 qualifiers
                        </div>
                        {!round2Progress && topPlayers.length >= 2 && (
                          <button
                            onClick={initiateRound2}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-semibold"
                          >
                            <MdRocket className="w-4 h-4" /> Proceed to Round 2
                          </button>
                        )}
                        {round2Progress && (
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                              Round 2 {round2Progress.option === 'knockout' ? 'Knockout' : 'Group Stage'} - {round2Progress.status}
                            </div>
                            <button
                              onClick={() => setShowResetModal(true)}
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                              title="Reset Round 2 Progress"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Players Table */}
                  <div className="overflow-hidden">
                    {topPlayers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full bg-white border border-gray-300 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Avatar</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Player Name</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {topPlayers.map((player, index) => (
                              <tr key={player._id || index} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <img
                                    src={`https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`}
                                    alt={player.playerName || 'Player Avatar'}
                                    className="w-10 h-10 rounded-full"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">
                                    {player.playerName || 'Unknown Player'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {player.category || 'Open'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                    <FaStar className="mr-1" /> Top Player
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-gray-600">
                                    {player.groupId?.includes('seeded') ? 'Seeded' : 'Round 1 Qualifier'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white border border-gray-300 rounded-lg">
                        <div className="text-gray-500">
                          <FaStar className="mx-auto text-4xl mb-4 text-gray-700" />
                          <p className="text-lg font-medium">No Top Players Yet</p>
                          <p className="text-sm mt-1">
                            Seed players by clicking the star icon in Registered Players, or complete Round 1 to see qualifiers here.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Super Players Sub-tab */}
              {selectedSubTab === "Super Players" && (
                <div className="p-4">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Super Players</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{superPlayers.length} players qualified for knockout</p>
                      </div>
                      {!knockoutGenerated && superPlayers.length > 0 && (
                        <button
                          onClick={() => {
                            const count = superPlayers.length;
                            if (count < 3) {
                              toast.warn(`Minimum 3 Super Players required for knockout. Currently: ${count}`);
                              return;
                            }
                            if (count > 128) {
                              toast.warn(`Maximum 128 players supported for knockout. Currently: ${count}`);
                              return;
                            }
                            setShowKnockoutModal(true);
                          }}
                          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 font-bold text-sm active:scale-[0.97] w-auto"
                        >
                          <MdFlashOn className="w-4 h-4" /> Start Knockout
                        </button>
                      )}
                    </div>

                    {knockoutGenerated ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                        <h4 className="text-emerald-700 font-bold mb-1 flex items-center gap-2">
                          <FaTrophy className="w-4 h-4" /> Knockout Generated
                        </h4>
                        <p className="text-sm text-emerald-600">
                          The knockout bracket has been created. Go to the tournament knockout view to manage matches.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                        <h4 className="text-orange-700 font-bold mb-1 flex items-center gap-2">
                          <FaTrophy className="w-4 h-4" /> Final Phase
                        </h4>
                        <p className="text-sm text-orange-600 mb-2">
                          Super Players from Round 2 are ready for the final knockout. Requires exactly 16, 32, or 64 players.
                        </p>
                        <ul className="text-xs text-orange-500 list-disc list-inside">
                          <li>Single elimination format</li>
                          <li>Winner takes the championship</li>
                          <li>Bracket-style matches until final</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Super Players Table */}
                  <div className="overflow-hidden">
                    {superPlayers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full bg-white border border-gray-300 rounded-lg">
                          <thead className="bg-gradient-to-r from-orange-50 to-red-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-emerald-700">Avatar</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-emerald-700">Player Name</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-emerald-700">Points</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-emerald-700">Record</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-emerald-700">Status</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-emerald-700">Selection</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {superPlayers.map((player, index) => (
                              <tr key={player._id || index} className="hover:bg-emerald-50">
                                <td className="px-4 py-3">
                                  <img
                                    src={player.profileImage || player.playerId?.profileImage || `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`}
                                    alt={player.userName || player.playerName || player.playerId?.name || 'Player Avatar'}
                                    className="w-10 h-10 rounded-full border-2 border-emerald-200"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-gray-900">
                                    {player.userName || player.playerName || player.playerId?.name || 'Unknown Player'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                                  {player.points || 0} pts
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{player.won || 0}W - {player.lost || 0}L</span>
                                    <span className="text-xs text-gray-500">Sets: {player.setsWon || 0} - {player.setsLost || 0}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-red-100 text-emerald-800">
                                    <GiLaurelCrown className="mr-1 w-3 h-3" /> Super Player
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-gray-600">
                                    Round {player.selectedFromRound || 2} Winner
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white border border-gray-300 rounded-lg">
                        <div className="text-gray-500">
                          <div className="text-emerald-600 text-6xl mb-4 flex justify-center">
                            <GiLaurelCrown className="w-16 h-16" />
                          </div>
                          <p className="text-lg font-medium text-gray-700 mb-2">No Super Players Yet</p>
                          <p className="text-sm text-gray-600 mb-4">
                            Super Players will appear here after Top Players are selected from Round 2.
                          </p>
                          <div className="text-sm text-gray-500">
                            Complete Round 2 and select Top Players to populate this section.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Groups Tab Content */}
        {selectedTab === "Groups" && (
          <GroupsTab tournamentId={tournamentId} />
        )}
      </div>

      {/* Step 1: Number of Groups */}
      {modalStep === 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#F0F4F9] p-[52px] rounded-[24px] relative min-w-[395px] shadow-lg min-h-[291px]">
            <button
              className="absolute top-0 right-6 text-xl text-gray-600 bg-transparent hover:bg-transparent w-0"
              onClick={resetModal}
            >
              <FiX />
            </button>
            <h2 className="text-[16px] md:text-[18px] font-[600] text-center text-black mb-[10px]">
              {isRound2Mode ? "Create Round 2 Groups" : "Create Number of Groups"}
            </h2>
            <p className="text-center text-gray-600 mb-6">
              {isRound2Mode ? `Selected Top Players for Round 2: ${selectedRound2Players.length}` : `Selected Players: ${selectedPlayers.length}`}
            </p>

            <div className="text-center">
              <label className="block text-sm font-medium mb-2 text-gray-700">Number of Groups:</label>
              <input
                type="number"
                min="2"
                max="10"
                value={numGroups}
                onChange={(e) => setNumGroups(parseInt(e.target.value) || 0)}
                className="w-full border rounded-lg px-3 py-3 mb-6 text-center text-lg"
                placeholder="Enter number of groups"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={resetModal}
                className="px-6 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                disabled={numGroups <= 1}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Group Names */}
      {modalStep === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#F0F4F9] p-[52px] rounded-[24px] relative min-w-[395px] max-h-[453px] shadow-lg overflow-y-auto">
            <button
              className="absolute top-0 right-6 text-xl text-gray-600 bg-transparent hover:bg-transparent w-0"
              onClick={resetModal}
            >
              <FiX />
            </button>
            <h2 className="font-[600] md:text-[18px] text-center text-black mb-6">
              Enter Group Names
            </h2>

            <div className="space-y-4 mb-6">
              {groupNames.map((name, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Group {index + 1}:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const newNames = [...groupNames];
                      newNames[index] = e.target.value;
                      setGroupNames(newNames);
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder={`Group ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setModalStep(1)}
                className="px-6 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Players per Group */}
      {modalStep === 3 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#F0F4F9] p-[52px] rounded-[24px] relative min-w-[395px] max-h-[515px] shadow-lg overflow-y-auto">
            <button
              className="absolute top-0 right-6 text-xl text-gray-600 bg-transparent hover:bg-transparent w-0"
              onClick={resetModal}
            >
              <FiX />
            </button>
            <h2 className="md:text-[18px] font-[600] text-center text-gray-800 mb-4">
              Distribute Players in Groups
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Total Selected Players: {isRound2Mode ? selectedRound2Players.length : selectedPlayers.length}
            </p>

            <div className="space-y-4 mb-6">
              {groupNames.map((name, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <label className="font-medium text-gray-700">{name}:</label>
                  <input
                    type="number"
                    min="0"
                    max={isRound2Mode ? selectedRound2Players.length : selectedPlayers.length}
                    value={groupPlayers[name] || ""}
                    onChange={(e) => {
                      setGroupPlayers(prev => ({
                        ...prev,
                        [name]: e.target.value
                      }));
                    }}
                    className="w-20 border rounded px-2 py-1 text-center"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Assigned: {groupNames.reduce((sum, name) => sum + (parseInt(groupPlayers[name]) || 0), 0)} / {isRound2Mode ? selectedRound2Players.length : selectedPlayers.length}
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setModalStep(2)}
                className="px-6 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {modalStep === 4 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#F0F4F9] p-[52px] rounded-[24px] relative min-w-[381px] min-h-[294px] shadow-lg">
            <button
              className="absolute top-0 right-6 text-xl text-gray-600 bg-transparent hover:bg-transparent w-0"
              onClick={resetModal}
            >
              <FiX />
            </button>
            <h2 className="md:text-[18px] text-gray-900 font-[600] text-center mb-4">
              Confirm Group Creation
            </h2>

            <div className="space-y-3 mb-6">
              <p className="text-center text-gray-600 mb-4">Distribution of Players:</p>
              {groupNames.map((name, index) => (
                <div key={index} className="flex justify-between bg-white p-2 rounded">
                  <span className="font-medium">{name}:</span>
                  <span>{groupPlayers[name]} players</span>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to create these groups?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setModalStep(3)}
                className="px-6 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <FiPlus /> Create Groups
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {modalStep === 5 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#F0F4F9] p-[52px] rounded-2xl relative min-w-[404px] min-h-[265px] shadow-lg">
            <button
              className="absolute top-0 right-6 text-xl text-gray-600 bg-transparent hover:bg-transparent w-0"
              onClick={resetModal}
            >
              <FiX />
            </button>
            <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">
              {isRound2Mode ? `Round 2 Groups Created Successfully!` : `Created ${numGroups} Groups Successfully`}
            </h2>

            <div className="text-center mb-6">
              <div className="text-green-500 text-6xl mb-4">
                <FiCheck className="mx-auto" />
              </div>
              <p className="text-gray-600">
                {isRound2Mode
                  ? "Round 2 groups have been created with Top Players. You can now generate matches and proceed with Round 2!"
                  : "All groups have been created and players have been distributed."
                }
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Page will refresh in 2 seconds...
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={resetModal}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Warning Modal */}
      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg relative max-w-md mx-4 shadow-lg">
            <button
              className="absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800"
              onClick={() => setShowDeleteWarning(false)}
            >
              <FiX />
            </button>

            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4 flex justify-center">
                <FiAlertTriangle />
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Delete All Groups?
              </h2>

              <p className="text-gray-600 mb-6 text-left">
                <strong>Warning:</strong> This will permanently delete all groups and remove all player assignments for this tournament.
                <br /><br />
                This action cannot be undone. All players will be available for new group creation.
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteWarning(false)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAllGroups}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
                >
                  <FiTrash /> Delete All Groups
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seeding Confirmation Modal */}
      {showSeedingModal && playerToSeed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg relative max-w-md mx-4 shadow-lg">
            <button
              className="absolute top-4 right-4 text-xl text-gray-600 hover:text-gray-800"
              onClick={() => {
                setShowSeedingModal(false);
                setPlayerToSeed(null);
              }}
            >
              <FiX />
            </button>

            <div className="text-center">
              <div className="text-yellow-500 text-4xl mb-4 flex justify-center">
                <FaStar />
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {seededPlayers.includes(playerToSeed.id) ? 'Remove Seeded Player?' : 'Add Seeded Player?'}
              </h2>

              <div className="text-left mb-6">
                <p className="text-gray-600 mb-4">
                  <strong>Player:</strong> {playerToSeed.name}
                </p>

                {seededPlayers.includes(playerToSeed.id) ? (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-700">
                      <FiInfo className="inline mr-2" />
                      This will remove the player from seeded status and Top Players list.
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                    <p className="text-orange-600">
                      <FiInfo className="inline mr-2" />
                      This player will be marked as seeded and will:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-orange-500 text-sm">
                      <li>Skip group stage matches</li>
                      <li>Advance directly to Round 2/Knockouts</li>
                      <li>Appear in the Top Players list</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowSeedingModal(false);
                    setPlayerToSeed(null);
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSeedPlayer}
                  className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${seededPlayers.includes(playerToSeed.id)
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                >
                  <FaStar />
                  {seededPlayers.includes(playerToSeed.id) ? 'Remove Star' : 'Add Star'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Round 2 Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl max-w-md mx-4 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-red-500 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold">Reset Round 2</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Are you sure you want to reset Round 2? This will permanently delete:
              </p>
              <div className="bg-red-50 rounded-xl p-4 space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  All Round 2 <strong>groups</strong> and their player assignments
                </div>
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  All Round 2 <strong>matches</strong> and their scores
                </div>
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  All <strong>knockout bracket</strong> matches (if any)
                </div>
              </div>
              <p className="text-gray-500 text-xs">
                You will be able to create new Round 2 groups and matches from scratch after resetting.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetRound2}
                disabled={resetting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resetting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Reset Round 2
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round 2 Option Selection Modal */}
      {showRound2Modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-[24px] relative max-w-2xl mx-4 shadow-2xl animate-fadeIn">
            <button
              className="absolute top-6 right-6 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setShowRound2Modal(false)}
            >
              <FiX className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdRocket className="w-10 h-10 text-green-500" />
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Choose Round 2 Format
              </h2>

              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You have <strong className="text-gray-900">{topPlayers.length} Top Players</strong> ready for the next stage.
                Select how you want them to compete.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Group Stage Option */}
                <div
                  className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${round2Option === 'group_stage'
                    ? 'border-orange-500 bg-orange-50/50 shadow-lg scale-[1.02]'
                    : 'border-gray-300 hover:border-orange-300 hover:shadow-md'
                    }`}
                  onClick={() => setRound2Option('group_stage')}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${round2Option === 'group_stage' ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-500 group-hover:bg-orange-500 group-hover:text-white'
                    }`}>
                    <GiTrophyCup className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900">Group Stage 2</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Create new groups with Top Players for another round of league matches.
                  </p>
                  <ul className="text-sm text-gray-500 text-left space-y-2 bg-white/50 p-3 rounded-lg">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>Round-robin format</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>Multiple matches per player</li>
                  </ul>
                  {round2Option === 'group_stage' && (
                    <div className="absolute top-4 right-4 text-orange-500 bg-white rounded-full p-1 shadow-sm">
                      <FiCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Knockout Option */}
                <div
                  className={`group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${round2Option === 'knockout'
                    ? 'border-red-500 bg-red-50/50 shadow-lg scale-[1.02]'
                    : 'border-gray-300 hover:border-red-300 hover:shadow-md'
                    }`}
                  onClick={() => setRound2Option('knockout')}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${round2Option === 'knockout' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500 group-hover:bg-red-500 group-hover:text-white'
                    }`}>
                    <MdFlashOn className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-900">Direct Knockout</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Elimination matches. Winner advances, loser goes home.
                  </p>
                  <ul className="text-sm text-gray-500 text-left space-y-2 bg-white/50 p-3 rounded-lg">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>Single elimination bracket</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>Fast completion</li>
                  </ul>
                  {round2Option === 'knockout' && (
                    <div className="absolute top-4 right-4 text-red-500 bg-white rounded-full p-1 shadow-sm">
                      <FiCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowRound2Modal(false)}
                  className="px-8 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRound2Option(round2Option)}
                  disabled={!round2Option}
                  className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform flex items-center gap-3 ${round2Option
                    ? 'bg-gray-900 hover:bg-black hover:scale-105 active:scale-95'
                    : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                  Start Round 2 <MdRocket className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Knockout Scheduling Modal */}
      {showKnockoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MdFlashOn className="w-5 h-5 text-red-500" />
                Schedule Knockout Tournament
              </h3>
              <button
                onClick={() => setShowKnockoutModal(false)}
                className="text-gray-600 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Court Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={knockoutSettings.courtNumber}
                  onChange={(e) => setKnockoutSettings(prev => ({
                    ...prev,
                    courtNumber: parseInt(e.target.value)
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter court number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Match Start Time
                </label>
                <input
                  type="datetime-local"
                  value={knockoutSettings.matchStartTime}
                  onChange={(e) => setKnockoutSettings(prev => ({
                    ...prev,
                    matchStartTime: e.target.value
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interval Between Matches (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  value={knockoutSettings.intervalMinutes}
                  onChange={(e) => setKnockoutSettings(prev => ({
                    ...prev,
                    intervalMinutes: parseInt(e.target.value)
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter interval in minutes"
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="text-orange-500 mt-0.5">ℹ️</div>
                  <div className="text-sm text-orange-600">
                    <p className="font-medium mb-1">Tournament Info:</p>
                    <p>• {superPlayers.length} Super Players will compete</p>
                    <p>• Bracket will auto-generate based on player count</p>
                    <p>• Matches scheduled with your specified interval</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowKnockoutModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={generateKnockoutMatches}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <MdFlashOn className="w-4 h-4" />
                Generate Knockout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 DIRECT KNOCKOUT PLAYER SELECTION MODAL (ENHANCED FOR SIZE SELECTION) */}
      {showDirectKnockoutPlayerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-[24px] relative max-w-5xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <MdFlashOn className="w-6 h-6 text-red-500" />
                  </div>
                  Knockout Setup
                </h2>
                <p className="text-gray-500 mt-1 ml-14">Select the tournament structure based on available players.</p>
              </div>
              <button
                onClick={() => setShowDirectKnockoutPlayerModal(false)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-10">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Pool</span>
                  </div>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <p className="text-lg text-gray-700">
                  You have <span className="text-3xl font-bold text-gray-900 mx-1">{topPlayers.length}</span> Top Players qualified.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[4, 8, 16, 32, 64, 128].map((size) => {
                  const minForSize = Math.ceil(size / 2) + 1;
                  const isAvailable = topPlayers.length >= minForSize;
                  const actualPlayers = Math.min(topPlayers.length, size);
                  const byes = size - actualPlayers;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (isAvailable) {
                          const newSelection = topPlayers.slice(0, Math.min(topPlayers.length, size));
                          setSelectedDirectKnockoutPlayers(newSelection);
                          setShowDirectKnockoutPlayerModal(false);
                          setShowDirectKnockoutScheduleModal(true);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`group relative overflow-hidden p-8 rounded-[20px] border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 h-64 ${isAvailable
                        ? 'border-gray-200 bg-white hover:border-red-500 hover:shadow-xl cursor-pointer'
                        : 'border-gray-200 bg-gray-50/50 opacity-60 cursor-not-allowed grayscale'
                        }`}
                    >
                      {/* Decorative Background Element */}
                      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${isAvailable ? 'bg-red-500' : 'bg-gray-400'}`}></div>

                      <div className={`text-6xl font-black tracking-tighter transition-transform group-hover:scale-110 ${isAvailable ? 'text-gray-900 group-hover:text-red-500' : 'text-gray-700'}`}>
                        {size}
                      </div>

                      <div className="text-center z-10 relative">
                        <div className={`text-lg font-bold mb-1 ${isAvailable ? 'text-gray-700' : 'text-gray-600'}`}>
                          Round of {size}
                        </div>
                        <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-50 text-red-500'
                          }`}>
                          {isAvailable ? '✅ Ready to Start' : `Need ${size - topPlayers.length} more`}
                        </div>
                      </div>

                      {isAvailable && (
                        <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 font-semibold text-sm flex items-center gap-1">
                          Select & Proceed <MdRocket />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Selection Toggle */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Manual Selection</h3>
                  <p className="text-sm text-gray-500">Custom bracket sizes or specific player selection</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDirectKnockoutPlayers([])}
                    className="text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Reset Checkboxes
                  </button>
                  {[4, 8].map(count => (
                    <button
                      key={count}
                      onClick={() => {
                        const newSelection = topPlayers.slice(0, count);
                        setSelectedDirectKnockoutPlayers(newSelection);
                      }}
                      disabled={topPlayers.length < count}
                      className="text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Pick Top {count}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-60 overflow-y-auto p-1">
                {topPlayers.map((player) => {
                  const isSelected = selectedDirectKnockoutPlayers.some(p =>
                    (p.playerId || p._id) === (player.playerId || player._id)
                  );
                  return (
                    <div
                      key={player.playerId || player._id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDirectKnockoutPlayers(prev =>
                            prev.filter(p => (p.playerId || p._id) !== (player.playerId || player._id))
                          );
                        } else {
                          setSelectedDirectKnockoutPlayers(prev => [...prev, player]);
                        }
                      }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 group ${isSelected
                        ? 'border-red-500 bg-red-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-red-500 border-red-500' : 'bg-transparent border-gray-300 group-hover:border-gray-400'
                        }`}>
                        {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm truncate font-medium ${isSelected ? 'text-red-900' : 'text-gray-600'}`}>
                        {player.playerName || player.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm">
                  <span className="text-gray-500">Selected Count: </span>
                  <span className={`font-bold text-lg ${selectedDirectKnockoutPlayers.length >= 4 ? 'text-green-600' : 'text-gray-900'}`}>{selectedDirectKnockoutPlayers.length}</span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDirectKnockoutPlayerModal(false)}
                    className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDirectKnockoutPlayerSelection}
                    disabled={selectedDirectKnockoutPlayers.length < 4}
                    className={`px-6 py-2.5 rounded-lg text-white font-bold flex items-center gap-2 shadow-lg transition-all ${selectedDirectKnockoutPlayers.length >= 4
                      ? 'bg-gray-900 hover:bg-black hover:-translate-y-0.5'
                      : 'bg-gray-300 cursor-not-allowed'
                      }`}
                  >
                    Confirm Selection <MdRocket />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 DIRECT KNOCKOUT SCHEDULE MODAL (ENHANCED) */}
      {showDirectKnockoutScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-[24px] relative max-w-lg mx-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <BiTrophy className="w-6 h-6 text-red-500" />
                </div>
                Schedule Matches
              </h2>
              <button
                onClick={() => setShowDirectKnockoutScheduleModal(false)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 mb-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">Total Players</p>
                  <p className="text-2xl font-bold text-gray-800">{selectedDirectKnockoutPlayers.length}</p>
                </div>
                <div className="h-auto w-px bg-orange-100"></div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">Total Matches</p>
                  <p className="text-2xl font-bold text-gray-800">{selectedDirectKnockoutPlayers.length - 1}</p>
                </div>
                <div className="h-auto w-px bg-orange-100"></div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">Total Rounds</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.log2(selectedDirectKnockoutPlayers.length)}</p>
                </div>
              </div>
            </div>

            {/* Draw Method Selection */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-3">Bracket Draw Method</label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${drawMethod === 'global'
                    ? 'border-orange-500 bg-orange-50/50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setDrawMethod('global')}
                >
                  <div className="font-bold text-gray-900 mb-1">Global Rules 🌍</div>
                  <div className="text-xs text-gray-500 leading-snug">
                    Standard seeding protection logic (1 vs Last, etc). Best for balanced competition.
                  </div>
                  {drawMethod === 'global' && <div className="absolute top-2 right-2 text-orange-500"><FiCheck /></div>}
                </div>

                <div
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${drawMethod === 'local'
                    ? 'border-orange-500 bg-orange-50/50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                  onClick={() => setDrawMethod('local')}
                >
                  <div className="font-bold text-gray-900 mb-1">Local Rules 🏠</div>
                  <div className="text-xs text-gray-500 leading-snug">
                    Fixed custom slot assignments based on specific local templates.
                  </div>
                  {drawMethod === 'local' && <div className="absolute top-2 right-2 text-orange-500"><FiCheck /></div>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={knockoutSchedule.startDate}
                    onChange={(e) => setKnockoutSchedule(prev => ({
                      ...prev,
                      startDate: e.target.value
                    }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={knockoutSchedule.startTime}
                    onChange={(e) => setKnockoutSchedule(prev => ({
                      ...prev,
                      startTime: e.target.value
                    }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Court Number</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1"
                    value={knockoutSchedule.courtNumber}
                    onChange={(e) => setKnockoutSchedule(prev => ({
                      ...prev,
                      courtNumber: parseInt(e.target.value)
                    }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Interval (min)</label>
                  <input
                    type="number"
                    min="15"
                    max="120"
                    step="5"
                    placeholder="30"
                    value={knockoutSchedule.intervalMinutes}
                    onChange={(e) => setKnockoutSchedule(prev => ({
                      ...prev,
                      intervalMinutes: parseInt(e.target.value)
                    }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDirectKnockoutScheduleModal(false)}
                className="flex-1 px-4 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDirectKnockoutCreation}
                disabled={!knockoutSchedule.startDate || !knockoutSchedule.startTime}
                className={`flex-1 px-4 py-3 rounded-xl text-white font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition-all ${knockoutSchedule.startDate && knockoutSchedule.startTime
                  ? 'bg-red-500 hover:bg-red-600 hover:-translate-y-0.5'
                  : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                Create Matches <MdFlashOn className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupStageManagement;