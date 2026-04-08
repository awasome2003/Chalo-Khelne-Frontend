//Manager/TeamKnockouts.jsx
import { useEffect, useState } from "react";
import { FaUsers, FaCrown, FaUser, FaSyncAlt } from "react-icons/fa";
import { Star, StarIcon, Loader2, Trophy, RefreshCcw } from "lucide-react";
import TeamKnockoutMatches from "./TeamKnockoutMatches";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField } from "@mui/material";
import dayjs from "dayjs";

const TeamKnockouts = () => {
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [hasGeneratedMatches, setHasGeneratedMatches] = useState(false);
  const [showStructureAlert, setShowStructureAlert] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [activeSection, setActiveSection] = useState("teams");
  const [tournamentType, setTournamentType] = useState("");
  const [matches, setMatches] = useState([]);
  const [setCount, setSetCount] = useState(null);
  const [roundSchedules, setRoundSchedules] = useState({
    1: {
      matchDateTime: dayjs(),
      matchInterval: "",
      courtNumber: "",
    },
  });
  const [byeTeams, setByeTeams] = useState([]);
  const [totalRounds, setTotalRounds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [currentSchedulingRound, setCurrentSchedulingRound] = useState(1);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Registered Teams");
  const [activeTab, setActiveTab] = useState("Live");
  const [teams, setTeams] = useState([]);
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [currentMatchForSub, setCurrentMatchForSub] = useState(null);
  // NEW: State for post-generation doubles configuration
  const [showDoublesNominationModal, setShowDoublesNominationModal] = useState(false);
  const [matchesToConfigure, setMatchesToConfigure] = useState([]);
  const [configuringIndex, setConfiguringIndex] = useState(0);
  const tournamentId = new URLSearchParams(location.search).get("tournamentId");

  // Round Robin state
  const [rrMatches, setRrMatches] = useState([]);
  const [rrStandings, setRrStandings] = useState([]);
  const [rrLoading, setRrLoading] = useState(false);
  const [rrGenerated, setRrGenerated] = useState(false);
  const [rrSchedule, setRrSchedule] = useState({
    matchStartTime: dayjs().format("YYYY-MM-DDTHH:mm"),
    matchInterval: "30",
    courtNumber: "1",
  });

  const fetchRoundRobin = async () => {
    if (!tournamentId) return;
    try {
      // Fetch round robin matches (round = 0)
      const matchRes = await axios.get(`/api/tournaments/team-knockout/matches/${tournamentId}`);
      if (matchRes.data?.success) {
        const allMatches = matchRes.data.matches || [];
        const roundRobinMatches = allMatches.filter((m) => m.round === 0);
        setRrMatches(roundRobinMatches);
        setRrGenerated(roundRobinMatches.length > 0);
      }
      // Fetch standings
      const standingsRes = await axios.get(`/api/tournaments/team-knockout/round-robin/standings/${tournamentId}`);
      if (standingsRes.data?.success) {
        setRrStandings(standingsRes.data.data?.standings || []);
      }
    } catch (err) {
      console.error("Error fetching round robin:", err);
    }
  };

  const handleGenerateRoundRobin = async () => {
    if (!tournamentId) return;
    setRrLoading(true);
    try {
      const res = await axios.post("/api/tournaments/team-knockout/round-robin/generate", {
        tournamentId,
        scheduleDetails: {
          matchStartTime: rrSchedule.matchStartTime,
          matchInterval: rrSchedule.matchInterval,
          courtNumber: rrSchedule.courtNumber,
        },
        tournamentType: tournamentType || "Singles",
        setCount: setCount || 3,
      });
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchRoundRobin();
      } else {
        toast.error(res.data?.message || "Failed to generate");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate round robin matches");
    } finally {
      setRrLoading(false);
    }
  };

  const handleDeleteRoundRobin = async () => {
    if (!window.confirm("Are you sure? This will delete all round robin matches.")) return;
    try {
      const res = await axios.post("/api/tournaments/team-knockout/round-robin/delete", { tournamentId });
      if (res.data?.success) {
        toast.success(res.data.message);
        setRrMatches([]);
        setRrStandings([]);
        setRrGenerated(false);
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  useEffect(() => {
    if (selectedTab === "Round Robin" && tournamentId) {
      fetchRoundRobin();
    }
  }, [selectedTab, tournamentId]);

  const handleSelectFavorite = (booking) => {
    // Check if the booking is in an enabled state
    if (!booking.team) {
      return;
    }

    // Check if the booking is in the selected teams
    const isTeamSelected = selectedTeams.some(
      (selectedTeam) => selectedTeam._id === booking._id
    );
    if (!isTeamSelected) {
      return;
    }

    // Toggle bye booking with multiple selection
    setByeTeams((prevByeTeams) => {
      const isCurrentlyBye = prevByeTeams.some((b) => b._id === booking._id);


      if (isCurrentlyBye) {
        // Remove from bye teams
        const updatedByeTeams = prevByeTeams.filter(
          (b) => b._id !== booking._id
        );
        return updatedByeTeams;
      } else {
        // Add to bye teams
        const byeBooking = {
          _id: booking._id,
          name: booking.team.name,
          team: booking.team,
          createdAt: booking.createdAt,
        };
        return [...prevByeTeams, byeBooking];
      }
    });
  };

  useEffect(() => {
    if (tournamentId) {
      fetchRegisteredTeams();
      fetchTournamentDetails();
    }
  }, [tournamentId]);

  const cleanTeamData = (teams) => {
    return teams.map((team) => ({
      ...team,
      team: {
        ...team.team,
        // Clean captain name
        captain:
          typeof team.team.captain === "string"
            ? team.team.captain
            : extractPlayerName(team.team.captain),

        // Clean player names
        players:
          team.team.players?.map((player) =>
            typeof player === "string" ? player : extractPlayerName(player)
          ) || [],

        // Clean substitute names - THIS IS THE KEY FIX
        substitutes:
          team.team.substitutes?.map((substitute) =>
            typeof substitute === "string"
              ? substitute
              : extractPlayerName(substitute)
          ) || [],
      },
    }));
  };

  const fetchTournamentDetails = async () => {
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}`
      );
      const data = await response.json();
      if (data.success) {
        // Convert "Single player" to "Single" and extract number from "3 sets" to 3
        // const type = data.tournament.playerNoValue.includes("Single")
        //   ? "Single"
        //   : "Double";
        // setTournamentType(type);
        const setsNum = parseInt(data.tournament.setFormat);
        setSetCount(setsNum);
      }
    } catch (error) {
      console.error("Error fetching tournament details:", error);
    }
  };

  const handleTeamSelection = (e, team) => {
    e.stopPropagation();
    setSelectedTeams((prev) => {
      if (e.target.checked) {
        // Add team if not already in array
        return [...prev, team];
      } else {
        // Remove the unchecked team by comparing _id
        return prev.filter((t) => t._id !== team._id);
      }
    });
  };

  const fetchRegisteredTeams = async () => {
    try {
      setLoading(true);

      const url = `/api/players/bookings/tournament-teams/${tournamentId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTeams(data.bookings);
      } else {
        console.error("API returned success: false", data.message);
        toast.error("Error", data.message || "Failed to load teams");
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      toast.error(
        "Error",
        "Failed to load teams. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const extractPlayerName = (player) => {
    // If it's already a string
    if (typeof player === "string") return player;

    // If it's an object with a name property
    if (player && player.name) return player.name;

    // If it's a character-by-character object (like in your data)
    if (typeof player === "object") {
      const chars = [];
      let i = 0;
      while (player[i] !== undefined) {
        chars.push(player[i]);
        i++;
      }
      return chars.join("");
    }

    // Fallback
    return "Unknown Player";
  };

  const calculateTotalRounds = (teamCount) => {
    return Math.ceil(Math.log2(teamCount));
  };

  const byesNeeded = selectedTeams.length > 0
    ? Math.pow(2, Math.ceil(Math.log2(selectedTeams.length))) -
    selectedTeams.length
    : 0;

  const handleGenerateButtonClick = () => {

    if (selectedTeams.length < 2) {
      toast.error("Please select at least 2 teams", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    // Calculate the next power of 2
    const nextPowerOf2 = Math.pow(
      2,
      Math.ceil(Math.log2(selectedTeams.length))
    );
    const byesNeeded = nextPowerOf2 - selectedTeams.length;


    if (byeTeams.length !== byesNeeded) {
      setShowStructureAlert(true); // Show modal instead of toast
      return;
    }

    const rounds = calculateTotalRounds(selectedTeams.length);

    // Update these states with useEffect to ensure they're processed in order
    setTotalRounds(rounds);
    setCurrentSchedulingRound(1);

    // Add a console.log before setting modal visibility
    setShowSchedulingModal(true);
  };

  const handleGenerateMatches = async () => {
    try {
      const currentRound = currentSchedulingRound;

      if (!roundSchedules[currentRound]?.matchDateTime) {
        toast.warning("Please set match date and time");
        return;
      }

      if (currentRound === 1) {
        // NEW: Use our simplified API for tournament creation
        const cleanedSelectedTeams = cleanTeamData(selectedTeams);
        const cleanedByeTeams = cleanTeamData(byeTeams);

        const requestBody = {
          tournamentId,
          selectedBookingIds: cleanedSelectedTeams.map((team) => team._id),
          byeBookingIds: cleanedByeTeams.map((team) => team._id),
          // ADD CLEANED DATA TO THE REQUEST
          cleanedTeamData: cleanedSelectedTeams,
          scheduleDetails: {
            matchStartTime:
              roundSchedules[
                currentSchedulingRound
              ].matchDateTime.toISOString(),
            matchInterval:
              roundSchedules[currentSchedulingRound].matchInterval || "0",
            courtNumber:
              roundSchedules[currentSchedulingRound].courtNumber || "TBD",
          },
          tournamentType: tournamentType === "Single" ? "Singles" : "Doubles",
          setCount,
        };

        const response = await fetch(
          `/api/tournaments/team-knockout/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();

        if (data.success) {
          setMatches(data.matches);
          setTotalRounds(data.totalRounds);
          setHasGeneratedMatches(true);
          setActiveSection("matches");
          setShowSchedulingModal(false);

          // NEW: Check for doubles matches to configure
          const doublesMatches = data.matches.filter(m =>
            m.status !== "BYE" &&
            m.sets &&
            m.sets.some(s => s.setNumber === 3) // Assuming set 3 is doubles
          );

          if (doublesMatches.length > 0) {
            setMatchesToConfigure(doublesMatches);
            setConfiguringIndex(0); // Start from first match
            setShowDoublesNominationModal(true);
          } else {
            toast.success("Match created successfully!");
            setSelectedTab("Matches"); // Auto-switch to matches tab
          }
        } else {
          throw new Error(data.message || "Failed to create tournament");
        }
        return;
      }

      // Handle subsequent rounds
      const previousRoundResponse = await fetch(
        `/api/tournaments/team-knockout/matches-by-round?tournamentId=${tournamentId}&round=${currentRound - 1}`
      );

      if (!previousRoundResponse.ok) {
        throw new Error(
          `Failed to fetch previous round matches: ${previousRoundResponse.statusText}`
        );
      }

      const previousRoundData = await previousRoundResponse.json();
      const previousRoundMatches = previousRoundData.matches;

      const incompletedMatch = previousRoundMatches.find(
        (match) => match.status !== "COMPLETED" && match.status !== "BYE"
      );

      if (incompletedMatch) {
        toast.warning(
          "Previous Round Incomplete",
          "All matches from the previous round must be completed first."
        );
        return;
      }

      const winners = previousRoundMatches
        .map((match) => match.winnerId || match.winner)
        .filter((winner) => winner !== null && winner !== undefined);

      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const nextRoundResponse = await fetch(
        `/api/tournaments/team-knockout/next-round`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tournamentId,
            currentRound,
            scheduleDetails: {
              matchStartTime:
                roundSchedules[currentRound].matchDateTime.toISOString(),
              matchInterval: roundSchedules[currentRound].matchInterval || "0",
              courtNumber: roundSchedules[currentRound].courtNumber || "TBD",
            },
            tournamentType: tournamentType === "Single" ? "Singles" : "Doubles",
            setCount,
          }),
        }
      );

      const nextRoundData = await nextRoundResponse.json();

      if (nextRoundData.success) {
        setMatches((prevMatches) => {
          const filteredMatches = prevMatches.filter(
            (match) => match.round !== currentRound
          );
          return [...filteredMatches, ...nextRoundData.matches];
        });

        if (
          nextRoundData.totalRounds &&
          nextRoundData.totalRounds !== totalRounds
        ) {
          setTotalRounds(nextRoundData.totalRounds);
        }

        setHasGeneratedMatches(true);
        setActiveSection("matches");
        setShowSchedulingModal(false);

        // NEW: Check for doubles matches to configure
        const doublesMatches = nextRoundData.matches.filter(m =>
          m.status !== "BYE" &&
          m.sets &&
          m.sets.some(s => s.setNumber === 3) // Assuming set 3 is doubles
        );

        if (doublesMatches.length > 0) {
          setMatchesToConfigure(doublesMatches);
          setConfiguringIndex(0); // Start from first match
          setShowDoublesNominationModal(true);
        } else {
          toast.success("Matches generated successfully!");
          setSelectedTab("Matches"); // Auto-switch to matches tab
        }

      } else {
        throw new Error(
          nextRoundData.message || "Failed to generate next round matches"
        );
      }
    } catch (error) {
      console.error("Error generating matches:", error);
      toast.error(`Failed to generate matches: ${error.message}`);
    }
  };

  const SchedulingModal = () => {
    const handleMatchGeneration = () => {
      if (!roundSchedules[currentSchedulingRound]?.matchDateTime) {
        toast.warning("Please select a match date and time");
        return;
      }

      const matchDateTime =
        roundSchedules[currentSchedulingRound].matchDateTime;

      setRoundSchedules((prev) => ({
        ...prev,
        [currentSchedulingRound]: {
          ...prev[currentSchedulingRound],
          matchStartTime: matchDateTime.toISOString(),
        },
      }));

      // SIMPLIFIED: Always use the same function regardless of bye teams
      handleGenerateMatches();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl overflow-y-auto w-[450px] flex p-[52px] flex-col items-start gap-[20px] rounded-[24px] bg-[#F5F7FA]">
          {/* Header */}
          <div className="flex w-full justify-end">
            <button
              onClick={() => setShowSchedulingModal(false)}
              className="text-black-500 hover:bg-transparent bg-transparent text-black w-auto text-[25px] p-0"
            >
              X
            </button>
          </div>

          {/* Schedule Form */}
          <div className="space-y-6 w-full">
            <div className="items-center text-center gap-2 mb-4">
              <h2 className="text-black text-center mb-0 font-roboto text-[18px] font-semibold leading-normal">
                Round {currentSchedulingRound} Schedule Details
              </h2>
            </div>

            {/* Match Date and Time */}
            <div className="space-y-2 first-popup">
              <label className="block text-sm font-medium text-gray-900">
                Match Start Date and Time
              </label>
              <LocalizationProvider
                className=" rounded-lg border-none hover:border-none datafield"
                dateAdapter={AdapterDayjs}
              >
                <DateTimePicker
                  value={
                    roundSchedules?.[currentSchedulingRound]?.matchDateTime ||
                    null
                  }
                  className="w-full bg-white rounded-2xl hover:border-none datafield"
                  onChange={(newValue) => {
                    setRoundSchedules((prev) => ({
                      ...prev,
                      [currentSchedulingRound]: {
                        ...prev[currentSchedulingRound],
                        matchDateTime: newValue,
                      },
                    }));
                  }}
                  renderInput={(props) => (
                    <div className="relative">
                      <TextField
                        {...props}
                        fullWidth
                        className="border-none hover:border-none bg-white rounded-lg datafield"
                      />
                    </div>
                  )}
                />
              </LocalizationProvider>
            </div>

            {/* Match Interval */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Match Interval (minutes)
              </label>
              <input
                type="number"
                value={
                  roundSchedules?.[currentSchedulingRound]?.matchInterval || ""
                }
                onChange={(e) => {
                  setRoundSchedules((prev) => ({
                    ...prev,
                    [currentSchedulingRound]: {
                      ...prev[currentSchedulingRound],
                      matchInterval: e.target.value,
                    },
                  }));
                }}
                min="0"
                placeholder="Enter interval in minutes"
                className="w-full h-[50px] text-gray-500 px-4 py-2 self-stretch rounded-lg bg-white border-none"
                required
              />
            </div>

            {/* Court Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Starting Court Number
              </label>
              <input
                type="number"
                value={
                  roundSchedules?.[currentSchedulingRound]?.courtNumber || ""
                }
                onChange={(e) => {
                  setRoundSchedules((prev) => ({
                    ...prev,
                    [currentSchedulingRound]: {
                      ...prev[currentSchedulingRound],
                      courtNumber: e.target.value,
                    },
                  }));
                }}
                min="1"
                placeholder="Enter starting court number"
                className="w-full text-gray-500 h-[50px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 border-none"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                className="flex h-[50px] px-6 py-2 justify-center items-center gap-[10px] rounded-[25px] bg-[#FF5500] hover:bg-[#CC4400] text-white"
                onClick={handleMatchGeneration}
              >
                Generate Matches
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SubstituteModal = () => {
    const [subData, setSubData] = useState({
      homePlayerB: "",
      awayPlayerZ: ""
    });

    useEffect(() => {
      if (currentMatchForSub) {
        // Find the doubles set (Set 3)
        const doublesSet = currentMatchForSub.sets.find(s => s.setNumber === 3);
        if (doublesSet) {
          setSubData({
            homePlayerB: doublesSet.homePlayerB || "",
            awayPlayerZ: doublesSet.awayPlayerZ || ""
          });
        }
      }
    }, [currentMatchForSub]);

    const handleSave = async () => {
      try {
        const response = await fetch(
          `/api/tournaments/team-knockout/matches/${currentMatchForSub._id}/substitute`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              setNumber: 3, // Doubles set
              homePlayerB: subData.homePlayerB,
              awayPlayerZ: subData.awayPlayerZ
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          toast.success("lineup updated successfully");
          setShowSubstituteModal(false);
          // Refresh matches
          handleGenerateMatches();
        } else {
          toast.error(data.message || "Failed to update lineup");
        }
      } catch (error) {
        toast.error("Error updating lineup");
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-[450px] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Edit Doubles Lineup</h3>
            <button onClick={() => setShowSubstituteModal(false)} className="bg-transparent hover:bg-transparent text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {currentMatchForSub?.team1Id?.teamName} - Doubles Partner
              </label>
              <input
                type="text"
                value={subData.homePlayerB}
                onChange={(e) => setSubData(prev => ({ ...prev, homePlayerB: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-black"
                placeholder="Enter player name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {currentMatchForSub?.team2Id?.teamName} - Doubles Partner
              </label>
              <input
                type="text"
                value={subData.awayPlayerZ}
                onChange={(e) => setSubData(prev => ({ ...prev, awayPlayerZ: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-black"
                placeholder="Enter player name"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#FF5500] hover:bg-[#CC4400] text-white rounded-full font-medium"
            >
              Save Lineup
            </button>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Modal for configuring doubles lineup immediately after generation
  const DoublesNominationModal = () => {
    const currentMatch = matchesToConfigure[configuringIndex];
    const [nominationData, setNominationData] = useState({
      homePlayerB: "",
      awayPlayerZ: ""
    });
    const [saving, setSaving] = useState(false);

    // Get team names safely
    const team1Name = currentMatch?.team1Id?.teamName ||
      currentMatch?.team1Id?.name || "Team 1";
    const team2Name = currentMatch?.team2Id?.teamName ||
      currentMatch?.team2Id?.name || "Team 2";

    const handleNext = async () => {
      if (!nominationData.homePlayerB || !nominationData.awayPlayerZ) {
        toast.warning("Please enter names for both doubles partners");
        return;
      }

      setSaving(true);
      try {
        // Save current match doubles lineup
        const response = await fetch(
          `/api/tournaments/team-knockout/matches/${currentMatch._id}/substitute`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              setNumber: 3, // Doubles set
              homePlayerB: nominationData.homePlayerB,
              awayPlayerZ: nominationData.awayPlayerZ
            }),
          }
        );

        const data = await response.json();
        if (data.success) {
          // Move to next match or finish
          if (configuringIndex < matchesToConfigure.length - 1) {
            setConfiguringIndex(prev => prev + 1);
            setNominationData({ homePlayerB: "", awayPlayerZ: "" }); // Reset for next
          } else {
            toast.success("All lineups configured successfully!");
            setShowDoublesNominationModal(false);
            setSelectedTab("Matches");
          }
        } else {
          toast.error(data.message || "Failed to save lineup");
        }

      } catch (error) {
        toast.error("Error saving lineup");
        console.error(error);
      } finally {
        setSaving(false);
      }
    };

    const handleSkip = () => {
      if (configuringIndex < matchesToConfigure.length - 1) {
        setConfiguringIndex(prev => prev + 1);
        setNominationData({ homePlayerB: "", awayPlayerZ: "" });
      } else {
        toast.info("Configuration completed");
        setShowDoublesNominationModal(false);
        setSelectedTab("Matches");
      }
    };

    if (!currentMatch) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-[500px] p-8 flex flex-col gap-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800">Doubles Lineup Configuration</h3>
            <p className="text-gray-500 text-sm mt-1">Match {configuringIndex + 1} of {matchesToConfigure.length}</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-center gap-4">
            <span className="font-bold text-orange-700">{team1Name}</span>
            <span className="text-sm font-bold text-gray-400">VS</span>
            <span className="font-bold text-red-800">{team2Name}</span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {team1Name} - Doubles Partner
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={nominationData.homePlayerB}
                  onChange={(e) => setNominationData(prev => ({ ...prev, homePlayerB: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter partner name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {team2Name} - Doubles Partner
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={nominationData.awayPlayerZ}
                  onChange={(e) => setNominationData(prev => ({ ...prev, awayPlayerZ: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter partner name"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-full font-medium transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              disabled={saving}
              className="px-8 py-2 bg-[#FF5500] hover:bg-[#CC4400] text-white rounded-full font-bold shadow-lg transform active:scale-95 transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {configuringIndex === matchesToConfigure.length - 1 ? 'Finish & Save' : 'Next Match'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="mt-4 text-gray-600 font-medium">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="p-5">
        {/* Main Tabs - Always visible */}
        <div className="flex w-full justify-center space-x-3 mb-4">
          {["Registered Teams", "Round Robin", "Matches"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex h-[50px] px-6 py-2 justify-center w-auto items-center gap-[10px] rounded-[25px] 
      ${selectedTab === tab
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content based on selected tab */}
        {selectedTab === "Registered Teams" ? (
          // Teams View
          <div className="flex gap-8">
            {/* Left Section: Tournament List */}
            <div className="">
              {/* Live, Upcoming, Recent Tabs */}
              <div className="flex p-1 bg-white items-center justify-center gap-2 rounded-[25px] bg-gray mb-[20px]">
                {["Live", "Upcoming", "Recent"].map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(tab)}
                    className={`flex h-[42px] px-4 mt-0 py-2 justify-center items-center gap-2 rounded-[25px] 
                    transition-colors duration-200 ease-in-out 
                    ${activeTab === tab
                        ? "bg-orange-500 text-white" // Active tab styles
                        : "bg-transparent text-black" // Non-active tab styles
                      }`}
                  >
                    {tab}
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                      {index === 0 ? 12 : index === 1 ? 8 : 6}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tournament List */}
              <div className="div">
                {/* Select All / Deselect All */}
                {teams?.length >= 2 && (
                  <div className="flex items-center justify-between mb-2 px-1">
                    <button
                      onClick={() => {
                        if (selectedTeams.length === teams.length) {
                          setSelectedTeams([]);
                        } else {
                          setSelectedTeams([...teams]);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all w-auto
                        bg-orange-500 text-white hover:bg-[#003D75]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.length === teams.length && teams.length > 0}
                        readOnly
                        className="w-4 h-4 rounded cursor-pointer accent-white"
                      />
                      {selectedTeams.length === teams.length ? "Deselect All" : "Select All"}
                    </button>
                    <span className="text-sm text-gray-500 font-medium">
                      {selectedTeams.length}/{teams.length} selected
                    </span>
                  </div>
                )}
                <div className="flex flex-col bg-white gap-[20px] overflow-y-auto h-[450px] p-4 border border-gray-300 rounded-[24px] scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 scrollbar-hide">
                  {teams?.map((booking) => (
                    <div
                      key={booking._id}
                      className={`flex h-16 p-2 w-auto items-center justify-between gap-3 w-80 bg-white rounded-2xl shadow-md border cursor-pointer
                      ${selectedTournament?._id === booking._id
                          ? "border-orange-500 border-2"
                          : "border-gray-200"
                        }`}
                      onClick={() => {
                        setSelectedTournament(booking);
                      }}
                    >
                      {/* Left Section */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {booking.team.name.charAt(0)}
                        </div>
                        <span className="text-gray-800 font-medium">
                          {booking.team.name}
                        </span>
                      </div>

                      <div className="team-actions flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFavorite(booking);
                          }}
                          className="focus:outline-none hover:bg-transparent bg-transparent transition-none mt-0 flex items-center justify-center"
                        >
                          {byeTeams.some(
                            (byeTeam) => byeTeam._id === booking._id
                          ) ? (
                            <StarIcon className="text-yellow-500 w-5 h-5" />
                          ) : (
                            <Star className="text-gray-400 w-5 h-5" />
                          )}
                        </button>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTeams.some(
                              (t) => t._id === booking._id
                            )}
                            onChange={(e) => handleTeamSelection(e, booking)}
                            className="w-6 h-6 p-[7px_6px] rounded bg-transparent cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTeams.length >= 2 && (
                  <button
                    onClick={handleGenerateButtonClick}
                    className="flex h-[50px] px-6 py-2 justify-center items-center gap-[10px] rounded-[25px] bg-[#FF5500] hover:bg-[#CC4400] text-white mt-4"
                  >
                    Generate Matches
                  </button>
                )}
              </div>
            </div>

            {/* Team Details */}
            {selectedTournament && (
              <div className="flex-1">
                <div className="bg-white rounded-[24px] p-6 shadow-md text-black">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold">Team Details</h2>
                    <div className="text-right text-sm">
                      <p className="font-medium">Registration Date</p>
                      <p className="text-gray-500">
                        {new Date(
                          selectedTournament.createdAt
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Team Name */}
                  <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg w-max text-orange-500 font-medium">
                    <FaUsers className="mr-2" />
                    <span>{selectedTournament.team.name}</span>
                  </div>

                  {/* Cards Section */}
                  <div className="flex gap-6 mt-6">
                    {/* Captain & Players */}
                    <div className="bg-gray-100 rounded-lg p-4 flex-1">
                      <h3 className="font-semibold text-orange-500 items-center">
                        Captain:
                      </h3>
                      <p className="flex items-center mt-1">
                        <FaCrown className="mr-2 text-gray-500" />
                        {selectedTournament.team.captain}
                      </p>

                      <h3 className="font-semibold text-orange-500 mt-4">
                        Players:
                      </h3>
                      {selectedTournament.team.players.map((player, index) => {
                        return (
                          <p key={index} className="flex items-center mt-1">
                            <FaUser className="mr-2 text-gray-500" />
                            {player.name}
                          </p>
                        );
                      })}
                    </div>

                    {/* Substitutes */}
                    <div className="bg-gray-100 rounded-lg p-4 flex-1">
                      <h3 className="font-semibold text-orange-500">
                        Substitutes:
                      </h3>
                      {selectedTournament.team.substitutes.map(
                        (substitute, index) => {
                          return (
                            <p key={index} className="flex items-center mt-1">
                              <FaSyncAlt className="mr-2 text-gray-500" />
                              {substitute.name}
                            </p>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : selectedTab === "Round Robin" ? (
          // Round Robin View
          <div className="max-w-5xl mx-auto">
            {!rrGenerated ? (
              // Generate Round Robin Form
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Generate Round Robin Matches</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Every team plays every other team. Total matches: <strong>{teams.length > 0 ? (teams.length * (teams.length - 1)) / 2 : 0}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={rrSchedule.matchStartTime}
                      onChange={(e) => setRrSchedule({ ...rrSchedule, matchStartTime: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Match Interval (min)</label>
                    <input
                      type="number"
                      value={rrSchedule.matchInterval}
                      onChange={(e) => setRrSchedule({ ...rrSchedule, matchInterval: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Court Number</label>
                    <input
                      type="text"
                      value={rrSchedule.courtNumber}
                      onChange={(e) => setRrSchedule({ ...rrSchedule, courtNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                      placeholder="1"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerateRoundRobin}
                  disabled={rrLoading || teams.length < 2}
                  className="w-full py-3 bg-orange-500 hover:bg-[#003d75] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {rrLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                  {rrLoading ? "Generating..." : "Generate Round Robin Matches"}
                </button>

                {teams.length < 2 && (
                  <p className="text-center text-red-500 text-sm mt-3">
                    Create teams first from the "Registered Teams" tab.
                  </p>
                )}
              </div>
            ) : (
              // Round Robin Results
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Round Robin</h3>
                    <p className="text-gray-500 text-sm">
                      {rrMatches.length} matches • {rrMatches.filter((m) => m.status === "COMPLETED").length} completed
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={fetchRoundRobin}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" /> Refresh
                    </button>
                    <button
                      onClick={handleDeleteRoundRobin}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Points Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h4 className="font-bold text-gray-900">Points Table</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Team</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">P</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">W</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">L</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">SW</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">SL</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">GW</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">GL</th>
                          <th className="text-center px-3 py-3 text-xs font-bold text-brand-600 uppercase tracking-wider font-black">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {rrStandings.map((team, i) => (
                          <tr key={team.teamId} className={`hover:bg-gray-50 ${i < 2 ? "bg-green-50/50" : ""}`}>
                            <td className="px-6 py-3 font-bold text-gray-400">{i + 1}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{team.teamName}</div>
                            </td>
                            <td className="text-center px-3 py-3 text-gray-600">{team.played}</td>
                            <td className="text-center px-3 py-3 font-semibold text-green-600">{team.won}</td>
                            <td className="text-center px-3 py-3 font-semibold text-red-500">{team.lost}</td>
                            <td className="text-center px-3 py-3 text-gray-600">{team.setsWon}</td>
                            <td className="text-center px-3 py-3 text-gray-600">{team.setsLost}</td>
                            <td className="text-center px-3 py-3 text-gray-600">{team.gamesWon}</td>
                            <td className="text-center px-3 py-3 text-gray-600">{team.gamesLost}</td>
                            <td className="text-center px-3 py-3 font-black text-orange-500 text-base">{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Match List */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h4 className="font-bold text-gray-900">All Matches</h4>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {rrMatches.map((match) => {
                      const t1 = match.team1Id?.teamName || "Team 1";
                      const t2 = match.team2Id?.teamName || "Team 2";
                      const isCompleted = match.status === "COMPLETED";
                      return (
                        <div key={match._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              isCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {isCompleted ? "Done" : "Pending"}
                            </span>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className={`font-semibold text-sm truncate ${isCompleted && match.matchWinner === "home" ? "text-green-600" : "text-gray-900"}`}>
                                {t1}
                              </span>
                              {isCompleted && (
                                <span className="text-xs font-bold text-gray-400">
                                  {match.setsWon?.home || 0} - {match.setsWon?.away || 0}
                                </span>
                              )}
                              <span className="text-xs text-gray-300">vs</span>
                              {isCompleted && (
                                <span className="text-xs font-bold text-gray-400">
                                  {match.setsWon?.away || 0} - {match.setsWon?.home || 0}
                                </span>
                              )}
                              <span className={`font-semibold text-sm truncate ${isCompleted && match.matchWinner === "away" ? "text-green-600" : "text-gray-900"}`}>
                                {t2}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 shrink-0">
                            {match.courtNumber !== "TBD" && `Court ${match.courtNumber}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Matches View (Knockout)
          <TeamKnockoutMatches tournament={selectedTournament} />
        )}
      </div>
      <ToastContainer position="top-center" />

      {showSchedulingModal && (
        <SchedulingModal
          teams={selectedTeams}
          onClose={() => setShowSchedulingModal(false)}
        />
      )}

      {showDoublesNominationModal && <DoublesNominationModal />}

      {showSubstituteModal && <SubstituteModal />}
      {showStructureAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 relative">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Tournament Structure Recommendation
            </h2>

            <div className="space-y-4 text-center">
              <p className="text-lg font-normal text-gray-700">
                You have selected {selectedTeams.length} teams
              </p>

              <p className="text-xl font-medium text-gray-900">
                Please assigned exactly {byesNeeded} bye
                {byesNeeded > 1 ? "s" : ""} to balance the tournament
              </p>

              <p className="text-lg font-normal text-gray-700">
                Currently assigned: {String(byeTeams.length).padStart(2, "0")}
              </p>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowStructureAlert(false)}
                className="h-[50px] px-6 py-2 rounded-[25px] bg-[#FF5500] hover:bg-[#CC4400] text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamKnockouts;
